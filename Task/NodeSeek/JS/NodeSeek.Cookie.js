/**
 * NodeSeek · Cookie 抓取
 *
 * 抓取：用 Safari 打开 nodeseek.com 任意页面，自动保存 pjwt 登录凭证
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Channel: Telegram 频道 https://t.me/mayihei
 * @Updated: 2026-06-26
 */

const $ = new Env("NodeSeek [Cookie]");

const CK_KEY = "nodeseek_cookie";
const UA_KEY = "nodeseek_ua";

(function main() {
    const cookie = ($request.headers["Cookie"] || $request.headers["cookie"] || "").trim();
    if (!cookie.includes("pjwt")) {
        $.done(); return;
    }

    const ua      = ($request.headers["User-Agent"] || $request.headers["user-agent"] || "").trim();
    const old     = $.getdata(CK_KEY) || "";
    const oldPjwt = (old.match(/pjwt=([^;]+)/)    || [])[1] || "";
    const newPjwt = (cookie.match(/pjwt=([^;]+)/) || [])[1] || "";

    // UA 跟随同步：中继服务器用这个 UA 去请求 NodeSeek
    if (ua) $.setdata(ua, UA_KEY);

    // pjwt 未变则静默，避免每次刷页都弹通知
    if (oldPjwt && oldPjwt === newPjwt) {
        $.done(); return;
    }

    $.setdata(cookie, CK_KEY);
    $.msg("NodeSeek", "✅ NodeSeek Cookie 获取成功", "");
    $.done();
})();

function Env(s) {
    this.name = s;
    this.isSurge = () => typeof $httpClient !== "undefined";
    this.isQuanX = () => typeof $task !== "undefined";
    this.isLoon = () => typeof $loon !== "undefined";
    this.log = (...a) => console.log(a.join("\n"));
    this.msg = (t = this.name, s = "", b = "") => {
        if (this.isSurge() || this.isLoon()) $notification.post(t, s, b);
        else if (this.isQuanX()) $notify(t, s, b);
        console.log(["", "====📣" + t + "====", s, b].filter(Boolean).join("\n"));
    };
    this.getdata = (k) => {
        if (this.isSurge() || this.isLoon()) return $persistentStore.read(k);
        if (this.isQuanX()) return $prefs.valueForKey(k);
        return null;
    };
    this.setdata = (v, k) => {
        if (this.isSurge() || this.isLoon()) return $persistentStore.write(v, k);
        if (this.isQuanX()) return $prefs.setValueForKey(v, k);
        return false;
    };
    this.done = (v = {}) => { if (typeof $done !== "undefined") $done(v); };
}
