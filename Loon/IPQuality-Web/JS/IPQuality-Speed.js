/**
 * 节点 IP 质量检测 · HTTPS 轻量测速
 *
 * 通过目标节点访问 Cloudflare 官方测速端点，测量端到端延迟与轻量吞吐。
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Updated: 2026-08-04
 */

const SPEED_VERSION = "2026-08-04.poc12";
const SESSION_KEY = "paperclip.ipquality.web.session";
const SESSION_TTL_MS = 30 * 60 * 1000;
const TOTAL_BUDGET_MS = 14000;
const BASE_URL = "https://speed.cloudflare.com";
const SMALL_DOWNLOAD_BYTES = 262144;
const LARGE_DOWNLOAD_BYTES = 1048576;
const SMALL_UPLOAD_BYTES = 131072;
const LARGE_UPLOAD_BYTES = 524288;
const USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";
const startedAt = Date.now();

const session = readSession();
const requestRun = queryValue($request && $request.url, "run");

if (!session || !session.node || !requestRun || requestRun !== session.id) {
    respondJson(409, { ok: false, error: "检测会话无效，请返回 Loon 重新启动" });
} else if (Date.now() - Number(session.createdAt || 0) > SESSION_TTL_MS) {
    respondJson(410, { ok: false, error: "检测会话已过期，请返回 Loon 重新启动" });
} else {
    run(session.node).then(
        (result) => respondJson(200, {
            ok: true,
            module: "speed",
            title: "节点 HTTPS 轻量测速",
            node: session.node,
            elapsedMs: Date.now() - startedAt,
            html: renderReport(result),
            version: SPEED_VERSION,
        }),
        (error) => respondJson(500, {
            ok: false,
            module: "speed",
            title: "节点 HTTPS 轻量测速",
            error: errorText(error),
        })
    );
}

async function run(nodeName) {
    const latencySamples = [];
    const notes = [];
    for (let index = 0; index < 3 && remaining() > 1200; index += 1) {
        const probe = await capture(request("GET", `${BASE_URL}/__down?bytes=0&r=${nonce()}`, {
            node: nodeName,
            timeout: Math.min(2200, remaining()),
            headers: commonHeaders("text/plain"),
        }));
        if (probe.ok) latencySamples.push(probe.value.elapsedMs);
        else notes.push(`延迟样本 ${index + 1}：${truncate(probe.error, 42)}`);
    }

    let download = await downloadSample(nodeName, SMALL_DOWNLOAD_BYTES);
    if (download.valid && download.elapsedMs < 900 && remaining() >= 2800) {
        const larger = await downloadSample(nodeName, LARGE_DOWNLOAD_BYTES);
        if (larger.valid) download = larger;
        else notes.push(`大样本下载：${larger.error}`);
    }

    let upload = null;
    if (download.valid && remaining() >= 1800) {
        upload = await uploadSample(nodeName, SMALL_UPLOAD_BYTES);
        if (upload.valid && upload.elapsedMs < 900 && remaining() >= 2800) {
            const larger = await uploadSample(nodeName, LARGE_UPLOAD_BYTES);
            if (larger.valid) upload = larger;
            else notes.push(`大样本上传：${larger.error}`);
        }
    } else if (!download.valid) {
        notes.push("下载未完成，已跳过上传，避免继续占用时间");
    }

    if (!download.valid) notes.push(`下载：${download.error}`);
    if (upload && !upload.valid) notes.push(`上传：${upload.error}`);
    return {
        latencyMs: median(latencySamples),
        latencyCount: latencySamples.length,
        download: download.valid ? download : null,
        upload: upload && upload.valid ? upload : null,
        notes,
    };
}

