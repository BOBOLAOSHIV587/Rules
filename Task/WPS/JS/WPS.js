/**
 * WPS · 每日签到 + 福利中心(打卡/抽奖/会员试用申请/限量爆款领取)+ 小程序每日打卡,送积分与会员时长
 *
 * 抓取:打开「WPS」APP → 进任意活动页(任务中心/福利中心)→ 自动触发 page_info,抓 wps_sid
 * 签到:cron 10 点触发,抢完限量爆款顺手做签到等其余任务,逐个串行、动作间随机间隔(细节见 README)
 *
 * @Author: MaYIHEI <https://github.com/MaYIHEI/paperclip>
 * @Channel: Telegram 频道 https://t.me/mayihei
 * @Updated: 2026-06-27
 *
 * ===== Loon =====
 * [MITM]
 * hostname = personal-act.wps.cn
 * [Script]
 * http-request ^https:\/\/personal-act\.wps\.cn\/activity-rubik\/activity\/page_info tag=WPS Cookie, script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/wps/wps.cookie.js, requires-body=false, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/wps.png
 * cron "0 10 * * *" script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/wps/wps.js, tag=WPS签到, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/wps.png, enable=true
 *
 * ===== Surge =====
 * [MITM]
 * hostname = personal-act.wps.cn
 * [Script]
 * WPS Cookie = type=http-request,pattern=^https:\/\/personal-act\.wps\.cn\/activity-rubik\/activity\/page_info,requires-body=false,max-size=0,script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/wps/wps.cookie.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/wps.png
 * WPS签到 = type=cron,cronexp=0 10 * * *,timeout=120,script-path=https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/wps/wps.js,img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/wps.png
 *
 * ===== Quantumult X =====
 * [MITM]
 * hostname = personal-act.wps.cn
 * [rewrite_local]
 * ^https:\/\/personal-act\.wps\.cn\/activity-rubik\/activity\/page_info url script-request-header https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/wps/wps.cookie.js
 * [task_local]
 * 0 10 * * * https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/wps/wps.js, tag=WPS签到, img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/wps.png, enabled=true
 *
 * ===== Stash =====
 * cron:
 *   script:
 *     - name: WPS签到
 *       cron: '0 10 * * *'
 *       timeout: 120
 * http:
 *   mitm:
 *     - "personal-act.wps.cn"
 *   script:
 *     - match: ^https:\/\/personal-act\.wps\.cn\/activity-rubik\/activity\/page_info
 *       name: WPS Cookie
 *       type: request
 *       require-body: false
 * script-providers:
 *   WPS签到:
 *     url: https://raw.githubusercontent.com/MaYIHEI/paperclip/refs/heads/main/app/wps/wps.js
 *     interval: 86400
 */

const $ = new Env("WPS");

const SCRIPT_VERSION = "2026-06-27.r1"; // 改一次 +1,确认拉到最新版
$.log(`[INFO] 脚本版本 ${SCRIPT_VERSION}`);

const CK_KEY = "wps_sid";

// 任务开关:关闭才跳过(兼容字符串 "false"/"0" 与布尔 false,不同 BoxJS 存法都认);未设置=默认开启
function taskOff(k) {
    const v = $.getdata(k);
    return v === false || v === 0 || v === "false" || v === "0";
}

// 调试日志:BoxJS 设 wps_debug=true 才打印接口原始响应(平时只看任务汇总)
function debug(content) {
    if (($.getdata("wps_debug") || "false") !== "true") return;
    $.log(`[DEBUG] ${typeof content === "string" ? content : JSON.stringify(content)}`);
}

// ===== 接口 =====
const ISLOGIN = "https://account.wps.cn/api/v3/islogin";        // 动态取 user_id(脚本不硬编码任何账号信息)
const ENC_KEY = "https://personal-bus.wps.cn/sign_in/v1/encrypt/key"; // 服务端全局公钥(所有用户共用,每次现拉)
const DAY_INFO = "https://personal-bus.wps.cn/sign_in/v1/day_info";
const SIGN_IN = "https://personal-bus.wps.cn/sign_in/v1/sign_in";
const COMPONENT = "https://personal-act.wps.cn/activity-rubik/activity/component_action";
const PAGE_INFO = "https://personal-act.wps.cn/activity-rubik/activity/page_info"; // 取组件当前状态(打卡序列 series_id 在此)

// 小程序每日打卡(独立活动,与上面福利中心 H5 不同):info 取动态密钥 s_key,CONF 取动态盐 ss,clock_in 执行
const CLOCK_INFO = "https://personal-bus.wps.cn/activity/clock_in/v1/info";
const CLOCK_IN = "https://personal-bus.wps.cn/activity/clock_in/v1/clock_in";
const CLOCK_REWARD = "https://personal-bus.wps.cn/activity/clock_in/v1/reward"; // 领取昨日打卡奖励(同套 Signature)
const CLOCK_CONF = "https://personal-act.wpscdn.cn/srcapi/act/rubik-service/honeycomb-adapter/client/module-info?pid=113&mg_id=47736&id=48312";

// ===== 福利中心活动「WPS618 天天领福利」的组件标识(活动换期需更新) =====
const FLZX = { activity_number: "HD2025031721339450", page_number: "YM2025060910400185" };
// page_info 必带的 position:真 app 用它定位「福利中心」页,缺了服务端会返回未带用户态的空渲染
//(打卡的 sign_series_id 读不到 → 误判没序列 → 又新建序列从第 1 天起)。mk_key 是渠道追踪,留空即可。
const FLZX_POSITION = "ios_flzx_grzxsdjg3001";
// component_action(签到/领取)的 component_uniq_number 不需要 filter_params(实测不参与鉴权),故不带

const COMPONENTS = {
    // 福利中心打卡免费领会员
    fragment: { component_number: "ZJ2025061815352884", component_node_id: "FN1769668388sb3w", type: 42 },
    // 天天抽奖
    lottery: { component_number: "ZJ2025092916519174", component_node_id: "FN1779447163CApn", type: 45, session_id: 3002 },
    // 会员免费试用(瓜分奖品,次日开奖;每天可申领 2 次,先 preview 拿当天奖品再申领)
    trial: { component_number: "ZJ2025041115207603", component_node_id: "FN1744359116PWbV", type: 32 },
    // 限量爆款「每天10点可领·任选1个」(privilege_select,每天 1 次机会;优先抢超级会员)
    hot: { component_number: "ZJ2025041115200788", component_node_id: "FN1744358694RbIn", type: 31 },
};

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WpsiOS/26.6.1";
// 小程序打卡走微信小程序 UA(打卡接口在 personal-bus 域,不带 APP 的 Origin/Referer)
const MINI_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003123) NetType/WIFI Language/zh_CN miniProgram";

