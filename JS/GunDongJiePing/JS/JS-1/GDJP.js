/*************************************

项目名称：滚动截屏-解锁 Premium
下载地址：https://t.cn/A6AZHHA5
更新日期：2024-04-28
脚本作者：@Sheepfj
电报频道：https://t.me/chxm1023
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^http:\/\/tailor\.tomax\.xyz\/api\/users\/fetch\/info url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/gdjp.js

[mitm]
hostname = tailor.tomax.xyz

*************************************/


var obj = JSON.parse($response.body);
const vip = '/api/users/fetch/info';

if ($request.url.indexOf(vip) != -1) {
obj.data.isVip=true;
obj.data.vip.expire="2099-09-09T09:09:09.000Z";
}
$done({body : JSON.stringify(obj)});
