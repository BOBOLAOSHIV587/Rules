// 最新修改/部署时间: 2026-04-08 02:50:00 (UTC+8)
// 参考薯薯: https://github.com/NSNanoCat/util/blob/main/test/argument.test.js
const url = $request.url;
let bypassParam = "-";

if (typeof $argument !== "undefined" && $argument !== null && $argument !== "") {
    if (typeof $argument === "string") {
        let str = $argument.trim();
        if (str.includes("Bypass=") || str.includes("bypass=")) {
            const match = str.match(/(?:Bypass|bypass)=([^&]+)/i);
            if (match) bypassParam = decodeURIComponent(match[1]);
        } else if (str.startsWith("[") && str.endsWith("]")) {
            bypassParam = str.slice(1, -1);
        } else {
            bypassParam = str;
        }
    } else if (typeof $argument === "object") {
        if ($argument.Bypass !== undefined) bypassParam = String($argument.Bypass);
        else if ($argument.bypass !== undefined) bypassParam = String($argument.bypass);
        else if (Array.isArray($argument) && $argument.length > 0) bypassParam = String($argument[0]);
    }
}

const regex = /^https:\/\/(api\.revenuecat\.com|api\.rc-backup\.com|rc\.visionarytech\.ltd|revenue\.cuto\.app|proxy\.linearity\.io|subscriptions-api\.superwall\.com|api\.adapty\.io)\/(.*)$/;
const match = url.match(regex);

if (match) {
    const host = match[1];
    const rest = match[2];
    const targetUrl = `https://reven.jsforbaby.workers.dev/reven/${host}/${rest}?bypass=${encodeURIComponent(bypassParam)}`;

    // 透明代理
    const method = ($request.method || "GET").toLowerCase();
    const options = {
        url: targetUrl,
        headers: $request.headers
    };
    if ($request.body) {
        options.body = $request.body;
    }

    if (["get", "post", "put", "delete", "head", "options", "patch"].includes(method)) {
        $httpClient[method](options, function (error, response, data) {
            if (error) {
                $done({ response: { status: 500, body: String(error) } });
                return;
            }

            let headers = response.headers || {};
            // Loon底层会自动解压和处理分块，如果把原内容带 gzip 或 chunked 的 header 原封不动传给 APP，导致解锁失败
            const cleanHeaders = {};
            for (let key in headers) {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                    cleanHeaders[key] = headers[key];
                }
            }

            $done({
                response: {
                    status: response.status || response.statusCode || 200,
                    headers: cleanHeaders,
                    body: data
                }
            });
        });
    } else {
        $done({});
    }
} else {
    $done({});
}
