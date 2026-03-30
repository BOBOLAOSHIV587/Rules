/*
 *
 *
#!name= 网易云音乐 𝕏
#!desc= 对 网易云音乐 深度学习探索;
#!openUrl= https://apps.apple.com/app/id590338362
#!author= 
#!icon= https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/2d/e8/1b/2de81bfd-29a0-d067-63c3-38315cc1661a/AppIcon-1x_U007emarketing-0-9-0-0-85-220-0.png/460x0w.webp
#!date = 2025-08-00 00:00:00

[Argument]
VIP = switch, false, tag = [启用]会员, desc = 关闭开关将不对此选项生效

Cookie = input, "", tag = Cookie, desc = 必填
MConfigInfo = input, "", tag = MConfig-Info ,desc = 选填
UserAgent = input, "", tag = User-Agent, desc = 选填

[Rule]
DOMAIN,iadmat.nosdn.127.net,REJECT
DOMAIN,iadmatapk.nosdn.127.net,REJECT
DOMAIN,iadmusicmat.music.126.net,REJECT
DOMAIN,iadmusicmatvideo.music.126.net,REJECT
DOMAIN,ipv4.music.163.com,REJECT
DOMAIN,ipv6.music.163.com,REJECT

[Rewrite]
^https?://interface.*\.music\.163\.com/eapi/ad/get reject
^https?://interface.*\.music\.163\.com/eapi/ad/config/get reject
^https?://interface.*\.music\.163\.com/eapi/ad/iyunIds reject
^https?://interface.*\.music\.163\.com/eapi/ad/prefetch/select reject
^https?://interface.*\.music\.163\.com/eapi/ad/loading/current reject

^https?:\/\/interface\d?\.music\.163\.com\/e?api\/(ocpc\/)?ad\/ mock-response-body data-type=text
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:delivery\/(batch-)?deliver|moment\/tab\/info\/|side-bar\/mini-program\/music-service\/account|yunbei\/account\/entrance\/) reject-dict
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:community\/friends\/fans-group\/artist\/group\/|mine\/applet\/redpoint|music\/songshare\/text\/recommend\/|resniche\/position\/play\/new\/|resniche\/tspopup\/show|resource\/comments?\/musiciansaid\/|user\/sub\/artist) reject-dict
^https?:\/\/interface\d?\.music\.163\.com\/eapi\/(?:ios\/version|mlivestream\/entrance\/playpage\/|link\/position\/show\/strategy|link\/scene\/show\/resource|v1\/content\/exposure\/comment\/banner\/) reject-dict
^https?:\/\/interface\d?\.music\.163.com\/w?e?api\/search\/default mock-response-body data-type=text
^https?:\/\/interface\d?\.music\.163\.com\/w?eapi\/(?:activity\/bonus\/playpage\/time\/query|resource-exposure\/|search\/(?:chart\/|rcmd\/keyword\/|specialkeyword\/)) reject-dict
^https:\/\/interface\d\.music\.163\.com\/eapi\/my\/podcast\/tab\/recommend reject-dict

[Script]
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
NeteaseHeaders['cookie'] = '';
NeteaseHeaders['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 CloudMusic/0.1.1 NeteaseMusic/8.20.30';

$done({headers : NeteaseHeaders});
*
*
*/
const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

let cookie = $argument?.Cookie;
let userAgent = header["user-agent"];
let mconfig = header["mconfig-info"];

const ApiHost = $argument?.api_host;
const ApiDes  = $argument?.api_des;

if ($argument?.UserAgent) userAgent = $argument.UserAgent;
if ($argument?.MConfigInfo) mconfig = $argument.MConfigInfo;

function decodeApiDes(encoded) {
    let decoded = "";
    for (let i = 0; i < encoded.length; i++) {
        decoded += String.fromCharCode(encoded.charCodeAt(i) - 1);
    }
    return decoded;
}

function base64Decode(str) {
    try {
        return decodeURIComponent(atob(str).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    } catch (_) { return null; }
}

function parseApiData(data) {
    if (!data) return {};
    const rawData = data.trim();
    let decoded = rawData;
    const b64 = base64Decode(rawData);
    if (b64) decoded = b64;
    try {
        return JSON.parse(decoded);
    } catch (_) {
        const match = decoded.match(/"[Cc]ookie"\s*:\s*"([\s\S]+?)"(?=\s*,\s*[\r\n]+)/);
        if (match && match[1]) return { Cookie: match[1] };
        return {};
    }
}

const targetUrl = ApiDes ? decodeApiDes(ApiDes) : ApiHost;

if (isNetEase && targetUrl) {
    $httpClient.get({
        url: targetUrl,
        headers: { "User-Agent": "ting_v9.4.32_c5(CFNetwork, iOS 15.4.1, iPhone14,2)" }
    }, (error, response, data) => {
        if (!error && data) {
            const apiData = parseApiData(data);
            if (apiData.Cookie || apiData.cookie) {
                cookie = apiData.Cookie || apiData.cookie;
            }
        }
        main();
    });
} else {
    main();
}

function main() {
    if (cookie) {
        cookie = cookie.replace(/\n|\r/g, "").trim()
            .replace(/(sDeviceId=)([^;]+)/gi, (match, p1, p2) => p1 + p2.replace(/[^-]/g, '0'))
            .replace(/(idfa=)([^;]+)/gi, (match, p1, p2) => p1 + p2.replace(/[^-]/g, '0'))
            .replace(/(idfv=)([^;]+)/gi, (match, p1, p2) => p1 + p2.replace(/[^-]/g, '0'));
    }

    if (isNetEase) {
        /*
        if (!cookie || !mconfig || !userAgent) {
            */
        if (!cookie) {
            console.log("参数缺失信息：");
            if (!cookie) console.log("❌ Cookie 参数缺失");
            /*
            if (!mconfig) console.log("❌ MConfigInfo 参数缺失");
            if (!userAgent) console.log("❌ UserAgent 参数缺失");
            */
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
}
