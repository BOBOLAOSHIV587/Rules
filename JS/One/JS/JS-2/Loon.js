// 最后更新: 2026-04-11 09:38 (北京时间)
const requestUrl = $request.url;
const method = ($request.method || "GET").toLowerCase();

// 把原始 URL 转成 CF Worker 路由 (移除 bypass 参数，追求极致纯净)
const match = requestUrl.match(/^https?:\/\/([^/?#]+)(\/[^?#]*)?(\?.*)?/);
const workerBase = "https://one-api.zzxu.de/one";

if (match) {
    const host = match[1];
    const pathAndSearch = (match[2] || "") + (match[3] || "");
    const targetUrl = `${workerBase}/${host}${pathAndSearch}`;

    const options = {
        url: targetUrl,
        headers: { ...$request.headers },
        timeout: 12000
    };
    
    // 强制清理可能干扰 Akamai 的头
    delete options.headers["Host"];
    delete options.headers["host"];
    delete options.headers["External"];
    
    if ($request.body) options.body = $request.body;

    const useHttpClient = typeof $httpClient !== "undefined";
    const fetchFunc = useHttpClient ? $httpClient[method].bind($httpClient) : $task.fetch.bind($task);

    fetchFunc(options, (error, response, data) => {
        if (error) {
            $done({ response: { status: 500, body: String(error) } });
            return;
        }

        const resp = response || {};
        const code = resp.status || resp.statusCode || 200;
        const headers = resp.headers || {};
        const cleanHeaders = {};

        for (const k in headers) {
            if (!["content-encoding", "content-length", "transfer-encoding"].includes(k.toLowerCase())) {
                cleanHeaders[k] = headers[k];
            }
        }

        $done({
            response: {
                status: code,
                headers: cleanHeaders,
                body: data || response.body
            }
        });
    });
} else {
    $done({});
}
