
/* 
* 原作者 @mcdasheng688 @General74110
* 酷我音乐签到 
* 更新: 2025-12-18
* 说明: 
*  - phone: 手机号 (用于Web登录)
*  - ocr: OCR密钥 (用于验证码识别)
*  - notify: 1=每次通知(默认), 0=仅23点汇总通知
*
* 参数配置方式: 在脚本URL后添加
* 示例: .js?phone=138xxxx&ocr=Kxxx&notify=0
* 示例: .js?phone=138xxx
* 示例: .js?notify=0 可以不填写手机号和OCR密钥
[task_local]
15 7-23/1 * * * https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/kuwotask.js, tag=酷我音乐签到, img-url=https://raw.githubusercontent.com/deezertidal/private/main/icons/kuwosvip.png, enabled=true

[rewrite_local]
^https?:\/\/360\.com\/kuwo url script-analyze-echo-response https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/kuwotask.js

[mitm]
hostname = *.kuwo.cn，360.com

*/

const $ = new Env("酷我音乐");
const ARGS = (() => {
    let args = { phone: "", ocr: "", notify: "1" };
    let input = null;

    if (typeof $argument !== "undefined") {
        input = $argument;
    } else if (typeof $environment !== "undefined" && $environment.sourcePath) {
        input = $environment.sourcePath.split(/[?#]/)[1];
    }

    if (!input) return args;

    if (typeof input === "object") {
        if (Array.isArray(input)) {
            args.phone = input[0];
            args.ocr = input[1] || "";
            args.notify = input[2] !== undefined ? input[2] : "1";
        } else {
            args.phone = input.phone || input.sj || "";
            args.ocr = input.ocr || "";
            if (input.notify !== undefined) {
                args.notify = (input.notify === true || input.notify === "true" || input.notify === "1" || input.notify === 1) ? "1" : "0";
            }
        }
        args.phone = String(args.phone || "");
        args.ocr = String(args.ocr || "");
        args.notify = String(args.notify || "1");
        return args;
    }

    let str = String(input).trim().replace(/^\[|\]$/g, "").replace(/^"|"$/g, "");
    
    if (str.includes("=") || str.includes("&")) {
        str.split(/&|,/).forEach(item => {
            let [k, v] = item.split("=");
            if (k && v) args[k.trim()] = decodeURIComponent(v.trim());
        });
        if (args.notify) {
            args.notify = (args.notify === "true" || args.notify === "1") ? "1" : "0";
        }
    } else if (str.includes(",")) {
        let arr = str.split(",");
        args.phone = arr[0].trim();
        args.ocr = (arr[1] || "").trim();
        if (arr[2] !== undefined) {
            args.notify = (arr[2].trim() === "true" || arr[2].trim() === "1") ? "1" : "0";
        }
    } else {
        args.phone = str;
    }
    
    return args;
})();

// 敏感信息脱敏函数
function maskSensitiveInfo(str, type = 'phone') {
    if (!str) return '';
    if (type === 'phone') {
        // 手机号脱敏：保留前3位和后4位
        return str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    } else if (type === 'key') {
        // 密钥脱敏：只显示前4位和后4位
        if (str.length <= 8) return '****';
        return str.substring(0, 4) + '****' + str.substring(str.length - 4);
    }
    return str;
}

// 业务常量配置（必须在使用前定义）
const BUSINESS_CONSTANTS = {
    MIN_SCORE_FOR_CONVERT: 150000,  // 最低兑换积分阈值
    SURPRISE_MAX_RUN_COUNT: 6,      // 惊喜任务最大执行次数
    VIDEO_TASK_COUNT: 5,            // 视频任务执行次数
    LOTTERY_VIDEO_COUNT: 3,         // 视频抽奖次数
    LAST_RUN_HOUR: 23,              // 最后一次运行的小时数（用于汇总通知）
    SCORE_TO_YUAN_RATIO: 10000      // 积分转人民币比例
};

console.log(`手机号: ${maskSensitiveInfo(ARGS.phone, 'phone')}`);
console.log(`OCR 密钥: ${maskSensitiveInfo(ARGS.ocr, 'key')}`);
console.log(`每次通知: ${ARGS.notify === "1" ? "开启" : "关闭(仅汇总)"}`);

// 判断是否为最后一次运行（用于汇总通知）
const isLastRun = (() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    // 23:00-23:59 之间才算最后一次运行，避免边界问题
    return hour === BUSINESS_CONSTANTS.LAST_RUN_HOUR && minute >= 0;
})();

const STATS_KEY = "kuwo_daily_stats";

function getDailyStats() {
    const today = new Date().toISOString().slice(0, 10);
    let stats = {};
    try { stats = JSON.parse($.getdata(STATS_KEY) || "{}"); } catch (e) { stats = {}; }
    if (stats.date !== today) {
        stats = { date: today, runCount: 0, totalGold: 0, accounts: {} };
    }
    return stats;
}

function saveDailyStats(stats) {
    $.setdata(JSON.stringify(stats), STATS_KEY);
}

const CONFIG = {
    PATH: "/kuwo",
    WWW: "https://www.kuwo.cn",
    API: "https://wapi.kuwo.cn",
    PH: ARGS.phone || "",
    OCR: ARGS.ocr || "",
    NOTIFY: ARGS.notify || "1",
    KEY: "cookie_kuwo_v2"
};

const kw_headers = {
    'Origin': `https://h5app.kuwo.cn`,
    'Host': `integralapi.kuwo.cn`,
    'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KWMusic/11.2.3.0 DeviceModel/iPhone13,2 NetType/WIFI kuwopage`,
    'Referer': `https://h5app.kuwo.cn/`,
    'Accept-Language': `zh-CN,zh-Hans;q=0.9`
};

let notifyMsg = [];
let surpriseState = new Map();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    if (typeof $request !== "undefined") {
        const url = $request.url;
        if (url.indexOf(CONFIG.PATH) > -1) {
            if (url.indexOf("captcha") > -1) await h_cap();
            else if (url.indexOf("ocr") > -1) await h_ocr();
            else if (url.indexOf("sms") > -1) await h_sms();
            else if (url.indexOf("login") > -1) await h_login();
            else await render();
        } else {
            $.done({});
        }
    } else {
        await runCron();
        $.done();
    }
})();

