(function () {
/*
 Discord Translate iOS v1.6 — 响应改写脚本 (Loon / Shadowrocket)
 改写 GET /api/v9/channels/{id}/messages 的 JSON + 论坛标题(threads[].name)。

 v1.6: 默认值调大 —— 同步翻译条数 8→30、单次最大翻译条数 10→30、每响应调用上限 16→30
       (一页 ?limit=25 一次翻完)。漏翻就把这三项一起调大(例如 50/50/50), 面板里改, 不用换插件;
       卡顿则把「同步翻译条数」「每响应调用上限」调小。
 v1.20: bilingual 参数真正生效(此前只在 ARG_ORDER/面板里, 主体从未读取 → 开关无效);
       修复谷歌分支 translationsList 索引错位(用全段全局下标, 有 URL/@/代码块时
       第二个可译段译文被丢弃 → 「@url: 之后的原文」原样留下); cache_on=false 现在真的生效
       (此前 cfgBaseInfo 没建 cacheOn 字段, 且关闭时会把已有缓存整个覆盖成 {});
 v1.4.4: 只同步翻 first_batch(默认8) 条, 其余立即放行记入 TranslateQueue:<chan> 由下次 cache 补翻 — 进频道不再阻塞
 v1.4.3: carry-over — 预算截断的消息记入 TranslateCarry:<chan>, 下次同频道加载优先补翻且 +8 预算; 修复 reqUrl 缺失时的崩溃
 v1.4.2: 缓存键统一(content 全文) + AI 分支写缓存 + 目标语言精确跳过(只跳目标语言, 日文→中文会翻) + 每响应调用预算 maxcalls(默认16, 可调)
 v1.4.0 设计(经 HAR 实证): 占位符标记会被谷歌翻译吞掉/改写, 导致还原失败回退原文。
  → 不再用占位符。按保护正则把 content 切成 prot(原样保留)/free(送翻) 段:
   - GOOGLE 引擎: 每个 free 段单独调用, 按原顺序拼回
   - AI 引擎: 所有 free 段用 @@SEG@@ 拼一块一次调用, 返回行数对上分段还原
*/
var ARG_ORDER = [
  "enabled", "probe", "debug", "target_lang", "engine", "provider",
  "api_key", "model", "custom_base_url",
  "cache_on", "maxmsgs", "maxcalls", "first_batch", "bilingual", "custom_prompt", "concurrency"
];

function bool(v, dflt) {
  if (v === true || v === false) return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return dflt;
}
function num(v, dflt) {
  var n = parseInt(v, 10);
  return isNaN(n) ? dflt : n;
}
function str(v, dflt) {
  return (v === null || v === undefined) ? dflt : String(v);
}
function cleanArgValue(v) {
  if (typeof v === "string" && /^\{\{\{[^}]*\}\}\}$/.test(v.trim())) return "";
  return v;
}

/* ---------- 跨平台兼容层(Loon / Shadowrocket / Surge 通用) ---------- */
/* Loon:  argument=[{enabled},{probe},...]  -> $argument 已是具名对象
   Shadowrocket / Surge: argument="{\"enabled\":true,...}" -> $argument 是 JSON 字符串
   位置数组(部分版本) -> 按 ARG_ORDER 映射。这里统一成具名对象。 */
function parseArgString(s) {
  var o = {}, parts = String(s).split("&");
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p) continue;
    var eq = p.indexOf("=");
    if (eq < 0) continue;
    var k = p.slice(0, eq), v = p.slice(eq + 1);
    try { k = decodeURIComponent(k); } catch (e) { }
    try { v = decodeURIComponent(v); } catch (e) { }
    /* 只转换布尔;数字一律保持字符串 —— 18 位雪花 ID 转 Number 会丢精度 */
    if (v === "true") v = true; else if (v === "false") v = false;
    o[k] = v;
  }
  return o;
}
var __ARG = (typeof $argument === "undefined") ? null : $argument;
if (typeof __ARG === "string") {
  var __s = __ARG.replace(/^\s+|\s+$/g, "");
  if (__s.charAt(0) === "{" || __s.charAt(0) === "[") {
    try { __ARG = JSON.parse(__s); } catch (e) { __ARG = null; }
  } else if (__s.indexOf("=") !== -1) {
    /* Shadowrocket 文档格式: argument=enabled=true&target_lang=zh-CN&... */
    __ARG = parseArgString(__s);
  } else { __ARG = null; }
}
if (Array.isArray(__ARG)) {
  var __pos = {};
  for (var __i = 0; __i < ARG_ORDER.length; __i++) { __pos[ARG_ORDER[__i]] = __ARG[__i]; }
  __ARG = __pos;
}
if (__ARG && typeof __ARG !== "object") __ARG = null;
if (__ARG && typeof __ARG === "object") {
  for (var __ak in __ARG) {
    if (Object.prototype.hasOwnProperty.call(__ARG, __ak)) __ARG[__ak] = cleanArgValue(__ARG[__ak]);
  }
}