async function downloadSample(nodeName, requestedBytes) {
    if (remaining() < 500) return invalidSample(requestedBytes, "整体时间预算已用尽");
    const result = await capture(request("GET", `${BASE_URL}/__down?bytes=${requestedBytes}&r=${nonce()}`, {
        node: nodeName,
        timeout: Math.min(4500, remaining()),
        binaryMode: true,
        headers: commonHeaders("application/octet-stream"),
    }));
    if (!result.ok) return invalidSample(requestedBytes, result.error);
    const received = bodyLength(result.value.body);
    const declared = contentLength(result.value.response);
    const complete = received >= requestedBytes * 0.9 && (!declared || declared >= requestedBytes * 0.9);
    return {
        valid: complete,
        bytes: received,
        requestedBytes,
        elapsedMs: result.value.elapsedMs,
        mbps: complete ? mbps(received, result.value.elapsedMs) : null,
        error: complete ? "" : `实收 ${received} / ${requestedBytes} 字节`,
    };
}

async function uploadSample(nodeName, requestedBytes) {
    if (remaining() < 500) return invalidSample(requestedBytes, "整体时间预算已用尽");
    const result = await capture(request("POST", `${BASE_URL}/__up?bytes=${requestedBytes}&r=${nonce()}`, {
        node: nodeName,
        timeout: Math.min(4500, remaining()),
        headers: Object.assign(commonHeaders("*/*"), { "Content-Type": "application/octet-stream" }),
        body: repeatBody(requestedBytes),
    }));
    if (!result.ok) return invalidSample(requestedBytes, result.error);
    return {
        valid: true,
        bytes: requestedBytes,
        requestedBytes,
        elapsedMs: result.value.elapsedMs,
        mbps: mbps(requestedBytes, result.value.elapsedMs),
        acknowledged: true,
        error: "",
    };
}

function request(method, url, options) {
    const config = options || {};
    return new Promise((resolve, reject) => {
        const beganAt = Date.now();
        let settled = false;
        const timeoutMs = Math.max(250, Number(config.timeout) || 3000);
        const timer = setTimeout(() => finish(new Error(`请求超时（${timeoutMs} ms）`)), timeoutMs + 80);
        const requestOptions = {
            url,
            node: config.node,
            timeout: timeoutMs,
            headers: config.headers || {},
        };
        if (config.binaryMode) requestOptions["binary-mode"] = true;
        if (typeof config.body !== "undefined") requestOptions.body = config.body;

        function finish(error, response, body) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) {
                reject(error instanceof Error ? error : new Error(String(error)));
                return;
            }
            const status = Number(response && (response.status || response.statusCode));
            if (!Number.isFinite(status) || status < 200 || status >= 300) {
                reject(new Error(`HTTP ${status || "?"}`));
                return;
            }
            resolve({ response: response || {}, body, elapsedMs: Math.max(1, Date.now() - beganAt) });
        }

        const callback = (error, response, body) => finish(error, response, body);
        if (String(method).toUpperCase() === "POST") $httpClient.post(requestOptions, callback);
        else $httpClient.get(requestOptions, callback);
    });
}

