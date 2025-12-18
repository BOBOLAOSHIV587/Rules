async function request(method, params) {
  return new Promise((resolve) => {
    const httpMethod = $httpClient[method.toLowerCase()];
    httpMethod(params, (error, response, data) => {
      resolve({ error, response, data });
    });
  });
}

function isChinese() {
  const lang = ($environment.language || "").toLowerCase();
  return lang.startsWith("zh");
}

async function main() {
  const url = "https://my.ippure.com/v1/info";
  const { error, response, data } = await request("GET", url);

  const title = isChinese()
    ? "IPPure IP 信息"
    : "IPPure IP Info";

  if (error || !data) {
    $done({
      title,
      content: isChinese() ? "网络错误" : "Network Error",
      backgroundColor: "#C44",
    });
    return;
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch {
    $done({
      title,
      content: isChinese() ? "无效 JSON" : "Invalid JSON",
      backgroundColor: "#C44",
    });
    return;
  }

  // Location 优先级：city → region → country
  let location = json.city || json.region || json.country || "";
  let org = json.asOrganization || "";

  if (!location) location = isChinese() ? "未知区域" : "Unknown";
  if (!org) org = isChinese() ? "未知运营商" : "Unknown";

  const separator = " - ";
  const text = `${location}${separator}${org}`;

  $done({
    title,
    content: text,
    backgroundColor: "#88A788",
  });
}

(async () => {
  try {
    await main();
  } catch {
    $done({
      title: isChinese() ? "IPPure IP 信息" : "IPPure IP Info",
      content: isChinese() ? "脚本错误" : "Script Error",
      backgroundColor: "#C44",
    });
  }
})();
