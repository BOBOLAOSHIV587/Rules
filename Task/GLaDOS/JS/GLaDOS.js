/****************************** 
脚本功能：GLaDOS / Railgun 自动签到 + 积分兑换（多账号版）
更新时间：2026-05-29
作者：Curtinp118

使用说明：
  访问 GLaDOS 任意域名的 /console/account 页面抓包保存 Cookie，定时任务自动对已保存 Cookie 的域名执行签到。
  支持 glados.network、railgun.info、glados.vip，各域名支持多账号。
  同一域名多次抓包可保存不同账号的 Cookie。

[rewrite_local]
^https:\/\/glados\.network\/console\/account$ url script-request-header https://raw.githubusercontent.com/curtinp118/Scripthub/main/scripts/glados/glados.js
^https:\/\/railgun\.info\/console\/account$ url script-request-header https://raw.githubusercontent.com/curtinp118/Scripthub/main/scripts/glados/glados.js
^https:\/\/glados\.vip\/console\/account$ url script-request-header https://raw.githubusercontent.com/curtinp118/Scripthub/main/scripts/glados/glados.js

[task_local]
10 7 * * * https://raw.githubusercontent.com/curtinp118/Scripthub/main/scripts/glados/glados.js, tag=GLaDOS 签到, enabled=true

[MITM]
hostname = %APPEND% glados.network, railgun.info, glados.vip
*******************************/

var isQX = typeof $task !== "undefined";
var isLoon = typeof $loon !== "undefined";
var isSurge = typeof $httpClient !== "undefined" && !isLoon;

var $http = {
  fetch: (opts) => {
    if (isQX) return $task.fetch(opts);
    return new Promise((resolve, reject) => {
      var method = (opts.method || "GET").toUpperCase();
      var handler = (err, resp, data) => {
        if (err) reject(err);
        else resolve({ statusCode: resp.statusCode, headers: resp.headers, body: data });
      };
      if (method === "POST") $httpClient.post(opts, handler);
      else $httpClient.get(opts, handler);
    });
  }
};

var $store = {
  read: (key) => isQX ? $prefs.valueForKey(key) : $persistentStore.read(key),
  write: (val, key) => isQX ? $prefs.setValueForKey(val, key) : $persistentStore.write(val, key)
};

var notify = isQX
  ? (t, s, b) => $notify(t, s, b)
  : (t, s, b) => $notification.post(t, s, b);

var COOKIES_KEY_PREFIX = "GLaDOS_Cookies";
var DOMAINS_LIST_KEY = "GLaDOS_Domains";
var DOMAINS = ["glados.network", "railgun.info", "glados.vip"];
var EXCHANGE_PLAN = "plan500";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
var isGetHeader = typeof $request !== "undefined";

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch (_) { return null; }
}

function cookiesKeyFor(domain) {
  return COOKIES_KEY_PREFIX + ":" + domain;
}

function getSavedDomains() {
  try {
    var raw = $store.read(DOMAINS_LIST_KEY);
    if (!raw) return [];
    var list = safeJsonParse(raw) || [];
    return Array.isArray(list) ? list.filter(Boolean) : [];
  } catch (e) {
    console.log("[GLaDOS] Error reading domains: " + e);
    return [];
  }
}

function addDomain(domain) {
  try {
    var list = getSavedDomains();
    if (list.indexOf(domain) === -1) {
      list.push(domain);
      $store.write(JSON.stringify(list), DOMAINS_LIST_KEY);
    }
  } catch (e) {
    console.log("[GLaDOS] Error adding domain: " + e);
  }
}

function getCookiesForDomain(domain) {
  try {
    var raw = $store.read(cookiesKeyFor(domain));
    if (!raw) return [];
    var list = safeJsonParse(raw);
    return Array.isArray(list) ? list.filter(Boolean) : [];
  } catch (e) {
    console.log("[GLaDOS] Error reading cookies: " + e);
    return [];
  }
}

function saveCookie(domain, cookie) {
  try {
    if (!cookie) return { isNew: false, index: -1 };
    var cookies = getCookiesForDomain(domain);
    var existingIdx = cookies.indexOf(cookie);
    if (existingIdx !== -1) return { isNew: false, index: existingIdx };
    cookies.push(cookie);
    $store.write(JSON.stringify(cookies), cookiesKeyFor(domain));
    addDomain(domain);
    return { isNew: true, index: cookies.length - 1 };
  } catch (e) {
    console.log("[GLaDOS] Error saving cookie: " + e);
    return { isNew: false, index: -1 };
  }
}

