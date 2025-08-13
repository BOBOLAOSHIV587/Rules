/*******************************
脚本功能：DJ音乐库 - DJ电音音乐播放器  解锁VIP,下载&音质选择
软件版本：2.6.7
更新时间：2025年
电报频道：https://t.me/GieGie777
使用声明：此脚本仅供学习与交流，请在下载使用24小时内删除！请勿在中国大陆转载与贩卖！
*******************************
[rewrite_local]
# > DJ音乐库 - DJ电音音乐播放器 VIP
^http:\/\/app-i.dj-5.com\/api\/User\/Info url script-response-body https://raw.githubusercontent.com/WeiGiegie/666/main/djyyk.js


[mitm]
hostname = app-i.dj-5.com

*******************************/


var body = $response.body;
let obj = JSON.parse($response.body);
obj.result.nickname = "https://t.me/GieGie777";
obj.result.cover = "/usercovers/e9ac8cec71e04feeb0d6297bdea58a09.jpg"
obj.result.isvip = true;
obj.result.expiretime = 32493834549;
$done({
    body:  JSON.stringify(obj)
});
