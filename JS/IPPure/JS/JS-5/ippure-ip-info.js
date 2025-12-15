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

  // Location 优先级：city → region → country
  const location = json.city || json.region || json.country || "Unknown";

  const org = json.asOrganization || "Unknown";

  const text = `${location} - ${org}`;

  $done({
    content: text,
    backgroundColor: "#88A788",
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
