/*************************************

#!name = 芒果tv解锁会员
#!author = 怎么肥事
#!update = 2026-05-14
^https?:\/\/mobile-stream\.api\.mgtv\.com\/v1\/video\/source url script-request-header https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/mgtv_vip.js

hostname = mobile-stream.api.mgtv.com

*************************************/

//2026/5/14

const TICKET = "6AF89DA4E2103AE383549D6BB890ABE5";
let url = $request.url;
if (/[?&]ticket=/.test(url)) {
  url = url.replace(/([?&]ticket=)[^&]*/i, "$1" + TICKET);
} else {
  url += (url.indexOf("?") >= 0 ? "&" : "?") + "ticket=" + TICKET;
}
$done({ url });
