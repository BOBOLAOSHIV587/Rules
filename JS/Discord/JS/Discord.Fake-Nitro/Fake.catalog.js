/*
 Discord FakeNitro catalog v1.11.0 — Loon 响应侧: 表情目录采集 + 黑名单消息过滤(分页不断档)
 当前插件规则只注册目录端点( http-response, requires-body ):
  ^https?:\/\/discord(app)?\.com\/api\/v\d+\/(guilds\/\d+\/(top-emojis|emojis)|emojis)
 脚本仍保留 messages 过滤实现供回归与旧安装兼容; /messages 的新入口已合入 translate-response.js。
 功能:
  1) 采集 name -> {id, animated} 存 $persistentStore("fakenitro_emoji_catalog")
  2) 消息数组响应里删除黑名单作者的消息(含 referenced_message/message_reference)
  3) 黑名单源: 服务器 /block (优先) -> $persistentStore("discord_blocked_users") + argument.manual_ids

 v1.11.0 分页修复(根因):
  客户端靠"本页条数是否 >= 请求的 limit"判断还有没有更早的消息。
  旧逻辑在以下情况会交出不足 limit 条的页, 客户端就当作"到顶"并停止上滑:
    a) 补拉的某一页全是被拉黑者的消息(kept=0) -> 旧代码直接 stop, 交出 0~几条
    b) 补拉遇到 429 / 超时 / 解析失败 -> 直接交出已有的几条
    c) 补拉 10 页仍凑不满
  新规则: 除非频道真的到头(服务端返回条数 < 请求条数), 否则永远交出恰好 limit 条:
    - 先用 limit=100 的大页补拉, 补拉游标每次都推进(整页被拉黑也继续往前), 凑够 limit 条可见消息即截断交付
    - 补不满(次数/时间/错误)时, 用被拉黑者消息的"占位"补足条数, 绝不交短页
  after= / around= 请求只做占位替换, 不删除, 不改页大小。
*/
var CAT_KEY = "fakenitro_emoji_catalog";
var BL_KEY = "discord_blocked_users";
var FETCH_LIMIT = 100;   // 补拉每页条数(Discord API 上限 100)
var MAX_FETCH = 4;       // 单次响应最多补拉次数(防 429)
var BUDGET_MS = 12000;   // 补拉总时间预算, 超了就用占位兜底

function argGet(name, dflt) {
  try {
    if (typeof $argument === "object" && $argument && $argument[name] !== undefined) {
      var v = $argument[name];
      if (v === "false" || v === false) return false;
      if (v === "true" || v === true) return true;
      return v;
    }
  } catch (e) {}
  return dflt;
}

var ENABLED = !(argGet("enabled", true) === false);
var MANUAL_IDS = (function(){ var v = argGet("manual_ids", ""); return typeof v === "string" ? v : ""; })();

function log(m) { try { console.log("[FakeNitro.catalog] " + m); } catch (e) {} }

var finished = false;
function done(o) { if (finished) return; finished = true; $done(o || {}); }

function toSet(list){
  var set = {};
  for (var i=0;i<list.length;i++) set[String(list[i])] = 1;
  return set;
}

function getBlockedSet(){
  var list = [];
  try { var raw = $persistentStore.read(BL_KEY); if (raw) list = JSON.parse(raw) || []; } catch(e) {}
  if (MANUAL_IDS) {
    MANUAL_IDS.split(/[,;\s]+/).forEach(function(x){
      x = x.replace(/^\s+|\s+$/g, "");
      if (/^\d{15,21}$/.test(x)) list.push(x);
    });
  }
  return toSet(list);
}

/* ---- 服务器黑名单(可选): 地址由用户在插件面板 block_server 填入, 不硬编码 ----------
   留空 = 不连服务器, 只用本地 store。多个地址用逗号分隔, 任意一个能拉到即用。
   拉取时带 node:"DIRECT"(LAN/内网直连语义, 和 blocklist-record 的 PUT 一致)。 */
