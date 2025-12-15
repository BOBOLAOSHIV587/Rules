async function request(method, params) {
  return new Promise((resolve) => {
    const httpMethod = $httpClient[method.toLowerCase()];
    httpMethod(params, (error, response, data) => {
      resolve({ error, response, data });
    });
  });
}

async function main() {
  const url = "https://my.ippure.com/v1/info";
  const { error, response, data } = await request("GET", url);

  if (error || !data) {
    $done({
      content: "Network Error",
      backgroundColor: "#C44",
    });
    return;
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch {
    $done({
      content: "Invalid JSON",
      backgroundColor: "#C44",
    });
    return;
  }

  const score = json.fraudScore;

  if (score === undefined || score === null) {
    $done({
      content: "No Score",
      backgroundColor: "#C44",
    });
    return;
  }

  // 可自定义区间颜色
  let color = "#88A788"; // 低风险：绿色
  if (score >= 40 && score < 70) {
    color = "#D4A017"; // 中风险：黄橙色
  } else if (score >= 70) {
    color = "#C44"; // 高风险：红色
  }

  $done({
    content: `Fraud Score: ${score}`,
    backgroundColor: color,
  });
}

(async () => {
  try {
    await main();
  } catch {
    $done({
      content: "Script Error",
      backgroundColor: "#C44",
    });
  }
})();
