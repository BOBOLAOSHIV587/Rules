/*
 *
 *
#!name= Nicegram Premium 𝕏
#!desc= 对 Nicegram 学习探索 注:广告可在Nicegram ==> ATT ==> 加入Nicegram空投活动页面 ==> 设置 完全关闭;
#!openUrl= https://apps.apple.com/app/id1608870673
#!author=
#!icon= https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/95/08/31/9508311c-9e94-3038-b267-5d4c8e39cb21/AppIconLLC-0-0-1x_U007epad-0-1-0-85-220.png/460x0w.webp
#!date = 2025-12-17 00:00:00

[Argument]
Demo= input, "", tag = 广告关闭说明（已废弃）, desc = 仅说明无实际用途

[Rule]
DOMAIN,static-cf.nicegram.app,REJECT
DOMAIN,image.adsgram.me,REJECT
DOMAIN,api.adsgram.ai,REJECT
DOMAIN,relay.walletconnect.com,REJECT
DOMAIN,firebaseremoteconfig.googleapis.com,REJECT
DOMAIN,firebase-settings.crashlytics.com,REJECT

[Script]
http-response ^https?:\/\/nicegram\.cloud\/api\/v\d+\/(telegram\/auth|att\/scroll-to-earn\/(?:config|ads-list|user-info)|airdrop\/task-list|ai-assistant\/list|user\/info|unblock-feature) script-path=https://he2o.vercel.app/Resource/Plugin/Nicegram.js, requires-body=true, timeout=60, tag=Nicegram Premium 𝕏

[Mitm]
hostname = nicegram.cloud
*
*
*/






let obj = JSON.parse($response.body);
let url = $request.url;

if (/\/api\/v\d+\/telegram\/auth/.test(url) && obj.data?.user) {
    Object.assign(obj.data.user, {
        lifetime_subscription: true,
        subscription: true,
        gems_balance: obj.data.user.gems_balance,
        store_subscription: true,
        subscriptionPlus: true
    });
} 

else if (/\/api\/v\d+\/(att\/scroll-to-earn\/(config|ads-list)|airdrop\/task-list)(\?.*)?/.test(url) && obj.data) {
    obj.data = [];
}
else if (/\/api\/v\d+\/ai-assistant\/list/.test(url) && obj.data) {
    obj.data = [];
}
else if (/\/api\/v\d+\/user\/info/.test(url) && obj.data?.user) {
    Object.assign(obj.data.user, {
        lifetime_subscription: true,
        subscription: true,
        store_subscription: true,
        subscriptionPlus: true
    });
} 
else if (/\/api\/v\d+\/att\/scroll-to-earn\/user-info/.test(url) && obj.data) {
    Object.assign(obj.data, {
        enabled: false,
        enabledAds: false,
        collectUserActions: false,
        enableCoinAnimation: false,
        autopilot: false
    });
    obj.data.placementSettings?.forEach(item => item.enabled = false);
} 
else if (/\/api\/v\d+\/unblock-feature/.test(url)) {
    Object.assign(obj, {
        premium: true,
        settings: Object.assign(obj.settings || {}, { max_pinned_chats: 9999 })
    });
}

$done({ body: JSON.stringify(obj) });
