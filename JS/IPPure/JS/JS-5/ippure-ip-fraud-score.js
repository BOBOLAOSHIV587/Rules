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
    ? "IPPure IP 风险评分"
    : "IPPure IP Fraud Score";

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

  const score = json.fraudScore;

  if (score === undefined || score === null) {
    $done({
      title,
      content: isChinese() ? "无评分数据" : "No Score",
      backgroundColor: "#C44",
    });
    return;
  }

  // 风险颜色：绿 → 黄 → 红 + 文案
  let color = "#88A788"; // 默认低风险（绿色）
  let levelZh = "低风险";
  let levelEn = "Low Risk";

  if (score >= 40 && score < 70) {
    color = "#D4A017"; // 中风险（黄色）
    levelZh = "中风险";
    levelEn = "Medium Risk";
  } else if (score >= 70) {
    color = "#C44"; // 高风险（红色）
    levelZh = "高风险";
    levelEn = "High Risk";
  }

  const text = isChinese()
    ? `风险评分: ${score}（${levelZh}）`
    : `Fraud Score: ${score} (${levelEn})`;

  $done({
    title,
    content: text,
    backgroundColor: color,
  });
}

(async () => {
  try {
    await main();
  } catch {
    $done({
      title: isChinese()
        ? "IPPure IP 风险评分"
        : "IPPure IP Fraud Score",
      content: isChinese() ? "脚本错误" : "Script Error",
      backgroundColor: "#C44",
    });
  }
})();
