/*
 * 海角社区 (haijiao.com) - 获取 Cookie & Header 凭据
 * 适用：QX / Loon / Surge
 */

const $ = new Env("海角社区 - 获取凭据");

const domain = "haijiao.com";
const headers = $request.headers;

// 获取各类关键 Header/Cookie
let userId = headers["x-user-id"] || headers["X-User-Id"];
let token = headers["x-user-token"] || headers["X-User-Token"];
let ua = headers["User-Agent"] || headers["user-agent"];
let cookie = headers["Cookie"] || headers["cookie"];

// 从 Cookie 中补充提取 uid / token（若 Header 中未带上）
if (!userId && cookie) {
  const matchUid = cookie.match(/uid=([^;]+)/);
  if (matchUid) userId = matchUid[1];
}

if (!token && cookie) {
  const matchToken = cookie.match(/token=([^;]+)/);
  if (matchToken) token = matchToken[1];
}

if (userId && token) {
  // 保存当前数据
  $.setdata(userId, `${domain}_uid`);
  $.setdata(token, `${domain}_token`);
  if (ua) $.setdata(ua, `${domain}_ua`);
  if (cookie) $.setdata(cookie, `${domain}_cookie`);

  $.msg(
    "海角社区凭据 - 获取成功 ✅",
    `UID: ${userId}`,
    `Token: ${token.slice(0, 8)}...\nUA: ${ua ? "已获取" : "未获取"}`
  );
}

$.done();

// ==================== 兼容环境库 (Env.js) ====================
function Env(name) {
  this.name = name;
  this.isLoon = typeof $loon !== "undefined";
  this.isSurge = typeof $httpClient !== "undefined" && typeof $loon === "undefined";
  this.isQX = typeof $task !== "undefined";

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