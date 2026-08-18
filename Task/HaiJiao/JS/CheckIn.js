/*
 * 海角社区 (haijiao.com) - 自动签到
 * 适用：QX / Loon / Surge
 */

const $ = new Env("海角社区 - 签到");

const domain = "haijiao.com";
const checkInUrl = "https://www.haijiao.com/api/user/user_sign_in";

// 读取持久化凭据
const userId = $.getdata(`${domain}_uid`);
const token = $.getdata(`${domain}_token`);
const ua = $.getdata(`${domain}_ua`) || "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1";
let cookie = $.getdata(`${domain}_cookie`) || `mainshow=true; token=${token}; uid=${userId}`;

if (!userId || !token) {
  $.msg("海角社区签到失败 ❌", "", "未检测到凭据，请先用手机浏览器登录海角社区触发抓取");
  $.done();
} else {
  // 构建抓包所要求的核心请求头
  const requestHeaders = {
    "Host": "www.haijiao.com",
    "Accept": "application/json, text/plain, */*",
    "x-user-id": userId,
    "x-user-token": token,
    "mver": "211112203214",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": ua,
    "Origin": "https://www.haijiao.com",
    "Referer": "https://www.haijiao.com/task",
    "Cookie": cookie
  };

  $.post(
    {
      url: checkInUrl,
      headers: requestHeaders,
      body: "" // 抓包显示 content-length: 0
    },
    (err, resp, data) => {
      if (err) {
        $.msg("海角社区签到失败 ❌", "", `网络错误: ${err}`);
        $.done();
        return;
      }

      try {
        const json = JSON.parse(data);
        if (json.success === true) {
          $.msg("海角社区签到成功 🎉", "", "签到成功！奖励金币已到账");
        } else {
          const errMsg = json.message || "未知错误或今日已签到";
          $.msg("海角社区签到提示 ⚠️", "", `结果: ${errMsg} (ErrCode: ${json.errorCode})`);
        }
      } catch (e) {
        const statusCode = resp.status || resp.statusCode || "未知";
        $.msg("海角社区签到响应解析失败 ❌", "", `HTTP 状态码: ${statusCode}\n返回原文: ${data ? data.slice(0, 100) : "空"}`);
      }
      $.done();
    }
  );
}

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
  this.msg = (title = name, subt = "", desc = "") => {
    if (this.isQX) $notify(title, subt, desc);
    if (this.isLoon || this.isSurge) $notification.post(title, subt, desc);
  };
  this.post = (options, callback) => {
    if (this.isQX) {
      if (typeof options === "string") options = { url: options };
      options.method = "POST";
      $task.fetch(options).then(
        (res) => callback(null, res, res.body),
        (err) => callback(err.error, null, null)
      );
    }
    if (this.isLoon || this.isSurge) {
      $httpClient.post(options, (err, response, body) => {
        callback(err, response, body);
      });
    }
  };
  this.done = (val = {}) => {
    if (this.isQX) $done(val);
    if (this.isLoon || this.isSurge) $done(val);
  };
}