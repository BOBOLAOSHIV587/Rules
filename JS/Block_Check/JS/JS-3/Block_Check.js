/**
 * 节点连通性检测脚本（Surge 版）
 * 原脚本：https://gist.githubusercontent.com/RavelloH/383354955aa3800e1d7e98666e11e16f/raw/block_check.js
 * 作者：https://github.com/RavelloH
 *
 * Surge 说明：
 *   Quantumult X 的 event-interaction 在 Surge 中没有完全对应的触发方式。
 *   这里使用 Panel（信息面板）脚本实现：在 Surge 的策略选择界面查看面板，
 *   点击刷新即可检测当前活动策略（节点）与 DIRECT 的连通性差异。
 *
 * 使用：
 *   1. 将 .sgmodule 与 block_check_surge.js 放入 Surge 配置目录。
 *   2. 在 Surge → 模块 中启用本模块。
 *   3. 进入策略选择界面，点击面板上的刷新按钮。
 */

const IP_API = "http://ip-api.com/json?lang=zh-CN";
const TIMEOUT = 8;

function fetchIpInfo(policy) {
  return new Promise((resolve) => {
    const opts = { url: IP_API, timeout: TIMEOUT };
    if (policy) opts.policy = policy;
    $httpClient.get(opts, (error, response, data) => {
      if (error || !data) return resolve({ ok: false, error });
      try {
        resolve({ ok: true, data: JSON.parse(data) });
      } catch (e) {
        resolve({ ok: false, error: e });
      }
    });
  });
}

function render(node, direct) {
  const nOk = node && node.ok;
  const dOk = direct && direct.ok;

  let lines = [];

  // 节点代理
  lines.push(`节点代理: ${nOk ? "✅ 正常" : "❌ 不可达"}`);
  if (nOk && node.data) {
    const d = node.data;
    lines.push(`IP: ${d.query}`);
    lines.push(`位置: ${[d.country, d.regionName, d.city].filter(Boolean).join(" - ")}`);
    lines.push(`ISP: ${d.isp || "未知"}`);
  }

  lines.push("");

  // 本机网络
  lines.push(`本机网络: ${dOk ? "✅ 正常" : "❌ 异常"}`);
  if (dOk && direct.data) {
    const d = direct.data;
    lines.push(`IP: ${d.query}`);
    lines.push(`位置: ${[d.country, d.regionName, d.city].filter(Boolean).join(" - ")}`);
    lines.push(`ISP: ${d.isp || "未知"}`);
  }

  lines.push("");

  // 诊断结论
  let conclusion;
  let style = "info";
  if (!dOk) {
    conclusion = "⚠️ 本机网络异常";
    style = "alert";
  } else if (nOk) {
    conclusion = "✅ 节点正常";
    style = "good";
  } else {
    conclusion = "🚫 疑似被运营商/GFW 阻断";
    style = "error";
  }
  lines.push(`诊断结论: ${conclusion}`);

  return { content: lines.join("\n"), style };
}

Promise.all([
  fetchIpInfo(),        // 走当前活动策略（节点）
  fetchIpInfo("DIRECT") // 走直连
]).then(([node, direct]) => {
  const { content, style } = render(node, direct);
  $done({
    title: "🌐 节点阻断检测",
    content: content,
    style: style,
    icon: "bolt.horizontal.icloud.fill",
    "icon-color": style === "good" ? "#34C759" : style === "error" ? "#FF3B30" : style === "alert" ? "#FF9500" : "#007AFF"
  });
}).catch((err) => {
  $done({
    title: "🌐 节点阻断检测",
    content: "🛑 检测发生异常，请检查网络或查看 Surge 日志。",
    style: "error",
    icon: "exclamationmark.triangle.fill",
    "icon-color": "#FF3B30"
  });
});
