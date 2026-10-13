/*
 Discord BlockList.record v1.0.0 — 拦 PUT/POST/DELETE /users/@me/relationships/{uid}
 iOS 拉黑: PUT body {"type":2}; 取消拉黑: DELETE
 写 $persistentStore("discord_blocked_users") — JSON 数组 [uid,...]
*/
var STORE_KEY = "discord_blocked_users";
var _EN = (typeof $argument === "object" && $argument && $argument.enabled !== undefined) ? $argument.enabled : true;
if (_EN === "false" || _EN === 0 || _EN === "0") _EN = false;
function log(m){ try{ console.log("[BlockList] "+m); }catch(e){} }

// 可选服务器同步: 地址由用户在插件面板 block_server 填入(空=不同步, 只记本地)
var _SYNC_URL = (function(){
  try { if (typeof $argument === "object" && $argument && typeof $argument.block_server === "string") return $argument.block_server.trim(); } catch(e) {}
  return "";
})();
function syncToServer(list) {
  if (!_SYNC_URL) { log("block_server empty, skip sync"); return; }
  if (!$httpClient) { log("no $httpClient, skip sync"); return; }
  $httpClient.put({
    url: _SYNC_URL, node: "DIRECT", timeout: 5,
    headers: { "Content-Type": "application/json", "User-Agent": "LoonBlockSync/1.0" },
    body: JSON.stringify(list)
  }, function (err, resp, data) {
    log("server sync -> " + (err ? ("ERR " + err) : (resp ? resp.status : "?")));
  });
}

if (_EN === false) {
  $done({});
} else {
  var url = $request ? ($request.url||"") : "";
  var m = url.match(/\/users\/@me\/relationships\/(\d{15,21})(\?|$)/);
  if (!m) {
    $done({});
  } else {
    var uid = m[1];
    var method = ($request.method||"").toUpperCase();
    var adding = (method === "PUT" || method === "POST");
    var skip = false;
    if (adding && $request.body) {
      try {
        var b = JSON.parse($request.body);
        if (typeof b.type === "number" && b.type !== 2) skip = true;
      } catch(e) {}
    }
    if (skip) {
      log("type!=2, skip (not a block)");
      $done({});
    } else {
      var list = [];
      try {
        var raw = $persistentStore.read(STORE_KEY);
        if (raw) list = JSON.parse(raw) || [];
      } catch(e) {}
      var idx = list.indexOf(uid);
      if (adding && idx < 0) {
        list.push(uid);
        $persistentStore.write(JSON.stringify(list), STORE_KEY);
        log("added " + uid + " total " + list.length);
        $notification.post("Discord 拉黑", "已加入黑名单", "uid " + uid + "  共 " + list.length + " 人");
        syncToServer(list);
      } else if (!adding && idx >= 0) {
        list.splice(idx, 1);
        $persistentStore.write(JSON.stringify(list), STORE_KEY);
        log("removed " + uid + " total " + list.length);
        $notification.post("Discord 拉黑", "已移出黑名单", "uid " + uid + "  共 " + list.length + " 人");
        syncToServer(list);
      }
      $done({});
    }
  }
}