async function h_cap() {
    try {
        const ua = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
        const r1 = await $.http.get({ url: CONFIG.WWW, headers: ua });
        let kv = "", kn = "";
        const sc = r1.headers['set-cookie'] || r1.headers['Set-Cookie'];
        const arr = Array.isArray(sc) ? sc : [sc];
        for (let c of arr) {
            if (c && (c.includes('Hm_Iuvt') || c.includes('kw_token') || c.length > 20)) {
                let parts = c.split(';')[0].split('=');
                if (parts.length >= 2) { kn = parts[0]; kv = parts[1]; break; }
            }
        }
        if (!kv && arr.length > 0) { let p = arr[0].split(';')[0].split('='); kn = p[0]; kv = p[1]; }
        if (!kv) return ret({ code: -1, msg: "Step1: Cookie获取失败" });
        const r2 = await $.http.get({ url: `${CONFIG.WWW}/api/common/captcha/getcode?reqId=${uuid()}&httpsStatus=1`, headers: { 'Cookie': `${kn}=${kv}`, 'Secret': sec(kv, kn), 'Referer': CONFIG.WWW, ...ua } });
        const j = JSON.parse(r2.body);
        ret({ code: j.code, msg: j.msg, data: { img: j.data?.img, token: j.data?.token, key: kn, val: kv } });
    } catch (e) { ret({ code: -1, msg: `异常: ${e.message}` }); }
}

async function h_ocr() {
    try {
        const b = sbody($request);
        let img = b.image;
        if (img.includes(",")) img = img.split(",")[1];
        const r = await $.http.post({ url: "https://api.ocr.space/parse/image", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `apikey=${CONFIG.OCR || 'helloworld'}&base64Image=data:image/jpeg;base64,${encodeURIComponent(img)}&language=eng&scale=true&OCREngine=2` });
        const j = JSON.parse(r.body);
        if (j.ParsedResults?.[0]?.ParsedText) ret({ code: 200, text: j.ParsedResults[0].ParsedText.replace(/[\r\n\s]/g, "") });
        else ret({ code: -1 });
    } catch (e) { ret({ code: -1 }); }
}

async function h_sms() {
    try {
        const b = sbody($request);
        const r = await $.http.post({ url: `${CONFIG.WWW}/api/sms/mobileLoginCode?reqId=${uuid()}&httpsStatus=1`, headers: { 'Cookie': `${b.cookieKey}=${b.cookieVal}`, 'Secret': sec(b.cookieVal, b.cookieKey), 'Content-Type': 'application/json', 'Referer': CONFIG.WWW }, body: JSON.stringify({ verifyCode: b.code, verifyCodeToken: b.token, mobile: b.mobile }) });
        ret(JSON.parse(r.body));
    } catch (e) { ret({ code: -1, msg: "网络错误" }); }
}

