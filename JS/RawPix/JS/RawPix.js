/*************************************

应用名称：RawPix-DIY壁纸
脚本功能：解锁VIP
下载地址：https://is.gd/Sx6SmN
更新日期：2026-05-02
脚本作者：@ddm1023
电报频道：https://t.me/ddm1023
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/api\.rawpixlive\.com\/api\/(sign\/profile|picture\/checkout|config\/config) url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/RawPix.js

[mitm]
hostname = api.rawpixlive.com

*************************************/


var ddm = JSON.parse($response.body);

if(/api\/sign\/profile/.test($request.url)){
  ddm.data.isCreator = 1;
  ddm.data.is_vip = true;
  ddm.data.expireTime = 4092599349;
  ddm.data.level = 6;
  ddm.data.level_name = "年卡会员";
  ddm.data.can_trail = false;
}

if(/api\/picture\/checkout/.test($request.url)){
  ddm = {
  "msg" : "ok",
    "data" : {
      "can_ad_times" : 9999,
      "message" : "VIP无限次使用",
      "config" : {
        "isOpenSingle" : true,
        "isVipWhenSingle" : false,
        "isOpenAd" : false,
        "isOpenVip" : true
      },
      "action" : 2
    },
    "code" : 0
  };
}

if(/api\/config\/config/.test($request.url)){
  ddm.data.screenAdId = "";
  ddm.data.ad1 = "";
  ddm.data.ad2 = "";
  ddm.data.ad3 = "";
  ddm.data.ad4 = "";
  ddm.data.ad5 = "";
  ddm.data.interAdImage = "";
  ddm.data.interstitialAdTime = 0;
  ddm.data.intervalAd = 0;
  ddm.data.background = "";
  ddm.data.backgroundImg = "";
  ddm.data.enterImg = "";
  ddm.data.enterEwm = "";
  ddm.data.waterText = "";
  ddm.data.waterImage = "";
  ddm.data.waterOpacity = 0;
  ddm.data.isOpenAd = true;
  ddm.data.isOpenSingle = true;
  ddm.data.isVipWhenSingle = true;
  ddm.data.isOpenVip = true;
}

$done({ body: JSON.stringify(ddm) });