function getHostFromRequest() {
  var h = ($request && $request.headers) || {};
  if (h.Host || h.host) return h.Host || h.host;
  var url = ($request && $request.url) || "";
  var m = url.match(/^https?:\/\/([^\/]+)/);
  return m ? m[1] : "";
}

function request(url, method, cookie, domain, body) {
  var headers = {
    "Content-Type": "application/json;charset=UTF-8",
    "Origin": "https://" + domain,
    "Referer": "https://" + domain + "/console/current",
    "User-Agent": UA,
    "Cookie": cookie
  };
  var opts = { url: url, method: method, headers: headers };
  if (body !== undefined) opts.body = typeof body === "string" ? body : JSON.stringify(body);

  return $http.fetch(opts).then(
    function (resp) {
      return { statusCode: resp.statusCode, data: safeJsonParse(resp.body || ""), raw: resp.body || "" };
    },
    function (reason) {
      return { statusCode: 0, data: null, raw: "", error: reason ? String(reason) : "Network error" };
    }
  );
}

async function checkin(cookie, domain) {
  var url = "https://" + domain + "/api/user/checkin";
  var resp = await request(url, "POST", cookie, domain, { token: domain });

  if (resp.error) {
    console.log("[GLaDOS] ✗ 签到网络错误 [" + domain + "]: " + resp.error);
    return { status: "签到失败", code: -2, message: resp.error, points: "0" };
  }
  if (!resp.data) {
    console.log("[GLaDOS] ✗ 签到响应解析失败 [" + domain + "]: " + resp.raw);
    return { status: "签到失败", code: -2, message: resp.raw, points: "0" };
  }

  var data = resp.data;
  var code = data.code !== undefined ? data.code : -2;
  var message = data.message || "";
  var points = String(data.points !== undefined ? data.points : 0);

  if (code === 0) {
    console.log("[GLaDOS] ✅ 签到成功 [" + domain + "]: +" + points + " 积分, " + message);
    return { status: "签到成功", code: 0, message: message, points: points };
  } else if (code === 1) {
    console.log("[GLaDOS] 🔄 重复签到 [" + domain + "]: " + message);
    return { status: "重复签到", code: 1, message: message, points: "0" };
  } else {
    console.log("[GLaDOS] ❌ 签到失败 [" + domain + "]: code=" + code + ", " + message);
    return { status: "签到失败", code: code, message: message, points: "0" };
  }
}

async function getStatus(cookie, domain) {
  var resp = await request("https://" + domain + "/api/user/status", "GET", cookie, domain);
  if (resp.error || !resp.data) {
    console.log("[GLaDOS] ✗ 查询状态失败 [" + domain + "]: " + (resp.error || resp.raw));
    return { leftDays: "N/A" };
  }
  var leftDays = resp.data.data && resp.data.data.leftDays;
  if (leftDays !== undefined && leftDays !== null) {
    var days = parseInt(parseFloat(leftDays), 10);
    console.log("[GLaDOS] 📊 剩余天数 [" + domain + "]: " + days + " 天");
    return { leftDays: days + " 天" };
  }
  console.log("[GLaDOS] 📊 状态响应 [" + domain + "]: " + JSON.stringify(resp.data));
  return { leftDays: "N/A" };
}

async function getPoints(cookie, domain) {
  var resp = await request("https://" + domain + "/api/user/points", "GET", cookie, domain);
  if (resp.error || !resp.data) {
    console.log("[GLaDOS] ✗ 查询积分失败 [" + domain + "]: " + (resp.error || resp.raw));
    return { points: "N/A", pointsNum: 0 };
  }
  var points = resp.data.points;
  if (points !== undefined && points !== null) {
    var pointsInt = parseInt(parseFloat(points), 10);
    console.log("[GLaDOS] 💰 总积分 [" + domain + "]: " + pointsInt);
    return { points: "" + pointsInt, pointsNum: pointsInt };
  }
  console.log("[GLaDOS] 💰 积分响应 [" + domain + "]: " + JSON.stringify(resp.data));
  return { points: "N/A", pointsNum: 0 };
}

async function exchange(cookie, domain, plan) {
  var resp = await request("https://" + domain + "/api/user/exchange", "POST", cookie, domain, { planType: plan });
  if (resp.error || !resp.data) {
    console.log("[GLaDOS] ✗ 兑换失败 [" + domain + "]: " + (resp.error || resp.raw));
    return "兑换失败: " + (resp.error || resp.raw);
  }
  var code = resp.data.code !== undefined ? resp.data.code : -2;
  var message = resp.data.message || "";
  if (code === 0) {
    console.log("[GLaDOS] 🎁 兑换成功 [" + domain + "]: " + plan + ", " + message);
    return "兑换成功(" + plan + ")";
  } else {
    console.log("[GLaDOS] ❌ 兑换失败 [" + domain + "]: code=" + code + ", " + message);
    return "兑换失败: " + message;
  }
}