async function h_login() {
    try {
        const b = sbody($request);
        const loginBody = { mobile: b.mobile, verifyCode: b.verifyCode, smsCode: b.smsCode, tm: b.tm };
        const reqUrl = `${CONFIG.API}/api/www/login/loginByMobile?reqId=${uuid()}&httpsStatus=1`;
        $.log(`[h_login] 请求URL: ${reqUrl}`);
        $.log(`[h_login] 请求Body: ${JSON.stringify(loginBody)}`);
        const r = await $.http.post({ 
            url: reqUrl, 
            headers: { 
                'Cookie': `${b.cookieKey}=${b.cookieVal}`, 
                'Secret': sec(b.cookieVal, b.cookieKey), 
                'Content-Type': 'application/json', 
                'Referer': CONFIG.WWW, 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }, 
            body: JSON.stringify(loginBody) 
        });
        let respBody = r.body;
        $.log(`[h_login] 响应: ${typeof respBody === 'string' ? respBody.substring(0, 300) : JSON.stringify(respBody)}`);
        if (typeof respBody === 'string' && respBody.trim().startsWith('<')) {
            return ret({ code: -1, msg: "登录接口返回HTML，请检查网络或稍后重试", raw: respBody.substring(0, 200) });
        }
        const j = JSON.parse(respBody);
        let logs = [];
        if (j.code === 200 && j.data && j.data.cookies) {
            const c = j.data.cookies;
            const u = { userid: c.userid, sid: c.sid || c.websid };
            let old = $.getdata(CONFIG.KEY);
            let arr = [];
            let isNewUser = true;
            let isUpdated = false;

            try {
                let p = JSON.parse(old);
                if (Array.isArray(p)) arr = p;
                else if (p && typeof p === 'object') arr = [p];
            } catch (e) { }

            // 检查是否是已存在的用户
            const existingUser = arr.find(x => x && x.userid && String(x.userid) === String(u.userid));
            if (existingUser) {
                isNewUser = false;
                // 检查sid是否变化
                if (String(existingUser.sid) !== String(u.sid)) {
                    isUpdated = true;
                    $.log(`[h_login] 用户 ${u.userid} 的sid已更新: ${existingUser.sid} -> ${u.sid}`);
                }
            }

            // 移除旧的相同userid的记录
            arr = arr.filter(x => x && x.userid && String(x.userid) !== String(u.userid));
            arr.push(u);
            $.setdata(JSON.stringify(arr), CONFIG.KEY);

            // 构建通知消息
            notifyMsg = [];
            let displayName = "新用户";

            if (isNewUser) {
                notifyMsg.push("🎉 账号首次登录成功");
                notifyMsg.push("✅ 数据已保存到持久化存储");
                $.log(`[h_login] 新用户登录: userid=${u.userid}`);
            } else if (isUpdated) {
                notifyMsg.push("🔄 账号信息已更新");
                notifyMsg.push("✅ 新的会话已保存");
                displayName = "更新用户";
                $.log(`[h_login] 用户信息已更新: userid=${u.userid}`);
            } else {
                notifyMsg.push("✅ 账号重新登录成功");
                notifyMsg.push("ℹ️ 会话信息未变化");
                displayName = "已有用户";
                $.log(`[h_login] 用户重新登录: userid=${u.userid}`);
            }

            let tempStats = getDailyStats();
            try {
                await executeTasks(`${u.userid}@${u.sid}`, displayName, tempStats);
            } catch (taskErr) {
                $.log(`[h_login] executeTasks 出错: ${taskErr.message}`);
            }
            saveDailyStats(tempStats);
            logs = notifyMsg;
        }
        $.log(`[h_login] 准备返回响应: code=${j.code}`);
        return ret({ code: j.code, msg: j.msg, logs: logs });
    } catch (e) { 
        $.log(`[h_login] 捕获异常: ${e.message}`);
        return ret({ code: -1, msg: e.message }); 
    }
}

