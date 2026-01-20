/*************************************

项目名称：Bending合集-解锁Pro
下载地址：https://t.cn/AiE8fHDr
更新日期：2024-09-04
脚本作者：chxm1023
电报频道：https://t.me/chxm1023
使用声明：⚠️仅供参考，🈲转载与售卖！
此脚本现不可用，可以配合FilmicPro.js脚本填入app id单独使用
**************************************

[rewrite_local]
^https?:\/\/.*\.oracle\.bendingspoonsapps\.com\/v\d\/(users\/.+|purchases\/verify) url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/bending.js

[mitm]
hostname = *.oracle.bendingspoonsapps.com

*************************************/


var chxm1023 = JSON.parse($response.body);
const headers = $request.headers;
const ua = headers['User-Agent'] || headers['user-agent'];

const list = {
  'CLIME': { id: "com.apalonapps.radarfree.01y_CLIME00001_d50" },  //CLIME-天气预报
  'SpeakTranslate': { id: "com.speakandtranslate.premium.69_99.yearly.7dtrial.groupa" },  //SpeakTranslate-说话与翻译-翻译器
  'splice': { id: "com.path36.SpliceFree.1y_t150_bundle" },  //Splice-视频编辑
  'filmicpro': { id: "com.cinegenix.filmic.pro.1y_t130_bundle_creator" },  //Filmicpro-专业级摄影机
  'firstlight': { id: "com.filmicpro.firstlight.1y_t130_bundle_creator" },  //Firstlight-照片应用
  'doubletake': { id: "com.filmicpro.doubletake.1w_t20_bundle_creator" },  //Doubletake
  'focos': { id: "com.focos.1y_t130_bundle_creator" },  //Focos-单反相机
  'remini': { id: "com.bigwinepot.nwdn.international.1y_p99_99_ft_pro" },  //Remini-人工智能修图
  'focoslive': { id: "com.focoslive.1y_t130_adj" },  //Focos live-视频编辑工具
  'thirtydayfitness': { id: "com.vigorapps.30DayFitness.1y_t130_bundle_adj" },  //30 Day Fitness-30天减肥运动
  'sleep': { id: "com.bendingspoonsapps.SleepHelp.1y_t100_bundle_adj" },  //Sleep-睡眠助手
  'yoga': { id: "com.flyingnayeem.yoga.1y_t100_1w_bundle_adj" }  //Yoga-冥想瑜伽
};

for (const key in list) {
  if (new RegExp(`^${key}`, `i`).test(ua)) {
    chxm1023["me"]["active_subscriptions_ids"] = [list[key].id];
    chxm1023["me"]["active_bundle_subscriptions"] = [{
      "expiry": "2099-09-09T09:09:09+00:00",
      "product_id": list[key].id,
      "features": ["unlock"]
    }];
    chxm1023["settings"]["__identity__"]["expiration"] = "2099-09-09T09:09:09+00:00";
    break;
  }
}

$done({body: JSON.stringify(chxm1023)});