async function checkinForAccount(cookie, domain, accountLabel) {
  console.log("[GLaDOS] ── " + accountLabel + " | " + domain + " ──");
  var statusBefore = await getStatus(cookie, domain);
  var checkinResult = await checkin(cookie, domain);
  var pointsResult = await getPoints(cookie, domain);
  var exchangeResult = "跳过(积分不足)";
  if (pointsResult.pointsNum >= 500) {
    exchangeResult = await exchange(cookie, domain, EXCHANGE_PLAN);
  } else {
    console.log("[GLaDOS] 积分 " + pointsResult.pointsNum + " < 500，跳过兑换");
  }
  var statusAfter = await getStatus(cookie, domain);
  return {
    accountLabel: accountLabel,
    domain: domain,
    status: checkinResult.status,
    code: checkinResult.code,
    message: checkinResult.message,
    earnedPoints: checkinResult.points,
    totalPoints: pointsResult.points,
    daysBefore: statusBefore.leftDays,
    daysAfter: statusAfter.leftDays,
    exchange: exchangeResult
  };
}

if (isGetHeader) {
  var allHeaders = $request.headers || {};
  var cookie = allHeaders.Cookie || allHeaders.cookie || "";
  var host = getHostFromRequest();
  if (!cookie || !host) {
    console.log("[GLaDOS] Cookie or Host not found in request headers");
    notify("GLaDOS", "抓包失败", "未获取到 Cookie 或 Host，请检查重写配置");
    $done({});
  } else {
    var result = saveCookie(host, cookie);
    var label = "账号 #" + (result.index + 1);
    if (result.isNew) {
      console.log("[GLaDOS] " + label + " Cookie saved for " + host);
      notify("GLaDOS", label + " 已保存 [" + host + "]", "新账号 Cookie 已记录，将用于自动签到");
    } else {
      console.log("[GLaDOS] " + label + " Cookie already exists for " + host);
      notify("GLaDOS", label + " 已存在 [" + host + "]", "该 Cookie 已保存过，无需重复抓包");
    }
    $done({});
  }
} else {
  var delay = Math.floor(Math.random() * 11);
  console.log("[GLaDOS] 随机延迟 " + delay + "s");
  setTimeout(async function () {
    var savedDomains = getSavedDomains();
    if (savedDomains.length === 0) {
      console.log("[GLaDOS] 未找到已保存的 Cookie");
      notify("GLaDOS 签到", "无 Cookie", "请先访问 /console/account 抓包");
      return $done();
    }
    var allResults = [];
    var totalAccounts = 0;
    for (var d = 0; d < savedDomains.length; d++) {
      var domain = savedDomains[d];
      var cookies = getCookiesForDomain(domain);
      if (cookies.length === 0) {
        console.log("[GLaDOS] ⚠️ " + domain + " 无 Cookie，跳过");
        continue;
      }
      for (var i = 0; i < cookies.length; i++) {
        totalAccounts++;
        var label = "账号 #" + (i + 1);
        console.log("[GLaDOS] ═══ " + label + " | " + domain + " ═══");
        allResults.push(await checkinForAccount(cookies[i], domain, label));
      }
    }
    console.log("[GLaDOS] 🚀 共 " + totalAccounts + " 个账号");
    var ok = allResults.filter(function (r) { return r.code === 0; }).length;
    var dup = allResults.filter(function (r) { return r.code === 1; }).length;
    var fail = allResults.filter(function (r) { return r.code !== 0 && r.code !== 1; }).length;
    var lines = allResults.map(function (r) {
      var icon = r.code === 0 ? "✅" : r.code === 1 ? "🔄" : "❌";
      var pts = r.earnedPoints !== "0" ? " +" + r.earnedPoints : "";
      return icon + " " + r.accountLabel + " " + r.domain + " | " + r.status + pts + " | " + r.daysBefore + "→" + r.daysAfter + " | " + r.totalPoints + "积分";
    });
    var title = "GLaDOS | " + totalAccounts + "账号 成" + ok + " 重" + dup + " 败" + fail;
    var content = lines.join("\n");
    console.log("\n[GLaDOS] ═══ 签到结果 ═══\n" + content + "\n");
    notify(title, "", content);
    $done();
  }, delay * 1000);
}