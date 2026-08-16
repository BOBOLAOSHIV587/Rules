/**
 * 节点 IP 质量检测 · 模块化网页接口
 *
 * 由 Safari 本地报告页按需调用；$argument 是固定模块名，不依赖插件参数插值。
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Updated: 2026-08-04
 */

const TEST_VERSION = "2026-08-04.poc12";
const SOURCE_URL = "https://raw.githubusercontent.com/MaYIHEI/paperclip/eaa04fe0a9f37ccfafdd11930d28fd5ff3f04718/loon/ipquality/ipquality.js";
const SESSION_KEY = "paperclip.ipquality.web.session";
const SESSION_TTL_MS = 30 * 60 * 1000;

const MODULES = {
    basic: { title: "基础信息", enabled: ["显示基础信息"] },
    types: { title: "IP 类型属性", enabled: ["显示 IP 类型"] },
    scores: { title: "风险评分", enabled: ["显示风险评分"] },
    factors: { title: "风险因素", enabled: ["显示风险因素"] },
    egress: { title: "出口分流", enabled: ["显示出口分流"] },
    bgp: { title: "BGP 信息", enabled: ["显示 BGP 信息"] },
    bgppath: { title: "BGP 路径", enabled: ["显示目标前缀 BGP 路径"] },
    inbound: { title: "外部探针入站路径", enabled: ["测试外部探针入站路径"] },
    ping: { title: "三网探针延迟", enabled: ["测试外部探针 Ping"] },
    mtr: { title: "外部探针 MTR", enabled: ["测试外部探针 MTR"] },
    stability: { title: "HTTPS 稳定性", enabled: ["测试 HTTPS 稳定性"] },
    media: {
        title: "流媒体与 AI",
        enabled: ["执行媒体与 AI 检测", "显示媒体与 AI 结果"],
    },
    regions: {
        title: "地区一致性",
        enabled: ["执行媒体与 AI 检测", "显示地区一致性"],
    },
    status: { title: "数据状态", enabled: ["显示数据状态"] },
};

const moduleName = normalizeModule(typeof $argument !== "undefined" ? $argument : "");
const moduleConfig = MODULES[moduleName];
const maskIP = queryValue($request && $request.url, "mask") === "1";

if (!moduleConfig) {
    respondJson(400, { ok: false, error: "未知检测模块" });
} else {
    const session = readSession();
    const requestRun = queryValue($request && $request.url, "run");
    if (!session || !session.node || !requestRun || requestRun !== session.id) {
        respondJson(409, { ok: false, error: "检测会话无效，请返回 Loon 重新启动" });
    } else if (Date.now() - Number(session.createdAt || 0) > SESSION_TTL_MS) {
        respondJson(410, { ok: false, error: "检测会话已过期，请返回 Loon 重新启动" });
    } else {
        runModule(session);
    }
}

function runModule(session) {
    const startedAt = Date.now();
    $httpClient.get({ url: SOURCE_URL, timeout: 12000 }, (error, response, body) => {
        if (error || !response || Number(response.status) < 200 || Number(response.status) >= 300 || !body) {
            respondJson(502, {
                ok: false,
                module: moduleName,
                title: moduleConfig.title,
                error: `检测脚本载入失败：${error || `HTTP ${response && response.status || "?"}`}`,
            });
            return;
        }

        const optionStore = {
            read(label) {
                if (String(label || "") === "隐藏 IP") return maskIP ? "true" : "false";
                return moduleConfig.enabled.indexOf(String(label || "")) >= 0 ? "true" : "false";
            },
            write() {
                return false;
            },
            remove() {
                return false;
            },
        };

        const targetEnvironment = { params: { node: session.node } };
        try {
            const execute = new Function(
                "$done",
                "$persistentStore",
                "$environment",
                `${body}\n//# sourceURL=paperclip-ipquality-r32-${moduleName}.js`
            );
            execute((result) => {
                if (!result || !result.htmlMessage) {
                    respondJson(502, {
                        ok: false,
                        module: moduleName,
                        title: moduleConfig.title,
                        error: result && result.content || "检测未生成报告",
                    });
                    return;
                }
                respondJson(200, {
                    ok: true,
                    module: moduleName,
                    title: moduleConfig.title,
                    node: session.node,
                    elapsedMs: Date.now() - startedAt,
                    html: enhanceModuleHtml(String(result.htmlMessage), moduleName),
                    version: TEST_VERSION,
                });
            }, optionStore, targetEnvironment);
        } catch (runtimeError) {
            respondJson(500, {
                ok: false,
                module: moduleName,
                title: moduleConfig.title,
                error: runtimeError && (runtimeError.message || runtimeError.toString()) || "检测启动失败",
            });
        }
    });
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

function normalizeModule(value) {
    return String(value || "").trim().replace(/^['"]|['"]$/g, "").toLowerCase();
}

function enhanceModuleHtml(html, name) {
    const layoutFix = '<style>'
        + '.report-section{content-visibility:visible!important;contain:none!important}'
        + '.section-body,.summary-card{contain:none!important}'
        + '.map-row{margin-top:7px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}'
        + '.map-link{color:#0A84FF;font-size:12px;font-weight:600;text-decoration:none}'
        + '.map-note{color:#8e8e93;font-size:10px}'
        + '</style>';
    if (name !== "basic") return html + layoutFix;

    const coordinateRow = String(html).match(/(<div class="info-line"><span class="info-label">坐标<\/span><span class="info-value">([^<]+)<\/span><\/div>)/);
    const coordinates = coordinateRow ? parseDMS(coordinateRow[2]) : null;
    if (!coordinateRow || !coordinates) return html + layoutFix;

    const mapURL = `https://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}`
        + `&q=${encodeURIComponent("节点 IP 出口")}&z=15&t=m`;
    const mapRow = '<div class="map-row">'
        + `<a class="map-link" href="${mapURL}" target="_blank" rel="noopener noreferrer">在 Apple 地图中查看</a>`
        + '<span class="map-note">IP 数据库估算位置</span></div>';
    return html.replace(coordinateRow[1], coordinateRow[1] + mapRow) + layoutFix;
}

function parseDMS(value) {
    const match = String(value || "").match(/(\d+)°(\d+)′([\d.]+)″([NS]).*?(\d+)°(\d+)′([\d.]+)″([EW])/);
    if (!match) return null;
    const latitude = dmsToDecimal(match[1], match[2], match[3], match[4]);
    const longitude = dmsToDecimal(match[5], match[6], match[7], match[8]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
    };
}

function dmsToDecimal(degrees, minutes, seconds, direction) {
    const value = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600;
    return /[SW]/.test(String(direction || "")) ? -value : value;
}

function respondJson(status, value) {
    const body = JSON.stringify(value);
    $done({
        response: {
            status,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Access-Control-Allow-Origin": "*",
                "X-Content-Type-Options": "nosniff",
            },
            body,
        },
    });
}
