/*
 * 学术FUN (xueshu.fun) - 自动签到
 * 兼容：Surge / Loon / Quantumult X
 */

const $ = new Env("学术FUN - 签到");

const domain = "xueshu.fun";
const checkInUrl = "https://xueshu.fun/wp-admin/admin-ajax.php";
const userPageUrl = "https://xueshu.fun/user/";

// ==== 已根据实际抓包确认 ====
const signAction = "user_qiandao";        // 确认值，来自抓包
const nonceParamName = "nonce";           // 确认值，来自抓包
const nonceRegex = /go-user-qiandao[^>]*data-nonce="([a-f0-9]+)"/;  // 精确匹配签到按钮 (class="go-user-qiandao") 的 data-nonce 属性

const cookie = $.getdata(`${domain}_cookie`);
const ua = $.getdata(`${domain}_ua`) ||
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1";

if (!cookie) {
  $.msg(
    "学术FUN 签到失败 ❌",
    "",
    "未找到 Cookie，请先打开网站登录一次触发抓取"
  );
  $.done();
} else {
  // 第一步：请求用户中心页面，提取最新 nonce
  $.get(
    {
      url: userPageUrl,
      headers: {
        "Cookie": cookie,
        "User-Agent": ua,
        "Referer": "https://xueshu.fun/"
      }
    },
    (err1, resp1, html) => {
      if (err1 || !html) {
        $.msg("学术FUN 签到失败 ❌", "", `获取用户页失败: ${err1 || "空响应"}`);
        $.done();
        return;
      }

      const match = html.match(nonceRegex);
      const nonce = match ? match[1] : null;

      if (!nonce) {
        $.msg(
          "学术FUN 签到失败 ❌",
          "",
          "未能从用户页提取到 nonce，请检查 nonceRegex 是否需要调整"
        );
        $.done();
        return;
      }

      // 第二步：用 nonce 发起签到请求
      const bodyString = `action=${signAction}&${nonceParamName}=${nonce}`;

      $.post(
        {
          url: checkInUrl,
          headers: {
            "Cookie": cookie,
            "User-Agent": ua,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Origin": "https://xueshu.fun",
            "Referer": "https://xueshu.fun/user/"
          },
          body: bodyString
        },
        (err2, resp2, data) => {
          if (err2) {
            $.msg("学术FUN 签到失败 ❌", "", `请求错误: ${err2}`);
            $.done();
            return;
          }

          let title = "学术FUN 签到结果";
          let subtitle = "";
          let body = data;

          try {
            const json = JSON.parse(data);
            subtitle = `status: ${json.status}`;
            body = json.msg || JSON.stringify(json);
          } catch (e) {
            // 非 JSON 返回，原样展示
          }

          const statusCode = resp2.status || resp2.statusCode || "";
          $.msg(title, subtitle, body ? body.slice(0, 200) : `状态码: ${statusCode}`);
          $.done();
        }
      );
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
  this.setdata = (val, key) => {
    if (this.isQX) return $prefs.setValueForKey(val, key);
    if (this.isLoon || this.isSurge) return $persistentStore.write(val, key);
  };
  this.msg = (title = name, subt = "", desc = "") => {
    if (this.isQX) $notify(title, subt, desc);
    if (this.isLoon || this.isSurge) $notification.post(title, subt, desc);
  };
  this.get = (options, callback) => {
    if (this.isQX) {
      if (typeof options === "string") options = { url: options };
      options.method = "GET";
      $task.fetch(options).then(
        (res) => callback(null, res, res.body),
        (err) => callback(err.error, null, null)
      );
    }
    if (this.isLoon || this.isSurge) {
      $httpClient.get(options, (err, response, body) => {
        callback(err, response, body);
      });
    }
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