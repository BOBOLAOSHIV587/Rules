/**
 * 节点 IP 质量检测 · 原生快捷入口
 *
 * $argument 固定为 basic、risk 或 media，不依赖插件参数插值。
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Updated: 2026-08-04
 */

const QUICK_VERSION = "2026-08-04.poc12";
const SOURCE_URL = "https://raw.githubusercontent.com/MaYIHEI/paperclip/eaa04fe0a9f37ccfafdd11930d28fd5ff3f04718/loon/ipquality/ipquality.js";
const params = typeof $environment !== "undefined" && $environment.params
    ? $environment.params
    : {};
const nodeName = String(params.node || "").trim();
const nativeDone = $done;

const QUICK_MODULES = {
    basic: {
        title: "快速 IP 信息",
        enabled: ["显示基础信息"],
    },
    risk: {
        title: "快速风险检测",
        enabled: ["显示 IP 类型", "显示风险评分", "显示风险因素"],
    },
    media: {
        title: "快速流媒体与 AI",
        enabled: ["执行媒体与 AI 检测", "显示媒体与 AI 结果", "显示地区一致性"],
    },
};

const quickName = normalizeName(typeof $argument !== "undefined" ? $argument : "");
const quickConfig = QUICK_MODULES[quickName];

if (!nodeName) {
    finishError("未获取到目标节点，请从节点或策略组页面运行。");
} else if (!quickConfig) {
    finishError("未知快捷检测项目。");
} else {
    runQuick();
}

function runQuick() {
    console.log(`[INFO] ${quickConfig.title} ${QUICK_VERSION}`);
    $httpClient.get({ url: SOURCE_URL, timeout: 12000 }, (error, response, body) => {
        if (error || !response || Number(response.status) < 200 || Number(response.status) >= 300 || !body) {
            finishError(`检测脚本载入失败：${error || `HTTP ${response && response.status || "?"}`}`);
            return;
        }
        const optionStore = {
            read(label) {
                return quickConfig.enabled.indexOf(String(label || "")) >= 0 ? "true" : "false";
            },
            write() {
                return false;
            },
            remove() {
                return false;
            },
        };
        try {
            const execute = new Function(
                "$done",
                "$persistentStore",
                "$environment",
                `${body}\n//# sourceURL=paperclip-ipquality-quick-${quickName}.js`
            );
            execute((result) => {
                if (!result || !result.htmlMessage) {
                    finishError(result && result.content || "检测未生成报告。");
                    return;
                }
                nativeDone(result);
            }, optionStore, { params: { node: nodeName } });
        } catch (runtimeError) {
            finishError(runtimeError && (runtimeError.message || runtimeError.toString()) || "检测启动失败。");
        }
    });
}

function normalizeName(value) {
    return String(value || "").trim().replace(/^['"]|['"]$/g, "").toLowerCase();
}

function finishError(message) {
    nativeDone({
        title: quickConfig && quickConfig.title || "IP 快捷检测",
        content: message,
        icon: "network.slash",
    });
}