async function render() {
    const ph = CONFIG.PH.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

    // 检测用户使用的代理工具
    let clientType = "未知";
    let clientColor = "#8e8e93";
    if ($.isQX) {
        clientType = "QuantumultX";
        clientColor = "#0066cc";
    } else if ($.isLoon) {
        clientType = "Loon";
        clientColor = "#ff6b6b";
    } else if ($.isSurge) {
        clientType = "Surge";
        clientColor = "#00c4cc";
    }

    const h = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>酷我助手</title>
<style>
* { box-sizing: border-box; }
body { background: #f2f2f7; font-family: -apple-system, sans-serif; padding: 15px; margin: 0; }
.box { background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
h3 { margin-top: 0; margin-bottom: 5px; color: #1c1c1e; }
p { font-size: 13px; color: #8e8e93; margin-bottom: 20px; margin-top: 0; }
.client-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; color: #fff; background: ${clientColor}; margin-left: 8px; }
input { display: block; width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #d1d1d6; border-radius: 10px; font-size: 16px; background: #fcfcfc; }
.row { display: flex; gap: 10px; margin-bottom: 12px; align-items: center; }
.row input { flex: 1; width: 0; margin-bottom: 0; }
.cp { width: 110px; flex: none; height: 44px; background: #e5e5ea; border-radius: 10px; position: relative; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; }
#ct { font-size: 12px; color: #666; text-align: center; }
img { width: 100%; height: 100%; object-fit: contain; display: none; background: #fff; }
button { width: 100%; padding: 14px; margin-top: 8px; border: none; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; }
.btn-ocr { background: #e3f0ff; color: #007aff; margin-bottom: 4px; }
.btn-sms { background: #007aff; color: #fff; }
.btn-login { background: #34c759; color: #fff; }
#log { margin-top: 15px; font-size: 12px; color: #333; background: #f2f2f7; padding: 10px; border-radius: 8px; word-break: break-all; white-space: pre-wrap; min-height: 20px; }
</style>
</head>
<body>
<div class="box">
    <h3>酷我助手 v25<span class="client-badge">${clientType}</span></h3>
    <p>配置: ${ph}</p>
    <input id="p" value="${CONFIG.PH}" type="tel" placeholder="请输入手机号">
    <div class="row">
        <input id="c" placeholder="验证码" autocomplete="off">
        <div class="cp" id="btn_cap">
            <span id="ct">点击加载图片</span>
            <img id="ci">
        </div>
    </div>
    <button class="btn-ocr" id="btn_ocr">OCR 识别</button>
    <button class="btn-sms" id="btn_sms">获取短信验证码</button>
    <div id="s2" style="display:none; border-top: 1px dashed #d1d1d6; margin-top: 20px; padding-top: 20px;">
        <input id="s" type="tel" placeholder="输入短信验证码">
        <button class="btn-login" id="btn_login">登录并执行任务</button>
    </div>
    <div id="log">等待 JS 初始化...</div>
</div>
<script>
(function(){
    let D = {t:"", k:"", v:"", tm:""};
    const logEl = document.getElementById('log');
    function L(text) { logEl.style.display = 'block'; logEl.innerText = ">> " + text + "\\n" + logEl.innerText; }
    async function loadCaptcha() {
        const ct = document.getElementById('ct'), ci = document.getElementById('ci');
        ci.style.display = 'none'; ct.style.display = 'flex'; ct.innerText = '加载中...';
        try {
            let r = await fetch('${CONFIG.PATH}/captcha?t=' + Date.now());
            let j = await r.json();
            if (j.code == 200 && j.data) {
                D.t = j.data.token; D.k = j.data.key; D.v = j.data.val;
                let src = j.data.img || "";
                if (!src.startsWith("data:image")) src = "data:image/png;base64," + src;
                ci.src = src;
                ci.onload = () => { ci.style.display = 'block'; ct.style.display = 'none'; L("图片加载成功"); };
                ci.onerror = () => { ct.innerText = '图片损坏'; L("Base64数据错误"); };
            } else { ct.innerText = '失败(点我)'; L("API错误: " + (j.msg || "未知")); }
        } catch(e) { ct.innerText = '重试'; L("网络请求失败: " + e); }
    }
    async function doOcr() {
        const b = document.getElementById('btn_ocr'), ci = document.getElementById('ci');
        b.innerText = "识别中...";
        try {
            if (!ci.src || ci.style.display === 'none') throw "请先加载图片";
            let raw = ci.src.split(',')[1];
            let r = await fetch('${CONFIG.PATH}/ocr', {method:'POST', body:JSON.stringify({image:raw})});
            let j = await r.json();
            if (j.code == 200 && j.text) { document.getElementById('c').value = j.text; b.innerText = "识别成功"; } 
            else { b.innerText = "识别失败"; L("OCR失败"); }
        } catch(e) { b.innerText = "OCR 识别"; alert(e); }
    }
    async function doSms() {
        const p = document.getElementById('p').value, c = document.getElementById('c').value;
        if (!p || !c) return alert("请补全手机号和验证码");
        const b = document.getElementById('btn_sms'); b.innerText = "发送中..."; b.disabled = true;
        try {
            let r = await fetch('${CONFIG.PATH}/sms', {method:'POST', body:JSON.stringify({mobile:p, code:c, token:D.t, cookieKey:D.k, cookieVal:D.v})});
            let j = await r.json();
            if (j.code == 200) { D.tm = j.data.tm; document.getElementById('s2').style.display = 'block'; b.innerText = "已发送"; L("短信发送成功"); }
            else { b.innerText = "重试"; b.disabled = false; L("短信错误: " + j.msg); }
        } catch(e) { b.innerText = "重试"; b.disabled = false; L("请求异常"); }
    }
    async function doLogin() {
        const s = document.getElementById('s').value;
        if (!s) return alert("请输入短信验证码");
        const b = document.getElementById('btn_login'); b.innerText = "登录中...";
        try {
            let r = await fetch('${CONFIG.PATH}/login', {method:'POST', body:JSON.stringify({mobile: document.getElementById('p').value, verifyCode: document.getElementById('c').value, smsCode: s, tm: D.tm, cookieKey: D.k, cookieVal: D.v})});
            let txt = await r.text();
            L("响应: " + txt.substring(0, 200));
            let j;
            try { j = JSON.parse(txt); } catch(pe) { L("JSON解析失败: " + pe.message); b.innerText = "解析失败"; return; }
            if (j.code == 200) { L("登录成功！\\n" + (j.logs ? j.logs.join("\\n") : "")); b.innerText = "登录成功"; }
            else { b.innerText = "登录失败"; L("错误: " + j.msg); }
        } catch(e) { b.innerText = "重试"; L("请求异常: " + e.message); }
    }
    window.addEventListener('load', () => {
        logEl.innerText = "✅ 系统初始化就绪";
        document.getElementById('btn_cap').addEventListener('click', loadCaptcha);
        document.getElementById('btn_ocr').addEventListener('click', doOcr);
        document.getElementById('btn_sms').addEventListener('click', doSms);
        document.getElementById('btn_login').addEventListener('click', doLogin);
    });
})();
</script></body></html>`;
    $.isQX ? $.done({ status: "HTTP/1.1 200 OK", headers: { "Content-Type": "text/html;charset=utf-8" }, body: h }) : $.done({ response: { status: 200, headers: { "Content-Type": "text/html;charset=utf-8" }, body: h } });
}

async function runCron() {
    $.log("🔔 脚本开始运行...");
    let rawData = $.getdata(CONFIG.KEY) || $.getdata("Kuwo_cookies");
    if (!rawData) {
        if (CONFIG.NOTIFY === "1" || isLastRun) {
            $.msg("酷我音乐", "", "❌ 未检测到登录信息");
        }
        return;
    }
    let accountArr = [];
    try {
        let p = JSON.parse(rawData);
        if (Array.isArray(p)) accountArr = p;
        else if (p && typeof p === 'object') accountArr = [p];
    } catch (e) {
        accountArr = rawData.split(/[&]/).filter(x => x.includes('@'));
    }
    accountArr = accountArr.filter(x => {
        if (typeof x === 'string') return x.includes('@');
        return x && x.userid;
    });
    $.log(`📝 共检测到 ${accountArr.length} 个账号`);
    
    let dailyStats = getDailyStats();
    dailyStats.runCount++;
    
    for (let i = 0; i < accountArr.length; i++) {
        let ID = accountArr[i];
        if (typeof ID === 'object') ID = `${ID.userid}@${ID.sid || ID.websid}`;
        if (!ID.includes('@')) continue;
        
        if (!dailyStats.accounts[ID]) {
            dailyStats.accounts[ID] = { name: "", goldEarned: 0, taskCount: 0 };
        }
        
        try {
            const nickname = await getNickname(ID);
            const displayName = nickname || `用户${i + 1}`;
            dailyStats.accounts[ID].name = displayName;
            notifyMsg = [`👤 账号: ${displayName}`];
            $.log(`🚀 [${displayName}] 开始执行任务...`);
            if (nickname == null) {
                notifyMsg.push("⚠️ Cookie可能已失效，请检查");
            } else {
                await executeTasks(ID, displayName, dailyStats);
            }
            
            if (CONFIG.NOTIFY === "1") {
                const message = notifyMsg.join("\n");
                $.msg("酷我音乐", `任务报告`, message);
            } else {
                $.log(`📝 静默模式，跳过通知`);
            }
        } catch (err) {
            $.log(`❌ 账号 ${i + 1} 执行出错: ${err.message}`);
            if (CONFIG.NOTIFY === "1") {
                $.msg("酷我音乐", `账号 ${i + 1} 异常`, err.message);
            }
        }
        if (i < accountArr.length - 1) await sleep(3000);
    }
    
    saveDailyStats(dailyStats);
    
    if (isLastRun && CONFIG.NOTIFY === "0") {
        sendDailySummary(dailyStats);
    }
}

function sendDailySummary(stats) {
    let summary = [`📊 今日汇总 (${stats.date})`];
    summary.push(`🔄 运行次数: ${stats.runCount}`);
    summary.push(`───────────`);
    
    let totalGold = 0;
    for (let id in stats.accounts) {
        const acc = stats.accounts[id];
        summary.push(`👤 ${acc.name}`);
        summary.push(`   💰 获得: ${acc.goldEarned} 金币`);
        summary.push(`   ✅ 任务: ${acc.taskCount} 次`);
        totalGold += acc.goldEarned;
    }
    
    summary.push(`───────────`);
    summary.push(`💎 总计获得: ${totalGold} 金币`);
    
    $.msg("酷我音乐", "📈 每日汇总", summary.join("\n"));
}

async function executeTasks(ID, displayName, dailyStats) {
    $.log(`  - 获取资产...`);
    let taskSuccessCount = 0; // 局部变量，避免全局污染
    let beforeScore = 0;
    await getAsset(ID);
    if ($.asset && $.asset.data) {
        beforeScore = $.asset.data.remainScore || 0;
    }

    await VipExtime(ID);
    try {
        if ($.asset && $.asset.data && $.asset.data.remainScore >= BUSINESS_CONSTANTS.MIN_SCORE_FOR_CONVERT) {
            const convertSuccess = await Convert(ID);
            if (convertSuccess) taskSuccessCount++;
        }
    } catch (e) {
        $.log(`  - 兑换异常: ${e.message}`);
    }
    $.log(`  - 强制执行任务...`);

    // 执行各项任务并统计成功数
    if (await Clockin(ID)) taskSuccessCount++;
    taskSuccessCount += await box(ID);
    if (await BoxTask(ID)) taskSuccessCount++;
    if (await novel(ID)) taskSuccessCount++;
    if (await mobile(ID)) taskSuccessCount++;
    taskSuccessCount += await Listen(ID);
    taskSuccessCount += await Earning(ID);
    if (await collect(ID)) taskSuccessCount++;
    if (await loterry_free(ID)) taskSuccessCount++;
    if (await new_sign(ID)) taskSuccessCount++;
    if (await sign(ID)) taskSuccessCount++;

    for (let i = 0; i < BUSINESS_CONSTANTS.VIDEO_TASK_COUNT; i++) {
        if (await video(ID)) taskSuccessCount++;
        if (i % 2 == 0) await sleep(500);
    }
    for (let k = 0; k < BUSINESS_CONSTANTS.LOTTERY_VIDEO_COUNT; k++) {
        if (await loterry_video(ID)) taskSuccessCount++;
    }

    // 保存执行记录
    try {
        let executedTasks = JSON.parse($.getval('executedTasks') || '{}');
        const today = new Date().toISOString().slice(0, 10);
        if (!executedTasks[today]) executedTasks[today] = { morning: [], evening: [] };
        if (!executedTasks[today].morning.includes(ID)) executedTasks[today].morning.push(ID);
        $.setval(JSON.stringify(executedTasks), 'executedTasks');
    } catch (e) {
        $.log(`  - 保存执行记录失败: ${e.message}`);
    }

    taskSuccessCount += await surprise(ID);

    await getAsset(ID, true); // 静默获取，不push到通知
    let afterScore = 0;
    if ($.asset && $.asset.data) {
        afterScore = $.asset.data.remainScore || 0;
    }
    let earnedThisRun = Math.max(0, afterScore - beforeScore);

    if (dailyStats && dailyStats.accounts[ID]) {
        dailyStats.accounts[ID].goldEarned += earnedThisRun;
        dailyStats.accounts[ID].taskCount += taskSuccessCount;
    }

    // 精简通知：只显示关键信息
    notifyMsg.push(`✅ 成功: ${taskSuccessCount}个任务`);
    notifyMsg.push(`💰 积分: ${afterScore} (¥${(afterScore / BUSINESS_CONSTANTS.SCORE_TO_YUAN_RATIO).toFixed(2)})`);
    notifyMsg.push(`📈 本次: +${earnedThisRun} 金币`);
    $.log(`    > 成功任务: ${taskSuccessCount}, 本次获得: ${earnedThisRun} 金币`);
}

async function getNickname(ID) {
    let [uid] = ID.split('@');
    try {
        let res = await $.http.get({
            url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/music/userBase?loginUid=${uid}`,
            headers: kw_headers
        });
        let body = res.body;
        if (typeof body === 'string') body = JSON.parse(body);
        return body.data.nickname;
    } catch (e) {
        return null;
    }
}

async function getAsset(ID, silent = false) {
    const [uid, sid] = ID.split('@');
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/earningUserSignList?loginUid=${uid}&loginSid=${sid}`, headers: kw_headers }).then(resp => {
        try {
            const obj = JSON.parse(resp.body);
            $.asset = obj;
            if (obj.code == 200 && obj.success) {
                const score = obj.data.remainScore || 0;
                if (!silent) notifyMsg.push(`💰积分: ${score} (¥${(score / BUSINESS_CONSTANTS.SCORE_TO_YUAN_RATIO).toFixed(2)})`);
                $.log(`    > 积分: ${score}`);
            }
        } catch (e) {
            $.log(`    > 获取资产解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 获取资产请求失败: ${err.message}`);
    });
}

async function VipExtime(ID) {
    const [uid, sid] = ID.split('@');
    let h = JSON.parse(JSON.stringify(kw_headers)); h["Host"] = "vip1.kuwo.cn";
    await $.http.get({ url: `http://vip1.kuwo.cn/vip/v2/user/vip?op=ui&uid=${uid}&sid=${sid}&signver=new`, headers: h }).then(resp => {
        try {
            const obj = JSON.parse(resp.body); if (obj.meta?.code !== 200) return;
            const vip = obj.data || {};
            let t = Number(vip.vipLuxuryExpire || vip.vipmExpire || vip.vipExpire || 0);
            if (!t) { notifyMsg.push('🔴 未开通会员'); }
            else { if (t < 1e12) t *= 1000; const d = new Date(t); let str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; notifyMsg.push(`🎟️ 会员到期: ${str}`); }
        } catch (e) { }
    });
}

// 任务执行函数，返回是否成功
const doTask = async (ID, path, q, name) => {
    const [uid, sid] = ID.split('@');
    let success = false;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/${path}?loginUid=${uid}&loginSid=${sid}&&${q}`, headers: kw_headers }).then(resp => {
        try {
            const o = JSON.parse(resp.body);
            if (o.code === 200 && o.success) {
                const d = o.data.description;
                if (d === "成功" || d === "今天已完成任务") {
                    success = true;
                    $.log(`    > ${name}: ${d}`);
                }
            }
        } catch (e) {
            $.log(`    > ${name} 解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > ${name} 请求失败: ${err.message}`);
    });
    return success;
};

async function novel(ID) { return await doTask(ID, 'everydaymusic/doListen', 'from=novel&goldNum=18', '每日小说'); }
async function mobile(ID) { return await doTask(ID, 'everydaymusic/doListen', 'from=mobile&goldNum=18', '每日听歌'); }
async function collect(ID) { return await doTask(ID, 'everydaymusic/doListen', 'from=collect&goldNum=18', '每日收藏'); }
async function video(ID) { return await doTask(ID, 'everydaymusic/doListen', 'from=videoadver&goldNum=58', '创意视频'); }
async function sign(ID) { return await doTask(ID, 'everydaymusic/doListen', 'from=sign&extraGoldNum=110', '每日签到'); }
async function new_sign(ID) {
    const [uid, sid] = ID.split('@');
    let success = false;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newUserSignList?loginUid=${uid}&loginSid=${sid}`, headers: kw_headers }).then(resp => {
        try {
            if (JSON.parse(resp.body).data.isSign) {
                success = true;
                $.log(`    > 新签到: 已签`);
            }
        } catch (e) {
            $.log(`    > 新签到解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 新签到请求失败: ${err.message}`);
    });
    return success;
}
async function Clockin(ID) {
    const [uid, sid] = ID.split('@');
    let success = false;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=clock&goldNum=59`, headers: kw_headers }).then(resp => {
        try {
            const o = JSON.parse(resp.body);
            if (o.code === 200) {
                success = true;
                notifyMsg.push(`⏰打卡: ${o.data.description}`);
            }
        } catch (e) {
            $.log(`    > 打卡解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 打卡请求失败: ${err.message}`);
    });
    return success;
}
async function Listen(ID) {
    const [uid, sid] = ID.split('@');
    let list = [];
    let successCount = 0;

    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newUserSignList?loginUid=${uid}&loginSid=${sid}`, headers: kw_headers }).then(resp => {
        try {
            const o = JSON.parse(resp.body);
            if (o.code === 200) {
                const t = o.data.dataList.find(x => x.taskType === "listen");
                if (t && t.listenList) {
                    list = t.listenList.filter(x => x.timetraStatus != "0").map(x => ({ gold: x.goldNum, time: x.time, unit: x.unit }));
                }
            }
        } catch (e) {
            $.log(`    > 听歌列表解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 听歌列表请求失败: ${err.message}`);
    });

    for (let t of list) {
        await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=listen&goldNum=${t.gold}&listenTime=${t.time}&unit=${t.unit}`, headers: kw_headers }).then(resp => {
            try {
                const o = JSON.parse(resp.body);
                if (o.code === 200) {
                    successCount++;
                    $.log(`    > 听歌(${t.time}): ${o.data.description}`);
                }
            } catch (e) {
                $.log(`    > 听歌(${t.time})解析失败: ${e.message}`);
            }
        }).catch(err => {
            $.log(`    > 听歌(${t.time})请求失败: ${err.message}`);
        });
    }
    return successCount;
}
async function Earning(ID) {
    const [uid, sid] = ID.split('@');
    let successCount = 0;
    for (let id of [1, 2, 3]) {
        await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=coinAccumulationTask&taskId=${id}`, headers: kw_headers }).then(resp => {
            try {
                const o = JSON.parse(resp.body);
                if (o.code === 200 && o.data.obtain !== 0) {
                    successCount++;
                    $.log(`    > 累计奖励(${id}): ${o.data.description}`);
                }
            } catch (e) {
                $.log(`    > 累计奖励(${id})解析失败: ${e.message}`);
            }
        }).catch(err => {
            $.log(`    > 累计奖励(${id})请求失败: ${err.message}`);
        });
    }
    return successCount;
}
async function loterry_free(ID) {
    const [uid, sid] = ID.split('@');
    let success = false;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/loterry/getLucky?loginUid=${uid}&loginSid=${sid}&type=free`, headers: kw_headers }).then(resp => {
        try {
            const o = JSON.parse(resp.body);
            if (o.code === 200) {
                success = true;
                $.log(`    > 免费抽奖: ${o.data.loterryname || 'OK'}`);
            }
        } catch (e) {
            $.log(`    > 免费抽奖解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 免费抽奖请求失败: ${err.message}`);
    });
    return success;
}
async function loterry_video(ID) {
    const [uid, sid] = ID.split('@');
    let success = false;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/loterry/getLucky?loginUid=${uid}&loginSid=${sid}&type=video`, headers: kw_headers }).then(resp => {
        try {
            const o = JSON.parse(resp.body);
            if (o.code === 200) {
                success = true;
                $.log(`    > 视频抽奖: ${o.data.loterryname || 'OK'}`);
            }
        } catch (e) {
            $.log(`    > 视频抽奖解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 视频抽奖请求失败: ${err.message}`);
    });
    return success;
}
async function surprise(ID) {
    const [uid, sid] = ID.split('@');
    let st = surpriseState.get(ID) || { runCount: 0 };
    if (st.runCount >= BUSINESS_CONSTANTS.SURPRISE_MAX_RUN_COUNT) return 0;

    let successCount = 0;
    const gn = Math.random() < 0.3 ? 68 : 70;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=surprise&goldNum=${gn}&surpriseType=1`, headers: kw_headers }).then(resp => {
        try {
            const o = JSON.parse(resp.body);
            if (o.code === 200 && o.success) {
                successCount++;
                st.runCount++;
                surpriseState.set(ID, st);
                $.log(`    > 惊喜任务: ${o.data.description}`);
            }
        } catch (e) {
            $.log(`    > 惊喜任务解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 惊喜任务请求失败: ${err.message}`);
    });
    return successCount;
}
async function box(ID) {
    const [uid, sid] = ID.split('@');
    const times = ["00-08", "08-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-24"];
    let successCount = 0;

    for (let t of times) {
        const rand = 30;
        await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/boxRenew?loginUid=${uid}&loginSid=${sid}&action=new&time=${t}&goldNum=${rand}`, headers: kw_headers }).then(r => {
            try {
                if (JSON.parse(r.body).code === 200) {
                    successCount++;
                    $.log(`    > 新宝箱(${t}): 成功`);
                }
            } catch (e) {
                $.log(`    > 新宝箱(${t})解析失败: ${e.message}`);
            }
        }).catch(err => {
            $.log(`    > 新宝箱(${t})请求失败: ${err.message}`);
        });

        await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/boxRenew?loginUid=${uid}&loginSid=${sid}&action=old&time=${t}&goldNum=${rand}`, headers: kw_headers }).then(r => {
            try {
                if (JSON.parse(r.body).code === 200) {
                    successCount++;
                    $.log(`    > 补宝箱(${t}): 成功`);
                }
            } catch (e) {
                $.log(`    > 补宝箱(${t})解析失败: ${e.message}`);
            }
        }).catch(err => {
            $.log(`    > 补宝箱(${t})请求失败: ${err.message}`);
        });
    }
    return successCount;
}
async function BoxTask(ID) {
    const [uid, sid] = ID.split('@');
    let success = false;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/newBoxList?loginUid=${uid}&loginSid=${sid}&from=sign&extraGoldNum=110`, headers: kw_headers }).then(async resp => {
        try {
            const d = JSON.parse(resp.body);
            if (d.code === 200 && d.data.goldNum > 0) {
                await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/newBoxFinish?loginUid=${uid}&loginSid=${sid}&action=new&goldNum=${d.data.goldNum}`, headers: kw_headers }).then(r => {
                    const o = JSON.parse(r.body);
                    if (o.code === 200) {
                        success = true;
                        $.log(`    > 活动宝箱: 获得 ${d.data.goldNum}`);
                    }
                }).catch(err => {
                    $.log(`    > 活动宝箱完成请求失败: ${err.message}`);
                });
            }
        } catch (e) {
            $.log(`    > 活动宝箱解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 活动宝箱列表请求失败: ${err.message}`);
    });
    return success;
}
async function Convert(ID) {
    const [uid, sid] = ID.split('@');
    let success = false;
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/getExchangeAward?loginUid=${uid}&loginSid=${sid}&quotaId=13&exchangeType=vip`, headers: kw_headers }).then(resp => {
        try {
            const o = JSON.parse(resp.body);
            if (o.code === 200) {
                success = true;
                $.log(`    > 兑换: ${o.data.description}`);
            }
        } catch (e) {
            $.log(`    > 兑换解析失败: ${e.message}`);
        }
    }).catch(err => {
        $.log(`    > 兑换请求失败: ${err.message}`);
    });
    return success;
}

function sbody(r) { try { return typeof r.body == 'object' ? r.body : JSON.parse(r.body) } catch (e) { return {} } }
function ret(d) { 
    let h = { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }; 
    let b = JSON.stringify(d);
    $.log(`[ret] 返回数据: ${b.substring(0, 200)}`);
    if ($.isQX) {
        $done({ status: "HTTP/1.1 200 OK", headers: h, body: b });
    } else {
        // Surge & Loon
        $done({ 
            response: { 
                status: 200, 
                headers: h, 
                body: b 
            } 
        });
    }
}
// 生成UUID
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 加密函数（酷我API签名）
function sec(t, e) {
    if (null == e || e.length <= 0) return null;

    let n = "";
    for (let i = 0; i < e.length; i++) {
        n += e.charCodeAt(i).toString();
    }

    const o = Math.floor(n.length / 5);
    const r = parseInt(n.charAt(o) + n.charAt(2 * o) + n.charAt(3 * o) + n.charAt(4 * o) + n.charAt(5 * o));
    const c = Math.ceil(e.length / 2);
    const l = Math.pow(2, 31) - 1;

    if (r < 2) return null;

    const d = Math.round(1e9 * Math.random()) % 1e8;
    n += d;

    while (n.length > 10) {
        n = (parseInt(n.substring(0, 10)) + parseInt(n.substring(10, n.length))).toString();
    }

    n = (r * n + c) % l;

    let f = "";
    let h = "";
    for (let i = 0; i < t.length; i++) {
        f = parseInt(t.charCodeAt(i) ^ Math.floor(n / l * 255));
        h += f < 16 ? "0" + f.toString(16) : f.toString(16);
    }

    let dHex = d.toString(16);
    while (dHex.length < 8) {
        dHex = "0" + dHex;
    }

    return h += dHex;
}
function Env(name) {
    const isLoon = typeof $loon !== "undefined", isSurge = typeof $httpClient !== "undefined" && !isLoon, isQX = typeof $task !== "undefined";
    const http = { get: o => send(o, 'GET'), post: o => send(o, 'POST') };
    const send = (o, m) => new Promise((r, j) => { const opt = isQX ? o : { url: o.url, headers: o.headers, body: o.body }; if (isQX) { opt.method = m; $task.fetch(opt).then(res => { res.body = res.body; r(res) }).catch(j) } else { const c = m === 'POST' ? $httpClient.post : $httpClient.get; c(opt, (e, res, b) => { if (e) j(e); else { res.body = b; r(res) } }) } });
    const setdata = (v, k) => { if (isQX) return $prefs.setValueForKey(v, k); return $persistentStore.write(v, k) };
    const getdata = k => { if (isQX) return $prefs.valueForKey(k); return $persistentStore.read(k) };
    const setval = setdata;
    const getval = getdata;
    const notify = (t, s, m) => { if (isSurge || isLoon) $notification.post(t, s, m); if (isQX) $notify(t, s, m) };
    const msg = (t, s, m) => { if (isSurge || isLoon) $notification.post(t, s, m); if (isQX) $notify(t, s, m); console.log(`${t}\n${s}\n${m}`) };
    const log = console.log;
    const done = v => { isQX ? $done(v) : $done(v) };
    return { name, isLoon, isSurge, isQX, http, setdata, getdata, setval, getval, notify, msg, log, done };
}
