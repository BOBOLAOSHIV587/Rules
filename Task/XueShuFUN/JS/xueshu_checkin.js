/*
  checkin_xueshu.js
  通用签到脚本（兼容 Quantumult X / Surge / Loon / Node）
  说明：
    - 请把你的 Cookie 填入 config.COOKIE（或使用 QX 的环境变量/变量面板注入）
    - 脚本会尝试一组常见签到接口，并报告第一个成功的结果
    - 若站点使用动态 token/签名，需把真实浏览器请求粘贴给我以便定制

[task_local]
# 每天 09:00 执行一次（CRON）
0 9 * * * checkin_xueshu.js, timeout=10

[rewrite_local]
# 捕获学术FUN 登录/首页的响应并提取 Cookie
^https?:\/\/xueshu\.fun\/.* url script-response-header xueshu_get_cookie.js

[mitm]
hostname = xueshu.fun

*/

const config = {
  HOST: 'https://xueshu.fun',
  // === 在这里填 Cookie（或在 QX/Surge 中使用脚本变量注入） ===
  COOKIE: 'wordpress_63c6d91ecc476e0b2b0f7d9535c9cc65=bobolaoshi%7C1762106525%7CTPfhZDO7hhflvcOvfJdpbPJ6ktyFfEnB3MtkxyLkD1W%7C83c3ae863060169a4c186163e2216228329796292ce0294dc723ee77fb518', // 示例: 'PHPSESSID=xxx; laravel_session=yyy; ...'
  // 可选自定义 UA
  UA: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  // 请求超时（ms）
  timeout: 15000,
};

// 一组常见的“签到”接口候选（按常见优先）
const candidates = [
  '/user/checkin',
  '/checkin',
  '/api/checkin',
  '/index.php?c=checkin',
  '/user/signin',
  '/signin',
  '/ajax/checkin',
  '/?s=api/user/checkin',
];

// 通用请求函数（兼容 QX/Surge/Loon/Node）
function httpRequest(options) {
  return new Promise((resolve) => {
    // Quantumult X (task.fetch)
    if (typeof $task !== 'undefined' && $task.fetch) {
      const opt = {
        method: options.method || 'GET',
        url: options.url,
        headers: options.headers || {},
        body: options.body,
        timeout: config.timeout / 1000,
      };
      $task.fetch(opt).then(resp => {
        resolve({ status: resp.status || resp.statusCode, body: resp.body, headers: resp.headers });
      }).catch(err => resolve({ status: -1, body: String(err), headers: {} }));
      return;
    }

    // Surge / Loon ($httpClient)
    if (typeof $httpClient !== 'undefined' && $httpClient) {
      $httpClient[options.method === 'POST' ? 'post' : 'get']({
        url: options.url,
        headers: options.headers || {},
        body: options.body,
        timeout: config.timeout,
      }, (err, resp, body) => {
        if (err) resolve({ status: -1, body: String(err), headers: {} });
        else resolve({ status: resp && resp.status || resp && resp.statusCode || 0, body: body, headers: resp.headers || {} });
      });
      return;
    }

    // Node.js fallback (for local测试)
    if (typeof require === 'function') {
      const https = require('https');
      const urlLib = require('url');
      const u = urlLib.parse(options.url);
      const opts = {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.path,
        method: options.method || 'GET',
        headers: options.headers || {},
      };
      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      });
      req.on('error', e => resolve({ status: -1, body: String(e), headers: {} }));
      if (options.body) req.write(options.body);
      req.end();
      return;
    }

    // otherwise unsupported runtime
    resolve({ status: -1, body: 'unsupported runtime', headers: {} });
  });
}

function notify(title, subtitle, message) {
  const body = `${title}\n${subtitle}\n${message}`;
  if (typeof $notify !== 'undefined') {
    $notify(title, subtitle, message);
  } else if (typeof console !== 'undefined') {
    console.log(body);
  }
}

