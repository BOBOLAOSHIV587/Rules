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
    ? "IPPure 原生 IP 检查"
    : "IPPure IP Native Check";

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

  const isRes = Boolean(json.isResidential);
  const isBrd = Boolean(json.isBroadcast);

  const resText = isChinese()
    ? (isRes ? "住宅" : "机房")
    : (isRes ? "Residential" : "DC");

  const brdText = isChinese()
    ? (isBrd ? "广播" : "原生")
    : (isBrd ? "Broadcast" : "Native");

  // 颜色逻辑：绿 → 黄 → 红
  let color = "#88A788";
  if ((isRes && isBrd) || (!isRes && !isBrd)) {
    color = "#D4A017";
  }
  if (!isRes && isBrd) {
    color = "#C44";
  }

  const separator = " • ";

  $done({
    title,
    content: `${resText}${separator}${brdText}`,
    backgroundColor: color,
  });
}

(async () => {
  try {
    await main();
  } catch {
    $done({
      title: isChinese()
        ? "IPPure 原生 IP 检查"
        : "IPPure IP Native Check",
      content: isChinese() ? "脚本错误" : "Script Error",
      backgroundColor: "#C44",
    });
  }
})();
