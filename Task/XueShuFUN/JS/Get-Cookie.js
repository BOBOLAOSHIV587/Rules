/*
 * 学术FUN (xueshu.fun) - 获取 Cookie & User-Agent
 * 兼容：Surge / Loon / Quantumult X
 */

const $ = new Env("学术FUN - 获取Cookie");
const domain = "xueshu.fun";

let cookie = $request.headers["Cookie"] || $request.headers["cookie"];
let ua = $request.headers["User-Agent"] || $request.headers["user-agent"];

if (cookie) {
  const oldCookie = $.getdata(`${domain}_cookie`) || "";

  // 只在新 Cookie 更完整（更长）时才覆盖，避免被不完整的请求覆盖掉好的 Cookie
  if (cookie.length >= oldCookie.length) {
    $.setdata(cookie, `${domain}_cookie`);
    if (ua) $.setdata(ua, `${domain}_ua`);

    $.msg(
      "学术FUN - Cookie 获取成功 ✅",
      "",
      `Cookie 长度: ${cookie.length}\nUA: ${ua || "未获取到"}`
    );
  }
} else {
  $.msg(
    "学术FUN - 未获取到 Cookie ⚠️",
    "",
    "请确认已在浏览器登录后重新访问首页"
  );
}

$.done();

// ==================== 兼容环境库 (Env.js) ====================
function Env(name) {
  this.name = name;
  this.isLoon = typeof $loon !== "undefined";
  this.isSurge = typeof $httpClient !== "undefined" && typeof $loon === "undefined";
  this.isQX = typeof $task !== "undefined";
  this.getdata = (key) => {
    if (this.isQX) return $prefs.valueForKey(key);
    if (this.isLoon || this.isSurge) return $persistentStore.read(key);
  };
  this.setdata = (val, key) => {
    if (this.isQX) return $prefs.setValueForKey(val, key);
    if (this.isLoon || this.isSurge) return $persistentStore.write(val, key);
  };
  this.msg = (title = name, subt = "", desc = "") => {
    if (this.isQX) $notify(title, subt, desc);
    if (this.isLoon || this.isSurge) $notification.post(title, subt, desc);
  };
  this.done = (val = {}) => {
    if (this.isQX) $done(val);
    if (this.isLoon || this.isSurge) $done(val);
  };
}