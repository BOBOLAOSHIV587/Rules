/*******************************
#!name=解锁会员｜网易云会员永久版
#!desc=共享永久网易云会员 失效群内反馈频道:@IPAs_share\n作者：暗夜
#!category=解锁会员

*******************************

[Script]
#7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
播放器会员皮肤 = type=http-request, pattern=^https:\/\/interface3?\.music\.163\.com\/eapi\/playermode\/, script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

搜索结果会员歌曲 = type=http-request, pattern=^https:\/\/interface3?\.music\.163\.com\/eapi\/search\/complex\/(page|rec\/song\/get), script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

播放器会员歌曲1 = type=http-request, pattern=^https:\/\/interface3?\.music\.163\.com\/eapi\/v3\/song\/detail, script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

播放器会员歌曲2 = type=http-request, pattern=^https:\/\/interface3?\.music\.163\.com\/eapi\/song\/(chorus|enhance\/|play\/|type\/detail\/get), script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

播放器会员歌曲3 = type=http-request, pattern=^https:\/\/interface3?\.music\.163\.com\/eapi\/(v1\/artist\/top\/song|v3\/discovery\/recommend\/songs), script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

侧边栏会员等级 = type=http-request, pattern=^https:\/\/interface3?\.music\.163\.com\/eapi\/vipnewcenter\/app\/resource\/newaccountpage, script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

首页歌单会员歌曲 = type=http-request, pattern=^https?:\/\/interface3?\.music\.163\.com\/eapi\/(homepage\/|v6\/)?playlist\/, script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

会员认证 = type=http-request, pattern=^https?:\/\/interface3?\.music\.163\.com\/eapi\/vipauth\/app\/auth\/(soundquality\/)?query, script-path=https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/NeteaseCloudMusic/JS/JS-5/NeteaseCloud.js, timeout=60

[MITM]
hostname = %APPEND% *.music.163.com

*******************************/

let header = $request.headers;
const isQuanX = typeof $task !== "undefined";
const MConfig = '{"zr4bw6pKFDIZScpo":{"version":1830912,"appver":"9.1.70"},"tPJJnts2H31BZXmp":{"version":3194880,"appver":"2.0.30"},"c0Ve6C0uNl2Am0Rl":{"version":598016,"appver":"1.7.50"},"IuRPVVmc3WWul9fT":{"version":52744192,"appver":"9.1.70"}}';

const User = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 CloudMusic/0.1.1 NeteaseMusic/8.20.30';

const cookie = 'MUSIC_U=00307B2CF8B0CC0C8D822BEF538D02760A54DA0214E64629E2DF3CB46DAB7A19C9E0B620421F3DBCB66B5EF1DF9912236F7F7CD242908C4F7494ED2CD2977C4A5A254744B110ABE92EDF9ABE3BE85D4A2FBDA0C7439D73C95227A2EF9DFEB044455674C7A6F4983CA52F0555DE667B4A49FC4A64C73E83669FB1B0AF3274896ED321F649DB4B57A4181D032AADE96F181227B1FDF1063299F44B6524B265E17FE164E6A4A8D015962D8DF9D8242C1961766CF84BA2BF44A4BE4F8D1D254186FDFBD31490FF90D90CF1B23C2E32768479467B5DBA296697E64209C5F589C711CC3F8D9B185CFB4661D38D78867EE179CA7773BF757D0AD3ACC41096161D3E62609022106FF0FA3D23BC88141A2E78C8BC926EBFB3F83FFED1642411993898E5EA07; caid={"lastIyunId":"c188fda5639eb7665faa8f12acce7976","iyunId":"8b2f57388088a1c2c7134fa625ad9375","iyunVersion":"20230330","lastIyunVersion":"20220111"}; buildver=5342; sDeviceId=9ec0847264c088b44ca5c2b5ee94cdab; channel=distribution; idfa=00000000-0000-0000-0000-000000000000; packageType=release; appver=9.1.60; deviceId=YD-9Ax%2FxiQscpNFGlFUREaQ6SU1wt1sfjoY; EVNSM=1.0.0; os=iPhone OS; osver=15.3.1; machineid=iPhone14.2; NMCID=jnvwlk.1721320815000.01.3; appkey=IuRPVVmc3WWul9fT; idfv=B2B23496-210B-40C0-B47B-C5AF4DADE41B; URS_APPID=B4300E3591BDEC0BDAD47C5B75AA09E2A1A402C0FEBDE5407986A72C8CE16DF5B6293116B121D6872A9FEA6913295501; NMDI=Q1NKTQcBDACpwlhh4qjU5lexqyeVAAAAbZiUDNNCRngAWM2rEgug%2FWjKgNVQj%2FxthQgCnQDkMe%2BBlTWRTXWFgjgWN%2BglqEGrkcrlNfCDMz93tohH8Qylg8SfY75c1x16qZaiYvB%2B%2B3K7vPs%2B%2BgrPNlMDe%2BzFTWy0oZVDQcLVOEfzFL1lMn8eVOE3QjGclQdPuWKM2gHbkYVNxP5QrC9f75m%2F8Rnyw%2Bc9MJPQ1ds%3D';



if (isQuanX) {
  header["MConfig-Info"] = MConfig;
  header["User-Agent"] = User;
  header["Cookie"] = cookie;
} else {
  header["mconfig-info"] = MConfig;
  header["user-agent"] = User;
  header["cookie"] = cookie;
}

$done({ headers: header });