// 动作间隔(秒,[最小,最大] 每步独立取随机,各不相等):10 点抢完顺手把其余做了,模拟真人手动操作避风控
const ACTION_GAP = [5, 10];

$.results = []; // 各任务结果汇总,最后一条通知

// 清除 cookie 开关(BoxJS 写 wps_clear=true)
if (JSON.parse($.getdata("wps_clear") || "false")) {
    $.setdata("", CK_KEY);
    $.setdata("false", "wps_clear");
    $.msg("WPS", "", "✅ Cookie 已清除，请重新抓取");
    $.done();
} else {
    main().catch((e) => {
        $.log(`[ERROR] 主流程异常: ${e}`);
        $.msg("WPS", "❌ 运行异常", String(e));
    }).finally(() => $.done());
}

async function main() {
    const sid = $.getdata(CK_KEY);
    if (!sid) {
        $.msg("WPS", "🚫 缺少 Cookie", "请先开启 cookie 抓取脚本,打开 WPS APP 进任意活动页停留 1 秒");
        return;
    }

    // 动态取 user_id(签到加密需要,不写进脚本)+ 顺带校验登录态。
    // 关键:区分「网络超时(reject)」与「服务端明确返回非 ok(真失效)」——
    // 整点 cron 易撞网络抖动,网络错误重试一次自愈,绝不能误报成 cookie 失效让用户白重抓。
    let uid, lastErr;
    for (let attempt = 0; attempt < 2 && !uid; attempt++) {
        if (attempt > 0) await sleep(3000);
        try {
            const r = await httpReq("GET", ISLOGIN);
            const j = JSON.parse(r.body);
            if (j.result !== "ok" || !j.userid) {
                // 服务端明确判失效 = 真·登录态失效,不重试
                $.msg("WPS", "🚫 登录态失效", "wps_sid 已过期,请重新抓取(打开 WPS 进活动页)");
                $.log(`[ERROR] islogin 非 ok: ${r.body.slice(0, 200)}`);
                return;
            }
            uid = j.userid;
            $.log(`[INFO] user_id 已获取(${String(uid).slice(0, 3)}***)`);
        } catch (e) {
            lastErr = e; // 网络超时 / 连接失败 / 响应非 JSON → 值得重试
            $.log(`[WARN] islogin 网络错误(${attempt + 1}/2): ${e}`);
        }
    }
    if (!uid) {
        // 重试后仍失败:是网络问题,不是 Cookie 失效——别误导用户去重抓
        $.msg("WPS", "⚠️ 网络异常", "islogin 请求超时(非 Cookie 失效),稍后会自动重试或手动运行一次");
        $.log(`[ERROR] islogin 重试后仍失败: ${lastErr}`);
        return;
    }

    // 任务清单:每项可在 BoxJS 单独开关(默认开;关闭则整项跳过,连同它的随机间隔)。
    // 10 点 cron 触发,逐个串行、动作间随机间隔(模拟真人,避风控)。
    // 顺序讲究(两端时间需求相反):
    //   ① 限量爆款放最前——库存少,10:00 窗口一开就得抢,晚了没了,绝不能让它等;
    //   ② 小程序打卡放最后——它走 personal-bus 域,整点 10:00:00 有后端尖峰偶发
    //      invalid connection,排最后离尖峰最远(被前面任务自然往后挪几十秒),再叠加它
    //      自带的「开头随机错峰 + 4 次退避重试」兜底(即便单独开它也靠这两层扛尖峰)。
    const tasks = [
        ["wps_task_hot", () => taskHot()],
        ["wps_task_trial", () => taskTrial()],
        ["wps_task_signin", () => taskSignIn(uid)],
        ["wps_task_fragment", () => taskFragment()],
        ["wps_task_lottery", () => taskLottery()],
        ["wps_task_clockin", () => taskClockIn()],
    ];
    // 打印每个开关实际读到的原始值(排查 BoxJS 是否生效:null=未设置默认开)
    $.log(`[INFO] 任务开关 ${tasks.map(([k]) => `${k.slice(9)}=${JSON.stringify($.getdata(k))}`).join(" ")}`);

    let ran = 0;
    for (const [key, run] of tasks) {
        if (taskOff(key)) continue;                    // BoxJS 关闭该任务 → 跳过
        if (ran++ > 0) await sleep(jitter(ACTION_GAP)); // 任务间随机间隔避风控
        await run();
    }
    if (!ran) $.results.push("ℹ️ 所有任务均已在 BoxJS 关闭");

    $.msg("WPS 任务汇总", "", $.results.join("\n")); // $.msg 已把汇总打到日志,不再重复 $.log
}

// ============ 任务:每日签到(请求体加密)============

async function taskSignIn(uid) {
    const tag = "每日签到";
    try {
        // 已签则跳过
        const di = await httpReq("GET", DAY_INFO);
        const info = (JSON.parse(di.body).data || {}).info || {};
        if (info.has_sign) {
            $.results.push(`✅ ${tag}:已签到`);
            return;
        }

        // 取全局公钥
        const ek = await httpReq("GET", ENC_KEY);
        const pubKeyB64 = JSON.parse(ek.body).data;
        if (!pubKeyB64) throw new Error(`公钥获取失败: ${ek.body.slice(0, 120)}`);

        // aesKey = 22 位随机 + 10 位 unix 秒;extra = AES(明文);token = RSA(aesKey)
        const aesKey = genAesKey();
        const plain = JSON.stringify({ user_id: uid, platform: 32 }); // 32 = iPhone(平台位码,公开常量)
        const extra = aesEncrypt(plain, aesKey, aesKey.substr(0, 16));
        const token = rsaEncryptB64(aesKey, pubKeyB64);

        const body = JSON.stringify({ encrypt: true, extra, pay_origin: "ios_ucs_rwzx sign", channel: "" });
        const r = await httpReq("POST", SIGN_IN, { body, token });
        const j = safeJson(r.body);
        if (j && j.result === "ok") {
            const names = ((j.data || {}).rewards || []).map((x) => x.reward_name).filter(Boolean);
            $.results.push(`✅ ${tag}:成功${names.length ? " " + names.join("/") : ""}`);
        } else {
            const st = classify(j && (j.ext_msg || j.msg), "已签到");
            $.results.push(`${st.e} ${tag}:${st.t}`);
            if (st.e !== "✅") debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
        }
    } catch (e) {
        $.results.push(`❌ ${tag}:异常`);
        $.log(`[ERROR] ${tag}: ${e}`);
    }
}

// ============ 任务:福利中心通用组件动作(明文 base64)============