var BL_SERVERS = (function(){
  var v = argGet("block_server", "");
  if (!v || typeof v !== "string") return [];
  return v.split(/[,;\s]+/).filter(function(s){ return /^https?:\/\//.test(s); });
})();
function tryServers(idx, cb){
  if (!$httpClient || idx >= BL_SERVERS.length) { log("blocklist server unreachable, fallback local"); cb(null); return; }
  $httpClient.get({
    url: BL_SERVERS[idx], node: "DIRECT", timeout: 3,
    headers: { "User-Agent": "LoonBlockSync/1.0" }
  }, function(err, resp, data) {
    var arr = null;
    try { var l = JSON.parse(data); if (Array.isArray(l)) arr = l; } catch(e) {}
    if (arr && !err) {
      try { $persistentStore.write(JSON.stringify(arr), BL_KEY); } catch(e2) {}
      log("blocklist server total " + arr.length + " (store rewritten) via " + BL_SERVERS[idx]);
      cb(toSet(arr));
    } else {
      log("blocklist " + BL_SERVERS[idx] + " failed (" + (err ? String(err) : ("status " + (resp && resp.status) )) + ")");
      tryServers(idx + 1, cb);
    }
  });
}
function fetchServerBlocklist(cb){ tryServers(0, cb); }

/* ---- 工具 ---- */
// 雪花 id 比较: 先比长度再比字典序(不依赖位数一致)
function idCmp(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return a.length < b.length ? -1 : 1;
  return a < b ? -1 : (a > b ? 1 : 0);
}
function isBlocked(m, bset) {
  var a = (m && m.author && m.author.id) ? String(m.author.id) : "";
  return !!(a && bset[a]);
}
function visible(arr, bset) {
  var out = [];
  for (var i = 0; i < arr.length; i++) if (!isBlocked(arr[i], bset)) out.push(arr[i]);
  return out;
}
// 回复了被拉黑者: 去掉引用(和旧版一致)。返回处理了几条
function scrubReplies(arr, bset) {
  var n = 0;
  for (var i = 0; i < arr.length; i++) {
    var m = arr[i];
    if (m && m.referenced_message && isBlocked(m.referenced_message, bset)) {
      delete m.referenced_message;
      delete m.message_reference;
      n++;
    }
  }
  return n;
}
// 占位: 保留 id/author(客户端分页游标和分组需要), 清空内容
function mask(m) {
  var c = JSON.parse(JSON.stringify(m));
  c.content = "[已屏蔽]";
  c.attachments = []; c.embeds = []; c.sticker_items = []; c.stickers = []; c.reactions = [];
  return c;
}

function fetchBefore(cursor, cb) {
  var h = {}, src = $request.headers || {};
  for (var k in src) {
    if (!src.hasOwnProperty(k)) continue;
    var lk = k.toLowerCase();
    if (lk === "host" || lk === "content-length" || lk === "content-type" || lk === "accept-encoding" ||
        lk === "connection" || lk === "if-none-match" || lk === "if-modified-since") continue;
    h[k] = src[k];   // 带上 Authorization / X-Super-Properties 等, 与客户端自身请求一致
  }
  var base = $request.url.split("?")[0];
  $httpClient.get({
    url: base + "?limit=" + FETCH_LIMIT + "&before=" + cursor + "&_bnfb=1",
    headers: h, timeout: 8
  }, function (err, resp, data) {
    if (err) { cb(String(err)); return; }
    if (!resp || resp.status !== 200) { cb("status " + (resp && resp.status)); return; }
    var arr = null;
    try { arr = JSON.parse(data); } catch (e) { cb("parse"); return; }
    if (!Array.isArray(arr)) { cb("not-array"); return; }
    cb(null, arr);
  });
}

/* ---- 消息过滤 ---- */
function processMessages(d, bset) {
  var url = $request.url;
  var hasBlocked = false;
  for (var i = 0; i < d.length; i++) if (isBlocked(d[i], bset)) { hasBlocked = true; break; }

  if (!hasBlocked) {                       // 本页没有拉黑者: 只可能需要清理回复引用
    if (scrubReplies(d, bset)) done({ body: JSON.stringify(d) }); else done({});
    return;
  }

  if (/[?&](after|around)=/.test(url)) {   // after/around: 不删除, 不改页大小
    var masked = d.map(function (m) { return isBlocked(m, bset) ? mask(m) : m; });
    scrubReplies(masked, bset);
    log("blockfilter other-mode masked page size=" + masked.length);
    done({ body: JSON.stringify(masked) });
    return;
  }

  var lm = /[?&]limit=(\d+)/.exec(url);
  var L = lm ? Math.max(1, parseInt(lm[1], 10) || 50) : 50;
  var pool = d.slice();                        // 新->老, 已取回的全部原始消息(含拉黑者)
  var cursor = String(d[d.length - 1].id);     // 下一次补拉的游标: 已取回的最老一条
  var ended = d.length < L;                    // 本页不足 limit => 频道真到头了
  var reqs = 0, t0 = Date.now();
  var kept = visible(pool, bset);

  function finish(reason) {
    var out, how;
    if (kept.length >= L) { out = kept.slice(0, L); how = "trim"; }
    else if (ended) { out = kept; how = "channel-end"; }
    else {
      // 补不满且频道还有历史: 用占位凑够 L 条, 保证客户端继续往上翻
      out = pool.slice(0, L).map(function (m) { return isBlocked(m, bset) ? mask(m) : m; });
      how = "placeholder(" + reason + ")";
    }
    scrubReplies(out, bset);
    log("blockfilter L=" + L + " pool=" + pool.length + " fetches=" + reqs + " -> " + out.length + " [" + how + "]");
    done({ body: JSON.stringify(out) });
  }

  function step() {
    if (kept.length >= L || ended) { finish("ok"); return; }
    if (reqs >= MAX_FETCH) { finish("max-fetch"); return; }
    if (Date.now() - t0 > BUDGET_MS) { finish("budget"); return; }
    reqs++;
    fetchBefore(cursor, function (err, arr) {
      try {
        if (err) { log("backfill err " + err); finish("err"); return; }
        var n0 = arr.length;
        if (n0 === 0) { ended = true; finish("empty"); return; }
        arr = arr.filter(function (m) { return m && m.id && idCmp(m.id, cursor) < 0; });
        if (!arr.length) { finish("no-progress"); return; }
        pool = pool.concat(arr);
        cursor = String(arr[arr.length - 1].id);   // 游标一定前进, 整页被拉黑也继续
        if (n0 < FETCH_LIMIT) ended = true;         // 返回不足请求数 => 到头
        kept = visible(pool, bset);
        step();
      } catch (e) { log("backfill exception " + e); done({}); }
    });
  }
  step();
}

function handleMessages(d) {
  if (!d.length) { done({}); return; }
  fetchServerBlocklist(function (srvSet) {
    try { processMessages(d, srvSet || getBlockedSet()); }
    catch (e) { log("process exception " + e); done({}); }
  });
}

/* ---- 表情目录采集 ---- */
function collectCatalog(d) {
  var found = [];
  (function walk(o, depth, key) {
    if (!o || typeof o !== "object" || depth > 12) return;
    if (Array.isArray(o)) { for (var i=0;i<o.length;i++) walk(o[i], depth+1, key); return; }
    var id = o.id, nm = o.name;
    var looksEmoji = (typeof id === "string" && /^\d{15,21}$/.test(id)) &&
                     (typeof nm === "string" && nm.length >= 1) &&
                     (o.animated === true || o.animated === false ||
                      key === "emoji" || key === "emojis" || key === "emoji_items");
    if (looksEmoji) found.push({ name: nm, id: id, animated: !!o.animated });
    for (var k in o) { if (o.hasOwnProperty(k)) walk(o[k], depth+1, k); }
  })(d, 0, "");

  if (found.length) {
    var cat = {};
    try { cat = JSON.parse($persistentStore.read(CAT_KEY) || "{}") || {}; } catch (e) { cat = {}; }
    var added = 0;
    for (var i=0;i<found.length;i++) {
      var f = found[i];
      if (!cat[f.name]) { cat[f.name] = { id: f.id, animated: f.animated }; added++; }
      else if (cat[f.name].id !== f.id) { cat[f.name] = { id: f.id, animated: f.animated }; added++; }
    }
    if (added) {
      var ok = $persistentStore.write(JSON.stringify(cat), CAT_KEY);
      log("catalog +(" + added + ") total=" + Object.keys(cat).length + (ok ? " saved" : " SAVE-FAIL"));
    }
  }
  done({});
}

/* ---- 入口 ---- */
try {
  var body = $response ? ($response.body || "") : "";
  var reqUrl = $request ? ($request.url || "") : "";
  if (!body || typeof body !== "string" || !ENABLED) { done({}); }
  else {
    var d = null;
    try { d = JSON.parse(body); } catch (e) {}
    if (!d) done({});
    else if (Array.isArray(d) && /\/channels\/\d+\/messages/.test(reqUrl)) {
      if (/[?&]_bnfb=1/.test(reqUrl)) done({});   // 脚本自己的补拉请求不再处理
      else handleMessages(d);
    } else collectCatalog(d);
  }
} catch (e) { log("fatal " + e); done({}); }
