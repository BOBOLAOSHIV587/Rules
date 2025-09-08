// ======= 环境适配封装 =======
function isQuanX() {
  return typeof $task !== "undefined";
}
function isSurge() {
  return typeof $httpClient !== "undefined" && typeof $loon === "undefined";
}
function isLoon() {
  return typeof $loon !== "undefined";
}
function isNode() {
  return typeof require == "function" && !isQuanX() && !isSurge() && !isLoon();
}


function httpGet(url, callback) {
  if (isQuanX()) {
    $task.fetch({ url }).then(
      resp => callback(null, resp, resp.body),
      err => callback(err, null, null)
    );
  } else if (isSurge() || isLoon()) {
    $httpClient.get(url, (err, resp, body) => {
      callback(err, resp, body);
    });
  } else if (isNode()) {
    const https = require("https");
    https.get(url, (resp) => {
      let data = "";
      resp.on("data", (chunk) => (data += chunk));
      resp.on("end", () => {
        callback(null, resp, data);
      });
    }).on("error", (err) => {
      callback(err, null, null);
    });
  } else {
    callback(new Error("未知环境"), null, null);
  }
}

const url = "https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/JVID/JS/JVIDtoken.txt";

httpGet(url, (error, response, data) => {
  if (error) {
    console.log(" 获取远程数据失败: " + error);
    $done({});
    return;
  }

  try {
    const json = JSON.parse(data);
    let headers = $request.headers;

    if (json.newToken && headers["token"]) {
      headers["token"] = json.newToken;
    }

    if (headers["Cookie"]) {
      headers["Cookie"] = headers["Cookie"]
        .replace(/CLSQ-Token=[^;]+/, `CLSQ-Token=${json.newToken}`)
        .replace(/CLSQ-UUID=[^;]+/, `CLSQ-UUID=${json.newUUID}`)
        .replace(/CLSQ-UserInfo=[^;]+/, `CLSQ-UserInfo=${json.newUserInfo}`);
    }

    console.log("Headers 已替换成功");
    $done({ headers });

  } catch (e) {
    console.log("JSON 解析失败: " + e.message);
    $done({});
  }
});
