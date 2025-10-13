/*******************************
app：地址预警
*******************************
[rewrite_local]
https://mobile-new.chinaeew.cn/v1/order/apple/vip url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/dzyj.js


[mitm]
hostname = mobile-new.chinaeew.cn

*******************************/


let obj = JSON.parse($response.body);
obj.data = {
  "productName" : "SVIP",
  "endTime" : 4791705729000,
  "vipType" : "svip",
  "productId" : "earthquake_early_warning_SVIP",
  "upgradePrice" : 0
};
$done({ body: JSON.stringify(obj) });

