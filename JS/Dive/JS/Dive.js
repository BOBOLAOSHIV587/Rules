/*
 *
 *
脚本功能：dive
软件版本：3.2.5

使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
^https://api\.diveplus\.cn/1\.1/functions/App\.GetUserInfo url script-response-body https://raw.githubusercontent.com/liul0ng/quanx/refs/heads/main/dive.js

[mitm]
hostname = api.diveplus.cn
*
*
*/

let obj = JSON.parse($response.body);

obj.result.isVIP = true;

obj.result.userOtherVIPSwitch = true;
obj.result.isUploadSeaCreatureVIP = true;
obj.result.isShareGetVIP = true;
obj.result.isVerifiedProLevel = true;
$done({body: JSON.stringify(obj)});
