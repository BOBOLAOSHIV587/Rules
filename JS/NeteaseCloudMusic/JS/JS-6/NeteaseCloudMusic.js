/*
 *
 *
#!name= 网易云音乐 𝕏
#!desc= 对 网易云音乐 深度学习探索;
#!author= 
#!homepage = https://apps.apple.com/app/id590338362
#!icon= https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2d/e8/1b/2de81bfd-29a0-d067-63c3-38315cc1661a/AppIcon-1x_U007emarketing-0-9-0-0-85-220-0.png/460x0w.webp

[Argument]
MY = switch,true,false,tag=隐藏[底部-漫游标签],desc=关闭开关将不对此选项生效
DT = switch,true,false,tag=隐藏[底部-笔记标签],desc=关闭开关将不对此选项生效
FX = switch,true,false,tag=隐藏[底部-发现标签],desc=关闭开关将不对此选项生效
GZ = switch,true,false,tag=隐藏[底部-关注标签],desc=关闭开关将不对此选项生效

PRGG = switch,true,false,tag=隐藏[首页-问候语],desc=关闭开关将不对此选项生效
PRRK = switch,false,true,tag=隐藏[首页-排行榜],desc=关闭开关将不对此选项生效
PRDRD = switch,true,false,tag=隐藏[首页-每日推荐],desc=关闭开关将不对此选项生效
PRSCVPT = switch,false,true,tag=隐藏[首页-推荐歌单],desc=关闭开关将不对此选项生效
PRST = switch,true,false,tag=隐藏[首页-最近常听],desc=关闭开关将不对此选项生效
PRRR = switch,true,false,tag=隐藏[首页-雷达歌单],desc=关闭开关将不对此选项生效
HMPR = switch,true,false,tag=隐藏[首页-音乐合伙人],desc=关闭开关将不对此选项生效
PRMST = switch,true,false,tag=隐藏[首页-推荐专属歌单],desc=关闭开关将不对此选项生效
PRCN = switch,true,false,tag=隐藏[首页-你的专属歌单],desc=关闭开关将不对此选项生效

VIP = switch, false, tag = [启用]会员, desc = 关闭开关将不对此选项生效

Cookie = input, "MUSIC_U=00611AB6CF97A35EE63C8292BA30F39D1188B44D76049213A858DBF1E237F7C5D22F1F7DE6731D3A00C6CAC23C0C6B4FDFDECD2137355C919FAEC36152A9B2969B66E0949D150F40AC1E3BE0BE66832D66F2C915EC27815867338CB568FF214B855A8C251116C168491FD5DADA4F97D554637EFBB03282E0507CD3701781721CE73249B2E07B9477FCB02065CE6EAD79065E0AD6D390E10F30B941A5519C946BD9FF00D6BED3E8B0DED2AA910583814D6398E5B0DD5A5434E31AA17DD5734897A7C46A007726AE2AF69EB5E8C59D4F70C5E064B22786D06968838EE9451A79E90FEDB1B11CD0132849B53438BAB07B48D6F9B1C60DC485CF06488C1E02C2D7D1F18B96110124F0A81394D59201CB6332546D6D34350A509F2734807D8AD2C467A82DDEC5E3965E34C86799217ED18FABF6FB84100702BC7BE456BC608C04524D7B3258BA45272E9649976B9A9B115CD17F35E6CDCDDEF69AB6E1613483F0DB1749191DDD4EA0220107A189A8DBBFCBE26E; caid={"lastIyunId":"c188fda5639eb7665faa8f12acce7976","iyunId":"8b2f57388088a1c2c7134fa625ad9375","iyunVersion":"20230330","lastIyunVersion":"20220111"}; buildver=5342; sDeviceId=9ec0847264c088b44ca5c2b5ee94cdab; channel=distribution; idfa=00000000-0000-0000-0000-000000000000; packageType=release; appver=9.3.60; deviceId=YD-9Ax/xiQscpNFGlFUREaQ6SU1wt1sfjoY; EVNSM=1.0.0; os=iPhone OS; osver=26.0; machineid=iPhone17.2; NMCID=jnvwlk.1721320815000.01.3; appkey=IuRPVVmc3WWul9fT; idfv=B2B23496-210B-40C0-B47B-C5AF4DADE41B; URS_APPID=B4300E3591BDEC0BDAD47C5B75AA09E2A1A402C0FEBDE5407986A72C8CE16DF5B6293116B121D6872A9FEA6913295501; NMDI=Q1NKTQcBDACpwlhh4qjU5lexqyeVAAAAbZiUDNNCRngAWM2rEgug/WjKgNVQj/xthQgCnQDkMe+BlTWRTXWFgjgWN+glqEGrkcrlNfCDMz93tohH8Qylg8SfY75c1x16qZaiYvB++3K7vPs++grPNlMDe+zFTWy0oZVDQcLVOEfzFL1lMn8eVOE3QjGclQdPuWKM2gHbkYVNxP5QrC9f75m/8Rnyw+c9MJPQ1ds=", tag = Cookie, desc = 必填
MConfigInfo = input, "{"IuRPVVmc3WWul9fT":{"version":94394368,"appver":"9.3.60"},"zr4bw6pKFDIZScpo":{"version":3186688,"appver":"9.3.60"},"tPJJnts2H31BZXmp":{"version":4026368,"appver":"2.0.30"}}", tag = MConfig-Info ,desc = 选填
UserAgent = input, "NeteaseMusic 9.3.60/6160 (iPhone; iOS 26.0; zh_CN)", tag = User-Agent, desc = 选填

[Rule]
DOMAIN, iadmat.nosdn.127.net, REJECT
DOMAIN, iadmatapk.nosdn.127.net, REJECT
DOMAIN, iadmusicmat.music.126.net, REJECT
DOMAIN, iadmusicmatvideo.music.126.net, REJECT
DOMAIN, ipv4.music.163.com, REJECT
DOMAIN, ipv6.music.163.com, REJECT

[Rewrite]
^https?://interface.*\.music\.163\.com/eapi/ad/get url reject
^https?://interface.*\.music\.163\.com/eapi/ad/config/get url reject
^https?://interface.*\.music\.163\.com/eapi/ad/iyunIds url reject
^https?://interface.*\.music\.163\.com/eapi/ad/prefetch/select url reject
^https?://interface.*\.music\.163\.com/eapi/ad/loading/current url reject

^https?:\/\/interface\d?\.music\.163\.com\/e?api\/(ocpc\/)?ad\/ mock-response-body data-type=text
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:delivery\/(batch-)?deliver|moment\/tab\/info\/|side-bar\/mini-program\/music-service\/account|yunbei\/account\/entrance\/) reject-dict
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:community\/friends\/fans-group\/artist\/group\/|mine\/applet\/redpoint|music\/songshare\/text\/recommend\/|resniche\/position\/play\/new\/|resniche\/tspopup\/show|resource\/comments?\/musiciansaid\/|user\/sub\/artist) reject-dict
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:ios\/version|mlivestream\/entrance\/playpage\/|link\/position\/show\/strategy|link\/scene\/show\/resource|v1\/content\/exposure\/comment\/banner\/) reject-dict
^https?:\/\/interface\d?\.music\.163.com\/w?e?api\/search\/default mock-response-body data-type=text
^https?:\/\/interface\d?\.music\.163\.com\/w?eapi\/(?:activity\/bonus\/playpage\/time\/query|resource-exposure\/|search\/(?:chart\/|rcmd\/keyword\/|specialkeyword\/)) reject-dict
^https:\/\/interface\d\.music\.163\.com\/eapi\/my\/podcast\/tab\/recommend reject-dict

[Script]
http-response ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:batch|v2\/resource\/comment\/floor\/get) script-path=https://he2o.vercel.app/Resource/Script/Ad/wyres.js, requires-body=true, binary-body-mode=true, timeout=20, tag=评论区、热推、有话想说、分享一下、歌曲下祝福
http-response ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:homepage\/block\/page|link\/page\/rcmd\/(?:block\/resource\/multi\/refresh|resource\/show)) script-path=https://he2o.vercel.app/Resource/Script/Ad/wyres.js, requires-body=true, binary-body-mode=true, timeout=20, tag=推荐、主页, argument=[{PRGG},{PRRK},{PRDRD},{PRSCVPT},{PRST},{PRRR},{HMPR},{PRMST},{PRCN}]
http-response ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/link\/home\/framework\/tab script-path=https://he2o.vercel.app/Resource/Script/Ad/wyres.js, requires-body=true, binary-body-mode=true, timeout=20, tag=底部选项卡, argument=[{MY},{DT},{FX},{GZ}]
http-response ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/link\/page\/discovery\/resource\/show script-path=https://he2o.vercel.app/Resource/Script/Ad/wyres.js, requires-body=true, binary-body-mode=true, timeout=20, tag=发现页
http-response ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/link\/position\/show\/resource script-path=https://he2o.vercel.app/Resource/Script/Ad/wyres.js, requires-body=true, binary-body-mode=true, timeout=20, tag=我的页面
http-response ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/user\/follow\/users\/mixed\/get script-path=https://he2o.vercel.app/Resource/Script/Ad/wyres.js, requires-body=true, binary-body-mode=true, timeout=20, tag=显示未关注你的人

http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/playermode\/ script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=皮肤, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/search\/(?:complex\/page|complex\/rec\/song\/get|song\/list\/page) script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=歌曲、听书, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/v3\/song\/detail script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=歌曲、听书, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/song\/(?:chorus|enhance\/|play\/|type\/detail\/get) script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=歌曲、听书, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:v1\/artist\/top\/song|v3\/discovery\/recommend\/songs) script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=歌曲、听书, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/vipnewcenter\/app\/resource\/newaccountpage script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=等级, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/w?e?api\/(homepage\/|v6\/)?playlist\/(?!(?:delete|subscribe|unsubscribe)) script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=首页歌单, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]
http-request ^https?:\/\/interface\d?\.music\.163\.com\/eapi\/vipauth\/app\/auth\/(soundquality\/)?query script-path=https://he2o.vercel.app/Resource/Plugin/Netease.js, timeout=60, tag=音质, enable={VIP}, argument=[{Cookie},{MConfigInfo},{UserAgent}]

[Mitm]
hostname = interface*.music.163.com
*
*
*/






