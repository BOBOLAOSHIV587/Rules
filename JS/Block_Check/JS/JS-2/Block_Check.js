/**
 * 节点阻断检测 · Loon generic 脚本
 *
 * 使用:在 Loon 的节点或策略组页面对目标执行「节点阻断检测」
 *
 * @Author: @RavelloH <https://github.com/RavelloH>
 * @Modifier: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Channel: Telegram 频道 https://t.me/mayihei
 * @Updated: 2026-07-17
 *
 * ===== Loon =====
 * [Script]
 * generic script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/loon/nodecheck/nodecheck.js, tag=节点阻断检测, timeout=20, img-url=bolt.horizontal.icloud.fill.system, enable=true
 */

const SCRIPT_VERSION = "2026-07-17.r1";
const IP_API = "http://ip-api.com/json?lang=zh-CN";
const CHECK_HOST = "https://check-host.net";
const REQUEST_TIMEOUT = 8000;
const RESULT_DELAY = 3500;
const RESULT_RETRY_DELAY = 2500;

const params = typeof $environment !== "undefined" && $environment.params
    ? $environment.params
    : {};
const nodeName = params.node || "";
const nodeInfo = params.nodeInfo || {};

console.log(`[INFO] 节点阻断检测 ${SCRIPT_VERSION}`);
console.log(`[INFO] 节点: ${nodeName || "未获取"}`);

if (!nodeName) {
    finishError("未获取到节点或策略组名称");
} else {
    run();
}

function run() {
    Promise.all([
        requestGeo(nodeName).then(
            (data) => ({ ok: true, data }),
            (error) => ({ ok: false, error: errorMessage(error) })
        ),
        requestGeo("DIRECT").then(
            (data) => ({ ok: true, data }),
            (error) => ({ ok: false, error: errorMessage(error) })
        ),
        checkRemote(nodeInfo),
    ]).then(
        (results) => render(results[0], results[1], results[2]),
        (error) => finishError(`检测异常: ${errorMessage(error)}`)
    );
}

function requestGeo(node) {
    return requestJson(IP_API, node).then((data) => {
        if (data && data.status === "fail") {
            throw new Error(data.message || "IP 查询失败");
        }
        return data;
    });
}

function requestJson(url, node) {
    return new Promise((resolve, reject) => {
        const options = {
            url,
            timeout: REQUEST_TIMEOUT,
            headers: {
                Accept: "application/json",
                "User-Agent": "Loon Node Check",
            },
        };
        if (node) options.node = node;

        $httpClient.get(options, (error, response, body) => {
            if (error) {
                reject(new Error(String(error)));
                return;
            }
            const status = Number(response && response.status);
            if (status < 200 || status >= 300) {
                reject(new Error(`HTTP ${status || "?"}`));
                return;
            }
            try {
                resolve(JSON.parse(body));
            } catch (_) {
                reject(new Error("响应解析失败"));
            }
        });
    });
}

function checkRemote(info) {
    const address = info && info.address ? String(info.address) : "";
    const port = info && info.port ? String(info.port) : "";
    if (!address || !port) {
        return Promise.resolve({
            available: false,
            reachable: false,
            error: "策略组未提供节点地址，请直接对具体节点运行",
        });
    }

    const host = address.indexOf(":") !== -1 && address.charAt(0) !== "["
        ? `[${address}]`
        : address;
    const target = `${host}:${port}`;
    const submitUrl = `${CHECK_HOST}/check-tcp?host=${encodeURIComponent(target)}&max_nodes=10`;

    return requestJson(submitUrl, "DIRECT").then(
        (submission) => {
            if (!submission || !submission.ok || !submission.request_id) {
                return {
                    available: false,
                    reachable: false,
                    target,
                    error: "远端探测提交失败",
                };
            }

            const nodes = submission.nodes || {};
            const names = Object.keys(nodes);
            const countries = {};
            names.forEach((name) => {
                countries[name] = Array.isArray(nodes[name]) ? nodes[name][0] : "";
            });

            return wait(RESULT_DELAY)
                .then(() => getRemoteResult(submission.request_id, names, countries))
                .then((result) => {
                    if (result.complete) return result;
                    return wait(RESULT_RETRY_DELAY)
                        .then(() => getRemoteResult(submission.request_id, names, countries));
                })
                .then((result) => {
                    if (!result.complete) {
                        return {
                            available: false,
                            reachable: false,
                            target,
                            error: "远端探测暂未返回结果",
                        };
                    }
                    return {
                        available: true,
                        reachable: result.reachable,
                        data: result.items,
                        target,
                    };
                });
        },
        (error) => ({
            available: false,
            reachable: false,
            target,
            error: `远端探测不可用: ${errorMessage(error)}`,
        })
    ).then(
        (result) => result,
        (error) => ({
            available: false,
            reachable: false,
            target,
            error: `远端探测不可用: ${errorMessage(error)}`,
        })
    );
}