// 尝试签到候选接口
async function tryCheckin() {
  if (!config.COOKIE) {
    notify('学术FUN 签到失败', '缺少 COOKIE', '请把你的 Cookie 填入脚本 config.COOKIE 或在 QX 环境变量中注入');
    return;
  }

  // 先 GET 首页取得可能的 token / 页面信息（有些站点需要 Referer / token）
  const homepage = await httpRequest({
    url: config.HOST + '/',
    method: 'GET',
    headers: {
      'User-Agent': config.UA,
      'Cookie': config.COOKIE,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  // 从首页尝试解析可能嵌入的 token（简单策略：查找 name="csrf-token" 或 meta csrf-token）
  let csrfToken = null;
  try {
    const body = homepage.body || '';
    // meta 标记
    const m1 = body.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i);
    if (m1) csrfToken = m1[1];
    // input 隐藏域
    const m2 = body.match(/<input[^>]+name=["']?_token["'][^>]+value=["']([^"']+)["']/i);
    if (!csrfToken && m2) csrfToken = m2[1];
  } catch (e) { /* ignore */ }

  // 如果首页有明确的签到链接（比如 <a href="/user/checkin"...>），试着抓取第一个 href 包含 “签到” / "sign" 的链接
  let candidateFromPage = null;
  try {
    const body = homepage.body || '';
    const m = body.match(/href=["']([^"']+)["'][^>]*>[^<]*(签到|打卡|sign)/i);
    if (m) {
      candidateFromPage = m[1];
      // 如果是相对路径，正常化
      if (!/^https?:\/\//i.test(candidateFromPage)) candidateFromPage = config.HOST.replace(/\/$/, '') + '/' + candidateFromPage.replace(/^\//, '');
    }
  } catch (e) { /* ignore */ }

  const tried = [];
  const base = config.HOST.replace(/\/$/, '');
  // 如果页面直接给出链接，把它放到候选首位
  let list = candidates.slice();
  if (candidateFromPage) {
    list.unshift(candidateFromPage.replace(base, '')); // 相对化
  }

  // 将候选路径标准化为完整 URL
  const urls = list.map(p => {
    if (/^https?:\/\//i.test(p)) return p;
    return base + (p.startsWith('/') ? p : '/' + p);
  });

  for (const url of urls) {
    // 忽略重复
    if (tried.includes(url)) continue;
    tried.push(url);

    // 构造请求头
    const headers = {
      'User-Agent': config.UA,
      'Cookie': config.COOKIE,
      'Referer': config.HOST + '/',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
    };
    if (csrfToken) {
      // 尝试常见 header 名称
      headers['X-CSRF-TOKEN'] = csrfToken;
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // 先尝试 POST（签到通常是 POST），若 405/404 则尝试 GET
    let resp = await httpRequest({ url, method: 'POST', headers, body: '' });
    // 如果返回 404 或 405，用 GET 再试一次
    if (resp.status === 404 || resp.status === 405 || resp.status === -1) {
      resp = await httpRequest({ url, method: 'GET', headers });
    }

    // 尝试解析 JSON
    let body = resp.body || '';
    let parsed = null;
    try {
      parsed = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      // 不是 JSON，则当作纯文本，尝试查找“签到成功”关键词
    }

    // 判断成功的几种策略：
    // 1) JSON 中有 success、code=0/1，message 包含“已签到”/“签到成功”之类
    // 2) 文本中包含“签到成功”“已签到”“获得奖励” 等
    const text = (typeof body === 'string' ? body : JSON.stringify(body)).toString();

    const successIndicators = [
      /签到成功/i,
      /已签到/i,
      /获得奖励/i,
      /success/i,
      /OK/i,
    ];

    let ok = false;
    let message = `尝试 ${url} 返回状态 ${resp.status}`;

    if (parsed && typeof parsed === 'object') {
      // 常见结构： { code: 0, msg: "..."} 或 { success: true, message: "..." }
      if (parsed.code === 0 || parsed.code === '0' || parsed.success === true || parsed.success === 'true' || parsed.status === 'success') {
        ok = true;
        message = JSON.stringify(parsed);
      } else if (parsed.message || parsed.msg) {
        const mm = (parsed.message || parsed.msg).toString();
        if (successIndicators.some(rx => rx.test(mm))) ok = true;
        message = mm;
      } else {
        // 检查所有字段
        const joined = JSON.stringify(parsed);
        if (successIndicators.some(rx => rx.test(joined))) ok = true;
        message = joined;
      }
    } else {
      if (successIndicators.some(rx => rx.test(text))) ok = true;
      message = text.slice(0, 500);
    }

    if (ok) {
      notify('学术FUN 签到结果', '成功', `接口: ${url}\n响应: ${message}`);
      return;
    }
  }

  // 所有候选失败 → 报告并附上尝试过的 URL 列表
  notify('学术FUN 签到结果', '未能签到', `尝试接口：\n${urls.join('\n')}\n\n可能原因：需要动态 CSRF/token 或签名。请用浏览器抓包真实签到请求给我，我可以帮你适配。`);
}

// 运行
(async () => {
  try {
    await tryCheckin();
  } catch (e) {
    notify('学术FUN 签到脚本错误', '', String(e));
  } finally {
    if (typeof $done === 'function') $done();
  }
})();
