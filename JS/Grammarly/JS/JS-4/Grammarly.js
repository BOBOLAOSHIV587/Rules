/*************************************
项目名称：Grammarly
下载地址：
更新日期：2024-01-14
脚本作者：@anyeyey
使用声明：⚠️仅供参考，🈲转载与售卖！
**************************************
[rewrite_local]
^https:\/\/subscription\.grammarly\.com\/api\/v1\/subscription url script-response-body https://raw.githubusercontent.com/anyehttp/quantumult-x/main/Adguard/Grammarly.js


[mitm]
hostname = subscription.grammarly.com

*************************************/


var anye = JSON.parse($response.body);
    anye.isPremium = true;
    anye.isAppleSubscription = true;
$done({body: JSON.stringify(anye)});