/*************************************

>「 脚本名称 」         Filmix解锁Pro
>「 脚本作者 」         M̆̈̆̈ĭ̈̆̈k̆̈̆̈ĕ̈
>「 电报频道 」         https://t.me/TrollStoreKios 
>「 更新时间 」         2024-09-24
>「 注意事项 」         如需引用请注明出处，谢谢合作！
>「 注意事项 」         使用此脚本，可能会导致AppleStore无法切换账户，解决方法[关闭QX切换账户，或关闭MITM，或删除脚本，或去设置媒体与购买项目处切换ID]

**************************************

[rewrite_local]
https:\/\/appv2\.filmix\.com\.cn\/api\/(v2|v4)\/users url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/Filmix/JS/Filmix.js

[mitm]
hostname = appv2.filmix.com.cn

*************************************/

var Mike = JSON.parse($response.body);
Mike.is_vip = true;
Mike.vip_start_time = "2009-09-09T10:10:10.101198+08:00";
Mike.vip_end_time = "2099-09-09T15:33:15.101198+08:00";
$done({ body: JSON.stringify(Mike)});
