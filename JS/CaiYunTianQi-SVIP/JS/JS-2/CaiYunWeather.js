/**************************
 *  * @Author: XiaoMao
 * @LastMod: 2024-09-18

彩云天气Svip + 彩云天气pro svip + 去广告
会员token改写
仅供学习参考，请于下载后24小时内删除

********************************
# 小版本更新请查看更新日志 ｜ 或加入xiaomao组织⬇️
# 微信公众号 【小帽集团】
# XiaoMao · TG通知频道：https://t.me/xiaomaoJT
# XiaoMao · Tg脚本频道：https://t.me/XiaoMaoScript
# XiaoMao · GitHub仓库：https://github.com/xiaomaoJT/QxScript


使用方法：
1、使用BoxJS增加以下脚本订阅。
https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/XiaoMao.json

2、通过boxjs设置天气svip到期时间
【一二此步骤可省略，会员到期时间永远定格10天后，失效请重开app】

3、QX > 右下角风车 > 重写 > 规则资源 > 引用以下脚本 > 打开资源解析器
https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/XiaoMaoCaiYunWeather.js

********************************

[rewrite_local]
https:\/\/ad\.cyapi\.cn\/* url reject
https:\/\/starplucker\.cyapi\.cn\/v3\/config url reject
https:\/\/biz\.cyapi\.cn\/p\/v1\/entries url reject-dict
https:\/\/cdn-w\.caiyunapp\.com\/p\/app\/activity url reject
https:\/\/starplucker\.cyapi\.cn\/v3\/notification\/message_center url reject
https:\/\/starplucker\.cyapi\.cn\/v3\/config\/cypage\/home\/conditions\/local url reject
https:\/\/(wrapper|api)\.(cyapi|caiyunapp)\.(cn|com)\/v1\/activity url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/CaiYunTianQi-SVIP/JS/JS-2/CaiYun-B.js
https?:\/\/biz\.(caiyunapp|cyapi)\.(com|cn)\/(membership_rights|v2\/user) url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/CaiYunTianQi-SVIP/JS/JS-2/CaiYun-B.js
https:\/\/starplucker\.cyapi\.cn\/v3 url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/CaiYunTianQi-SVIP/JS/JS-2/CaiYun-B.js
https:\/\/biz\.cyapi\.cn\/api\/v1\/user_detail url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/CaiYunTianQi-SVIP/JS/JS-2/CaiYun-B.js
https:\/\/biz\.cyapi\.cn\/p\/v1\/vip_info url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/CaiYunTianQi-SVIP/JS/JS-2/CaiYun-B.js
https:\/\/wrapper\.cyapi\.cn\/v1 url script-request-header https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/CaiYunTianQi-SVIP/JS/JS-2/CaiYun-H.js

[mitm]
hostname = biz.caiyunapp.com,biz.cyapi.cn,cdn-w.caiyunapp.com,ad.cyapi.cn,wrapper.cyapi.cn,starplucker.cyapi.cn,api.caiyunapp.com

********************************/