async function taskComponent(tag, comp, action, payload, doneLabel) {
    try {
        const uniq = {
            activity_number: FLZX.activity_number,
            page_number: FLZX.page_number,
            component_number: comp.component_number,
            component_node_id: comp.component_node_id,
        };

        const reqObj = { component_uniq_number: uniq, component_type: comp.type, component_action: action };
        for (const k in payload) reqObj[k] = payload[k];

        // body 与响应均为 JSON
        const r = await httpReq("POST", COMPONENT, { body: JSON.stringify(reqObj) });
        const j = safeJson(r.body);
        if (!j) {
            $.results.push(`❌ ${tag}:无响应`);
            debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
            return;
        }
        // 外层 result 只代表请求被受理(打卡已签时这里直接报 Duplicate 错);真正成败看内层 data.<action>.success
        if (j.result !== "ok") {
            const st = classify(j.msg || j.ext_msg, doneLabel);
            $.results.push(`${st.e} ${tag}:${st.t}`);
            if (st.e !== "✅") debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
            return;
        }
        const inner = (j.data || {})[action.split(".")[0]] || {};
        if (inner.success === true) {
            $.results.push(`✅ ${tag}:成功${inner.reward_name ? " " + inner.reward_name : ""}`);
        } else {
            // 内层失败:优先看 reason,抽奖次数用完(error_code 10005)归为已达上限
            let reason = inner.reason || "";
            if (!reason && inner.error_code === 10005) reason = "次数用完";
            if (!reason) reason = j.msg || (inner.error_code ? `code ${inner.error_code}` : "");
            const st = classify(reason, doneLabel);
            $.results.push(`${st.e} ${tag}:${st.t}`);
            if (st.e !== "✅") debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
        }
    } catch (e) {
        $.results.push(`❌ ${tag}:异常`);
        $.log(`[ERROR] ${tag}: ${e}`);
    }
}

// ============ 福利中心 page_info 复用助手 ============
// page_info 返回活动页全部组件的实时状态(各组件挂自己的业务字段),多个任务都从这里取状态。
async function fetchPageInfo() {
    // 必带 filter_params 的 position,否则服务端返回的组件不含本用户态(打卡序列/选择记录读不到)
    const filter = encodeURIComponent(JSON.stringify({ cs_from: "", mk_key: "", position: FLZX_POSITION }));
    const pi = await httpReq("GET",
        `${PAGE_INFO}?activity_number=${FLZX.activity_number}&page_number=${FLZX.page_number}&filter_params=${filter}`);
    const pj = safeJson(pi.body);
    if (!pj || pj.result !== "ok" || !Array.isArray(pj.data)) {
        debug(`page_info 异常: ${(pi.body || "").slice(0, 300)}`);
        return null;
    }
    return pj.data;
}
// 在 page_info 组件数组里按组件号 + 节点号定位某个组件
function findComp(list, number, node) {
    return (list || []).find((c) => c && c.number === number && (!node || c.component_node_id === node)) || null;
}

// ============ 任务:限量爆款「每天10点可领·任选1个」(privilege_select)============
// 福利中心「限量爆款」是 3 选 1:超级会员1小时(限量,秒光)/ WPS积分2 / WPS积分1,每天 1 次机会。
// 价值排序:超级会员 ≫ 积分,所以优先抢超级会员,抢不到(已秒光)再退而求其次拿积分,别浪费当天机会。
//   - 每个选项的 group_id / privilege_id 从 page_info 的 privilege_select_details 读(不硬编码,换期也跟得上);
//   - 选项打分:会员(privilege_type=="privilege")最高,其余按 hours/积分数排序;按分从高到低逐个尝试;
//   - select_reach_limit==true = 今天这 1 次已用掉 → 直接 ✅;
//   - 超级会员限 1200 份、10:00 一开几分钟就光,必须靠 hot 排首位踩整点抢。
async function taskHot() {
    const tag = "限量爆款";
    const comp = COMPONENTS.hot;
    try {
        const list = await fetchPageInfo();
        if (!list) { $.results.push(`❌ ${tag}:page_info 无响应`); return; }
        const node = findComp(list, comp.component_number, comp.component_node_id);
        const ps = (node && node.privilege_select) || {};
        const details = ps.privilege_select_details || [];
        if (!details.length) { $.results.push(`⚠️ ${tag}:未找到爆款组件(可能已换期,需重抓)`); return; }

        // 今天这次机会已用掉
        if (ps.select_reach_limit) { $.results.push(`✅ ${tag}:已领取(今日已选)`); return; }

        // 按价值排序:会员优先,其次积分多的优先(hours*100 + nums,会员再加底分)
        const score = (d) => (d.privilege_type === "privilege" ? 10000 : 0) + (d.hours || 0) * 100 + (d.nums || 0);
        const ranked = details.slice().sort((a, b) => score(b) - score(a));

        let done = false;
        for (const d of ranked) {
            const reqObj = {
                component_uniq_number: {
                    activity_number: FLZX.activity_number,
                    page_number: FLZX.page_number,
                    component_number: comp.component_number,
                    component_node_id: comp.component_node_id,
                },
                component_type: comp.type,
                component_action: "privilege_select.exec",
                // group_id 与 privilege_id 各选项不一定相等(会员是 1/101),都取自 detail
                privilege_select: { group_id: d.group_id, privilege_id: d.privilege_id },
            };
            const r = await httpReq("POST", COMPONENT, { body: JSON.stringify(reqObj) });
            const j = safeJson(r.body);
            const inner = (j && j.data && j.data.privilege_select) || {};
            if (j && j.result === "ok" && inner.success === true) {
                $.results.push(`✅ ${tag}:成功 ${d.title || "pid " + d.privilege_id}`);
                done = true;
                break;
            }
            // 这档没抢到(多半已秒光)→ 记一笔继续抢下一档
            debug(`${tag} ${d.title}(pid ${d.privilege_id})未中: ${(r.body || "").slice(0, 200)}`);
        }
        if (!done) $.results.push(`⚠️ ${tag}:未领到(超级会员已秒光、其余也没抢到)`);
    } catch (e) {
        $.results.push(`❌ ${tag}:异常`);
        $.log(`[ERROR] ${tag}: ${e}`);
    }
}

