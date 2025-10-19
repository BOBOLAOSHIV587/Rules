/***************************************
 xueshu_get_cookie.js
 作用：拦截 xueshu.fun 的响应，提取 Set-Cookie 或页面内 document.cookie，并保存到本地 key "XUESHU_COOKIE"
 兼容：Quantumult X / Surge / Loon / Node（尽可能）
 使用：配合 rewrite_local 的 script-response-header 规则


[rewrite_local]
# 捕获学术FUN 登录/首页的响应并提取 Cookie
^https?:\/\/xueshu\.fun\/.* url script-response-header https://你的raw地址/xueshu_get_cookie.js


[mitm]
hostname = xueshu.fun

***************************************/

(() => {
  // 获取响应头和响应体（QX 提供）
  const resp = typeof $response !== 'undefined' ? $response : {};
  const headers = (resp && resp.headers) ? resp.headers : {};
  const body = (resp && resp.body) ? resp.body : '';

  // 获取 Set-Cookie 头（可能为数组或字符串）
  let cookie = headers['Set-Cookie'] || headers['set-cookie'] || headers['set_cookie'] || null;

  // 如果头里没有，尝试从 body 中解析常见 JS 写 cookie 的语句
  if (!cookie || cookie === '') {
    try {
      // 查找 document.cookie = "key=val; ..." 或类似写法
      const m = String(body).match(/document\.cookie\s*=\s*["']([^"']+)["']/i)
                 || String(body).match(/cookie\s*[:=]\s*["']([^"']+)["']/i)
                 || String(body).match(/setCookie\(\s*["']([^"']+)["']\s*\)/i);
      if (m && m[1]) cookie = m[1];
    } catch (e) {
      cookie = cookie || null;
    }
  }

  if (!cookie) {
    // 未找到 cookie，则直接结束（不破坏响应）
    if (typeof $done === 'function') {
      $done({}); // 保留原始响应
    } else {
      // Node 环境或其他：打印并结束
      console.log('xueshu_get_cookie: no cookie found');
    }
    return;
  }

  // normalize: 如果是数组，合并为字符串；若包含换行/多个 Set-Cookie，尽量拼接为单行
  if (Array.isArray(cookie)) cookie = cookie.join('; ');
  cookie = String(cookie).trim();

  // 把 cookie 写入多种可能的本地存储 API（以兼容不同运行时）
  const TARGET_KEY = 'XUESHU_COOKIE';
  try {
    // Quantumult X 偏好接口
    if (typeof $prefs !== 'undefined' && typeof $prefs.setValueForKey === 'function') {
      $prefs.setValueForKey(cookie, TARGET_KEY);
    }
    // Surge / Loon / 通用持久化
    else if (typeof $persistentStore !== 'undefined' && typeof $persistentStore.write === 'function') {
      $persistentStore.write(cookie, TARGET_KEY);
    }
    // Web Storage 风格（某些环境）
    else if (typeof $storage !== 'undefined' && typeof $storage.setItem === 'function') {
      $storage.setItem(TARGET_KEY, cookie);
    }
    // Node 环境：写入文件（位于 /tmp/xueshu_cookie.txt）
    else if (typeof require === 'function') {
      try {
        const fs = require('fs');
        const path = '/tmp/xueshu_cookie.txt';
        fs.writeFileSync(path, cookie, { encoding: 'utf8' });
        console.log('xueshu_get_cookie: cookie saved to', path);
      } catch (e) { /* ignore file write errors */ }
    }
  } catch (e) {
    // 忽略写入错误，但会通知
  }

  // 发送本地通知（只要运行环境支持）
  try {
    const short = cookie.split(';')[0]; // 只显示第一段，避免太长
    if (typeof $notify === 'function') {
      $notify('学术FUN - Cookie 已保存', short, '存储 Key: ' + TARGET_KEY);
    } else if (typeof console !== 'undefined') {
      console.log('学术FUN - Cookie 已保存 ->', short);
    }
  } catch (e) { /* ignore */ }

  // 完成并返回原始响应（不修改）
  if (typeof $done === 'function') {
    $done({}); // 保留原始响应（QX 会自动使用原始响应）
  } else {
    // Node / 其他：打印并结束
    console.log('xueshu_get_cookie: done');
  }
})();
