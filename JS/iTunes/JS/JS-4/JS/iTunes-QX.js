/*
 * Reven QX iTunes IAP Unlock
 * 支持域名: buy.itunes.apple.com/verifyReceipt
 * 业务逻辑在 Worker 端 src/Reven/routes/iap.js, 本脚本仅负责 QX 侧转发到 Worker。
 * 可在 BoxJS 订阅面板配置: reven_mock / iap_enabled / iap_expires / iap_country
 */
const StatusTexts = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable"
};

const requestUrl = $request.url;
const requestHeaders = $request.headers || {};
delete requestHeaders["Host"];
delete requestHeaders["host"];
const requestBody = $request.body;
const requestMethod = $request.method;

// #key=value
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

function readPref(key, fallback) {
  const v = (typeof $prefs !== 'undefined' && $prefs.valueForKey) ? $prefs.valueForKey(key) : null;
  if (v && String(v).length) return String(v);
  return fallback;
}

const params = getParams(typeof $environment !== 'undefined' ? $environment.sourcePath : "");

// BoxJS 优先 > URL hash 兜底 > 默认
const mockGateway = (readPref("reven_mock", "https://reven.jsforbaby.workers.dev/reven") || "").replace(/\/+$/, "");
const iapEnabled = readPref("iap_enabled", params.enabled || "true");
const iapExpires = readPref("iap_expires", params.expires || "2099-09-09");
const iapCountry = readPref("iap_country", params.country || "HK");

const iapRegex = /^https:\/\/(buy\.itunes\.apple\.com)\/(.*)$/;
const match = requestUrl.match(iapRegex);

let targetUrl = requestUrl;
if (match && iapEnabled !== "false" && iapEnabled !== "0" && iapEnabled !== "off") {
  const host = match[1];
  const rest = match[2];
  const qs = `enabled=${encodeURIComponent(iapEnabled)}&expires=${encodeURIComponent(iapExpires)}&country=${encodeURIComponent(iapCountry)}`;
  targetUrl = `${mockGateway}/${host}/${rest}?${qs}`;
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
    console.log("iTunes Request failed:", reason);
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
