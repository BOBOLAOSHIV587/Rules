/*************************************
#!name = X字幕 (xzimu) 无限翻译次数
#!author = 怎么肥事
#!update = 2026-4-20

^http:\/\/apps\.tltgame\.com\/api\/user\/updateStatus url script-response-body https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/xzimu-unlock.js
^http:\/\/apps\.tltgame\.com\/api\/task\/offline\/post url script-request-body https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/xzimu-unlock.js
^http:\/\/apps\.tltgame\.com\/api\/task\/offline\/post url script-response-body https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/xzimu-unlock.js
^http:\/\/47\.251\.39\.178:18080\/task\/runSegment url script-request-body https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/xzimu-unlock.js

hostname = apps.tltgame.com,47.251.39.178
*************************************/

/*
 * X字幕 (xzimu) 无限翻译次数
 * By TG@ZenMoFiShi
 *
 */

const APPKEY = "c7ea8cbab9a95f69c2380e57583f5cd3";
const BASE = "http://apps.tltgame.com/api";
const BODY_KEY = "xz_post_body";

const url = $request.url;
const isResponse = typeof $response !== "undefined";

if (url.includes("/user/updateStatus") && isResponse) {
    handleUpdateStatus();
} else if (url.includes("/task/offline/post") && !isResponse) {
    saveRequestBody();
} else if (url.includes("/task/offline/post") && isResponse) {
    handleOfflinePost();
} else if (url.includes("/task/runSegment") && !isResponse) {
    handleRunSegment();
} else {
    $done({});
}

function handleUpdateStatus() {
    let obj;
    try { obj = JSON.parse($response.body); } catch (e) { $done({}); return; }

    if (obj.data) {
        obj.data.balance = 99999;
        obj.data.isExpire = 0;
        obj.data.is_expire = 0;
        obj.data.lifetimeVip = 1;
        obj.data.expireDate = "2099-12-31 00:00:00";
        obj.data.expire_date = "2099-12-31 00:00:00";
    }
    console.log("[XZ] ✅ updateStatus 已篡改");
    $done({ body: JSON.stringify(obj) });
}

function saveRequestBody() {
    if ($request.body) {
        $prefs.setValueForKey($request.body, BODY_KEY);
    }
    $done({});
}

function handleOfflinePost() {
    let resp;
    try { resp = JSON.parse($response.body); } catch (e) { $done({}); return; }

    if (resp.errcode !== 10001) {
        $done({});
        return;
    }

    const savedBody = $prefs.valueForKey(BODY_KEY);
    if (!savedBody) {
        console.log("[XZ] ❌ 未找到保存的请求体");
        $done({});
        return;
    }

    console.log("[XZ] 余额不足，自动注册新身份...");

    (async () => {
        try {
            const regResp = await http("POST", `${BASE}/user/randomRegister`, `appKey=${APPKEY}`);
            const regData = JSON.parse(regResp.body);

            if (regData.errcode !== 0 || !regData.data || !regData.data.accesstoken) {
                console.log("[XZ] 注册失败");
                $done({});
                return;
            }

            const newToken = regData.data.accesstoken;
            const uid = regData.data.uid || "";

            const actResp = await http("POST", `${BASE}/apps/activate`,
                `appKey=${APPKEY}&accesstoken=${newToken}&deviceId=${uid}`);
            const actData = JSON.parse(actResp.body);
            const newDeviceId = actData.data && actData.data.deviceId ? actData.data.deviceId : uid;

            let newBody = savedBody;
            newBody = newBody.replace(/accesstoken=[^&]+/, `accesstoken=${newToken}`);
            newBody = newBody.replace(/deviceId=[^&]+/, `deviceId=${newDeviceId}`);

            const retryResp = await http("POST", url, newBody);
            console.log("[XZ] ✅ 换号重发完成");
            $done({ body: retryResp.body });
        } catch (e) {
            console.log("[XZ] ❌ " + e);
            $done({});
        }
    })();
}

function handleRunSegment() {
    let obj;
    try { obj = JSON.parse($request.body); } catch (e) { $done({}); return; }

    const LIMIT = 300000; 
    if (obj.start >= LIMIT) {
        const duration = obj.end - obj.start;
        const fakeStart = (obj.segmentIndex * 1000) % LIMIT;
        obj.start = fakeStart;
        obj.end = fakeStart + duration;
        console.log(`[XZ] runSegment seg=${obj.segmentIndex}: start/end 已伪装为 ${obj.start}-${obj.end}`);
        $done({ body: JSON.stringify(obj) });
    } else {
        $done({});
    }
}

function http(method, url, body) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url, method,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body
        }).then(resolve, reject);
    });
}
