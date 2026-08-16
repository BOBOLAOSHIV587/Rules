/**
 * 节点 IP 质量检测 · 模块化网页测试启动器
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Channel: Telegram 频道 https://t.me/mayihei
 * @Updated: 2026-08-04
 */

const TEST_VERSION = "2026-08-04.poc12";
const VIEWER_URL = "http://paperclip.test/ipquality";
const SESSION_KEY = "paperclip.ipquality.web.session";
const params = typeof $environment !== "undefined" && $environment.params
    ? $environment.params
    : {};
const nodeName = String(params.node || "").trim();

if (!nodeName) {
    $done({
        title: "节点 IP 质量检测 · 模块化网页测试",
        content: "未获取到目标节点，请从节点或策略组页面运行。",
        icon: "network.slash",
    });
} else {
    const session = {
        id: createSessionId(),
        node: nodeName,
        createdAt: Date.now(),
        version: TEST_VERSION,
    };
    const saved = $persistentStore.write(JSON.stringify(session), SESSION_KEY);
    if (!saved) {
        $done({
            title: "节点 IP 质量检测 · 模块化网页测试",
            content: "无法保存本次检测会话，请检查 Loon 存储权限。",
            icon: "exclamationmark.triangle",
        });
    } else {
        const openUrl = `${VIEWER_URL}?run=${encodeURIComponent(session.id)}`;
        $notification.post(
            "节点 IP 自选检测",
            truncate(nodeName, 36),
            "点按进入检测页面",
            { openUrl }
        );
        $done({
            title: "检测页面已准备",
            content: "请点按上方通知进入 Safari，选择需要的检测项目。",
            icon: "safari",
            "title-color": "#0A84FF",
        });
    }
}

function createSessionId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function truncate(value, maxLength) {
    const text = String(value || "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