// ============ 任务:福利中心打卡免费领会员(连续打卡)============
// 关键:必须先取当前签到序列 sign_series_id 再签——服务端靠它累计连续天数。
// 旧实现固定传 series_id:"" + is_new_sign_series:true,等于每天「新建序列」→ 永远停在第 1 天。
// 正确逻辑(对齐官方 H5 fragment-collect 组件):有序列就复用、is_new_sign_series=false;
// 只有从无序列(第一次)时才置 true。series_id 从 page_info 的 fragment 组件里取。
async function taskFragment() {
    const tag = "打卡领会员";
    const comp = COMPONENTS.fragment;
    try {
        const today = beijingDate();

        // 1) 取当前序列状态:page_info 返回各组件,fragment 组件挂 sign_series_id + sign_records
        const list = await fetchPageInfo();
        const node = findComp(list, comp.component_number);
        // 安全闸:page_info 没拿到 fragment 组件(网络错/换期)→ 绝不盲签,否则会被当「新序列」从头开始。
        // 宁可今天不签(用户开 app 点一下即可),也不把已坚持的连续天数清零。
        if (!node) {
            $.results.push(`⚠️ ${tag}:未取到序列状态,跳过(避免误清零连续天数)`);
            debug(`${tag} page_info 未含 fragment 组件 ${comp.component_number}`);
            return;
        }
        const fc = node.fragment_collect || {};
        const seriesId = fc.sign_series_id || "";
        const records = fc.sign_records || [];
        debug(`${tag} 读到 series_id=${seriesId || "(空)"} records=${records.map((r) => r.sign_date + ":" + r.sign_status).join(",")}`);

        // 今天已签则跳过(sign_records 里今天 sign_status==signed)
        const todayRec = records.find((r) => r && r.sign_date === today);
        if (todayRec && todayRec.sign_status === "signed") {
            $.results.push(`✅ ${tag}:已打卡`);
            return;
        }

        // 2) 签到:有序列就复用(is_new_sign_series=false),无序列才新建
        const isNew = !seriesId;
        const reqObj = {
            component_uniq_number: {
                activity_number: FLZX.activity_number,
                page_number: FLZX.page_number,
                component_number: comp.component_number,
                component_node_id: comp.component_node_id,
            },
            component_type: comp.type,
            component_action: "fragment_collect.sign_in",
            fragment_collect: { sign_date: today, series_id: seriesId, is_new_sign_series: isNew },
        };
        const r = await httpReq("POST", COMPONENT, { body: JSON.stringify(reqObj) });
        const j = safeJson(r.body);
        if (!j) {
            $.results.push(`❌ ${tag}:无响应`);
            debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
            return;
        }
        if (j.result !== "ok") {
            const st = classify(j.msg || j.ext_msg, "已打卡");
            $.results.push(`${st.e} ${tag}:${st.t}`);
            if (st.e !== "✅") debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
            return;
        }
        const inner = (j.data || {}).fragment_collect || {};
        if (inner.success === true) {
            $.results.push(`✅ ${tag}:成功${isNew ? "(新序列)" : ""}`);
        } else {
            const st = classify(inner.reason || j.msg, "已打卡");
            $.results.push(`${st.e} ${tag}:${st.t}`);
            if (st.e !== "✅") debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
        }
    } catch (e) {
        $.results.push(`❌ ${tag}:异常`);
        $.log(`[ERROR] ${tag}: ${e}`);
    }
}

// ============ 任务:天天抽奖(lottery_v2,免费次数 10 点后才刷新)============
// 免费抽奖次数(lottery_list[].times)在每天 10:00 之后才刷出来(实测 cron 10:00 那刻常是 0、
// 10:05 才变 1)。旧实现不看次数直接 exec,撞 0 次 → 服务端回 10005,被误判成「已达上限」。
// 改为先读 page_info 的 times:有次数才抽、没次数如实报(不再假报已达上限);session_id 动态取。
async function taskLottery() {
    const tag = "天天抽奖";
    const comp = COMPONENTS.lottery;
    try {
        const list = await fetchPageInfo();
        const node = findComp(list, comp.component_number, comp.component_node_id);
        const lv = (node && node.lottery_v2) || {};
        const sessions = lv.lottery_list || [];
        // 优先进行中的场次,取不到再退活动内置 session_id(3002)
        const sess = sessions.find((s) => s && s.session_status === "IN_PROGRESS") || sessions[0];
        const sessionId = (sess && sess.session_id) || comp.session_id;
        const times = (sess && sess.times) || 0;

        if (times < 1) {
            // 免费次数还没刷出来(cron 跑太早)= 正常,如实报,别误判已达上限
            $.results.push(`✅ ${tag}:今日暂无免费次数`);
            return;
        }

        const reqObj = {
            component_uniq_number: {
                activity_number: FLZX.activity_number,
                page_number: FLZX.page_number,
                component_number: comp.component_number,
                component_node_id: comp.component_node_id,
            },
            component_type: comp.type,
            component_action: "lottery_v2.exec",
            lottery_v2: { session_id: sessionId },
        };
        const r = await httpReq("POST", COMPONENT, { body: JSON.stringify(reqObj) });
        const j = safeJson(r.body);
        const inner = (j && j.data && j.data.lottery_v2) || {};
        if (j && j.result === "ok" && inner.success === true) {
            $.results.push(`✅ ${tag}:成功${inner.reward_name ? " " + inner.reward_name : ""}`);
        } else {
            // 极少数:刚读到次数但 exec 时已被用掉 → error_code 10005 归「次数用完」
            let reason = inner.send_msg || "";
            if (!reason && inner.error_code === 10005) reason = "次数用完";
            const st = classify(reason || (j && j.msg), "已完成");
            $.results.push(`${st.e} ${tag}:${st.t}`);
            if (st.e !== "✅") debug(`${tag} 响应: ${(r.body || "").slice(0, 300)}`);
        }
    } catch (e) {
        $.results.push(`❌ ${tag}:异常`);
        $.log(`[ERROR] ${tag}: ${e}`);
    }
}

// ============ 任务:会员免费试用(瓜分奖品,divide_prize)============
// 先 preview 拿当天奖品(session_id/cycle_id 每期变,不硬编码),三个全部申领(均次日开奖)。
// 逐个状态写清楚:✓=本次申领成功、已申领、已领完、没资格、已达上限等。

