/* 
原作者 @mcdasheng688 @General74110
*/
const $ = new Env("酷我音乐");
const ARGS = (() => {
    let e = { phone: "", ocr: "" }, t = null;
    "undefined" != typeof $argument ? t = $argument : "undefined" != typeof $environment && $environment.sourcePath && (t = $environment.sourcePath.split(/[?#]/)[1]);
    if (!t) return e;
    if ("object" == typeof t) {
        Array.isArray(t) ? (e.phone = t[0], e.ocr = t[1] || "") : (e.phone = t.phone || t.sj || "", e.ocr = t.ocr || "");
        return e.phone = String(e.phone || ""), e.ocr = String(e.ocr || ""), e
    }
    let n = String(t).trim().replace(/^\[|\]$/g, "").replace(/^"|"$/g, "");
    return n.includes("=") || n.includes("&") ? n.split(/&|,/).forEach(t => {
        let [n, r] = t.split("=");
        n && r && (e[n.trim()] = decodeURIComponent(r.trim()))
    }) : n.includes(",") ? (t = n.split(","), e.phone = t[0].trim(), e.ocr = (t[1] || "").trim()) : e.phone = n, e
})();

const C = {
    PATH: "/kuwo",
    WWW: "https://www.kuwo.cn",
    API: "https://wapi.kuwo.cn",
    PH: ARGS.phone || "",
    KEY: "cookie_kuwo_v2"
};

const H = {
    Origin: "https://h5app.kuwo.cn",
    Host: "integralapi.kuwo.cn",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KWMusic/11.2.3.0 DeviceModel/iPhone13,2 NetType/WIFI kuwopage",
    Referer: "https://h5app.kuwo.cn/",
    "Accept-Language": "zh-CN,zh-Hans;q=0.9"
};

let NM = [], SS = new Map, sleep = e => new Promise(t => setTimeout(t, e));

(async () => {
    if ("undefined" != typeof $request) {
        const e = $request.url;
        if (e.indexOf(C.PATH) > -1) {
            if (e.indexOf("captcha") > -1) await h_cap();
            else if (e.indexOf("sms") > -1) await h_sms();
            else if (e.indexOf("login") > -1) await h_login();
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
        const ua = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" };
        const t = await $.http.get({ url: C.WWW, headers: ua });
        
        let n = "", r = "", o = t.headers["set-cookie"] || t.headers["Set-Cookie"];
        let a = Array.isArray(o) ? o : [o];
        
        for (let e of a) {
            if (e && (e.includes("Hm_Iuvt") || e.includes("kw_token") || e.length > 20)) {
                let t = e.split(";")[0].split("=");
                if (t.length >= 2) { r = t[0]; n = t[1]; break; }
            }
        }
        if (!n && a.length > 0) {
            let split = a[0].split(";")[0].split("=");
            r = split[0]; n = split[1];
        }

        if (!n) return ret({ code: -1, msg: "Step1: Cookie获取失败" });

        const i = await $.http.get({
            url: `${C.WWW}/api/common/captcha/getcode?reqId=${uuid()}&httpsStatus=1`,
            headers: {
                Cookie: `${r}=${n}`,
                Secret: sec(n, r),
                Referer: C.WWW,
                ...ua
            }
        });
        
        const c = JSON.parse(i.body);
        ret({
            code: c.code,
            msg: c.msg,
            data: {
                img: c.data?.img,
                token: c.data?.token,
                key: r,
                val: n
            }
        });
    } catch (e) {
        ret({ code: -1, msg: `异常: ${e.message}` });
    }
}

async function h_sms() {
    try {
        const e = sbody($request); 
        if (!e.mobile) return ret({ code: -1, msg: "参数解析失败(Body丢失)" });

        const t = await $.http.post({
            url: `${C.WWW}/api/sms/mobileLoginCode?reqId=${uuid()}&httpsStatus=1`,
            headers: {
                Cookie: `${e.cookieKey}=${e.cookieVal}`,
                Secret: sec(e.cookieVal, e.cookieKey),
                "Content-Type": "application/json",
                Referer: C.WWW
            },
            body: JSON.stringify({
                verifyCode: e.code,
                verifyCodeToken: e.token,
                mobile: e.mobile
            })
        });
        ret(JSON.parse(t.body));
    } catch (e) {
        ret({ code: -1, msg: "网络错误: " + e.message });
    }
}

async function h_login() {
    try {
        const e = sbody($request);
        const t = await $.http.post({
            url: `${C.API}/api/www/login/loginByMobile?reqId=${uuid()}&httpsStatus=1`,
            headers: {
                Cookie: `${e.cookieKey}=${e.cookieVal}`,
                Secret: sec(e.cookieVal, e.cookieKey),
                "Content-Type": "application/json",
                Referer: C.WWW
            },
            body: JSON.stringify(e)
        });
        
        const n = JSON.parse(t.body);
        let r = [];
        
        if (200 === n.code && n.data && n.data.cookies) {
            const t = n.data.cookies;
            const o = { userid: t.userid, sid: t.sid || t.websid };
            const a = $.getdata(C.KEY);
            let i = [];
            try {
                let e = JSON.parse(a);
                Array.isArray(e) ? i = e : e && "object" == typeof e && (i = [e]);
            } catch (e) {}
            
            i = i.filter(e => e && e.userid && String(e.userid) !== String(o.userid));
            i.push(o);
            $.setdata(JSON.stringify(i), C.KEY);
            
            let userStr = `${o.userid}@${o.sid}`;
            let nick = await getNickname(userStr);
            $.msg($.name, "✅ 登录成功", `CK已缓存\n账号昵称: ${nick || o.userid}`);

            NM = [];
            
            // QX 特殊处理：跳过耗时任务，只返回简单信息，防止超时
            if ($.isQX) {
                r = [
                    `👤 账号: ${nick || o.userid}`, 
                    "✅ 登录成功 (QX模式)", 
                    "⚠️ 为防止页面卡死，已跳过自动任务", 
                    "请在脚本列表中手动运行以执行任务"
                ];
            } else {
                await executeTasks(userStr, "新用户");
                r = NM;
            }
        }
        ret({ code: n.code, msg: n.msg, logs: r });
    } catch (e) {
        ret({ code: -1, msg: e.message });
    }
}

async function render() {
    const e = C.PH.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    let clientName = $.isLoon ? "Loon" : $.isQX ? "Quantumult X" : $.isSurge ? "Surge" : "Unknown Client";
    
    const t = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>酷我助手</title>
<style>
*{box-sizing:border-box}body{background:#f2f2f7;font-family:-apple-system,sans-serif;padding:15px;margin:0}
.box{background:#fff;padding:20px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.08)}
h3{margin-top:0;margin-bottom:5px;color:#1c1c1e}
.badge{display:inline-block;padding:2px 8px;border-radius:6px;background:#e5e5ea;color:#666;font-size:12px;font-weight:500;margin-bottom:15px}
p{font-size:13px;color:#8e8e93;margin-bottom:20px;margin-top:0}
input{display:block;width:100%;padding:12px;margin-bottom:12px;border:1px solid #d1d1d6;border-radius:10px;font-size:16px;background:#fcfcfc}
.row{display:flex;gap:10px;margin-bottom:12px;align-items:center}
.row input{flex:1;width:0;margin-bottom:0}
.cp{width:110px;flex:none;height:44px;background:#e5e5ea;border-radius:10px;position:relative;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center}
#ct{font-size:12px;color:#666;text-align:center}
img{width:100%;height:100%;object-fit:contain;display:none;background:#fff}
button{width:100%;padding:14px;margin-top:8px;border:none;border-radius:12px;font-weight:600;font-size:16px;cursor:pointer}
.btn-sms{background:#007aff;color:#fff}
.btn-login{background:#34c759;color:#fff}
#log{margin-top:15px;font-size:12px;color:#333;background:#f2f2f7;padding:10px;border-radius:8px;word-break:break-all;white-space:pre-wrap;min-height:20px}
</style>
</head>
<body>
<div class="box">
    <h3>酷我签到助手</h3>
    <span class="badge">当前客户端: ${clientName}</span>
    <p>配置: ${e}</p>
    <input id="p" value="${C.PH}" type="tel" placeholder="请输入手机号">
    <div class="row">
        <input id="c" placeholder="请手动输入右侧验证码" autocomplete="off">
        <div class="cp" id="btn_cap">
            <span id="ct">点击加载图片</span>
            <img id="ci">
        </div>
    </div>
    <button class="btn-sms" id="btn_sms">获取短信验证码</button>
    
    <div id="s2" style="display:none;border-top:1px dashed #d1d1d6;margin-top:20px;padding-top:20px;">
        <input id="s" type="tel" placeholder="输入短信验证码">
        <button class="btn-login" id="btn_login">登录并执行任务</button>
    </div>
    <div id="log">等待操作...</div>
</div>
<script>
(function(){
    let D={t:"",k:"",v:"",tm:""};
    const logEl=document.getElementById('log');
    function L(text){logEl.style.display='block';logEl.innerText=">> "+text+"\\n"+logEl.innerText}

    async function qFetch(path, data) {
        const str = JSON.stringify(data);
        return await fetch('${C.PATH}' + path, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Q-Body': encodeURIComponent(str)
            },
            body: str
        });
    }

    async function loadCaptcha(){
        const ct=document.getElementById('ct'),ci=document.getElementById('ci');
        ci.style.display='none';ct.style.display='flex';ct.innerText='加载中...';
        try{
            let r=await fetch('${C.PATH}/captcha?t='+Date.now());
            let j=await r.json();
            if(j.code==200&&j.data){
                D.t=j.data.token;D.k=j.data.key;D.v=j.data.val;
                let src=j.data.img||"";
                if(!src.startsWith("data:image"))src="data:image/png;base64,"+src;
                ci.src=src;
                ci.onload=()=>{ci.style.display='block';ct.style.display='none';L("图片加载成功，请手动输入")};
                ci.onerror=()=>{ct.innerText='图片损坏';L("Base64数据错误")}
            }else{
                ct.innerText='失败(点我)';L("API错误: "+(j.msg||"未知"))
            }
        }catch(e){ct.innerText='重试';L("网络请求失败: "+e)}
    }

    async function doSms(){
        const p=document.getElementById('p').value,c=document.getElementById('c').value;
        if(!p||!c)return alert("请补全手机号和图形验证码");
        const b=document.getElementById('btn_sms');b.innerText="发送中...";b.disabled=true;
        try{
            let r=await qFetch('/sms', {mobile:p,code:c,token:D.t,cookieKey:D.k,cookieVal:D.v});
            let j=await r.json();
            if(j.code==200){
                D.tm=j.data.tm;
                document.getElementById('s2').style.display='block';
                b.innerText="已发送";L("短信发送成功")
            } else {
                b.innerText="重试";b.disabled=false;L("短信错误: "+j.msg)
            }
        }catch(e){b.innerText="重试";b.disabled=false;L("请求异常: "+e)}
    }

    async function doLogin(){
        const s=document.getElementById('s').value;
        if(!s)return alert("请输入短信验证码");
        const b=document.getElementById('btn_login');b.innerText="登录中...";
        try{
            let r=await qFetch('/login', {
                mobile:document.getElementById('p').value,
                verifyCode:document.getElementById('c').value,
                smsCode:s,tm:D.tm,cookieKey:D.k,cookieVal:D.v
            });
            let j=await r.json();
            if(j.code==200){
                L("登录成功！\\n"+(j.logs?j.logs.join("\\n"):""));
                b.innerText="登录成功";
            } else {
                b.innerText="登录失败";L("错误: "+j.msg)
            }
        }catch(e){b.innerText="重试";L("请求异常: "+e)}
    }

    window.addEventListener('load',()=>{
        logEl.innerText="✅ 系统就绪";
        document.getElementById('btn_cap').addEventListener('click',loadCaptcha);
        document.getElementById('btn_sms').addEventListener('click',doSms);
        document.getElementById('btn_login').addEventListener('click',doLogin)
    })
})();
</script></body></html>`;

    $.isQX ? $.done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "text/html;charset=utf-8" },
        body: t
    }) : $.done({
        response: {
            status: 200,
            headers: { "Content-Type": "text/html;charset=utf-8" },
            body: t
        }
    })
}

async function runCron() {
    $.log("🔔 脚本开始运行...");
    let e = $.getdata(C.KEY) || $.getdata("Kuwo_cookies");
    if (!e) return void $.msg("酷我音乐", "", "❌ 未检测到登录信息");
    let t = [];
    try {
        let n = JSON.parse(e);
        Array.isArray(n) ? t = n : n && "object" == typeof n && (t = [n])
    } catch (n) {
        t = e.split(/[&]/).filter(e => e.includes("@"))
    }
    t = t.filter(e => "string" == typeof e ? e.includes("@") : e && e.userid);
    $.log(`📝 共检测到 ${t.length} 个账号`);
    for (let e = 0; e < t.length; e++) {
        let n = t[e];
        if ("object" == typeof n && (n = `${n.userid}@${n.sid || n.websid}`), n.includes("@")) try {
            const r = await getNickname(n), o = r || `用户${e + 1}`;
            NM = [`👤 账号: ${o}`], $.log(`🚀 [${o}] 开始执行任务...`), null == r ? NM.push("⚠️ Cookie可能已失效，请检查") : await executeTasks(n, o), $.msg("酷我音乐", "任务报告", NM.join("\n"))
        } catch (t) {
            $.log(`❌ 账号 ${e + 1} 执行出错: ${t.message}`), $.msg("酷我音乐", `账号 ${e + 1} 异常`, t.message)
        }
        e < t.length - 1 && await sleep(3e3)
    }
}
async function executeTasks(e, t) {
    $.log("  - 获取资产..."), await getAsset(e), await VipExtime(e);
    try {
        $.asset && $.asset.data && $.asset.data.remainScore >= 15e4 && await Convert(e)
    } catch (e) { } $.log("  - 强制执行任务..."), await Clockin(e), await box(e), await BoxTask(e), await novel(e), await mobile(e), await Listen(e), await Earning(e), await collect(e), await loterry_free(e), await new_sign(e), await sign(e);
    for (let t = 0; t < 5; t++)await video(e), t % 2 == 0 && await sleep(500);
    for (let t = 0; t < 3; t++)await loterry_video(e);
    let n = JSON.parse($.getval("executedTasks") || "{}"), r = (new Date).toISOString().slice(0, 10);
    n[r] || (n[r] = { morning: [], evening: [] }), n[r].morning.includes(e) || n[r].morning.push(e), $.setval(JSON.stringify(n), "executedTasks"), await surprise(e)
}
async function getNickname(e) { let [t] = e.split("@"); try { let e = await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/music/userBase?loginUid=${t}`, headers: H }), n = e.body; "string" == typeof n && (n = JSON.parse(n)); return n.data.nickname } catch (e) { return null } }
async function getAsset(e) { const [t, n] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/earningUserSignList?loginUid=${t}&loginSid=${n}`, headers: H }).then(e => { try { var t = JSON.parse(e.body); if ($.asset = t, 200 == t.code && t.success) { var n = t.data.remainScore || 0; NM.push(`💰积分: ${n} (¥${(n / 1e4).toFixed(2)})`), $.log(`    > 积分: ${n}`) } } catch (e) { } }) }
async function VipExtime(e) { const [t, n] = e.split("@"); let r = JSON.parse(JSON.stringify(H)); r.Host = "vip1.kuwo.cn", await $.http.get({ url: `http://vip1.kuwo.cn/vip/v2/user/vip?op=ui&uid=${t}&sid=${n}&signver=new`, headers: r }).then(e => { try { const t = JSON.parse(e.body); if (200 !== t.meta?.code) return; const n = t.data || {}; let r = Number(n.vipLuxuryExpire || n.vipmExpire || n.vipExpire || 0); if (r) { r < 1e12 && (r *= 1e3); const e = new Date(r), t = `${e.getFullYear()}-${e.getMonth() + 1}-${e.getDate()}`; NM.push(`🎟️ 会员到期: ${t}`) } else NM.push("🔴 未开通会员") } catch (e) { } }) }
const doTask = async (e, t, n, r) => { const [o, a] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/${t}?loginUid=${o}&loginSid=${a}&&${n}`, headers: H }).then(e => { try { let t = JSON.parse(e.body); if (200 === t.code && t.success) { let e = t.data.description; "成功" === e ? (NM.push(`🎉${r}: 成功`), $.log(`    > ${r}: 成功`)) : "今天已完成任务" === e && (NM.push(`🟢${r}: 已完成`), $.log(`    > ${r}: 已完成`)) } } catch (e) { } }) };
async function novel(e) { await doTask(e, "everydaymusic/doListen", "from=novel&goldNum=18", "每日小说") } async function mobile(e) { await doTask(e, "everydaymusic/doListen", "from=mobile&goldNum=18", "每日听歌") } async function collect(e) { await doTask(e, "everydaymusic/doListen", "from=collect&goldNum=18", "每日收藏") } async function video(e) { await doTask(e, "everydaymusic/doListen", "from=videoadver&goldNum=58", "创意视频") } async function sign(e) { await doTask(e, "everydaymusic/doListen", "from=sign&extraGoldNum=110", "每日签到") } async function new_sign(e) { const [t, n] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newUserSignList?loginUid=${t}&loginSid=${n}`, headers: H }).then(e => { try { JSON.parse(e.body).data.isSign && NM.push("🟢新签到: 已签") } catch (e) { } }) } async function Clockin(e) { const [t, n] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${t}&loginSid=${n}&from=clock&goldNum=59`, headers: H }).then(e => { try { let t = JSON.parse(e.body); 200 === t.code && NM.push(`⏰打卡: ${t.data.description}`) } catch (e) { } }) }
async function Listen(e) { const [t, n] = e.split("@"); let r = []; await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newUserSignList?loginUid=${t}&loginSid=${n}`, headers: H }).then(e => { try { let t = JSON.parse(e.body); if (200 === t.code) { let e = t.data.dataList.find(e => "listen" === e.taskType); e && e.listenList && (r = e.listenList.filter(e => "0" != e.timetraStatus).map(e => ({ gold: e.goldNum, time: e.time, unit: e.unit }))) } } catch (e) { } }); for (let e of r)await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${t}&loginSid=${n}&from=listen&goldNum=${e.gold}&listenTime=${e.time}&unit=${e.unit}`, headers: H }).then(t => { try { let n = JSON.parse(t.body); 200 === n.code && (NM.push(`🎉听歌(${e.time}${e.unit}): ${n.data.description}`), $.log(`    > 听歌(${e.time}): 成功`)) } catch (e) { } }) }
async function Earning(e) { const [t, n] = e.split("@"); for (let e of [1, 2, 3])await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${t}&loginSid=${n}&from=coinAccumulationTask&taskId=${e}`, headers: H }).then(t => { try { let n = JSON.parse(t.body); 200 === n.code && 0 !== n.data.obtain && NM.push(`🎉累计奖励(${e}): ${n.data.description}`) } catch (e) { } }) } async function loterry_free(e) { const [t, n] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/loterry/getLucky?loginUid=${t}&loginSid=${n}&type=free`, headers: H }).then(e => { try { let t = JSON.parse(e.body); 200 === t.code && NM.push(`🎉免费抽奖: ${t.data.loterryname || "OK"}`) } catch (e) { } }) } async function loterry_video(e) { const [t, n] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/loterry/getLucky?loginUid=${t}&loginSid=${n}&type=video`, headers: H }).then(e => { try { let t = JSON.parse(e.body); 200 === t.code && NM.push(`🎉视频抽奖: ${t.data.loterryname || "OK"}`) } catch (e) { } }) }
async function surprise(e) { const [t, n] = e.split("@"); let r = SS.get(e) || { runCount: 0 }; if (r.runCount >= 6) return; let o = Math.random() < .3 ? 68 : 70; await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/v1/earningSignIn/newDoListen?loginUid=${t}&loginSid=${n}&from=surprise&goldNum=${o}&surpriseType=1`, headers: H }).then(e => { try { let t = JSON.parse(e.body); 200 === t.code && t.success && (NM.push(`🎉惊喜任务: ${t.data.description}`), r.runCount++, SS.set(e, r)) } catch (e) { } }) } async function box(e) { const [t, n] = e.split("@"); let r = ["00-08", "08-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-24"]; for (let e of r) { let r = 30; await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/boxRenew?loginUid=${t}&loginSid=${n}&action=new&time=${e}&goldNum=${r}`, headers: H }).then(t => { try { 200 === JSON.parse(t.body).code && NM.push(`📦新宝箱(${e}): 成功`) } catch (e) { } }), await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/boxRenew?loginUid=${t}&loginSid=${n}&action=old&time=${e}&goldNum=${r}`, headers: H }).then(t => { try { 200 === JSON.parse(t.body).code && NM.push(`📦补宝箱(${e}): 成功`) } catch (e) { } }) } }
async function BoxTask(e) { const [t, n] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/newBoxList?loginUid=${t}&loginSid=${n}&from=sign&extraGoldNum=110`, headers: H }).then(async e => { try { let r = JSON.parse(e.body); 200 === r.code && r.data.goldNum > 0 && await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/new/newBoxFinish?loginUid=${t}&loginSid=${n}&action=new&goldNum=${r.data.goldNum}`, headers: H }).then(e => { 200 === JSON.parse(e.body).code && NM.push(`🎉活动宝箱: 获得 ${r.data.goldNum}`) }) } catch (e) { } }) } async function Convert(e) { const [t, n] = e.split("@"); await $.http.get({ url: `https://integralapi.kuwo.cn/api/v1/online/sign/getExchangeAward?loginUid=${t}&loginSid=${n}&quotaId=13&exchangeType=vip`, headers: H }).then(e => { try { let t = JSON.parse(e.body); 200 === t.code && NM.push(`💳兑换: ${t.data.description}`) } catch (e) { } }) }

function sbody(e) {
    try {
        let b = e.body;
        if (!b && e.headers) {
            const h = e.headers["X-Q-Body"] || e.headers["x-q-body"];
            if (h) b = decodeURIComponent(h);
        }
        if (!b) return {};
        return "object" == typeof b ? b : JSON.parse(b);
    } catch (e) {
        return {}
    }
}
function ret(e) { let t = { "Content-Type": "application/json" }, n = JSON.stringify(e); $.isQX ? $.done({ status: "HTTP/1.1 200 OK", headers: t, body: n }) : $.done({ response: { status: 200, headers: t, body: n } }) }
function uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, e => ("x" === e ? 16 * Math.random() | 0 : 16 * Math.random() | 0 & 3 | 8).toString(16)) }
function sec(e, t) { if (null == t || t.length <= 0) return null; var n = ""; for (var r = 0; r < t.length; r++)n += t.charCodeAt(r).toString(); var o = Math.floor(n.length / 5), a = parseInt(n.charAt(o) + n.charAt(2 * o) + n.charAt(3 * o) + n.charAt(4 * o) + n.charAt(5 * o)), i = Math.ceil(t.length / 2), c = Math.pow(2, 31) - 1; if (a < 2) return null; var s = Math.round(1e9 * Math.random()) % 1e8; for (n += s; n.length > 10;)n = (parseInt(n.substring(0, 10)) + parseInt(n.substring(10, n.length))).toString(); n = (a * n + i) % c; var l = "", u = ""; for (r = 0; r < e.length; r++)l = parseInt(e.charCodeAt(r) ^ Math.floor(n / c * 255)), u += l < 16 ? "0" + l.toString(16) : l.toString(16); var d = s.toString(16); for (; d.length < 8;)d = "0" + d; return u += d }
function Env(e) { const t = "undefined" != typeof $loon, n = "undefined" != typeof $httpClient && !t, r = "undefined" != typeof $task, o = { get: e => a(e, "GET"), post: e => a(e, "POST") }, a = (e, t) => new Promise((n, o) => { const a = r ? e : { url: e.url, headers: e.headers, body: e.body }; r ? (a.method = t, $task.fetch(a).then(e => { e.body = e.body, n(e) }).catch(o)) : (t = "POST" === t ? $httpClient.post : $httpClient.get)(a, (e, t, r) => { e ? o(e) : (t.body = r, n(t)) }) }), i = (e, t) => r ? $prefs.setValueForKey(e, t) : $persistentStore.write(e, t), c = e => r ? $prefs.valueForKey(e) : $persistentStore.read(e), s = (e, o, a) => { (n || t) && $notification.post(e, o, a), r && $notify(e, o, a) }, l = (e, o, a) => { (n || t) && $notification.post(e, o, a), r && $notify(e, o, a), console.log(`${e}\n${o}\n${a}`) }, u = e => { r ? $done(e) : $done(e) }; return { name: e, isLoon: t, isSurge: n, isQX: r, http: o, setdata: i, getdata: c, setval: i, getval: c, notify: s, msg: l, log: console.log, done: u } }
