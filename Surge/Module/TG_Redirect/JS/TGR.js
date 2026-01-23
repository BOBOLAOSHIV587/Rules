/**
 * Surge: t.me Redirect (http-request 直接返回 302)
 * $argument 支持：
 * - client=Telegram / Swiftgram / Turrit / iMe / Nicegram / Lingogram
 * - client=tg / sg / turrit / ime / ng / lingo
 * - 纯值：tg / ng ...
 */
function parseArg() {
  const a = typeof $argument === "undefined" ? "" : $argument;
  if (!a) return {};
  if (typeof a === "object") return a;
  const s = String(a).trim();
  if (!s) return {};
  if (!s.includes("=") && !s.includes("&")) return { client: s };
  return s.split("&").reduce((o, p) => {
    const i = p.indexOf("=");
    if (i > -1) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
    return o;
  }, {});
}

const map = { Telegram: "tg", Swiftgram: "sg", Turrit: "turrit", iMe: "ime", Nicegram: "ng", Lingogram: "lingo" };

function qget(qs, k) {
  if (!qs) return "";
  const m = qs.match(new RegExp("(?:^|&)" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^&]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}

(function () {
  if (typeof $request === "undefined" || !$request.url) return $done({});
  const m = String($request.url).match(/^https?:\/\/t\.me\/(.+)$/i);
  if (!m) return $done({});

  const a = parseArg();
  let scheme = String(a.client || a["t.me_redirect"] || "").trim();
  scheme = map[scheme] || scheme || "tg";

  let tail = m[1];
  if (tail.startsWith("s/")) tail = tail.slice(2);

  const parts = tail.split("?");
  const path = parts[0] || "";
  const qs = parts[1] || "";
  const seg = path.split("/").filter(Boolean);

  let loc = "";
  if (seg[0] && seg[0][0] === "+") loc = `${scheme}://join?invite=${encodeURIComponent(seg[0].slice(1))}`;
  else if (seg[0] === "joinchat" && seg[1]) loc = `${scheme}://join?invite=${encodeURIComponent(seg[1])}`;
  else if (seg[0] === "addstickers" && seg[1]) loc = `${scheme}://addstickers?set=${encodeURIComponent(seg[1])}`;
  else if (seg[0] === "share" && seg[1] === "url") {
    const u = qget(qs, "url"), t = qget(qs, "text");
    loc = `${scheme}://msg_url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`;
  } else if (seg[0]) {
    loc = seg[1] && /^\d+$/.test(seg[1])
      ? `${scheme}://resolve?domain=${encodeURIComponent(seg[0])}&post=${encodeURIComponent(seg[1])}`
      : `${scheme}://resolve?domain=${encodeURIComponent(seg[0])}`;
  }

  if (!loc) return $done({});

  if (typeof $task !== "undefined") return $done({ status: "HTTP/1.1 302 Found", headers: { Location: loc }, body: "" });
  return $done({ response: { status: 302, headers: { Location: loc }, body: "" } });
})();
