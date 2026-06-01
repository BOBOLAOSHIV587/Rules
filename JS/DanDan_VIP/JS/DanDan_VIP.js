/******************************
脚本功能：蛋蛋不语 - 解锁会员
Version  : v1.0.0
更新时间：2026-05-31
作者：Curtinp118
Platform : Quantumult X / Loon / Surge

使用说明：
添加到重写 解锁蛋蛋不语VIP会员功能。

[rewrite_local]
^http:\/\/38\.76\.202\.248:8000\/.*profiles.* url script-response-body https://raw.githubusercontent.com/curtinp118/Scripthub/main/scripts/dandanvip/dandanvip_unlock.js

[MITM]
hostname = 38.76.202.248
*******************************/

const VIP_PATCH = {
  vip_status: true,
  vip_level: 3,
  vip_expire_at: "2099-09-19T22:21:06.147807+00:00",
  username: "TG@Curtinp118"
};

function patch(obj) {
  if (!obj || typeof obj !== "object") return obj;
  return Object.assign(obj, VIP_PATCH);
}

function done(body) {
  $done({ body: typeof body === "string" ? body : JSON.stringify(body) });
}

function run() {
  const raw = ($response && $response.body) ? $response.body : "";

  if (!raw) return done("");

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return done(raw);
  }

  if (Array.isArray(data)) {
    data = data.map(patch);
  } else {
    data = patch(data);
  }

  return done(data);
}

try {
  run();
} catch (e) {
  console.log("fatal:", e);
  done($response?.body || "");
}