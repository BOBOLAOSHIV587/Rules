/******************************
脚本功能：彩云天气-登陆后解锁会员
脚本作者：afengye
脚本频道：https://t.me/afengye
更新时间：2024-05-28
使用声明：️仅供学习交流, 🈲️商业用途
*******************************
[rewrite_local]
^https:\/\/biz\.cyapi\.cn\/ url script-response-body https://raw.githubusercontent.com/afengye/QX/main/caiyun.js

[mitm]
hostname = biz.cyapi.cn
*******************************/

var aFengYe = $response.body;
var obj =  JSON.parse(aFengYe);

if($request.url.indexOf("/v2/user") != -1) {
  obj.result.is_vip = true;
  obj.result.vip_type = "s";
  obj.result.svip_expired_at = 4070951226;
}

aFengYe = JSON.stringify(obj);
$done(aFengYe);