async function taskTrial() {
    const tag = "会员试用";
    try {
        const base = {
            activity_number: FLZX.activity_number,
            page_number: FLZX.page_number,
            component_number: COMPONENTS.trial.component_number,
            component_node_id: COMPONENTS.trial.component_node_id,
        };
        const callTrial = async (action, extra) => {
            const reqObj = { component_uniq_number: base, component_type: COMPONENTS.trial.type, component_action: action };
            for (const k in extra) reqObj[k] = extra[k];
            const r = await httpReq("POST", COMPONENT, { body: JSON.stringify(reqObj) });
            return safeJson(r.body);
        };
        const short = (t) => String(t || "奖品").replace(/超级会员/g, ""); // 7天卡 / 月卡 / 3个月卡

        // preview 列出当天奖品
        const pv = await callTrial("divide_prize.preview", {});
        const details = (((pv || {}).data || {}).divide_prize || {}).divide_prize_details || [];
        // 没明细 / 三档都已申领 → 直接收成一句(正常完成,不逐项罗列)
        if (!details.length || details.every((d) => d.has_join)) {
            $.results.push(`✅ ${tag}:全部已申请`);
            return;
        }

        // 三个全领(均次日开奖),无优先;逐个申领,动作间隔避风控,每项状态单独写清。
        // 行级图标:只有出现真问题(已领完/没资格/原文异常)才 ⚠️,否则 ✅。
        const parts = [];
        let allGood = true;
        let acted = 0;
        for (const d of details) {
            const name = short(d.title);
            if (d.has_join) { parts.push(`${name}已申请`); continue; }
            if (d.stock != null && d.stock <= 0) { parts.push(`${name}已领完`); allGood = false; continue; }
            if (acted > 0) await sleep(jitter(ACTION_GAP));
            acted++;
            const su = await callTrial("divide_prize.sign_up", {
                divide_prize: { cycle_id: d.cycle_id, session_id: `${d.session_id}_${beijingDate()}` },
            });
            const inner = ((su || {}).data || {}).divide_prize || {};
            if (su && su.result === "ok" && inner.success === true) {
                parts.push(`${name}✓`);
            } else {
                const st = classify(inner.reason || (su && su.msg), "已申请");
                parts.push(`${name}${st.t}`);
                if (st.e !== "✅") { allGood = false; debug(`${tag} ${d.title}: ${JSON.stringify(su).slice(0, 200)}`); }
            }
        }
        // 三档全部到位(本次成功或之前已申请)→ 折叠成一句;有问题才逐项罗列
        $.results.push(allGood ? `✅ ${tag}:全部已申请` : `⚠️ ${tag}:${parts.join(" ")}`);
    } catch (e) {
        $.results.push(`❌ ${tag}:异常`);
        $.log(`[ERROR] ${tag}: ${e}`);
    }
}

// ============ 任务:小程序每日打卡(请求头签名)============
// 打卡接口在 personal-bus 域,鉴权 = wps_sid(Cookie)+ 固定 X-CSRFToken + Signature 头。
// Signature = HMAC-SHA256( s_key + MD5(body) + Date , ss )(均现拉,无内嵌密钥):
//   s_key 来自 clock_in/v1/info(每账号每日变);ss 来自 CONF 配置端点(活动级盐)。

async function taskClockIn() {
    const tag = "小程序打卡";
    try {
        const sid = $.getdata(CK_KEY);

        // 整点 cron 可能精确撞上 10:00:00 的后端尖峰(尤其只单独开这一项时)→ 先错峰几秒再打首个请求
        await sleep(jitter([3, 10]));

        // 动态盐 ss(配置端点在 CDN,不需登录);整点 cron 易撞网络抖动 → 与 s_key 一样重试
        let ss = "", cfBody = "";
        for (let i = 0; i < 2 && !ss; i++) {
            if (i > 0) await sleep(2000);
            const cf = await rawReq("GET", CLOCK_CONF, {});
            cfBody = cf.body || "";
            ss = (((safeJson(cfBody) || {}).data || {}).value || {}).ss;
        }

        // 动态密钥 s_key(带 wps_sid):info 接口在整点 10:00 后端负载尖峰时偶发应用层错
        // (msg:"invalid connection",非 cookie 失效——手动错峰跑就正常)。重试 4 次 + 递增退避,
        // 尽量盖过尖峰窗口;退避序列 0/3/6/9s,总耗时上限约 18s(clockin 排首位,不挤占后续任务)。
        let s_key = "", infBody = "";
        const backoff = [0, 3000, 6000, 9000];
        for (let i = 0; i < backoff.length && !s_key; i++) {
            if (backoff[i]) await sleep(backoff[i]);
            // 带上与真客户端一致的分页参数:s_key 不带也能回,但 reward_list(领昨日奖励要用)
            // 不带 page_size 实测可能回空 → 领奖永远扫不到东西。对齐真请求,确保列表完整返回。
            const inf = await rawReq("GET", `${CLOCK_INFO}?client_type=1&page_index=0&page_size=10`, { sid });
            infBody = inf.body || "";
            s_key = ((safeJson(infBody) || {}).data || {}).s_key;
            if (!s_key) debug(`${tag} info 重试 ${i + 1}/${backoff.length}: ${infBody.slice(0, 120)}`);
        }

        if (!ss || !s_key) {
            // 服务端/网络偶发错,优雅降级为接口异常(不抛 ❌,写清是 ss 还是 s_key 没拿到)
            const which = !ss ? "ss" : "s_key";
            const src = !ss ? cfBody : infBody;
            const m = ((safeJson(src) || {}).msg) || src.slice(0, 60) || `缺 ${which}`;
            $.results.push(`⚠️ ${tag}:接口异常(取 ${which} 失败:${m})`);
            debug(`${tag} info: ss=${!!ss} s_key=${!!s_key} cf=${cfBody.slice(0, 120)} inf=${infBody.slice(0, 120)}`);
            return;
        }

        // body 键名排序后做规范 JSON,与服务端校验口径一致
        const bodyStr = canonicalJSON({ client_type: 1 });
        const date = new Date().toUTCString();
        const signature = hmacSha256Hex(s_key + md5Hex(bodyStr) + date, ss);

        const r = await rawReq("POST", CLOCK_IN, { sid, body: bodyStr, date, signature });
        const j = safeJson(r.body);
        if (j && j.result === "ok") {
            const d = j.data || {};
            const rw = d.reward_name || (d.prize && d.prize.name) || (d.reward && d.reward.name) || "";
            $.results.push(`✅ ${tag}:成功${rw ? " " + rw : ""}`);
        } else {
            const st = classify(j && j.msg, "已打卡");
            $.results.push(`${st.e} ${tag}:${st.t}`);
            if (st.e !== "✅") debug(`${tag} 响应: ${r.body.slice(0, 300)}`);
        }

        // 领取昨日打卡奖励(奖励次日开放、隔天作废)。与打卡无关,不论今天签没签都尝试领。
        await claimClockInRewards(infBody, sid, s_key, ss);
    } catch (e) {
        $.results.push(`❌ ${tag}:异常`);
        $.log(`[ERROR] ${tag}: ${e}`);
    }
}