function getRemoteResult(requestId, names, countries) {
    return requestJson(`${CHECK_HOST}/check-result/${requestId}`, "DIRECT").then((result) => {
        let reachable = false;
        let complete = false;
        const items = names.map((name) => {
            const records = result && result[name];
            const record = Array.isArray(records) && records.length ? records[0] : null;
            const seconds = record && Number(record.time);
            if (record !== null) complete = true;
            if (Number.isFinite(seconds) && seconds >= 0) reachable = true;
            return {
                flag: getFlag(countries[name]),
                ms: Number.isFinite(seconds) && seconds >= 0
                    ? formatMs(seconds * 1000)
                    : "--.--ms",
            };
        });
        return { reachable, complete, items };
    });
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function render(node, direct, remote) {
    const parts = [];

    let nodeBlock = `<b>节点代理</b>: ${node.ok ? "✅ 正常" : "❌ 不可达"}`;
    if (node.ok && node.data) {
        const data = node.data;
        const location = [data.country, data.regionName || data.region, data.city].filter(Boolean).join(" - ");
        nodeBlock += `<br/><b>IP</b>: ${escapeHtml(data.ip || data.query || "未知")}`;
        if (location) nodeBlock += `<br/><b>位置</b>: ${escapeHtml(location)}`;
        nodeBlock += `<br/><b>ISP</b>: ${escapeHtml(data.isp || data.organization || "未知")}`;
    } else if (node.error) {
        nodeBlock += `<br/><small>${escapeHtml(node.error)}</small>`;
    }
    parts.push(nodeBlock);

    let directBlock = `<b>本机网络</b>: ${direct.ok ? "✅ 正常" : "❌ 异常"}`;
    if (!direct.ok && direct.error) {
        directBlock += `<br/><small>${escapeHtml(direct.error)}</small>`;
    }
    parts.push(directBlock);

    let remoteBlock;
    if (!remote.available) {
        remoteBlock = "<b>远端探测</b>: ⚠️ 未完成";
        if (remote.error) remoteBlock += `<br/><small>${escapeHtml(remote.error)}</small>`;
    } else {
        remoteBlock = `<b>远端探测</b>: ${remote.reachable ? "✅ 可达" : "❌ 不可达"}`;
        if (remote.data && remote.data.length) {
            for (let i = 0; i < remote.data.length; i += 2) {
                const left = remote.data[i];
                const right = remote.data[i + 1];
                remoteBlock += `<br/>${left.flag} <code>${left.ms}</code>`;
                if (right) remoteBlock += `&emsp;&emsp;${right.flag} <code>${right.ms}</code>`;
            }
        }
    }
    parts.push(remoteBlock);

    parts.push("<b>📋 诊断结论</b>");
    if (!direct.ok) {
        parts.push("⚠️ 本机网络异常");
    } else if (node.ok) {
        parts.push("✅ 节点正常");
    } else if (remote.available && remote.reachable) {
        parts.push("🚫 疑似被运营商 / GFW 阻断");
    } else if (remote.available) {
        parts.push("💤 节点疑似离线");
    } else {
        parts.push("❓ 数据不足，无法区分阻断或离线");
    }

    const type = nodeInfo.type ? ` · ${escapeHtml(nodeInfo.type)}` : "";
    parts.push(`<b>节点</b>: <span style="color:#467fcf">${escapeHtml(nodeName)}${type}</span>`);
    if (remote.target) {
        parts.push(`<small>探测目标: ${escapeHtml(remote.target)}</small>`);
    }

    $done({
        title: "   🌐 节点阻断检测",
        htmlMessage: `<div style="font-family:-apple-system;font-size:large">${parts.join("<br/><br/>")}</div>`,
    });
}

function formatMs(ms) {
    if (ms >= 10000) return `${Math.floor(ms)}ms`;
    if (ms >= 1000) return `${Math.floor(ms).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}ms`;
    if (ms >= 100) return `${ms.toFixed(1)}ms`;
    if (ms >= 10) return `${ms.toFixed(2)}ms`;
    if (ms <= 0) return "0.00ms";
    return `${ms.toFixed(3)}ms`;
}

function getFlag(countryCode) {
    if (!countryCode || String(countryCode).length !== 2) return "🌍";
    const points = String(countryCode).toUpperCase().split("").map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint.apply(null, points);
}

function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function errorMessage(error) {
    return error && error.message ? error.message : String(error || "未知错误");
}

function finishError(message) {
    $done({
        title: "   🌐 节点阻断检测",
        htmlMessage: `<div style="font-family:-apple-system;font-size:large"><b>🛑 ${escapeHtml(message)}</b></div>`,
    });
}
