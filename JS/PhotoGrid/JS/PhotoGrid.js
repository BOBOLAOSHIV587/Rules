﻿/*************************************

>「 脚本名称 」         PhotoGrid解锁VIP
>「 脚本作者 」         M̆̈̆̈ĭ̈̆̈k̆̈̆̈ĕ̈
>「 电报频道 」         https://t.me/TrollStoreKios 
>「 更新时间 」         2024-10-24
>「 注意事项 」         如需引用请注明出处，谢谢合作！
>「 注意事项 」         使用此脚本，会导致AppleStore无法切换账户，解决方法[关闭QX切换账户，或关闭MITM，或删除脚本，或去设置媒体与购买项目处切换ID]
>「 额外说明 」         请勿传播或售卖此脚本

[rewrite_local]
# >PhotoGrid解锁VIP
^https?:\/\/pgapi\.(ksmobile\.com||photogrid\.app)\/v1\/ios\/auth url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/PhotoGrid/JS/PhotoGrid.js

[mitm]
hostname = pgapi.ksmobile.com, pgapi.photogrid.app

*************************************/

var Mike = $response.body;
Mike = Mike.replace(/"expires_date":\d+/g, '"expires_date":148204937166');
Mike  = Mike.replace(/"is_trial_period":\w+/g, '"is_trial_period":false');
Mike = Mike.replace(/"expires_date_ms":\d+/g, '"expires_date_ms":148204937166000');
Mike = Mike.replace(/"is_premium":\d/g, '"is_premium":1');
Mike = Mike.replace(/"premiumExpiredAt":\d+/g, '"premiumExpiredAt":148204937166000');
Mike = Mike.replace(/"is_new":\w+/g, '"is_new":true');
Mike = Mike.replace(/"is_super_ios":\w+/g, '"is_super_ios":true');
Mike = Mike.replace(/"IsSuper":\w+/g, '"IsSuper":true');
Mike = Mike.replace(/"isPremiumDiscountEnable":\w+/g, '"isPremiumDiscountEnable":true');
$done({ body:Mike});