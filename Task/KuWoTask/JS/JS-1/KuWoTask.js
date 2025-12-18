/* 
原作者 @mcdasheng688 @General74110
// Loon示例: [Argument]
// kuwo_phone = input,手机号,tag=酷我-手机号
// kuwo_ocr = input,OCR密钥,tag=酷我-OCR密钥  
// kuwo_notify = switch,true,false,tag=酷我-每次通知
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

console.log(`手机号: ${ARGS.phone}`);
console.log(`OCR 密钥: ${ARGS.ocr}`);
console.log(`每次通知: ${ARGS.notify === "1" ? "开启" : "关闭(仅汇总)"}`);

const isLastRun = (() => {
    const hour = new Date().getHours();
    return hour === 23;
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
        const r = await $.http.post({ url: `${CONFIG.API}/api/www/login/loginByMobile?reqId=${uuid()}&httpsStatus=1`, headers: { 'Cookie': `${b.cookieKey}=${b.cookieVal}`, 'Secret': sec(b.cookieVal, b.cookieKey), 'Content-Type': 'application/json', 'Referer': CONFIG.WWW }, body: JSON.stringify(b) });
        const j = JSON.parse(r.body);
        let logs = [];
        if (j.code === 200 && j.data && j.data.cookies) {
            const c = j.data.cookies;
            const u = { userid: c.userid, sid: c.sid || c.websid };
            let old = $.getdata(CONFIG.KEY);
            let arr = [];
            try {
                let p = JSON.parse(old);
                if (Array.isArray(p)) arr = p;
                else if (p && typeof p === 'object') arr = [p];
            } catch (e) { }
            arr = arr.filter(x => x && x.userid && String(x.userid) !== String(u.userid));
            arr.push(u);
            $.setdata(JSON.stringify(arr), CONFIG.KEY);
            notifyMsg = [];
            let tempStats = getDailyStats();
            await executeTasks(`${u.userid}@${u.sid}`, "新用户", tempStats);
            saveDailyStats(tempStats);
            logs = notifyMsg;
        }
        ret({ code: j.code, msg: j.msg, logs: logs });
    } catch (e) { ret({ code: -1, msg: e.message }); }
}

async function render() {
    const ph = CONFIG.PH.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
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
    <h3>酷我助手 v25</h3>
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
    taskSuccessCount = 0; // 重置任务计数
    let beforeScore = 0;
    await getAsset(ID);
    if ($.asset && $.asset.data) {
        beforeScore = $.asset.data.remainScore || 0;
    }
    
    await VipExtime(ID);
    try {
        if ($.asset && $.asset.data && $.asset.data.remainScore >= 150000) await Convert(ID);
    } catch (e) { }
    $.log(`  - 强制执行任务...`);
    
    await Clockin(ID);
    await box(ID);
    await BoxTask(ID);
    await novel(ID);
    await mobile(ID);
    await Listen(ID);
    await Earning(ID);
    await collect(ID);
    await loterry_free(ID);
    await new_sign(ID);
    await sign(ID);
    for (let i = 0; i < 5; i++) {
        await video(ID);
        if (i % 2 == 0) await sleep(500);
    }
    for (let k = 0; k < 3; k++) await loterry_video(ID);
    let executedTasks = JSON.parse($.getval('executedTasks') || '{}');
    const today = new Date().toISOString().slice(0, 10);
    if (!executedTasks[today]) executedTasks[today] = { morning: [], evening: [] };
    if (!executedTasks[today].morning.includes(ID)) executedTasks[today].morning.push(ID);
    $.setval(JSON.stringify(executedTasks), 'executedTasks');
    await surprise(ID);
    
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
    notifyMsg.push(`💰 积分: ${afterScore} (¥${(afterScore / 10000).toFixed(2)})`);
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
            var obj = JSON.parse(resp.body); $.asset = obj;
            if (obj.code == 200 && obj.success) {
                var score = obj.data.remainScore || 0;
                if (!silent) notifyMsg.push(`💰积分: ${score} (¥${(score / 10000).toFixed(2)})`);
                $.log(`    > 积分: ${score}`);
            }
        } catch (e) { }
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

let taskSuccessCount = 0;
const doTask = async (ID, path, q, name) => {
    const [uid, sid] = ID.split('@');
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/${path}?loginUid=${uid}&loginSid=${sid}&&${q}`, headers: kw_headers }).then(resp => {
        try {
            let o = JSON.parse(resp.body);
            if (o.code === 200 && o.success) {
                let d = o.data.description;
                if (d === "成功" || d === "今天已完成任务") { taskSuccessCount++; $.log(`    > ${name}: ${d}`); }
            }
        } catch (e) { }
    });
};

async function novel(ID) { await doTask(ID, 'everydaymusic/doListen', 'from=novel&goldNum=18', '每日小说'); }
async function mobile(ID) { await doTask(ID, 'everydaymusic/doListen', 'from=mobile&goldNum=18', '每日听歌'); }
async function collect(ID) { await doTask(ID, 'everydaymusic/doListen', 'from=collect&goldNum=18', '每日收藏'); }
async function video(ID) { await doTask(ID, 'everydaymusic/doListen', 'from=videoadver&goldNum=58', '创意视频'); }
async function sign(ID) { await doTask(ID, 'everydaymusic/doListen', 'from=sign&extraGoldNum=110', '每日签到'); }
async function new_sign(ID) { const [uid, sid] = ID.split('@'); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newUserSignList?loginUid=${uid}&loginSid=${sid}`, headers: kw_headers }).then(resp => { try { if (JSON.parse(resp.body).data.isSign) { taskSuccessCount++; $.log(`    > 新签到: 已签`); } } catch (e) { } }); }
async function Clockin(ID) { const [uid, sid] = ID.split('@'); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=clock&goldNum=59`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200) { taskSuccessCount++; notifyMsg.push(`⏰打卡: ${o.data.description}`); } } catch (e) { } }); }
async function Listen(ID) {
    const [uid, sid] = ID.split('@'); let list = [];
    await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newUserSignList?loginUid=${uid}&loginSid=${sid}`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200) { let t = o.data.dataList.find(x => x.taskType === "listen"); if (t && t.listenList) list = t.listenList.filter(x => x.timetraStatus != "0").map(x => ({ gold: x.goldNum, time: x.time, unit: x.unit })); } } catch (e) { } });
    for (let t of list) { await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=listen&goldNum=${t.gold}&listenTime=${t.time}&unit=${t.unit}`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200) { taskSuccessCount++; $.log(`    > 听歌(${t.time}): ${o.data.description}`); } } catch (e) { } }); }
}
async function Earning(ID) { const [uid, sid] = ID.split('@'); for (let id of [1, 2, 3]) { await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=coinAccumulationTask&taskId=${id}`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200 && o.data.obtain !== 0) { taskSuccessCount++; $.log(`    > 累计奖励(${id}): ${o.data.description}`); } } catch (e) { } }); } }
async function loterry_free(ID) { const [uid, sid] = ID.split('@'); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/loterry/getLucky?loginUid=${uid}&loginSid=${sid}&type=free`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200) { taskSuccessCount++; $.log(`    > 免费抽奖: ${o.data.loterryname || 'OK'}`); } } catch (e) { } }); }
async function loterry_video(ID) { const [uid, sid] = ID.split('@'); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/loterry/getLucky?loginUid=${uid}&loginSid=${sid}&type=video`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200) { taskSuccessCount++; $.log(`    > 视频抽奖: ${o.data.loterryname || 'OK'}`); } } catch (e) { } }); }
async function surprise(ID) { const [uid, sid] = ID.split('@'); let st = surpriseState.get(ID) || { runCount: 0 }; if (st.runCount >= 6) return; let gn = Math.random() < 0.3 ? 68 : 70; await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${uid}&loginSid=${sid}&from=surprise&goldNum=${gn}&surpriseType=1`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200 && o.success) { taskSuccessCount++; st.runCount++; surpriseState.set(ID, st); $.log(`    > 惊喜任务: ${o.data.description}`); } } catch (e) { } }); }
async function box(ID) { const [uid, sid] = ID.split('@'); let times = ["00-08", "08-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-24"]; for (let t of times) { let rand = 30; await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/boxRenew?loginUid=${uid}&loginSid=${sid}&action=new&time=${t}&goldNum=${rand}`, headers: kw_headers }).then(r => { try { if (JSON.parse(r.body).code === 200) { taskSuccessCount++; $.log(`    > 新宝箱(${t}): 成功`); } } catch (e) { } }); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/boxRenew?loginUid=${uid}&loginSid=${sid}&action=old&time=${t}&goldNum=${rand}`, headers: kw_headers }).then(r => { try { if (JSON.parse(r.body).code === 200) { taskSuccessCount++; $.log(`    > 补宝箱(${t}): 成功`); } } catch (e) { } }); } }
async function BoxTask(ID) { const [uid, sid] = ID.split('@'); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/newBoxList?loginUid=${uid}&loginSid=${sid}&from=sign&extraGoldNum=110`, headers: kw_headers }).then(async resp => { try { let d = JSON.parse(resp.body); if (d.code === 200 && d.data.goldNum > 0) { await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/newBoxFinish?loginUid=${uid}&loginSid=${sid}&action=new&goldNum=${d.data.goldNum}`, headers: kw_headers }).then(r => { let o = JSON.parse(r.body); if (o.code === 200) { taskSuccessCount++; $.log(`    > 活动宝箱: 获得 ${d.data.goldNum}`); } }); } } catch (e) { } }); }
async function Convert(ID) { const [uid, sid] = ID.split('@'); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/getExchangeAward?loginUid=${uid}&loginSid=${sid}&quotaId=13&exchangeType=vip`, headers: kw_headers }).then(resp => { try { let o = JSON.parse(resp.body); if (o.code === 200) { taskSuccessCount++; $.log(`    > 兑换: ${o.data.description}`); } } catch (e) { } }); }

function sbody(r) { try { return typeof r.body == 'object' ? r.body : JSON.parse(r.body) } catch (e) { return {} } }
function ret(d) { let h = { "Content-Type": "application/json" }; let b = JSON.stringify(d); $.isQX ? $.done({ status: "HTTP/1.1 200 OK", headers: h, body: b }) : $.done({ response: { status: 200, headers: h, body: b } }) }
function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? Math.random() * 16 | 0 : (Math.random() * 16 | 0 & 0x3 | 0x8)).toString(16)) }
function sec(t, e) { if (null == e || e.length <= 0) return null; var n = ""; for (var i = 0; i < e.length; i++)n += e.charCodeAt(i).toString(); var o = Math.floor(n.length / 5), r = parseInt(n.charAt(o) + n.charAt(2 * o) + n.charAt(3 * o) + n.charAt(4 * o) + n.charAt(5 * o)), c = Math.ceil(e.length / 2), l = Math.pow(2, 31) - 1; if (r < 2) return null; var d = Math.round(1e9 * Math.random()) % 1e8; n += d; while (n.length > 10) n = (parseInt(n.substring(0, 10)) + parseInt(n.substring(10, n.length))).toString(); n = (r * n + c) % l; var f = "", h = ""; for (i = 0; i < t.length; i++)f = parseInt(t.charCodeAt(i) ^ Math.floor(n / l * 255)), h += f < 16 ? "0" + f.toString(16) : f.toString(16); var dHex = d.toString(16); while (dHex.length < 8) dHex = "0" + dHex; return h += dHex; }
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
