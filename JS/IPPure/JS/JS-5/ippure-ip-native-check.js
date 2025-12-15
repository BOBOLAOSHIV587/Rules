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
    $done({ content: "Network Error", backgroundColor: "#C44" });
    return;
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch {
    $done({ content: "Invalid JSON", backgroundColor: "#C44" });
    return;
  }

  const isRes = Boolean(json.isResidential);
  const isBrd = Boolean(json.isBroadcast);

  const resText = isRes ? "Residential" : "DC";
  const brdText = isBrd ? "Broadcast" : "Native";

  // 颜色：绿 优 → 黄 中 → 红 差
  let color = "#88A788"; // 绿
  if ((isRes && isBrd) || (!isRes && !isBrd)) {
    color = "#D4A017"; // 黄
  }
  if (!isRes && isBrd) {
    color = "#C44"; // 红
  }

  $done({
    content: `${resText} • ${brdText}`,
    backgroundColor: color,
  });
}

(async () => {
  try {
    await main();
  } catch {
    $done({ content: "Script Error", backgroundColor: "#C44" });
  }
})();
