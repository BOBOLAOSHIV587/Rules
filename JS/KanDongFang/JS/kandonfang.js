[rewrite_local]
# NBA视频和电视剧
https:\/\/bp-api\.bestv\.(?:com\.cn|cn)\/cms\/api\/(live\/studio\/id\/v8|c\/player\/common) url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/KDF/video-parser.js
# HTML页面
^https?:\/\/360\.com\/(?:video|nba\.m3u|dianshi\.m3u)$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/KDF/video-parser.js
# 首页弹窗广告
^https:\/\/bp-api\.bestv\.cn\/cms\/api\/advertise\/project\/advertise\/popup\/scene$ url reject
# 开屏广告（清除缓存）
https://bp-api.bestv.cn/cms/api/free/open/advertisingV2 url reject

[mitm]
hostname = 360.com, bp-api.bestv.com.cn, bp-api.bestv.cn
