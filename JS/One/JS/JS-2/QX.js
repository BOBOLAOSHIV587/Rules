/*
 * One QX
 * 致敬开源: https://github.com/NSNanoCat/util
 *
 [rewrite_local]
 ^https?:\/\/(\w*api|jmtp)(.*-uat)?\.[\w]+\.com\/v2\.5\/(bootstrap|user\/login|user\/avatarFrame|article\/discovery|navigation|ad\/space|my\/userExtraInfo|article\/download|vip\/download|article\/detail) url script-analyze-echo-response https://one-api.zzxu.de/one/qx.js

 [mitm]
 hostname = *.apubis.com, *.pjq6he.com, *.zbdk8ws.com, *.f38khx.com, *.deyhhc3.com, *.68f4deb.com, *.3459381.com, *.61c76a0.com, *.87735d5.com, *.afe9a49.com, *.c6dd5cc.com, *.2b37894.com, *.35a46dd.com, *.43b8477.com, *.5ce3771.com, *.632d809.com, *.b675211.com, *.a9a2bc4.com, *.8eb269a.com, *.4c86d03.com, *.979bb9e.com, *.988068b.com, *.9cbd862.com, *.c2e777b.com, *.b676039.com, *.ab1e7ee.com, *.5ed249d.com, *.2b1daea.com, *.4934430.com, *.645fb8d.com, *.53cuk7g.com, *.5ebd5d.com, *.em1oifd0.com, *.k55n2r.com, *.26bb4xt.com, *.vf5x3hv.com, *.fexsqz.com, *.ec53y2t.com, *.j7y675.com, *.nj5byj6j.com, *.einhn4.com, *.ecmxb7e.com
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
