/*************************************

项目功能：Filmic Pro相机
下载地址：https://t.cn/AiE8fHDr  id436577167
脚本作者：chxm1023
# 脚本功能：解锁高级会员
# 特别说明：非一次性解锁，先开启规则，在进入软件即可！如果无效按[恢复购买]进行恢复！
**************************************

[rewrite_local]
^https:\/\/filmicpro\.oracle\.bendingspoonsapps\.com\/v\d\/(users\/setup|purchases\/verify) url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/FilmicPro/JS/FilmicPro.js

[mitm]
hostname = filmicpro.oracle.bendingspoonsapps.com

*************************************/


var chxm1023 = JSON.parse($response.body);

chxm1023["me"]["active_subscriptions_ids"] = ["com.cinegenix.filmic.pro.1y_t80_1w_bis"];
chxm1023["me"]["active_bundle_subscriptions"] = [{
   "expiry" : "2099-09-09T09:09:09+00:00",
   "product_id" : "com.cinegenix.filmic.pro.1y_t80_1w_bis",
   "features" : ["unlock"]
  }];
chxm1023["settings"]["__identity__"]["expiration"] = "2099-09-09T09:09:09.09+00:00";

$done({body : JSON.stringify(chxm1023)});