// 领取昨日打卡奖励:reward_list 里 reward_status==1 的(1=可领取/昨日签到今日开放)逐个 POST。
// 复用打卡同一套 Signature(s_key+MD5(body)+Date 用 ss 做 HMAC);body 带 reward_id + clock_in_time。
// 奖励是 PDF/图片/AI 体验等 1 天权益,不领次日作废;真正发放靠这一个接口,不需要微信授权 code。
async function claimClockInRewards(infBody, sid, s_key, ss) {
    try {
        const list = (((safeJson(infBody) || {}).data || {}).reward_list || {}).list || [];
        const pend = list.filter((rw) => rw && rw.reward_status === 1);
        // 诊断:打印整张奖励表的状态分布(0=今天签明天开放 / 1=可领 / 2=已过期 / 3=已领),
        // 用来区分两种「领不到」:列表空=接口/参数没取到;有奖励但无 1=开放时机没到。
        debug(`奖励表(${list.length}): ${list.map((rw) => `${rw.reward_id}=${rw.reward_status}`).join(" ") || "空"}`);
        if (!pend.length) {
            // 空场也报一行,避免「跑没跑、有没有可领」全靠猜;两种成因分开提示
            $.results.push(list.length ? "ℹ️ 昨日奖励:暂无可领(未到开放时间)" : "⚠️ 领奖:未取到奖励列表");
            return;
        }

        const got = [], fail = [];
        for (const rw of pend) {
            const body = canonicalJSON({ client_type: 1, reward_id: rw.reward_id, clock_in_time: rw.clock_in_time });
            const date = new Date().toUTCString();
            const signature = hmacSha256Hex(s_key + md5Hex(body) + date, ss);
            const r = await rawReq("POST", CLOCK_REWARD, { sid, body, date, signature });
            const j = safeJson(r.body);
            const name = rw.sku_name || rw.mb_name || "奖励";
            // 成功响应 data.reward_status===true
            if (j && j.result === "ok" && (j.data || {}).reward_status === true) got.push(name);
            else { fail.push(name); debug(`领奖 ${name}(${rw.reward_id}) 失败: ${(r.body || "").slice(0, 200)}`); }
            await sleep(jitter(ACTION_GAP)); // 多个奖励之间留间隔
        }
        if (got.length) $.results.push(`✅ 领昨日奖励:${got.join("、")}`);
        if (fail.length) $.results.push(`⚠️ 待领奖励未领成功(可去小程序手动领):${fail.join("、")}`);
    } catch (e) {
        $.log(`[ERROR] 领昨日奖励: ${e}`);
    }
}

// 小程序打卡专用请求:personal-bus 域,X-CSRFToken + Signature 鉴权(与 personal-act 系列 header 不同,单独隔离)
function rawReq(method, url, { sid, body, date, signature } = {}) {
    const headers = { "User-Agent": MINI_UA, "Accept": "*/*", "X-CSRFToken": "1234567890" };
    if (sid) headers["Cookie"] = `wps_sid=${sid};csrf=1234567890`;
    if (body) headers["Content-Type"] = "application/json";
    if (signature) headers["Signature"] = signature;
    if (date) headers["Date"] = date;
    return new Promise((resolve, reject) => {
        const cb = (err, resp, data) =>
            err ? reject(err) : resolve({ status: (resp && (resp.status || resp.statusCode)) || 0, body: data || "" });
        method === "POST" ? $.post({ url, headers, body }, cb) : $.get({ url, headers, body }, cb);
    });
}

// 键名排序后 JSON.stringify(与小程序源码 d(t) 的规范化口径一致)
function canonicalJSON(obj) {
    const sorted = Object.keys(obj).sort().reduce((a, k) => ((a[k] = obj[k]), a), {});
    return JSON.stringify(sorted);
}

// ============ HTTP(携带 wps_sid;签到带 token 头)============

function httpReq(method, url, { body, token } = {}) {
    const sid = $.getdata(CK_KEY);
    const headers = {
        "User-Agent": UA,
        "Cookie": `wps_sid=${sid}; wps_sids=${sid}`,
        "Origin": "https://personal-act.wps.cn",
        "Referer": "https://personal-act.wps.cn/",
    };
    if (body) headers["Content-Type"] = "application/json";
    if (token) headers["token"] = token;
    return new Promise((resolve, reject) => {
        const req = { url, headers, body };
        const cb = (err, resp, data) => {
            if (err) return reject(err);
            resolve({ status: (resp && (resp.status || resp.statusCode)) || 0, body: data || "" });
        };
        method === "POST" ? $.post(req, cb) : $.get(req, cb);
    });
}

function safeJson(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
}

// 把服务端各种提示归类成清晰、正确的状态文案。
// 返回 { e: 标记, t: 文案 };doneLabel = 本任务「已完成」的说法(已签到/已打卡/已申领/已领取/已完成)。
// ✅ = 已做过 / 已达上限(都属正常完结);⚠️ = 没领到(已领完/没资格/其它异常,需留意)。
function classify(msg, doneLabel) {
    const m = String(msg || "");
    if (!m) return { e: "⚠️", t: "未成功" };
    if (/已签|has sign/i.test(m)) return { e: "✅", t: "已签到" };
    if (/Duplicate entry|已领取|已申领|已参与|已参加|已报名|已完成|重复|repeat|already/i.test(m)) return { e: "✅", t: doneLabel || "已完成" };
    if (/无.*次数|没有.*次数|次数.*(用完|不足|为0)|达到?.*上限|已达.*上限|超(出|过).*次数|reach limit|out of limit|上限/i.test(m)) return { e: "✅", t: "已达上限" };
    if (/售罄|领完|抢完|发完|抢光|领光|out of stock|库存(不足)?|no stock|sold out|stock/i.test(m)) return { e: "⚠️", t: "已领完" };
    if (/资格|不满足|未满足|不符合|无权限|没有权限|没有资格|not (match|qualified)|不在.*(范围|名单)|未达条件/i.test(m)) return { e: "⚠️", t: "没资格" };
    // 其它服务端原文,原样写清楚(截短)
    return { e: "⚠️", t: m.length > 30 ? m.slice(0, 30) + "…" : m };
}

// 北京时间 YYYY-MM-DD(青龙服务器可能是 UTC,固定 +8)
function beijingDate() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 在 [min,max] 秒区间取随机毫秒
function jitter([min, max]) {
    return Math.floor((min + Math.random() * (max - min)) * 1000);
}

// aesKey: 22 位随机 base36 + 10 位 unix 秒(共 32 字符)
function genAesKey() {
    const cs = "0123456789abcdefghijklmnopqrstuvwxyz";
    let s = "";
    for (let i = 0; i < 22; i++) s += cs[Math.floor(Math.random() * 36)];
    return s + Math.floor(Date.now() / 1000);
}

// ============ 纯 JS 加密工具(AES-CBC-Pkcs7 + RSA PKCS#1 v1.5,BigInt 实现)============

