/*************************************

应用名称：X字幕
下载地址：https://is.gd/50cZFy
更新日期：2026-04-21
脚本作者：@ddm1023
电报频道：https://t.me/ddm1023
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
http:\/\/apps\.tltgame\.com\/api\/user\/(updateStatus|randomRegister) url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/xzimu.js

[mitm]
hostname = apps.tltgame.com

*************************************/


var ddm = JSON.parse($response.body);
const endtime = "2099-09-09 09:09:09";

Object.assign(ddm.data, {
    "VIP": 1,
    "VIPExpireDate": endtime,
    "XSQVIP": 1,
    "XSQVIPExpireDate": endtime,
    "XHDVIP": 1,
    "XHDVIPExpireDate": endtime,
    "isExpire": 0,
    "xsqExpire": 0,
    "xhdExpire": 0,
    "expireDate": endtime,
    "xsqExpireDate": endtime,
    "xhdExpireDate": endtime,
    "lifetimeVip": 1,
    "xsqLifetimeVip": 1,
    "balance" : 60,
    "xsqWithdraw": 1,
    "xsqWithdrawTimeout": 20,
    "xsqSearchable": 1
});

$done({ body: JSON.stringify(ddm) });
