// WhosTV for Loon
// Author: @imzwr6
// Repo: https://github.com/imzwr214/whos
//
// 功能：
// 1. http-request 场景：抓取 whos.tv Cookie 并写入 Loon 持久化存储。
// 2. cron 场景：读取插件参数或已抓取 Cookie。
//
// 注意：当前 public 仓库未包含 WhosTV 签到接口细节，避免误请求或暴露私有接口。
// 后续确认签到接口后，只需要在 runCheckin(cookie) 中补请求即可。

const STORE_KEY = 'whostv_cookie';
const APP_NAME = 'WhosTV';

function getArg(name) {
  try {
    if (typeof $argument === 'object' && $argument !== null) {
      return $argument[name];
    }
    if (typeof $argument === 'string') {
      try {
        const parsed = JSON.parse($argument);
        return parsed[name];
      } catch (_) {
        const pairs = $argument.split('&');
        for (const pair of pairs) {
          const [k, v] = pair.split('=');
          if (k === name) return decodeURIComponent(v || '');
        }
      }
    }
  } catch (_) {}
  return '';
}

function notify(title, subtitle, body) {
  if (typeof $notification !== 'undefined') {
    $notification.post(title, subtitle || '', body || '');
  } else if (typeof $notify !== 'undefined') {
    $notify(title, subtitle || '', body || '');
  }
}

function done(value) {
  if (typeof $done !== 'undefined') $done(value || {});
}

function readCookie() {
  const manualCookie = getArg('whostv_cookie');
  if (manualCookie && manualCookie !== 'xxx') return manualCookie;
  return $persistentStore.read(STORE_KEY) || '';
}

function captureCookie() {
  const headers = ($request && $request.headers) || {};
  const cookie = headers.Cookie || headers.cookie || '';

  if (!cookie) {
    done({});
    return;
  }

  const oldCookie = $persistentStore.read(STORE_KEY) || '';
  if (cookie !== oldCookie) {
    $persistentStore.write(cookie, STORE_KEY);
    notify(APP_NAME, 'Cookie 抓取成功', '已写入 Loon 持久化存储，建议回插件页面关闭 Cookie 抓取。');
  }
  done({});
}

function runCheckin(cookie) {
  if (!cookie) {
    notify(APP_NAME, '签到跳过', '未读取到 Cookie，请先开启 Cookie 抓取并登录 whos.tv，或在插件里手动填写 Cookie。');
    done({});
    return;
  }

  // TODO: 补充 WhosTV 实际签到接口后，在这里发起请求。
  // 保留这个安全占位，避免在接口未确认时乱请求造成账号风控或签到失败误判。
  notify(APP_NAME, 'Cookie 已读取', 'Loon 参数与抓取逻辑已就绪；待补充实际签到接口。');
  done({});
}

if (typeof $request !== 'undefined') {
  captureCookie();
} else {
  runCheckin(readCookie());
}
