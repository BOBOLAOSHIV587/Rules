/**************************************
本脚本旨在实现网易云音乐共享 by @Sliverkiss，支持Surge,Loon,QuantumultX，其它软件自行测试

致谢：
- 本脚本在@RuRu6的基础上降低了获取和管理ck的难度，使得小白更容易上手。
- 代价是频繁读取数据持久化所带来的微不足道的性能损耗。

使用教程：
1.将脚本拉取到本地，通过捷径打开获取ck开关
2.打开网易云音乐，等待1~2秒，直到出现相关脚本通知
3.获取ck成功后，在捷径中将获取ck开关关闭，避免产生不必要的麻烦

捷径地址：https://www.icloud.com/shortcuts/06b6e7b8e3344de59b593e03daba3762

关于会员数据如何分享给好友：
1.打开捷径，点击导出数据，将其发送给被共享好友
2.被共享好友通过捷径一键导入会员数据
3.将本脚本拉取到本地，在捷径关闭获取ck开关，即可享受会员服务

ps：获取ck默认关闭，可根据需求在捷径或boxjs订阅中手动打开

boxjs订阅地址：https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/boxjs.json

QuantumultX配置如下：

[rewrite_local]
^https:\/\/interface3?\.music\.163\.com\/eapi\/playermode\/ url script-request-header https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/WyyCrack.js

^https:\/\/interface3?\.music\.163\.com\/eapi\/search\/complex\/(page|rec\/song\/get) url script-request-header https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/WyyCrack.js

^https:\/\/interface3?\.music\.163\.com\/eapi\/song\/(chorus|enhance\/|play\/|type\/detail\/get) url script-request-header https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/WyyCrack.js

^https:\/\/interface3?\.music\.163\.com\/eapi\/(v1\/artist\/top\/song|v3\/discovery\/recommend\/songs) url script-request-header https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/WyyCrack.js

^https:\/\/interface3?\.music\.163\.com\/eapi\/vipnewcenter\/app\/resource\/newaccountpage url script-request-header https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/WyyCrack.js

^https?:\/\/interface3?\.music\.163\.com\/eapi\/(homepage\/|v6\/)?playlist\/ url script-request-header https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/WyyCrack.js

^https?:\/\/interface3?\.music\.163\.com\/eapi\/vipauth\/app\/auth\/(soundquality\/)?query url script-request-header https://gist.githubusercontent.com/Sliverkiss/479ecf770801bb8d3efa514c56a699e7/raw/WyyCrack.js

[mitm]
hostname = *.music.163.com

------------------------------------------
⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
******************************************/
const $ = init();
//脚本名称
$.name = "网易云音乐会员共享"
//数据持久化
const ckName = 'wyy_crack';
//ck数据
const ck = $.getjson(ckName) || {};
//打开自动获取ck
const is_open = ck?.is_open || `false`;
//请求头大小写转换
const headers = ObjectKeys2LowerCase($request.headers);
//判断是否打开捕获ck
try {
    if (is_open == `true` && $request.url.match(/eapi\/(homepage\/|v6\/)?playlist\/official\/ids\/get/)) {
        let obj = {
            "mconfig-info": headers[`mconfig-info`],
            "user-agent": headers[`user-agent`],
            "cookie": headers[`cookie`]
        }
        if (headers[`mconfig-info`] && headers[`user-agent`] && headers[`cookie`]) {
            $.setjson(obj, ckName);
            $.msg($.name, "", "🎉获取会员数据成功！");
        } else {
            $.msg($.name, "", "❌获取会员数据失败！");
        }
    } else {
        if (ck[`mconfig-info`]&&ck[`cookie`]&&ck[`user-agent`]) {
                Object.assign(headers, {
                    "mconfig-info": ck[`mconfig-info`],
                    "cookie": ck[`cookie`],
                    "user-agent": ck[`user-agent`]
                })
        } else {
            $.msg($.name, "", "❌不存在ck数据,请先根据说明完成配置");
        }
    }
} catch (e) {
    $.log(e);
} finally {
    $.done({ headers });
}

/**
 * 对象属性转小写
 * @param {*} obj
 * @returns
 */
function ObjectKeys2LowerCase(e){e=Object.fromEntries(Object.entries(e).map(([e,t])=>[e.toLowerCase(),t]));return new Proxy(e,{get:function(e,t,r){return Reflect.get(e,t.toLowerCase(),r)},set:function(e,t,r,n){return Reflect.set(e,t.toLowerCase(),r,n)}})}
// prettier-ignore
function init(){return isSurge=()=>void 0!==this.$httpClient,isQuanX=()=>void 0!==this.$task,getdata=t=>isSurge()?$persistentStore.read(t):isQuanX()?$prefs.valueForKey(t):void 0,setdata=(t,e)=>isSurge()?$persistentStore.write(t,e):isQuanX()?$prefs.setValueForKey(t,e):void 0,getjson=(t,e)=>{let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s},setjson=(t,e)=>{try{return this.setdata(JSON.stringify(t),e)}catch{return!1}},msg=(t,e,s)=>{isSurge()&&$notification.post(t,e,s),isQuanX()&&$notify(t,e,s)},log=t=>console.log(t),done=(t={})=>{$done(t)},{isSurge:isSurge,isQuanX:isQuanX,msg:msg,log:log,getdata:getdata,setdata:setdata,getjson:getjson,setjson:setjson,done:done}}
