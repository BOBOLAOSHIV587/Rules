/* 
CamScanner 解锁部分高级特权
====================================
[rewrite_local]
^https:\/\/api(|-cs)\.intsig\.net\/purchase\/cs\/query_property\? url script-response-body https://raw.githubusercontent.com/wf021325/qx/master/js/CamScanner.js

[mitm]
hostname = ap*.intsig.net
====================================
*/
let body = $response.body;
body = '{"data":{"psnl_vip_property":{"expiry":"3742732800"}}}';
$done({body});
