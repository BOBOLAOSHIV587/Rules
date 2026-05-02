/*
 * One QX
 * 致敬开源: https://github.com/NSNanoCat/util
 *
 [rewrite_local]
 ^https?:\/\/(api|jmtp)(.*-uat)?\.[\w]+\.com\/v2\.5\/(bootstrap|user\/login|user\/avatarFrame|article\/discovery|navigation|ad\/space|my\/userExtraInfo|article\/download|vip\/download|article\/detail) url script-analyze-echo-response https://one-api.zzxu.de/one/qx.js

 [mitm]
 hostname = api.apubis.com, api.pjq6he.com, api.zbdk8ws.com, api.f38khx.com, api.deyhhc3.com, api.68f4deb.com, api.3459381.com, api.61c76a0.com, api.87735d5.com, api.afe9a49.com, api.c6dd5cc.com, api.2b37894.com, api.35a46dd.com, api.43b8477.com, api.5ce3771.com, api.632d809.com, api.b675211.com, api.a9a2bc4.com, api.8eb269a.com, api.4c86d03.com, api.979bb9e.com, api.988068b.com, api.9cbd862.com, api.c2e777b.com, api.b676039.com, api.ab1e7ee.com, api.5ed249d.com, api.2b1daea.com, api.4934430.com, api.645fb8d.com, api.53cuk7g.com, api.5ebd5d.com, api.em1oifd0.com, jmtp.*.com, api.k55n2r.com, api.26bb4xt.com, api.vf5x3hv.com, api.fexsqz.com, api.ec53y2t.com, api.j7y675.com, qqcapi.*.com, www.nj5byj6j.com
 */

const StatusTexts = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable",
};

const requestUrl   = $request.url;
const requestHeaders = Object.assign({}, $request.headers || {});
delete requestHeaders["Host"];
delete requestHeaders["host"];
const requestBody  = $request.body;
const requestMethod = $request.method || "GET";

// 把原始 URL 转成 CF Worker 路由：
// https://api.apubis.com/v2.5/article/detail → https://one-api.zzxu.de/one/api.apubis.com/v2.5/article/detail
const match = requestUrl.match(/^https?:\/\/([^/?#]+)(\/[^?#]*)?(\?.*)?/);
const workerBase = "https://one-api.zzxu.de/one";
const targetUrl = match
  ? `${workerBase}/${match[1]}${match[2] || ""}${match[3] || ""}`
  : requestUrl;

const options = {
  url: targetUrl,
  method: requestMethod,
  headers: requestHeaders,
  timeout: 12000,
};
if (requestBody) options.body = requestBody;

$task.fetch(options).then(
  (response) => {
    const code = response.statusCode || 200;
    const cleanHeaders = {};
    for (const k in response.headers || {}) {
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(k.toLowerCase())) {
        cleanHeaders[k] = response.headers[k];
      }
    }
    $done({
      status: `HTTP/1.1 ${code} ${StatusTexts[code] || "OK"}`,
      headers: cleanHeaders,
      body: response.body,
    });
  },
  (reason) => {
    console.log("❌ One Worker 请求失败:", reason);
    $done({
      status: "HTTP/1.1 500 Internal Server Error",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "worker request failed", reason: String(reason) }),
    });
  }
);