function modpow(base, exp, mod) {
    let result = 1n;
    base %= mod;
    while (exp > 0n) {
        if (exp & 1n) result = (result * base) % mod;
        exp >>= 1n;
        base = (base * base) % mod;
    }
    return result;
}

// RSA 公钥加密:pemB64 = encrypt/key 返回的 data(base64 的 PKCS#1 PEM)→ 解出 n,e → PKCS#1 v1.5 type2 → base64 密文
function rsaEncryptB64(msg, pemB64) {
    const pem = bytesUtf8(b64dec(pemB64));
    const der = b64dec(pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, ""));
    let p = 0;
    p++; // SEQUENCE tag
    let sl = der[p++];
    if (sl & 0x80) p += sl & 0x7f; // 跳过长度字节
    const readInt = () => {
        p++; // INTEGER tag
        let l = der[p++];
        if (l & 0x80) {
            let nb = l & 0x7f;
            l = 0;
            for (let i = 0; i < nb; i++) l = (l << 8) | der[p++];
        }
        let v = 0n;
        for (let i = 0; i < l; i++) v = (v << 8n) | BigInt(der[p++]);
        return v;
    };
    const n = readInt(), e = readInt();
    let k = 0, nn = n;
    while (nn > 0n) { k++; nn >>= 8n; } // 模数字节数(RSA-512 = 64)

    const m = utf8Bytes(msg);
    const psLen = k - 3 - m.length;
    if (psLen < 8) throw new Error("RSA 明文过长");
    const block = [0x00, 0x02];
    for (let i = 0; i < psLen; i++) block.push(1 + Math.floor(Math.random() * 255)); // 非零随机填充
    block.push(0x00);
    for (const b of m) block.push(b);

    let mm = 0n;
    for (const b of block) mm = (mm << 8n) | BigInt(b);
    let hex = modpow(mm, e, n).toString(16);
    while (hex.length < k * 2) hex = "0" + hex;
    const cb = [];
    for (let i = 0; i < hex.length; i += 2) cb.push(parseInt(hex.substr(i, 2), 16));
    return b64enc(cb);
}

const _SB = [], _ISB = [];
(function () {
    const p = [], l = [];
    let x = 1;
    for (let i = 0; i < 256; i++) {
        p[i] = x;
        x ^= (x << 1) ^ (x & 0x80 ? 0x11b : 0);
        p[i] &= 0xff;
    }
    for (let i = 0; i < 255; i++) l[p[i]] = i;
    let si = 0;
    for (let i = 0; i < 256; i++) {
        let xx = si ? p[255 - l[si]] : 0;
        let t = xx;
        for (let r = 0; r < 4; r++) {
            t = ((t << 1) | (t >>> 7)) & 0xff;
            xx ^= t;
        }
        xx = (xx ^ 0x63) & 0xff;
        _SB[si] = xx;
        _ISB[xx] = si;
        si = si ? p[(l[si] + 1) % 255] : 1;
    }
})();
const _RCON = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
function _xt(a) { return ((a << 1) ^ (a & 0x80 ? 0x11b : 0)) & 0xff; }
function _mul(a, b) {
    let r = 0;
    for (; b; b >>= 1) {
        if (b & 1) r ^= a;
        a = _xt(a);
    }
    return r;
}
function _keyExp(key) {
    const Nk = key.length / 4, Nr = Nk + 6, w = [];
    for (let i = 0; i < Nk; i++) w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
    for (let i = Nk; i < 4 * (Nr + 1); i++) {
        let t = w[i - 1].slice();
        if (i % Nk === 0) {
            t.push(t.shift());
            t = t.map((b) => _SB[b]);
            t[0] ^= _RCON[i / Nk - 1];
        } else if (Nk > 6 && i % Nk === 4) {
            t = t.map((b) => _SB[b]);
        }
        w[i] = w[i - Nk].map((b, j) => b ^ t[j]);
    }
    return { w, Nr };
}
function _enc(inp, ks) {
    let s = [[], [], [], []];
    for (let i = 0; i < 16; i++) s[i % 4][i >> 2] = inp[i];
    const ar = (k) => {
        for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) s[r][c] ^= k[c][r];
    };
    ar(ks.w.slice(0, 4));
    for (let rd = 1; rd < ks.Nr; rd++) {
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s[r][c] = _SB[s[r][c]];
        for (let r = 1; r < 4; r++) {
            const row = s[r].slice();
            for (let c = 0; c < 4; c++) s[r][c] = row[(c + r) % 4];
        }
        for (let c = 0; c < 4; c++) {
            const a = [s[0][c], s[1][c], s[2][c], s[3][c]];
            s[0][c] = _mul(a[0], 2) ^ _mul(a[1], 3) ^ a[2] ^ a[3];
            s[1][c] = a[0] ^ _mul(a[1], 2) ^ _mul(a[2], 3) ^ a[3];
            s[2][c] = a[0] ^ a[1] ^ _mul(a[2], 2) ^ _mul(a[3], 3);
            s[3][c] = _mul(a[0], 3) ^ a[1] ^ a[2] ^ _mul(a[3], 2);
        }
        ar(ks.w.slice(4 * rd, 4 * rd + 4));
    }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s[r][c] = _SB[s[r][c]];
    for (let r = 1; r < 4; r++) {
        const row = s[r].slice();
        for (let c = 0; c < 4; c++) s[r][c] = row[(c + r) % 4];
    }
    ar(ks.w.slice(4 * ks.Nr, 4 * ks.Nr + 4));
    const out = [];
    for (let i = 0; i < 16; i++) out[i] = s[i % 4][i >> 2];
    return out;
}
function utf8Bytes(str) {
    const out = [];
    for (const ch of unescape(encodeURIComponent(str))) out.push(ch.charCodeAt(0));
    return out;
}
function bytesUtf8(b) {
    let s = "";
    for (const x of b) s += String.fromCharCode(x);
    return decodeURIComponent(escape(s));
}
const _B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64enc(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
        s += _B64[b0 >> 2] + _B64[((b0 & 3) << 4) | (b1 >> 4)];
        s += i + 1 < bytes.length ? _B64[((b1 & 15) << 2) | (b2 >> 6)] : "=";
        s += i + 2 < bytes.length ? _B64[b2 & 63] : "=";
    }
    return s;
}
function b64dec(str) {
    const out = [];
    let buf = 0, bits = 0;
    for (const c of str) {
        if (c === "=") break;
        const v = _B64.indexOf(c);
        if (v < 0) continue;
        buf = (buf << 6) | v;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out.push((buf >> bits) & 0xff);
        }
    }
    return out;
}
// AES-256-CBC + Pkcs7,key/iv 为 UTF8 字符串,输出 base64
function aesEncrypt(plain, keyStr, ivStr) {
    const ks = _keyExp(utf8Bytes(keyStr));
    const data = utf8Bytes(plain);
    const pad = 16 - (data.length % 16);
    for (let i = 0; i < pad; i++) data.push(pad);
    let prev = utf8Bytes(ivStr);
    const out = [];
    for (let i = 0; i < data.length; i += 16) {
        const blk = data.slice(i, i + 16).map((b, j) => b ^ prev[j]);
        prev = _enc(blk, ks);
        out.push(...prev);
    }
    return b64enc(out);
}

