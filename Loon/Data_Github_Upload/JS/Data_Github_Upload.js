/*
#!name=文本/手动上传GitHub
#!desc=使用说明看js脚本
#!openUrl = 
#!icon = https://raw.githubusercontent.com/fishdown/Icon/master/app/github.png
#!author=fishdown

[Argument]
text = input,"",tag=插件文本,desc=输入要上传的完整文本，支持换行
owner = input,"",tag=git用户名,desc=GitHub 用户名
repo = input,"",tag=git仓库名,desc=GitHub 仓库名
branch = input,"",tag=git分支,desc=GitHub 分支
path = input,"/*.lpx",tag=文件路径,desc=文件夹/文件名.lpx
ghToken = input,"",tag=gitoken,desc=GitHub Token

open= switch,false,tag=开关,desc=
time = input,"35 * * * *",tag=Cron时间,desc=cron表达式

[Script]
cron {time} script-path=https://raw.githubusercontent.com/chmg2025/js/refs/heads/main/github.js, timeout=60, img-url=https://raw.githubusercontent.com/fishdown/Icon/master/app/github.png,enable={open},tag=Github上传文件, argument=[{text},{owner},{repo},{path},{branch},{ghToken}]
*/
// 本js文件，plugins,scripts 都放，直接添加本地插件，data-github-upload.js
// 本地文件，可以在[Argument]预设自己的input，input后面双引号内，token建议在ui界面输入
// 要申请GitHub token 要有权限，自行google。
// 弄清楚文件路径，看准下面申明的变量
// 仓库没文件，直接上传，有文件直接替换




// ========== 参数 ==========
let text = $argument.text || "";      
let owner = $argument.owner || "";    
let repo = $argument.repo || "";      
let branch = $argument.branch || "";  
let upload = $argument.upload  || ""; // true 或 false
let path = $argument.path || ""; 
let ghToken = $argument.ghToken || ""; 


const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/`;
const repoUrl = `https://github.com/${owner}/${repo}/tree/${branch}/`;
const startTime = Date.now();
const maxRetry = 3; // 最大重试次数
let failLogs = [];  // 失败日志数组

// ========== 主入口 ==========
if (!path.trim()) {
    console.log("❌ 未检测到路径 path，取消操作");
    $notification.post("外部文本上传GitHub", "❌ 操作失败", "请在插件参数内填写 path");
    $done();
}

if (upload) {
    if (!text.trim()) {
        console.log("❌ upload 为 true，但未检测到文本，取消操作");
        $notification.post("外部文本上传GitHub", "❌ 操作失败", "请在插件参数内填写 text");
        $done();
    }
    console.log("📦 upload 为 true，准备上传");
    uploadFile(text);
} else {
    console.log("🗑️ upload 为 false，准备删除文件");
    deleteFile(path);
}

