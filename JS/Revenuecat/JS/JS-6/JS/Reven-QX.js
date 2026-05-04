/*
 * Reven QX Response Modifier
 * 支持域名: api.revenuecat.com及代理解析、 subscriptions-api.superwall.com、 api.adapty.io
 * 注意: 由于内购收据的本地缓存机制，接入 Adapty 框架的 App 通常需要卸载并重新安装才能获取解锁权限！
 * 可在 BoxJS 订阅面板配置: reven_mock / reven_bypass
 * iTunes (buy.itunes.apple.com) 由独立的 qx-itunes.js 处理, 互不干扰。
 */
const StatusTexts = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable"
};

// 最新修改/部署时间: 2026-04-08 02:50:00 (UTC+8)
const requestUrl = $request.url;
const requestHeaders = $request.headers || {};
delete requestHeaders["Host"];
delete requestHeaders["host"];
const requestBody = $request.body;
const requestMethod = $request.method;

// #bypass=xxx
function getParams(url) {
  const params = {};
  if (!url) return params;
  const hashSplit = url.split('#');
  if (hashSplit.length > 1) {
    const pairs = hashSplit[1].split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (v !== undefined) params[decodeURIComponent(k)] = decodeURIComponent(v);
    }
  }
  return params;
}

const params = getParams(typeof $environment !== 'undefined' ? $environment.sourcePath : "");
// 优先级: BoxJS ($prefs) > URL hash (#bypass=xxx) > 默认 "-"
const boxjsBypass = (typeof $prefs !== 'undefined' && $prefs.valueForKey) ? $prefs.valueForKey("reven_bypass") : null;
const bypassParam = (boxjsBypass && boxjsBypass.length) ? boxjsBypass : (params.bypass || "-");
const boxjsMock = (typeof $prefs !== 'undefined' && $prefs.valueForKey) ? $prefs.valueForKey("reven_mock") : null;
const mockGateway = (boxjsMock && boxjsMock.length) ? boxjsMock.replace(/\/+$/, "") : "https://reven.jsforbaby.workers.dev/reven";

// 检查是否命中旁路
const ua = (requestHeaders["User-Agent"] || requestHeaders["user-agent"] || "").toLowerCase();
let isBypass = false;
if (bypassParam !== "-") {
  const keywords = bypassParam.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (keywords.length > 0) {
    isBypass = keywords.some(kw => ua.includes(kw));
  }
}

//  https://api.revenuecat.com/v1/receipts
const regex = /^https:\/\/(api\.revenuecat\.com|api\.rc-backup\.com|rc\.visionarytech\.ltd|revenue\.cuto\.app|proxy\.linearity\.io|subscriptions-api\.superwall\.com|api\.adapty\.io)\/(.*)$/;
const match = requestUrl.match(regex);

let targetUrl = requestUrl; // 若命中 Bypass 或正则不匹配，默认为原始请求地址 (不走 Worker)
if (!isBypass && match) {
  const host = match[1];
  const rest = match[2];
  targetUrl = `${mockGateway}/${host}/${rest}?bypass=${encodeURIComponent(bypassParam)}`;
}

const options = {
  url: targetUrl,
  method: requestMethod,
  headers: requestHeaders,
  body: requestBody,
  timeout: 10000
};

$task.fetch(options).then(
  response => {
    let cleanHeaders = {};
    for (let key in response.headers) {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        cleanHeaders[key] = response.headers[key];
      }
    }
    $done({
      status: `HTTP/1.1 ${response.statusCode || 200} ${StatusTexts[response.statusCode || 200]}`,
      headers: cleanHeaders,
      body: response.body
    });
  },
  reason => {
    console.log("Request failed:", reason);
    $done({
      status: "HTTP/1.1 500 Internal Server Error",
      headers: {
        server: "Reven",
        "content-type": "application/json; charset=utf-8",
      },
      body: '{"error":"Request failed"}'
    });
  }
);