// ============ 纯 JS 哈希(MD5 + SHA-256 + HMAC-SHA256,小程序打卡签名用;均与 node:crypto 对拍一致)============

function md5Hex(str) {
    const rol = (n, c) => (n << c) | (n >>> (32 - c));
    const s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
    const K = [];
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    const m = utf8Bytes(str);
    const origLen = m.length;
    m.push(0x80);
    while (m.length % 64 !== 56) m.push(0);
    const bitLen = origLen * 8;
    for (let i = 0; i < 8; i++) m.push(Math.floor(bitLen / Math.pow(2, 8 * i)) & 0xff);
    for (let off = 0; off < m.length; off += 64) {
        const M = [];
        for (let i = 0; i < 16; i++)
            M[i] = (m[off + i * 4]) | (m[off + i * 4 + 1] << 8) | (m[off + i * 4 + 2] << 16) | (m[off + i * 4 + 3] << 24);
        let A = a0, B = b0, C = c0, D = d0;
        for (let i = 0; i < 64; i++) {
            let F, g;
            if (i < 16) { F = (B & C) | (~B & D); g = i; }
            else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
            else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
            else { F = C ^ (B | ~D); g = (7 * i) % 16; }
            F = (F + A + K[i] + M[g]) >>> 0;
            A = D; D = C; C = B;
            B = (B + rol(F, s[i])) >>> 0;
        }
        a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
    }
    const hexLE = (n) => { let h = ""; for (let i = 0; i < 4; i++) h += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0"); return h; };
    return hexLE(a0) + hexLE(b0) + hexLE(c0) + hexLE(d0);
}

function sha256Bytes(bytes) {
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const m = bytes.slice();
    const origLen = m.length;
    m.push(0x80);
    while (m.length % 64 !== 56) m.push(0);
    const bitLen = origLen * 8;
    for (let i = 7; i >= 0; i--) m.push(Math.floor(bitLen / Math.pow(2, 8 * i)) & 0xff);
    const rotr = (n, c) => (n >>> c) | (n << (32 - c));
    for (let off = 0; off < m.length; off += 64) {
        const w = [];
        for (let i = 0; i < 16; i++)
            w[i] = ((m[off + i * 4] << 24) | (m[off + i * 4 + 1] << 16) | (m[off + i * 4 + 2] << 8) | (m[off + i * 4 + 3])) >>> 0;
        for (let i = 16; i < 64; i++) {
            const s0 = (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
            const s1 = (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }
        let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
        for (let i = 0; i < 64; i++) {
            const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
            const ch = ((e & f) ^ (~e & g)) >>> 0;
            const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
            const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
            const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
            const t2 = (S0 + maj) >>> 0;
            hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
        }
        h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
        h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
    }
    const out = [];
    for (const x of h) out.push((x >>> 24) & 0xff, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff);
    return out;
}

const bytesToHex = (b) => b.map((x) => x.toString(16).padStart(2, "0")).join("");

// HMAC-SHA256:key/msg 为 UTF8 字符串,输出 hex(crypto-js HmacSHA256(msg,key).toString() 同口径)
function hmacSha256Hex(msgStr, keyStr) {
    let key = utf8Bytes(keyStr);
    if (key.length > 64) key = sha256Bytes(key);
    while (key.length < 64) key.push(0);
    const o = [], i = [];
    for (let j = 0; j < 64; j++) { o.push(key[j] ^ 0x5c); i.push(key[j] ^ 0x36); }
    const inner = sha256Bytes(i.concat(utf8Bytes(msgStr)));
    return bytesToHex(sha256Bytes(o.concat(inner)));
}

function Env(s) {
    this.name = s;
    this.isSurge = () => typeof $httpClient !== "undefined";
    this.isQuanX = () => typeof $task !== "undefined";
    this.isLoon = () => typeof $loon !== "undefined";
    this.log = (...a) => console.log(a.join("\n"));
    this.msg = (t = this.name, s = "", b = "") => {
        if (this.isSurge() || this.isLoon()) $notification.post(t, s, b);
        else if (this.isQuanX()) $notify(t, s, b);
        console.log(["", "====📣" + t + "====", s, b].filter(Boolean).join("\n"));
    };
    this._node = {}; // Node(青龙)内存兜底,种子来自环境变量
    this.getdata = (k) => {
        if (this.isSurge() || this.isLoon()) return $persistentStore.read(k);
        if (this.isQuanX()) return $prefs.valueForKey(k);
        if (typeof process !== "undefined" && process.env) return k in this._node ? this._node[k] : (process.env[k] || null);
        return null;
    };
    this.setdata = (v, k) => {
        if (this.isSurge() || this.isLoon()) return $persistentStore.write(v, k);
        if (this.isQuanX()) return $prefs.setValueForKey(v, k);
        this._node[k] = v;
        return true;
    };
    this.get = (req, cb) => this.send(req, "GET", cb);
    this.post = (req, cb) => this.send(req, "POST", cb);
    this.send = (req, method, cb) => {
        if (this.isSurge() || this.isLoon()) {
            const fn = method === "POST" ? $httpClient.post : $httpClient.get;
            fn(req, (err, resp, data) => {
                if (resp) { resp.body = data; resp.statusCode = resp.status || resp.statusCode; }
                cb(err, resp, data);
            });
        } else if (this.isQuanX()) {
            req.method = method;
            $task.fetch(req).then(
                (r) => { r.status = r.statusCode; cb(null, r, r.body); },
                (e) => cb(e.error || e, null, null)
            );
        } else {
            // Node(青龙)
            const https = require("https");
            const u = new URL(req.url);
            const r = https.request(
                { hostname: u.hostname, path: u.pathname + u.search, method, headers: req.headers },
                (resp) => {
                    let d = "";
                    resp.on("data", (c) => (d += c));
                    resp.on("end", () => cb(null, { status: resp.statusCode, statusCode: resp.statusCode }, d));
                }
            );
            r.on("error", (e) => cb(e, null, null));
            if (req.body) r.write(req.body);
            r.end();
        }
    };
    this.done = (v = {}) => { if (typeof $done !== "undefined") $done(v); };
}