/*
 *
 *
var NeteaseHeaders = $request.headers;
NeteaseHeaders['mconfig-info'] = '{"zr4bw6pKFDIZScpo":{"version":1830912,"appver":"9.3.60"},"tPJJnts2H31BZXmp":{"version":3194880,"appver":"2.0.30"},"c0Ve6C0uNl2Am0Rl":{"version":598016,"appver":"1.7.50"},"IuRPVVmc3WWul9fT":{"version":52744192,"appver":"9.3.60"}}';
NeteaseHeaders['cookie'] = 'MUSIC_U=00307B2CF8B0CC0C8D822BEF538D02760A54DA0214E64629E2DF3CB46DAB7A19C9E0B620421F3DBCB66B5EF1DF9912236F7F7CD242908C4F7494ED2CD2977C4A5A254744B110ABE92EDF9ABE3BE85D4A2FBDA0C7439D73C95227A2EF9DFEB044455674C7A6F4983CA52F0555DE667B4A49FC4A64C73E83669FB1B0AF3274896ED321F649DB4B57A4181D032AADE96F181227B1FDF1063299F44B6524B265E17FE164E6A4A8D015962D8DF9D8242C1961766CF84BA2BF44A4BE4F8D1D254186FDFBD31490FF90D90CF1B23C2E32768479467B5DBA296697E64209C5F589C711CC3F8D9B185CFB4661D38D78867EE179CA7773BF757D0AD3ACC41096161D3E62609022106FF0FA3D23BC88141A2E78C8BC926EBFB3F83FFED1642411993898E5EA07; caid={"lastIyunId":"c188fda5639eb7665faa8f12acce7976","iyunId":"8b2f57388088a1c2c7134fa625ad9375","iyunVersion":"20230330","lastIyunVersion":"20220111"}; buildver=5342; sDeviceId=9ec0847264c088b44ca5c2b5ee94cdab; channel=distribution; idfa=00000000-0000-0000-0000-000000000000; packageType=release; appver=9.3.60; deviceId=YD-9Ax/xiQscpNFGlFUREaQ6SU1wt1sfjoY; EVNSM=1.0.0; os=iPhone OS; osver=15.3.1; machineid=iPhone14.2; NMCID=jnvwlk.1721320815000.01.3; appkey=IuRPVVmc3WWul9fT; idfv=B2B23496-210B-40C0-B47B-C5AF4DADE41B; URS_APPID=B4300E3591BDEC0BDAD47C5B75AA09E2A1A402C0FEBDE5407986A72C8CE16DF5B6293116B121D6872A9FEA6913295501; NMDI=Q1NKTQcBDACpwlhh4qjU5lexqyeVAAAAbZiUDNNCRngAWM2rEgug/WjKgNVQj/xthQgCnQDkMe+BlTWRTXWFgjgWN+glqEGrkcrlNfCDMz93tohH8Qylg8SfY75c1x16qZaiYvB++3K7vPs++grPNlMDe+zFTWy0oZVDQcLVOEfzFL1lMn8eVOE3QjGclQdPuWKM2gHbkYVNxP5QrC9f75m/8Rnyw+c9MJPQ1ds=';
NeteaseHeaders['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 CloudMusic/0.1.1 NeteaseMusic/8.20.30';

$done({headers : NeteaseHeaders});
*
*
*/
const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

if (isNetEase) {
    const cookie = $argument?.Cookie;
    const mconfig = $argument?.MConfigInfo;
    const userAgent = $argument?.UserAgent;

    if (!cookie || !mconfig || !userAgent) {
        console.log("参数缺失信息：");
        if (!cookie) console.log("❌ Cookie 参数缺失");
        if (!mconfig) console.log("❌ MConfigInfo 参数缺失");
        if (!userAgent) console.log("❌ UserAgent 参数缺失");

        $notification.post(
            "网易云音乐遇到问题",
            "参数缺失",
            "请在插件内填入会员数据"
        );
        $done({});
    } else {
        header["cookie"] = cookie;
        header["mconfig-info"] = mconfig;
        header["user-agent"] = userAgent;

        console.log("✅ 网易云音乐会员已解锁 🎉");
        $done({ headers: header });
    }
} else {
    $done({});
}

