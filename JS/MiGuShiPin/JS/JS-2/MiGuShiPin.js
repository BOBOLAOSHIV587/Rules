/*************************************

#!name = 咪咕视频解锁会员
#!author = 怎么肥事
#!update = 2026-05-14
^https?:\/\/(play|play-pre|v|v[0-9]?-sc|vmesh|app-sc|vms-sc|display(-sc)?|common-sc|program-sc|d[0-9]-sc|fs-sc|fsdv-sc|mp-user|recommend-dy|chat|chat-wx|public-deliver[0-9]?|public-operbiz[0-9]?|public-img)\.miguvideo\.com\/.+ url script-request-header https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/migu_vip.js

^https?:\/\/(passport|uem|push|jadeite|jadeiteapp|hound|feedback|rcsdk)\.migu\.cn\/.+ url script-request-header https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/migu_vip.js
hostname = *.miguvideo.com, *.migu.cn

*************************************/

//2025/5/14
const AUTH = {
  userToken: "nlps4840006C8E8B5958769A",
  userId:    "1245377469",
  passId:    "395831016729557547",
  userNum:   "NTDrsyM1kTO5YTNwcTNxYDO",
  encrypted: "1",
  carrierCode: "CM",
  areaId: "551",
  cityId: "0551",
  expiredOn: "1783920728000",
  sign:      "A0C9ED100281B5EFF979D46468C1003F",
  clientId:  "809f891b829f43ad8105bfd7e82335fb",
  l_s:       "06c8eea357521254e2565a7357fa6825",
  l_t:       "1778736725"
};
const MIGU_UID = "2377a93d-03c8-447b-a82d-84687dd522ac";
const LOGIN_DEVICE_ID = "95cf83d8-2e8e-4f43-bf96-0b0d61cbb37a";

const FORCE_RATE = "4";

function setQ(u, k, v) {
  const re = new RegExp("([?&]" + k + "=)[^&]*", "i");
  if (re.test(u)) return u.replace(re, "$1" + v);
  return u + (u.indexOf("?") >= 0 ? "&" : "?") + k + "=" + v;
}

let url = $request.url;
if (/play-pre\.miguvideo\.com\/playurl\//.test(url)) {
  url = setQ(url, "rateType", FORCE_RATE);
  url = setQ(url, "4kDifinition", "true");
  url = setQ(url, "4kvivid", "true");
  url = setQ(url, "2Kvivid", "true");
  url = setQ(url, "super4k", "true");
  url = setQ(url, "superPlay", "1");
  url = setQ(url, "h265", "true");
  url = setQ(url, "h265N", "true");
  url = setQ(url, "xh265", "true");
  url = setQ(url, "dolby", "true");
  url = setQ(url, "vivid", "2");
  url = setQ(url, "needDrm", "1");
  url = setQ(url, "drm", "true");
  url = setQ(url, "drmN2", "1");
}

const userInfo = JSON.stringify({
  areaId: AUTH.areaId, cityId: AUTH.cityId, expiredOn: AUTH.expiredOn,
  mobile: "", passId: AUTH.passId, userId: AUTH.userId,
  carrierCode: AUTH.carrierCode, encrypted: AUTH.encrypted,
  userNum: AUTH.userNum, userToken: AUTH.userToken, blurMobile: "***"
});

const H = {
  userToken: AUTH.userToken,
  userId:    AUTH.userId,
  userInfo:  userInfo,
  sign:      AUTH.sign,
  clientId:  AUTH.clientId,
  l_c:       AUTH.clientId,
  l_s:       AUTH.l_s,
  l_t:       AUTH.l_t,
  csessionId: AUTH.clientId + "0000DEAD-BEEF-4444-8888-000000000001"
};
const COOKIE = `MIGU_UID=${MIGU_UID}; REMEMBER_CODE=${MIGU_UID}; login_deviceId=${LOGIN_DEVICE_ID}`;

const headers = $request.headers;
for (const k in H) {
  headers[k] = H[k];
  const lk = k.toLowerCase();
  if (lk !== k && headers[lk] !== undefined) headers[lk] = H[k];
}
headers["Cookie"] = COOKIE;
if (headers["cookie"] !== undefined) headers["cookie"] = COOKIE;

$done({ url, headers });
