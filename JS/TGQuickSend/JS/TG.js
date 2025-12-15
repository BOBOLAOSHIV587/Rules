/**
 * TG QuickSend (Surge)
 * - mode=panel  : Panel 展示（可点 tg:// / https://t.me/ 链接，刷新可轮换预设）
 * - mode=notify : 弹通知（点击通知直达 TG 并预填草稿）
 *
 * 
 */

(function main() {
  // 默认
  const DEFAULT = {
    bot: "lovebabyforeverbot",           // 不带 @
    text: "/start",
    list: "lovebabyforeverbot::/start",  // Panel 预设列表（支持多条用 | 分隔）
    title: "TG Start",
    open: "1",                    // 1=通知点击跳 TG
  };
  // ==============================================

  const args = parseArgs(typeof $argument !== "undefined" ? $argument : "");
  const mode = ((args.mode || "").toLowerCase() || "notify");

  const KEY = "TGQuick_index";

  // 预设列表：argument 优先，其次 DEFAULT.list
  const items = parseList(args.list || DEFAULT.list);

  function pickItem() {
    // notify 或 panel 都可以直接传 bot/text 覆盖默认值
    const b = (args.bot || "").trim();
    const t = (args.text || "").trim();
    if (b) return { bot: b, text: t };

    // panel 下刷新轮换
    if (items && items.length) {
      let idx = parseInt($persistentStore.read(KEY) || "0", 10);
      if (!Number.isFinite(idx) || idx < 0) idx = 0;
      const cur = items[idx % items.length];
      $persistentStore.write(String((idx + 1) % items.length), KEY);
      return cur;
    }

    // fallback：用默认 bot/text
    return { bot: DEFAULT.bot, text: DEFAULT.text };
  }

  const cur = pickItem();
  const bot = (cur.bot || DEFAULT.bot).replace(/^@/, "").trim();
  const text = (cur.text || DEFAULT.text).trim();

  if (!bot) {
    const msg = "缺少 bot：请在 DEFAULT.bot 里设置，或 argument 里写 bot=xxx";
    if (mode === "panel") $done({ title: "TG QuickSend", style: "info", content: msg });
    else $notification.post("TG QuickSend", "missing bot", msg);
    return safeDone();
  }

  const tgUrl = `tg://resolve?domain=${encodeURIComponent(bot)}&text=${encodeURIComponent(text)}`;
  const webUrl = `https://t.me/${encodeURIComponent(bot)}?text=${encodeURIComponent(text)}`;

  if (mode === "panel") {
    const now = new Date().toLocaleString();
    const hint = (items && items.length)
      ? `刷新=切换下一条（共 ${items.length} 条预设）`
      : "在 DEFAULT.list 里配置预设列表";

    $done({
      title: "TG QuickSend",
      style: "info",
      content:
        `当前：@${bot}\n` +
        `内容：${text || "(空)"}\n\n` +
        `点我打开 TG（tg://）：\n${tgUrl}\n\n` +
        `备用（https）：\n${webUrl}\n\n` +
        `${hint}\n` +
        `更新时间：${now}`
    });
    return;
  }

  // mode=notify
  const title = args.title || DEFAULT.title || "TG Draft";
  const subtitle = args.subtitle || `@${bot}`;
  const open = args.open === undefined ? (DEFAULT.open || "1") : String(args.open);

  const body =
    `已预填草稿：${text || "(空)"}\n` +
    `点通知打开 TG 后手动点发送`;

  if (open === "1" || open.toLowerCase() === "true") {
    $notification.post(title, subtitle, body, { action: "open-url", url: tgUrl });
  } else {
    $notification.post(title, subtitle, body);
  }

  safeDone();

  function safeDone() {
    if (typeof $request !== "undefined") return $done({});
    return $done();
  }

  function parseArgs(s) {
    const o = {};
    s.split("&").forEach((kv) => {
      if (!kv) return;
      const i = kv.indexOf("=");
      const k = i >= 0 ? kv.slice(0, i) : kv;
      const v = i >= 0 ? kv.slice(i + 1) : "";
      o[decodeURIComponent(k)] = decodeURIComponent(v);
    });
    return o;
  }

  function parseList(listStr) {
    if (!listStr) return null;
    const parts = listStr.split("|").map(x => x.trim()).filter(Boolean);
    const out = [];
    for (const p of parts) {
      let b = "", t = "";
      if (p.includes("::")) [b, t] = p.split("::");
      else if (p.includes(",")) [b, t] = p.split(",");
      else b = p;

      b = (b || "").trim().replace(/^@/, "");
      t = (t || "").trim();
      if (b) out.push({ bot: b, text: t });
    }
    return out.length ? out : null;
  }
})();
