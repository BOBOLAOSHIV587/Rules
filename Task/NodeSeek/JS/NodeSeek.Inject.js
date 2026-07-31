/**
 * NodeSeek · 浏览器注入签到
 *
 * 抓取：用 Safari 打开 nodeseek.com 任意页面
 * 签到：Safari 打开 nodeseek.com 时自动触发（浏览器备用方案，无需 cron）
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Channel: Telegram 频道 https://t.me/mayihei
 * @Updated: 2026-06-26
 *
 * ===== Loon =====
 * [MITM]
 * hostname = www.nodeseek.com
 * [Script]
 * # 注入签到脚本 + 抓签到结果（requires-body=true，匹配 HTML 页面和签到接口响应）
 * http-response ^https://www\.nodeseek\.com/ tag=NodeSeek Inject, script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/nodeseek/nodeseek.inject.js, requires-body=true, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/nodeseek.png
 *
 * ===== Surge =====
 * [MITM]
 * hostname = www.nodeseek.com
 * [Script]
 * NodeSeek Inject = type=http-response,pattern=^https://www\.nodeseek\.com/,requires-body=true,max-size=0,script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/nodeseek/nodeseek.inject.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/nodeseek.png
 *
 * ===== Quantumult X =====
 * [MITM]
 * hostname = www.nodeseek.com
 * [rewrite_local]
 * ^https://www\.nodeseek\.com/ url script-response-body https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/nodeseek/nodeseek.inject.js
 *
 * ===== Stash =====
 * http:
 *   mitm:
 *     - "www.nodeseek.com"
 *   script:
 *     - match: ^https://www\.nodeseek\.com/
 *       name: NodeSeek Inject
 *       type: response
 *       require-body: true
 * script-providers:
 *   NodeSeek Inject:
 *     url: https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/nodeseek/nodeseek.inject.js
 *     interval: 86400
 */

const $ = new Env("NodeSeek");

(function main() {
    const url = ($request && $request.url) || "";

    // Attendance API response → parse result and notify
    if (url.includes("/api/attendance")) {
        handleResult();
        return;
    }

    // HTML page response → inject sign-in script
    handleInject();
})();

function handleResult() {
    const raw = $response.body || "";
    let result;
    try { result = JSON.parse(atob(raw)); } catch (_) {
        try { result = JSON.parse(raw); } catch (_2) {
            $.done({});
            return;
        }
    }
    normalizeRelayResult(result);

    const state = classifyResult(result);
    if (state === "unconfirmed") {
        $.msg("NodeSeek", "❌ 签到未确认", "NodeSeek 未返回成功字段，需进站核对鸡腿是否变化");
    } else if (state === "already") {
        $.msg("NodeSeek", "ℹ️ 今日已签到", result.message || "");
    } else if (state === "failed") {
        $.msg("NodeSeek", "❌ 签到失败", result.message || "未知错误");
    } else {
        const detail = (result.message || "") + (result.gain != null ? "\n鸡腿+" + result.gain + " 当前" + result.current : "");
        $.msg("NodeSeek", "✅ 签到成功", detail);
    }
    $.done({});
}

function classifyResult(result) {
    if (!result || typeof result !== "object") return "unconfirmed";
    if (result.state === "success") return "success";
    if (result.state === "empty") return "unconfirmed";
    if (result.state === "unconfirmed") return "unconfirmed";
    if (Object.keys(result).length === 0) return "unconfirmed";
    const msg = String((result && result.message) || "");
    if (/已签到|重复|already|duplicate|repeat/i.test(msg)) return "already";
    if (result && result.success === false) return "failed";
    if (result && result.success === true) return "success";
    return "unconfirmed";
}

function normalizeRelayResult(result) {
    if (!result || typeof result !== "object" || !result.message_b64) return;
    try {
        result.message = decodeURIComponent(escape(atob(result.message_b64)));
    } catch (_) {
        try { result.message = atob(result.message_b64); } catch (_2) {}
    }
}

function handleInject() {
    const ct = ($response.headers["Content-Type"] || $response.headers["content-type"] || "");
    if (!ct.includes("text/html")) {
        $.done({});
        return;
    }

    let body = $response.body || "";
    if (!body.includes("</head>")) {
        $.done({});
        return;
    }

    const d = new Date();
    // Local date key — prevents re-signing on same calendar day
    const today = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

    // Injected into every nodeseek.com HTML page.
    // SW intercepts the fetch and adds refract headers — no manual signing needed.
    const script = `<script id="ns-auto-sign">
(function(){
    var KEY='ns_s_${today}';
    if(localStorage.getItem(KEY))return;
    function doSign(){
        if(!navigator.serviceWorker||!navigator.serviceWorker.controller){
            setTimeout(doSign,1500);return;
        }
        localStorage.setItem(KEY,'1');
        fetch('/api/attendance?random=false',{
            method:'POST',credentials:'include',body:'',
            headers:{'Content-Type':'text/plain;charset=UTF-8'}
        }).catch(function(){});
    }
    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',doSign);
    }else{
        doSign();
    }
})();
</script>`;

    $.done({ body: body.replace("</head>", script + "</head>") });
}

function Env(s) {
    this.name = s;
    this.isSurge  = () => typeof $httpClient !== "undefined";
    this.isQuanX  = () => typeof $task !== "undefined";
    this.isLoon   = () => typeof $loon !== "undefined";
    this.log  = (...a) => console.log(a.join("\n"));
    this.msg  = (t = this.name, s = "", b = "") => {
        if (this.isSurge() || this.isLoon()) $notification.post(t, s, b);
        else if (this.isQuanX()) $notify(t, s, b);
        console.log(["", "====📣" + t + "====", s, b].filter(Boolean).join("\n"));
    };
    this.done = (v = {}) => { if (typeof $done !== "undefined") $done(v); };
}