function renderReport(result) {
    const latency = result.latencyMs === null
        ? '<b class="bad">未完成</b>'
        : `<b>${Math.round(result.latencyMs)} ms <small>${result.latencyCount} 次中位数</small></b>`;
    const download = result.download
        ? `<b>${result.download.mbps} Mbps <small>${sampleLabel(result.download)}</small></b>`
        : '<b class="bad">未完成</b>';
    const upload = result.upload
        ? `<b>${result.upload.mbps} Mbps <small>${sampleLabel(result.upload)} · 服务端已响应</small></b>`
        : '<b class="muted-value">未执行或未完成</b>';
    const notes = result.notes.length
        ? `<div class="notes">${result.notes.map((item) => `<div>• ${escapeHtml(item)}</div>`).join("")}</div>` : "";
    return '<style>'
        + '.report-root{font-family:-apple-system,BlinkMacSystemFont;font-size:14px;line-height:1.5;text-align:left;padding:18px 0 92px}'
        + '.report-title{font-size:20px;font-weight:700;margin-bottom:12px}.node-label{color:#8e8e93;font-size:11px;margin-bottom:10px}'
        + '.report-section{display:block;margin:8px 0;border-top:1px solid rgba(142,142,147,.2)}.section-summary{min-height:42px;color:#0A84FF;font-weight:700;font-size:15px;display:flex;align-items:center}'
        + '.speed-card{padding:4px 0}.metric{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid rgba(142,142,147,.14)}.metric span{color:#8e8e93}.metric b{text-align:right}.metric small{display:block;color:#8e8e93;font-size:10px;font-weight:400}.bad{color:#ff453a}.muted-value{color:#8e8e93}.notes,.method-note{margin-top:10px;color:#8e8e93;font-size:11px;line-height:1.55}.method-note{padding:9px 10px;border-radius:10px;background:rgba(142,142,147,.1)}.report-note{color:#8e8e93;font-size:10px;margin-top:12px}'
        + '</style><div class="report-root"><div class="report-title">节点 HTTPS 轻量测速</div>'
        + `<div class="node-label">Cloudflare Speed · ${SPEED_VERSION}</div><section class="report-section"><div class="section-summary">▌节点 HTTPS 轻量测速</div><div class="section-body"><div class="speed-card">`
        + `<div class="metric"><span>目标</span><b>Cloudflare Edge<small>HTTPS · 443</small></b></div>`
        + `<div class="metric"><span>HTTPS 响应</span>${latency}</div><div class="metric"><span>下载</span>${download}</div><div class="metric"><span>上传</span>${upload}</div>${notes}<div class="method-note">Cloudflare HTTPS 单连接小样本，适合快速判断节点当前速度；不是 Ookla 或 VPS 本机带宽。</div></div></div></section>`
        + '<div class="report-note">数据来自目标节点的真实 HTTPS 收发字节与端到端耗时。它适合快速判断节点当前可用速度，不等同于 Ookla 多连接测速或 VPS 本机带宽。</div></div>';
}

function commonHeaders(accept) {
    return { Accept: accept, "Accept-Encoding": "identity", "Cache-Control": "no-cache", "User-Agent": USER_AGENT };
}

function readSession() {
    try {
        const raw = $persistentStore.read(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

function queryValue(url, key) {
    const match = String(url || "").match(new RegExp(`[?&]${key}=([^&#]*)`));
    if (!match) return "";
    try {
        return decodeURIComponent(match[1].replace(/\+/g, " "));
    } catch (_) {
        return match[1];
    }
}

function contentLength(response) {
    const headers = response && response.headers || {};
    const key = Object.keys(headers).find((name) => name.toLowerCase() === "content-length");
    const value = key ? Number(headers[key]) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
}

function bodyLength(body) {
    if (body === null || typeof body === "undefined") return 0;
    if (typeof body.byteLength === "number") return body.byteLength;
    if (typeof body.length === "number") return body.length;
    return 0;
}

function repeatBody(bytes) {
    const unit = "0123456789abcdef";
    return unit.repeat(Math.ceil(bytes / unit.length)).slice(0, bytes);
}

function invalidSample(requestedBytes, error) {
    return { valid: false, bytes: 0, requestedBytes, elapsedMs: 0, mbps: null, error: truncate(error, 64) };
}

function sampleLabel(sample) {
    const size = sample.bytes >= 1048576
        ? `${(sample.bytes / 1048576).toFixed(1)} MB`
        : `${Math.round(sample.bytes / 1024)} KB`;
    return `${size} / ${sample.elapsedMs} ms`;
}

function median(values) {
    if (!values.length) return null;
    const sorted = values.slice().sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function mbps(bytes, ms) {
    return Math.round(((Number(bytes) * 8) / (Math.max(1, Number(ms)) * 1000)) * 100) / 100;
}

function remaining() {
    return Math.max(0, TOTAL_BUDGET_MS - (Date.now() - startedAt));
}

function nonce() {
    return `${Date.now()}${Math.floor(Math.random() * 100000)}`;
}

function capture(promise) {
    return Promise.resolve(promise).then(
        (value) => ({ ok: true, value }),
        (error) => ({ ok: false, error: errorText(error) })
    );
}

function truncate(value, maxLength) {
    const text = String(value || "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function errorText(error) {
    return error && (error.message || error.toString()) || "未知错误";
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function respondJson(status, value) {
    $done({
        response: {
            status,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Access-Control-Allow-Origin": "*",
                "X-Content-Type-Options": "nosniff",
            },
            body: JSON.stringify(value),
        },
    });
}