function bodyText(b) {
  if (b === null || b === undefined) return null;
  if (typeof b === "string") return b;
  try {
    if (b && typeof b.length === "number" && typeof b.byteLength === "number" && typeof b.charCodeAt !== "function") {
      var s = "";
      for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i] & 0xff);
      try { return decodeURIComponent(escape(s)); } catch (e2) { return s; }
    }
    if (b && typeof b.byteLength === "number" && b.length === undefined) return bodyText(new Uint8Array(b));
  } catch (e3) { }
  try { return String(b); } catch (e4) { return null; }
}

var CFG = {};
for (var ai = 0; ai < ARG_ORDER.length; ai++) {
  var k = ARG_ORDER[ai];
  CFG[k] = __ARG ? __ARG[k] : null;
}
var DEBUG = bool(CFG.debug, false);
var PROBE = bool(CFG.probe, false);

function probeLog(stage, detail) {
  if (!PROBE) return;
  try { console.log("[Translate] " + stage + " " + detail); } catch (e) { }
}
function log(stage, detail) {
  if (!DEBUG) return;
  try { console.log({ plugin: "Translate", stage: stage, detail: detail }); } catch (e) { }
}

var DONE_CALLED = false;
function doneOnce(arg) {
  if (DONE_CALLED) return;
  DONE_CALLED = true;
  try { $done(arg); } catch (e) { }
}

var CJK_TARGETS = { "zh-CN": 1, "ja": 1, "ko": 1 };
var TARGET_IS_CJK = !!CJK_TARGETS[str(CFG.target_lang, "zh-CN")];
var BILINGUAL = bool(CFG.bilingual, false);
var CACHE_ON = bool(CFG.cache_on, true);
/* Discord 单条 content 上限 2000, 双语要拼 原文+换行+译文, 超长就只给译文(否则消息发不出去) */
var BILINGUAL_MAX = 1900;

function hasCJK(s) {
  return /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/.test(s);
}

