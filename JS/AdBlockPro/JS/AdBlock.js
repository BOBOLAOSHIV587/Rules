/**************************
 *  * @Author: XiaoMao
 * @LastMod: 2024-01-15
 *
 * 


AdBlockPro 终身订阅


仅供学习参考，请于下载后24小时内删除

********************************
# 小版本更新请查看更新日志 ｜ 或加入xiaomao组织⬇️
# 微信公众号 【小帽集团】
# XiaoMao · TG通知频道：https://t.me/xiaomaoJT
# XiaoMao · Tg脚本频道：https://t.me/XiaoMaoScript
# XiaoMao · GitHub仓库：https://github.com/xiaomaoJT/QxScript
# https://apps.apple.com/us/app/adblock-pro-for-safari/id1018301773?uo=4

使用方法：
1、QX > 右下角风车 > 重写 > 规则资源 > 引用以下脚本 > 打开资源解析器
https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/XiaoMaoAdBlockPro.js



[mitm]
hostname = api.adblockpro.app

[rewrite_local]

https:\/\/api\.adblockpro\.app\/verify url script-response-body https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/source/abcp.js

********************************/

var obj=JSON.parse($response.body);changeValueToOne(obj);function changeValueToOne(obj){var keys=Object.keys(obj);for(var i=0;i<keys.length;i++){if(obj[keys[i]]===0){obj[keys[i]]=1}}}$done({body:JSON.stringify(obj)});
