/*
 Discord FakeNitro.send v0.1.0 - Loon 发送侧表情转链接
 参考: Equicord fakeNitro preSend
 把 <a?:name:id> / :name: 换成 [name](cdn emoji url) markdown 链接
 :name: 无 id 时查 $persistentStore 目录(由 fakenitro-catalog.js 采集)
 用户要求: 不跳过本服表情
*/
var ARGS = (typeof $argument === "object" && $argument) ? $argument : {};
function CFGv(k, d) { return ARGS && ARGS[k] !== undefined && ARGS[k] !== null && ARGS[k] !== "" ? ARGS[k] : d; }

var STORE_KEY = "fakenitro_emoji_catalog";
var EMOJI_SIZE = parseInt(CFGv("emoji_size", "48"), 10) || 48;

function log(m) { try { console.log("[FakeNitro.send] " + m); } catch (e) {} }

var body = $request ? ($request.body || "") : "";
if (!body || typeof body !== "string") { log("no body"); $done({}); }
else {
  var d = null;
  try { d = JSON.parse(body); } catch (e) { log("not json"); $done({}); }
  if (!d || typeof d !== "object" || typeof d.content !== "string" || !d.content) { $done({}); }
  else {
    var catalog = {};
    try { catalog = JSON.parse($persistentStore.read(STORE_KEY) || "{}") || {}; } catch (e) { catalog = {}; }
    var content = d.content;
    var hits = 0;

    content = content.replace(/<(a?):([A-Za-z0-9_]+):(\d+)>/g, function (m, a, name, id) {
      hits++;
      var ext = a ? "gif" : "webp";
      var url = "https://cdn.discordapp.com/emojis/" + id + "." + ext + "?size=" + EMOJI_SIZE;
      return "[" + name + "](" + url + ")";
    });

    content = content.replace(/(^|[^a-zA-Z0-9_]):([A-Za-z0-9_]{2,32}):/g, function (m, pre, name) {
      var ent = catalog[name];
      if (!ent || !ent.id) return m;
      hits++;
      var ext = ent.animated ? "gif" : "webp";
      var url = "https://cdn.discordapp.com/emojis/" + ent.id + "." + ext + "?size=" + EMOJI_SIZE;
      return pre + "[" + name + "](" + url + ")";
    });

    if (hits > 0) {
      d.content = content;
      log("converted " + hits);
      $done({ body: JSON.stringify(d) });
    } else {
      $done({});
    }
  }
}
