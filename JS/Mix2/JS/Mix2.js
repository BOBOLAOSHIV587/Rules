/**************************
 *  * @Author: XiaoMao
 * @LastMod: 2024-10-14
 *
 * 


Mix2 解锁会员


仅供学习参考，请于下载后24小时内删除

********************************
# 小版本更新请查看更新日志 ｜ 或加入xiaomao组织⬇️
# 微信公众号 【小帽集团】
# XiaoMao · TG通知频道：https://t.me/xiaomaoJT
# XiaoMao · Tg脚本频道：https://t.me/XiaoMaoScript
# XiaoMao · GitHub仓库：https://github.com/xiaomaoJT/QxScript


使用方法：
1、QX > 右下角风车 > 重写 > 规则资源 > 引用以下脚本 > 打开资源解析器
https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/XiaoMaoMix2.js

2、打开软件 > 左上角 > 恢复购买



[mitm]
hostname = bmall.camera360.com

[rewrite_local]
https:\/\/bmall\.camera360\.com\/api\/iap\/check-receipt url script-response-body https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/source/mix2.js



********************************/


let obj=JSON.parse($response.body);let requestUrl=$request.url;if(/^https:\/\/bmall\.camera360\.com\/api\/iap\/check-receipt?/.test(requestUrl)){obj.data={errorCode:0,sandbox:0,isTrialPeriod:0,purchaseTime:1692026680,expireTime:7955085722,appleExpireTime:7955085722,originalTransactionId:"444444444444444",productId:"VIP_yearly_29.99",appleVip:1,operationVip:1,giftVip:1,}}$done({body:JSON.stringify(obj)});
