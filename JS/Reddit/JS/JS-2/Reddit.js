/*
 * Reddit Premium 解锁&去广告全兼容脚本
 * 作者：Mikephie
 
[rewrite_local]
^https?:\/\/gql(-fed)?\.reddit\.com url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/redditvip-qx.js

[MITM]
hostname = gql.reddit.com, gql-fed.reddit.com

 */

// ===== 轻量通知 + 冷却 =====
var APP_NAME = "✨ RedditVIP ✨"; // 仅展示名
var ID = "reddit";             // 键名，纯字母数字

var EN = "n:" + ID + ":e";  // 开关
var TS = "n:" + ID + ":t";  // 时间戳
var CD = 600000;            // 冷却 10 分钟（毫秒）

function notify(t, s, b) {
  if (typeof $notify === "function") {
    $notify(t, s, b);
  } else if (typeof $notification !== "undefined" && $notification && $notification.post) {
    $notification.post(t, s, b);
  } else {
    console.log("[Notify]", t, s, b);
  }
}

try {
  var enabled = (($persistentStore.read(EN) || "1") === "1");
  if (enabled) {
    var now = Date.now();
    var last = parseInt($persistentStore.read(TS) || "0", 10) || 0;
    if (last === 0 || now - last > CD) {
      notify(APP_NAME,"💖永久解锁 🆚 ⓿❽-⓿❽-❷⓿❽❽💗");
      $persistentStore.write(String(now), TS);
    }
  }
} catch (e) {
  console.log("通知模块异常: " + e.message);
}

// ======= 主处理逻辑 =======
function deepPatch(obj) {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    // 过滤广告类节点
    var filtered = [];
    for (var i = 0; i < obj.length; i++) {
      var item = obj[i];
      var isAd = false;
      try {
        if (item && item.__typename === "AdPost") isAd = true;
        if (!isAd && item && item.node) {
          if (item.node.cells && Array.isArray(item.node.cells)) {
            for (var k = 0; k < item.node.cells.length; k++) {
              var cell = item.node.cells[k];
              if (cell && cell.__typename === "AdMetadataCell") { isAd = true; break; }
            }
          }
          if (!isAd && item.node.adPayload) isAd = true;
        }
      } catch (e) {}
      if (!isAd) filtered.push(deepPatch(item));
    }
    return filtered;
  }

  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    try {
      // 权限/订阅
      if (key === "isPremiumMember" && obj[key] === false) obj[key] = true;
      if (key === "isSubscribed" && obj[key] === false) obj[key] = true;
      if (key === "isEmployee" && obj[key] === false) obj[key] = true;
      if (key === "has_gold_subscription" && obj[key] === false) obj[key] = true;
      if (key === "hasGoldSubscription" && obj[key] === false) obj[key] = true;
      if (key === "isGold" && obj[key] === false) obj[key] = true;
      if (key === "isGoldMember" && obj[key] === false) obj[key] = true;
      if (key === "has_subscribed_to_premium" && obj[key] === false) obj[key] = true;
      if (key === "isBrandAffiliate" && obj[key] === false) obj[key] = true;
      if (key === "user_is_subscriber" && obj[key] === false) obj[key] = true;
      if (key === "hide_ads" && obj[key] === false) obj[key] = true;
      if (key === "has_ios_subscription" && obj[key] === false) obj[key] = true;
      if (key === "seen_premium_adblock_modal" && obj[key] === false) obj[key] = true;
      if (key === "has_external_account" && obj[key] === false) obj[key] = true;
      if (key === "is_mod" && obj[key] === false) obj[key] = true;

      // 图标/广告/NSFW
      if (key === "locked" && obj[key] === true) obj[key] = false;
      if (key === "commentsPageAds" && Array.isArray(obj[key])) obj[key] = [];
      if (key === "isNsfw" && obj[key] === true) obj[key] = false;
      if (key === "isNsfwMediaBlocked" && obj[key] === true) obj[key] = false;
      if (key === "isNsfwContentShown" && obj[key] === false) obj[key] = true;

      // skus 补全
      if (key === "skus" && Array.isArray(obj[key]) && obj[key].length === 0) {
        obj[key] = [{
          kind: "Premium",
          subscriptionType: "Premium",
          name: "Premium Subscription",
          description: "Mobile Annual Premium Subscription",
          duration: { amount: 1, unit: "YEAR" },
          id: "1",
          quantity: "1",
          renewInterval: "YEAR",
          requiredPaymentProviders: ["APPLE_INAPP", "GOOGLE_INAPP"],
          externalProductId: "com.reddit.premium_2",
          promos: [],
          tags: []
        }];
      }
    } catch (e) {}

    var val = obj[key];
    if (val && typeof val === "object") obj[key] = deepPatch(val);
  }
  return obj;
}

function processResponse() {
  var body = $response && $response.body ? $response.body : "";
  if (!body) return body;

  try {
    var obj = JSON.parse(body);
    obj = deepPatch(obj);

    var text = JSON.stringify(obj);
    // 双保险字符串替换
    var pairs = [
      ['"isPremiumMember":false','"isPremiumMember":true'],
      ['"isSubscribed":false','"isSubscribed":true'],
      ['"isEmployee":false','"isEmployee":true'],
      ['"has_gold_subscription":false','"has_gold_subscription":true'],
      ['"hasGoldSubscription":false','"hasGoldSubscription":true'],
      ['"isGold":false','"isGold":true'],
      ['"isGoldMember":false','"isGoldMember":true'],
      ['"has_subscribed_to_premium":false','"has_subscribed_to_premium":true'],
      ['"isBrandAffiliate":false','"isBrandAffiliate":true'],
      ['"user_is_subscriber":false','"user_is_subscriber":true'],
      ['"hide_ads":false','"hide_ads":true'],
      ['"has_ios_subscription":false','"has_ios_subscription":true'],
      ['"seen_premium_adblock_modal":false','"seen_premium_adblock_modal":true'],
      ['"has_external_account":false','"has_external_account":true'],
      ['"is_mod":false','"is_mod":true'],
      ['"locked":true','"locked":false'],
      ['"isNsfw":true','"isNsfw":false'],
      ['"isNsfwMediaBlocked":true','"isNsfwMediaBlocked":false'],
      ['"isNsfwContentShown":false','"isNsfwContentShown":true']
    ];
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i];
      // 用 split/join 兼容旧引擎的全局替换
      text = text.split(p[0]).join(p[1]);
    }
    return text;
  } catch (e) {
    console.log("Reddit 解锁脚本处理错误: " + e.message);
    return body; // 解析失败直接放行
  }
}

try {
  var out = processResponse();
  $done({ body: out });
} catch (e) {
  console.log("脚本总异常: " + e.message);
  $done({});
}