/* 判断文本是否已是目标语言(不再送翻) —— 只有目标语言本身才跳过, 其他的(包括日文当目标是中文)送翻 */
var _HAN = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
var _KANA = /[\u3040-\u30FF]/;
var _HANGUL = /[\uAC00-\uD7AF\u1100-\u11FF]/;
function isTargetLang(s, tl) {
  if (!s) return false;
  var han = (s.match(/[\u4E00-\u9FFF\u3400-\u4DBF]/g) || []).length;
  var kana = (s.match(/[\u3040-\u30FF]/g) || []).length;
  var hangul = (s.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length;
  if (tl === "zh-CN" || tl === "zh-TW" || tl === "zh") {
    if (_KANA.test(s) || _HANGUL.test(s)) return false;
    if (han < 3) return false;
    // 中英混排(长英文部分)仍送翻, 由分段逻辑保护/翻译各自的段
    var words = (s.match(/[A-Za-z]{2,}/g) || []).length;
    return words < 6;
  }
  if (tl === "ja") return _KANA.test(s);
  if (tl === "ko") return _HANGUL.test(s);
  return false;  // 其他目标语言不启用本盾
}

/* ---------- 分段 ---------- */
function protect_placeholders(text) {
  var patterns = [
    /```[\s\S]*?```/g,
    /`[^`\n]+`/g,
    /<a?:[a-zA-Z0-9_]+:\d+>/g,
    /<@[!&]?\d+>/g,
    /<#\d+>/g,
    /<t:\d+(?::[a-zA-Z])?>/g,
    /@url:/g,
    /* 字符类里 ')' 与 ']' 都要转义, 且 ']' 必须写在最后收尾。
       v1.20 前写成 [^\s<>"\)]]+ —— 第一个 ] 就闭合了字符类, 尾部的 ] 变成字面量要求,
       结果 URL 一条都匹配不到 → URL 混进译文被引擎改写, 「@url: 之后的原文」露出来。 */
    /https?:\/\/[^\s<>"')\]]+/gi,
  ];
  var segs = [{ prot: false, text: text }];
  patterns.forEach(function (re) {
    var out = [];
    segs.forEach(function (s) {
      if (s.prot) { out.push(s); return; }
      var last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(s.text)) !== null) {
        if (m.index > last) out.push({ prot: false, text: s.text.slice(last, m.index) });
        out.push({ prot: true, text: m[0] });
        last = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
      }
      if (last < s.text.length) out.push({ prot: false, text: s.text.slice(last) });
    });
    segs = out;
  });
  var merged = [];
  segs.forEach(function (s) {
    if (s.text === "") return;
    var p = merged[merged.length - 1];
    if (p && p.prot === s.prot) p.text += s.text;
    else merged.push({ prot: s.prot, text: s.text });
  });
  return merged;
}

function restore_placeholders(segs, translatedList) {
  var out = "", ti = 0;
  segs.forEach(function (s) {
    if (s.prot) out += s.text;
    else {
      var t = translatedList[ti++];
      if (t && t.length) {
        /* 引擎返回的译文被 trim 过, 但自由段两端的空格是要保留的:
           没有它 "look at <@123>" 会拼成 "look at<@123>" —— 词和 @提及/URL 粘连。 */
        var lead = s.text.match(/^\s+/), tail = s.text.match(/\s+$/);
        out += (lead ? lead[0] : "") + t.replace(/^\s+|\s+$/g, "") + (tail ? tail[0] : "");
      } else out += s.text;
    }
  });
  return out;
}

function segFreeCount(segs) {
  var n = 0;
  segs.forEach(function (s) { if (!s.prot) n++; });
  return n;
}

/* 双语: 原文+换行+译文。译文与原文相同(本来就是目标语言)或超长时只给译文 */
function applyBilingual(original, translated) {
  if (!BILINGUAL) return translated;
  if (!translated || translated === original) return translated;
  if (original.length + translated.length + 1 > BILINGUAL_MAX) return translated;
  return original + "\n" + translated;
}

/* ---------- 翻译调用 ---------- */
var DEFAULT_PROMPT = "准确保留原意和语气，不增不减、不擅自发挥，避免直译，用目标语言最自然、口语化、接地气的表达快速翻译，只输出译文。";
function buildAIPrompt(targetLang, customPrompt) {
  var style = customPrompt && customPrompt.length ? customPrompt : DEFAULT_PROMPT;
  return "你是 Discord 聊天翻译器。检测源语言, 翻译成 " + targetLang + "。" + style +
    "\n如果原文包含 @@SEG@@ 分隔符, 请按相同顺序、相同数量分割译文, 保留 @@SEG@@ 原样。" +
    "\n只输出译文, 不要解释、不要引号。" +
    "\n如果原文已经是目标语言, 原样输出。";
}

function lanDirect(url) {
  var mh = url.match(/^https?:\/\/([^\/:]+)/i);
  return !!(mh && /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(mh[1]));
}
function providerBase(provider, customBase) {
  if (provider === "openrouter") return "https://openrouter.ai/api";
  if (provider === "自定义端点") return customBase;
  return "https://api.openai.com";
}


function fetchAIModel(cfg, callback) {
  var url = cfg.base.replace(/\/+$/, "") + "/v1/models";
  var opts = { url: url, headers: { "Authorization": "Bearer " + cfg.apiKey, "Accept": "application/json" }, timeout: 10000 };
  if (lanDirect(url)) { opts.node = "DIRECT"; opts.policy = "DIRECT"; }
  $httpClient.get(opts, function (err, resp, data) {
    if (err) { callback(null, "MODELS ERR " + String(err).slice(0, 120)); return; }
    try {
      var out = JSON.parse(data);
      if (out.error && out.error.message) { callback(null, "MODELS " + String(out.error.message).slice(0, 140)); return; }
      var ids = (out.data || []).map(function (x) { return x.id; });
      if (!ids || !ids.length) { callback(null, "MODELS EMPTY"); return; }
      try { probeLog("模型", String(ids.length) + " 个可用: " + ids.slice(0, 12).join(", ")); } catch (le) { }
      var prefer = ids.filter(function (id) {
        return /gpt-4o-mini|gpt-4\.1-mini|gemini|flash|mini|claude/i.test(id);
      });
      var model = prefer.length ? prefer[0] : ids[0];
      callback(model, null);
    } catch (e) { callback(null, "MODELS PARSE head=" + String(data || "").slice(0, 120)); }
  });
}

function translateAI(text, targetLang, cfg, done) {
  var finish = function () {
    var headers = { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.apiKey };
    if (cfg.provider === "openrouter") headers["HTTP-Referer"] = "https://github.com/Duncan588/LoonFakeNitro";
    var payload = {
      model: cfg.model,
      messages: [
        { role: "system", content: buildAIPrompt(targetLang, cfg.customPrompt) },
        { role: "user", content: text }
      ],
      temperature: 0,
      max_tokens: 2000,
      reasoning_effort: "minimal"
    };
    var url = cfg.base.replace(/\/+$/, "") + "/v1/chat/completions";
    var opts = { url: url, headers: headers, body: JSON.stringify(payload), timeout: 20000 };
    if (lanDirect(url)) { opts.node = "DIRECT"; opts.policy = "DIRECT"; }
    $httpClient.post(opts, function (err, resp, data) {
      if (err) { done(null, "AI ERR " + String(err).slice(0, 120)); return; }
      try {
        var out = JSON.parse(data);
        var c = out.choices && out.choices[0] && out.choices[0].message &&
                out.choices[0].message.content;
        if (typeof c === "string" && c.trim()) done(c.trim(), null);
        else {
          var msg = out.error && out.error.message ? out.error.message : (out.message || "");
          done(null, "AI BAD st=" + (resp && resp.status) + (msg ? " " + String(msg).slice(0, 120) : ""));
        }
      } catch (e) { done(null, "AI PARSE " + String(e && e.message || e).slice(0, 80) + " st=" + (resp && resp.status) + " head=" + String(data || "").slice(0, 200)); }
    });
  };
  if (cfg.model) { finish(); return; }
  var cached = null;
  try { cached = $persistentStore.read("TranslateAIModel:" + cfg.provider + ":" + cfg.base); } catch (e) { }
  if (cached) { cfg.model = cached; finish(); return; }
  fetchAIModel(cfg, function (model, er) {
    if (!model) { done(null, er); return; }
    cfg.model = model;
    try { $persistentStore.write(model, "TranslateAIModel:" + cfg.provider + ":" + cfg.base); } catch (e) { }
    log("AI model auto", { model: model });
    finish();
  });
}

var GG_HOSTS = [
  "https://translate.googleapis.com/translate_a/single?client=gtx",
  "https://clients5.google.com/translate_a/single?client=dict-chrome-ex",
  "https://translate.google.com/translate_a/single?client=gtx"
];
function ggParse(respBody) {
  var out = JSON.parse(respBody);
  var src = out && out[0];
  if (!src) return null;
  var text2 = "";
  for (var i = 0; i < src.length; i++) {
    if (src[i] && src[i][0]) text2 += src[i][0];
  }
  var tr = text2.trim();
  return tr || null;
}
function translateGoogle(text, targetLang, done) {
  var cachedHost = null;
  try { cachedHost = $persistentStore.read("TranslateGGHost"); } catch (e) { }
  var order = [];
  if (cachedHost) {
    for (var h = 0; h < GG_HOSTS.length; h++) if (GG_HOSTS[h].indexOf(cachedHost) !== -1) order.push(GG_HOSTS[h]);
  }
  for (var h2 = 0; h2 < GG_HOSTS.length; h2++) if (order.indexOf(GG_HOSTS[h2]) === -1) order.push(GG_HOSTS[h2]);
  var q = "&sl=auto&tl=" + encodeURIComponent(targetLang) + "&dt=t&q=" + encodeURIComponent(text);
  var idx = 0;
  var tryNext = function () {
    if (idx >= order.length) { probeLog("谷歌", "全部端点失败"); done(null, "GG ALL FAILED"); return; }
    var base = order[idx++];
    var hostTag = base.split("/")[2];
    $httpClient.get({ url: base + q, timeout: 6000 }, function (err, resp, data) {
      if (err) { probeLog("谷歌", hostTag + " 异常, 换下一个"); tryNext(); return; }
      try {
        var tr = ggParse(data);
        if (tr) {
          try { $persistentStore.write(hostTag, "TranslateGGHost"); } catch (e) { }
          done(tr, null);
        } else done(null, "GG EMPTY");
      } catch (pe) {
        probeLog("谷歌", hostTag + " 非JSON st=" + (resp && resp.status) + " head=" + String(data || "").slice(0, 100));
        tryNext();
      }
    });
  };
  tryNext();
}

/* ---------- 主流程 ---------- */
function cfgBaseInfo() {
  var c = {
    targetLang: str(CFG.target_lang, "zh-CN"),
    engine: str(CFG.engine, "auto"),
    provider: str(CFG.provider, ""),
    apiKey: str(CFG.api_key, ""),
    model: str(CFG.model, ""),
    customPrompt: str(CFG.custom_prompt, ""),
    customBase: str(CFG.custom_base_url, ""),
    cacheOn: bool(CFG.cache_on, true)
  };
  c.base = providerBase(c.provider, c.customBase);
  probeLog("AI 端点", "provider=" + c.provider + " base=" + c.base);
  return c;
}

function translateForumNames(data, cfg, finishCb) {
  var names = [];
  for (var i = 0; i < (data.threads || []).length; i++) {
    var th = data.threads[i];
    if (th && typeof th.name === "string" && th.name.length >= 2 && !hasCJK(th.name)) names.push({ idx: i, name: th.name });
  }
  if (!names.length) { finishCb(); return; }
  var engine = cfg.engine;
  if (engine === "auto") engine = cfg.apiKey ? "ai" : "google";
  var next = function () {
    if (!names.length) { finishCb(); return; }
    var item = names.shift();
    var handler = function (tr, er) {
      if (tr) data.threads[item.idx].name = tr;
      else if (er && !allState.firstErr) allState.firstErr = { engine: engine, detail: er };
      probeLog("论坛标题", "idx=" + item.idx + (er ? " err=" + er : " ok"));
      next();
    };
    if (engine === "ai" && cfg.apiKey) translateAI(item.name, cfg.targetLang, cfg, handler);
    else translateGoogle(item.name, cfg.targetLang, handler);
  };
  next();
}

var reqUrl = $request ? $request.url : "?";
var status = $response ? $response.status : 0;
var body = bodyText($response ? $response.body : null);
var CHID = ((typeof reqUrl === "string" && reqUrl.match(/\/channels\/(\d+)/)) || [])[1] || "c";
probeLog("响应", "status=" + status);

if (bool(CFG.enabled, true) === false) {
  doneOnce({});
} else if (!body || typeof body !== "string") {
  doneOnce({});
} else if (!/\/api\/v\d+\/channels\/\d+\/messages(\?|$|\/)|\/api\/v\d+\/channels\/\d+\/threads\/search|\/api\/v\d+\/channels\/\d+\/post-data/i.test(reqUrl)) {
  doneOnce({});
} else {
  var data = null;
  try { data = JSON.parse(body); }
  catch (e) { doneOnce({}); }

  if (!DONE_CALLED && data !== null) {
    var allState = { firstErr: null };
    var cfg = cfgBaseInfo();
    var changed = [];
    var CACHE = {};
    try { if (cfg.cacheOn !== false) CACHE = JSON.parse($persistentStore.read("TranslateCache") || "{}") || {}; } catch (e) { }

    /* 论坛 payload: threads/search 数组 / post-data 对象 map */
    if (!Array.isArray(data)) {
      var pendingF = 0, anyChanged = false;
      var finishForum = function () {
        pendingF--;
        if (pendingF > 0) return;
        doneOnce(anyChanged ? { body: JSON.stringify(data) } : {});
      };
      var engineF = cfg.engine;
      if (engineF === "auto") engineF = cfg.apiKey ? "ai" : "google";
      function trOne(text, cb) {
        var h = function (tr, er) {
          if (er && !allState.firstErr) allState.firstErr = { engine: engineF, detail: er };
          cb(tr);
        };
        if (engineF === "ai" && cfg.apiKey) translateAI(text, cfg.targetLang, cfg, h);
        else translateGoogle(text, cfg.targetLang, h);
      }
      var targets = [];   // {set: fn, text}
      if (Array.isArray(data.threads)) {
        data.threads.forEach(function (th, i) {
          if (th && typeof th.name === "string" && th.name.length >= 2 && !isTargetLang(th.name, cfg.targetLang))
            targets.push({ text: th.name, set: function (v) { th.name = v; } });
        });
        (data.first_messages || []).forEach(function (fm, i) {
          if (fm && typeof fm.content === "string" && fm.content.length >= 2 && !isTargetLang(fm.content, cfg.targetLang))
            targets.push({ text: fm.content, set: function (v) { fm.content = applyBilingual(fm.content, v); } });
        });
      } else if (data.threads && typeof data.threads === "object") {
        Object.keys(data.threads).forEach(function (tid) {
          var td = data.threads[tid];
          var fm = td && td.first_message;
          if (fm && typeof fm.content === "string" && fm.content.length >= 2 && !isTargetLang(fm.content, cfg.targetLang))
            targets.push({ text: fm.content, set: function (v) { fm.content = applyBilingual(fm.content, v); } });
        });
      }
      var toGo = targets.filter(function (t) { return t.text && t.text.length <= 300; });
      probeLog("论坛", "targets=" + toGo.length);
      pendingF = toGo.length;
      toGo.forEach(function (t) {
        trOne(t.text, function (tr, er) {
          probeLog("论坛条目", "t=" + t.text.slice(0, 24) + (er ? " err=" + er : (tr ? " ok→" + tr.slice(0, 24) : " null")));
          if (tr) { anyChanged = true; t.set(tr); changed.push("forum:" + t.text.slice(0, 18)); }
          finishForum();
        });
      });
      if (!toGo.length) doneOnce({});
      return;
    }

    var cfgMax = num(CFG.maxmsgs, 30);
    var candidates = [];
    for (var mi = 0; mi < data.length && (cfgMax <= 0 || candidates.length < cfgMax); mi++) {
      var m = data[mi];
      if (!m || typeof m !== "object") continue;
      var content = m.content;
      if (typeof content !== "string" || content.length < 2 || content.length > 4000) continue;
      if (CACHE[content]) {
        m.content = applyBilingual(content, CACHE[content]);
        changed.push("cache:" + m.id);
        continue;
      }
      if (isTargetLang(content, cfg.targetLang)) continue;
      candidates.push({ msg: m, prot: protect_placeholders(content), freeN: 0, translated: null });
      candidates[candidates.length - 1].freeN = segFreeCount(candidates[candidates.length - 1].prot);
    }

    /* v1.4.4: 感知延迟根治 — 只同步翻 first_batch(默认8) 条, 其余立即放行, 由下次响应 cache 命中 */
    var FIRST_BATCH = num(CFG.first_batch, 30);
    if (FIRST_BATCH > 0 && candidates.length > FIRST_BATCH) {
      // 保存未翻的 content keys 到队列, 下次的 cache 会命中
      var QUEUE = {};
      candidates.slice(FIRST_BATCH).forEach(function (c) { QUEUE[c.msg.content] = true; });
      try { $persistentStore.write(JSON.stringify(QUEUE), "TranslateQueue:" + CHID); } catch (e) { }
      candidates = candidates.slice(0, FIRST_BATCH);
    }

    /* v1.4.3: carry-over — 上次截断未翻的优先 */
    var CARRY = {};
    try { CARRY = JSON.parse($persistentStore.read("TranslateCarry:" + CHID) || "{}") || {}; } catch (e) { }
    var hadCarry = false;
    for (var ck in CARRY) { if (CARRY.hasOwnProperty(ck) && CARRY[ck]) { hadCarry = true; break; } }
    if (hadCarry) {
      candidates.sort(function (a, b) {
        var ca = a.msg.content, cb2 = b.msg.content;
        var wa = CARRY[ca] ? 0 : 1, wb = CARRY[cb2] ? 0 : 1;
        return wa - wb;
      });
    }
    var HAS_QUEUE = false;
    try { HAS_QUEUE = !!$persistentStore.read("TranslateQueue:" + CHID); } catch (e) { }
    var CALL_BUDGET = num(CFG.maxcalls, 30);
    var effBudget = CALL_BUDGET + (hadCarry ? 8 : 0) + (HAS_QUEUE ? 4 : 0);

    var engine = cfg.engine;
    if (engine === "auto") engine = cfg.apiKey ? "ai" : "google";
    var pending = candidates.length;

    function allDone() {
      if (pending > 0 || candidates.length === 0) { /* wait */ }
      if (pending > 0) return;
        if (changed.length === 0 && allState.firstErr) {
          probeLog("AI配置失败", "engine=" + allState.firstErr.engine + " " + allState.firstErr.detail);
        }
      try {
        var cks = Object.keys(CACHE);
        if (cks.length > 800) { for (var ci = 0; ci < cks.length - 600; ci++) delete CACHE[cks[ci]]; }
      } catch (e) { }
      /* 缓存关掉时 CACHE 是空对象, 直接写会把已有缓存整个抹掉 → 读的时候也必须跳过 */
      if (CACHE_ON) { try { $persistentStore.write(JSON.stringify(CACHE), "TranslateCache"); } catch (e) { } }
      /* v1.4.3: 只保留这轮真没翻的 carry */
      var rest = {};
      for (var rk in CARRY) {
        if (CARRY.hasOwnProperty(rk) && !CACHE[rk]) rest[rk] = true;
      }
      try { $persistentStore.write(JSON.stringify(rest), "TranslateCarry:" + CHID); } catch (e) { }
      log("处理完成", { changed: changed });
      doneOnce({ body: JSON.stringify(data) });
    }

    if (!candidates.length) {
      log("无候选", { changed: changed });
      doneOnce({ body: JSON.stringify(data) });
    } else {
      var CALL_BUDGET = num(CFG.maxcalls, 30);      // 每次响应最多发起的网络调用数
      var callCount = 0;
      var pending = candidates.length;
      var segIdxStack = null;

      var CONC = Math.max(1, num(CFG.concurrency, engine === "ai" ? 4 : 8));
      var nextIdx = 0, running = 0;

      function candidateDone(c) {
        var fullTranslated = c.translationsList && c.translationsList.some(function (x) { return x; });
        if (fullTranslated) {
          /* 缓存里只存纯译文: 双语模式下原文是动态拼的, 不能把「原文+译文」写进缓存
             —— 下次缓存命中直接替换 content 会出现「原文+译文」再拼一次原文。 */
          var merged = restore_placeholders(c.prot, c.translationsList);
          CACHE[c.msg.content] = merged;
          changed.push(c.engineName + ":" + c.msg.id);
          c.msg.content = applyBilingual(c.msg.content, merged);
        } else {
          c.msg.content = restore_placeholders(c.prot, c.translationsList);
        }
        probeLog("候选结束", "id=" + c.msg.id + " engine=" + c.engineName + (fullTranslated ? "" : " 无译文"));
        pending--;
        running--;
        pump();
      }

      /* 有界并发: 同时最多 CONC 条候选在翻, 不再逐条串行 */
      function pump() {
        if (pending === 0) { allDone(); return; }
        while (running < CONC && nextIdx < candidates.length) {
          var cc = candidates[nextIdx++];
          running++;
          startCandidate(cc);
        }
      }

      function startCandidate(c) {
        c._done = true;
        if (callCount >= effBudget) {
          CARRY[c.msg.content] = true;
          probeLog("预算", "已达上限 " + effBudget + ", 记入 carry");
          c.translationsList = new Array(c.freeN);
          candidateDone(c);
          return;
        }
        var freeSegs = c.prot.filter(function (s) { return !s.prot; });
        c.translationsList = new Array(c.freeN);
        var engineName = engine === "ai" && cfg.apiKey ? "ai" : "google";
        c.engineName = engineName;
        callCount++;
        if (engineName === "ai") {
          var joined = freeSegs.map(function (s) { return s.text; }).join("\n\n@@SEG@@\n\n");
          translateAI(joined, cfg.targetLang, cfg, function (tr, er) {
            if (er && !allState.firstErr) allState.firstErr = { engine: "ai", detail: er };
            if (tr) {
              var parts = tr.split("@@SEG@@");
              if (parts.length === c.freeN) {
                for (var p = 0; p < c.freeN; p++) c.translationsList[p] = parts[p].trim();
              } else {
                for (var p2 = 0; p2 < c.freeN; p2++) c.translationsList[p2] = tr;
              }
            }
            candidateDone(c);
          });
        } else {
          var si = 0;
          var stepSeg = function () {
            if (si >= freeSegs.length) { candidateDone(c); return; }
            var sg = freeSegs[si];
            /* 索引必须是「可译段序号」si —— translationsList 由 restore_placeholders 按 ti++ 消费。
               v1.20 前这里用 c.prot.indexOf(sg)(全段全局下标), 有 URL/@/代码块时第二个可译段
               写到越界位置被丢弃 → 该段译文丢失, 原文原样留下。 */
            var segIdx = si;
            translateGoogle(sg.text, cfg.targetLang, function (tr, er) {
              if (tr) c.translationsList[segIdx] = tr;
              else if (er && !allState.firstErr) allState.firstErr = { engine: "google", detail: er };
              si++;
              stepSeg();
            });
          };
          stepSeg();
        }
      }

      pump();
    }
  }
}
})();