// ========== 上传文件 ==========
function uploadFile(content, attempt = 1) {
    const body = {
        message: `上传外部文本 ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
        content: base64Encode(content),
        branch: branch
    };
    const headers = {
        Authorization: `token ${ghToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Loon-File-Upload-Script"
    };

    console.log(`📤 上传请求 (尝试 ${attempt}):`, JSON.stringify({ url: apiUrl + path, headers, body }, null, 2));

    $httpClient.put({ url: apiUrl + path, headers, body: JSON.stringify(body) }, (err, resp, data) => {
        let res = {};
        try { res = JSON.parse(data); } catch (e) {}

        if (resp.status === 201 && res?.content?.download_url) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ 文本上传成功，耗时 ${duration}s`);
            notifySuccess(res.content.download_url, "上传", true, duration);
            $done();
        } else if (resp.status === 422) {
            console.log("📄 文件已存在，准备更新");
            getFileShaAndUpdate(content);
        } else {
            if (attempt < maxRetry) {
                console.log(`⚠️ 上传失败，重试中 (${attempt}/${maxRetry})`);
                uploadFile(content, attempt + 1);
            } else {
                const log = `[上传失败] ${JSON.stringify(res)}`;
                failLogs.push(log);
                console.log("❌ " + log);
                $notification.post("外部文本上传GitHub", "❌ 上传失败", log);
                $done();
            }
        }
    });
}

// ========== 获取 SHA 并更新 ==========
function getFileShaAndUpdate(content, attempt = 1) {
    const url = `${apiUrl}${path}?ref=${branch}`;
    const headers = { Authorization: `token ${ghToken}`, "User-Agent": "Loon-File-Upload-Script" };

    $httpClient.get({ url, headers }, (err, resp, data) => {
        let res = {};
        try { res = JSON.parse(data); } catch (e) {}
        if (res?.sha) {
            updateFile(content, res.sha);
        } else {
            if (attempt < maxRetry) {
                console.log(`⚠️ 获取 SHA 失败，重试中 (${attempt}/${maxRetry})`);
                getFileShaAndUpdate(content, attempt + 1);
            } else {
                const log = `[获取 SHA 失败] ${JSON.stringify(res)}`;
                failLogs.push(log);
                console.log("❌ " + log);
                $notification.post("外部文本上传GitHub", "❌ 获取 SHA 多次失败", log);
                $done();
            }
        }
    });
}

// ========== 更新文件 ==========
function updateFile(content, sha, attempt = 1) {
    const body = {
        message: `更新外部文本 ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
        content: base64Encode(content),
        branch: branch,
        sha: sha
    };
    const headers = {
        Authorization: `token ${ghToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Loon-File-Upload-Script"
    };

    $httpClient.put({ url: apiUrl + path, headers, body: JSON.stringify(body) }, (err, resp, data) => {
        let res = {};
        try { res = JSON.parse(data); } catch (e) {}

        if (resp.status === 200 && res?.content?.download_url) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ 文本更新成功，耗时 ${duration}s`);
            notifySuccess(res.content.download_url, "更新", true, duration);
        } else {
            if (attempt < maxRetry) {
                console.log(`⚠️ 更新失败，重试中 (${attempt}/${maxRetry})`);
                updateFile(content, sha, attempt + 1);
            } else {
                const log = `[更新失败] ${JSON.stringify(res)}`;
                failLogs.push(log);
                console.log("❌ " + log);
                $notification.post("外部文本上传GitHub", "❌ 更新失败", log);
            }
        }
        if (failLogs.length > 0) {
            console.log("📌 失败日志汇总:", failLogs.join("\n"));
        }
        $done();
    });
}

// ========== 删除文件 ==========
function deleteFile(filePath) {
    const url = `${apiUrl}${filePath}?ref=${branch}`;
    const headers = { Authorization: `token ${ghToken}`, "User-Agent": "Loon-File-Delete-Script" };

    const fileDir = filePath.includes("/") ? filePath.substring(0, filePath.lastIndexOf("/") + 1) : "";
    const jumpUrl = repoUrl + fileDir;
    const attach = { openUrl: jumpUrl, clipboard: jumpUrl };

    $httpClient.get({ url, headers }, (err, resp, data) => {
        let res = {};
        try { res = JSON.parse(data); } catch (e) {}

        if (!res?.sha) {
            const log = `[删除文件不存在] ${filePath}`;
            failLogs.push(log);
            console.log("⚠️ " + log + "，跳转目录: " + jumpUrl);
            $notification.post("外部文本上传GitHub", "⚠️ 文件不存在，跳转目录", filePath, attach);
            return $done();
        }

        const body = {
            message: `删除文件 ${filePath} ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
            sha: res.sha,
            branch: branch
        };

        $httpClient.delete({ url: `${apiUrl}${filePath}`, headers, body: JSON.stringify(body) }, (err2, resp2, data2) => {
            let res2 = {};
            try { res2 = JSON.parse(data2); } catch (e) {}

            if (resp2.status === 200) {
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`✅ 文件删除成功，耗时 ${duration}s`);
                $notification.post("外部文本上传GitHub", `✅ 删除成功 | ${duration}s`, filePath, attach);
            } else {
                const log = `[删除失败] ${JSON.stringify(res2)}`;
                failLogs.push(log);
                console.log("❌ " + log);
                $notification.post("外部文本上传GitHub", "❌ 删除失败", log, attach);
            }
            if (failLogs.length > 0) {
                console.log("📌 失败日志汇总:", failLogs.join("\n"));
            }
            $done();
        });
    });
}

// ========== 通知 ==========
function notifySuccess(downloadUrl, action, success = true, duration = "0") {
    const rawUrl = downloadUrl.replace("https://github.com/", "https://raw.githubusercontent.com/").replace("/blob/", "/");
    const attach = { openUrl: rawUrl, clipboard: rawUrl };
    const title = `${success ? "✅" : "❌"} ${action}成功 | ${duration}s`;
    $notification.post("外部文本上传GitHub", title, rawUrl, attach);
}

// ========== base64 编码 ==========
function base64Encode(str) {
    let encoded = "";
    try {
        encoded = Buffer.from(str, "utf-8").toString("base64");
    } catch (e) {
        encoded = btoa(unescape(encodeURIComponent(str)));
    }
    return encoded;
}
