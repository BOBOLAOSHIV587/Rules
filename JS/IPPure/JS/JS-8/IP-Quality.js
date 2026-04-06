// IP 纯净度检测脚本
// 数据源：ip-api.com（含 proxy/hosting 检测）

const url = "http://ip-api.com/json?fields=status,query,country,countryCode,regionName,city,isp,org,as,proxy,hosting,mobile";

$httpClient.get(url, function(error, response, data) {
  if (error || !data) {
    $done({ title: "IP 检测失败", content: error || "无数据", icon: "exclamationmark.triangle" });
    return;
  }

  const d = JSON.parse(data);
  const flag = getFlag(d.countryCode);

  // 类型判断
  let ipType = "🏠 住宅 IP";
  if (d.hosting) ipType = "🏢 数据中心";
  else if (d.proxy) ipType = "🔀 代理/VPN";
  else if (d.mobile) ipType = "📱 移动网络";

  // 风险评级
  let risk = "✅ 低风险";
  if (d.hosting && d.proxy) risk = "🔴 高风险";
  else if (d.hosting || d.proxy) risk = "🟡 中等风险";

  // 纯净度评分（简单规则）
  let score = 100;
  if (d.proxy) score -= 40;
  if (d.hosting) score -= 30;
  if (d.mobile) score -= 5;

  const content = [
    `IP：${d.query}`,
    `归属：${flag}${d.country} · ${d.city}`,
    `运营商：${d.isp}`,
    `类型：${ipType}`,
    `风险：${risk}`,
    `纯净度：${score}/100`
  ].join("\n");

  $done({
    title: `${flag} ${d.query}`,
    content: content,
    icon: score >= 70 ? "checkmark.shield.fill" : score >= 40 ? "exclamationmark.shield.fill" : "xmark.shield.fill",
    "icon-color": score >= 70 ? "#34C759" : score >= 40 ? "#FF9500" : "#FF3B30"
  });
});

function getFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map(c => 127397 + c.charCodeAt())
  );
}