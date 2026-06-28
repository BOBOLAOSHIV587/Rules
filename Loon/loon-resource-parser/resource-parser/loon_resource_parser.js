/**
 * $resourceType: 解析器脚本自带全局变量，资源类型，枚举，详见下方
 * $resource: 解析器脚本自带全局变量，资源内容，string
 * $resourceUrl: 解析器脚本自带全局变量，资源url，string
 *
 * 资源类型
 * 0:config
 * 1:nodes
 * 2:rules
 * 3:rewrites
 * 4:scripts
 * 5:plugin
 *
 * Author: mc2u
 * Repository: https://github.com/mc2u/Loon
 *
 * 功能：
 * - 添加节点名前缀 / 后缀
 * - 去除节点名中的 Emoji
 * - 普通文本替换
 * - 按关键词自定义节点排序
 * - 开启 `ua` 时使用自定义 User-Agent 重新请求原始订阅
 *
 * 参数来源：
 * - 解析器插件 `[Argument]`
 * - 每次执行只使用本次插件设置传入的参数
 * - 如果 Loon 未调用解析器脚本，则脚本内任何参数和逻辑都不会执行
 */

var type = $resourceType;
var pre = "";
var suf = "";
var emoji = false;
var rename = "";
var sort = "";
var ua = false;
var userAgent = "";
var noCache = false;

function str(v) {
  return v == null ? "" : String(v);
}

function bool(v) {
  if (v === true) return true;
  var s = str(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}

function normalizeText(s) {
  s = str(s);
  if (s && s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function cleanEmoji(text) {
  return str(text)
    .replace(/[\u{1F1E0}-\u{1F1FF}]|[\u{1F300}-\u{1FAFF}]|[\u{1FB00}-\u{1FBFF}]|[\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

var renamePairs = [];

function parseRename() {
  renamePairs = [];
  if (!rename) return;
  var items = str(rename).split(",");
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (!item) continue;
    var idx = item.indexOf(":");
    if (idx === -1) continue;
    var from = item.slice(0, idx).trim();
    var to = item.slice(idx + 1).trim();
    if (from) renamePairs.push([from, to]);
  }
}

function applyRename(name) {
  var n = str(name);
  for (var i = 0; i < renamePairs.length; i++) {
    n = n.split(renamePairs[i][0]).join(renamePairs[i][1]);
  }
  return n;
}

var sortKeywords = [];
var hasSort = false;

function parseSort() {
  sortKeywords = [];
  hasSort = false;
  if (!sort) return;
  var items = str(sort).split(",");
  for (var i = 0; i < items.length; i++) {
    var kw = items[i].trim();
    if (kw) sortKeywords.push(kw);
  }
  hasSort = sortKeywords.length > 0;
}

function getSortIndex(name) {
  if (!hasSort) return -1;
  var n = str(name);
  for (var i = 0; i < sortKeywords.length; i++) {
    if (n.indexOf(sortKeywords[i]) !== -1) return i;
  }
  return sortKeywords.length;
}

function sortItemsByName(items) {
  if (!hasSort || !items.length) return items;
  items.sort(function(a, b) {
    var ai = getSortIndex(a.name);
    var bi = getSortIndex(b.name);
    if (ai !== bi) return ai - bi;
    return a.index - b.index;
  });
  return items;
}

function modifyName(name) {
  var n = str(name);
  if (emoji) n = cleanEmoji(n);
  if (rename) n = applyRename(n);
  if (pre) n = pre + n;
  if (suf) n = n + suf;
  return n;
}

function base64DecodeUnicode(s) {
  try {
    var binary = atob(s);
    var bytes = [];
    for (var i = 0; i < binary.length; i++) {
      bytes.push("%" + ("00" + binary.charCodeAt(i).toString(16)).slice(-2));
    }
    return decodeURIComponent(bytes.join(""));
  } catch (e) { return null; }
}


function looksLikeBase64(text) {
  var s = str(text).replace(/\s+/g, "");
  if (!s || s.length < 16) return false;
  if (s.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/=]+$/.test(s);
}

function processLoonStyle(text) {
  var raw = str(text);
  if (!raw) return "";
  var lines = raw.split("\n");
  var output = [];
  var items = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line || line.charAt(0) === "#") { output.push(line); continue; }
    var eqPos = line.indexOf("=");
    if (eqPos > 0) {
      items.push({
        index: items.length,
        name: modifyName(line.substring(0, eqPos).trim()),
        value: line.substring(eqPos + 1).trim()
      });
      continue;
    }
    output.push(line);
  }
  items = sortItemsByName(items);
  for (var j = 0; j < items.length; j++) {
    output.push(items[j].name + "=" + items[j].value);
  }
  console.log("[解析器] 已修改节点数: " + items.length);
  return output.join("\n");
}

function extractRemarkName(line) {
  var m = str(line).match(/[?&]remark=([^&#]*)/);
  if (!m) return null;
  var name = m[1];
  try { name = decodeURIComponent(name); } catch (e) {}
  return name;
}

function processBase64UriList(text) {
  var compact = str(text).replace(/\s+/g, "");
  var decoded = base64DecodeUnicode(compact);
  if (!decoded) return null;
  var lines = normalizeText(decoded).split("\n");
  var sortable = [];
  var passthrough = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var hashPos = line.lastIndexOf("#");
    if (hashPos > -1 && hashPos < line.length - 1) {
      var left = line.slice(0, hashPos + 1);
      var frag = line.slice(hashPos + 1);
      var oldName = "";
      try { oldName = decodeURIComponent(frag); } catch (e) { oldName = frag; }
      sortable.push({ index: sortable.length, name: modifyName(oldName), left: left });
    } else {
      var remarkName = extractRemarkName(line);
      if (remarkName) {
        sortable.push({ index: sortable.length, name: modifyName(remarkName), left: line + "#" });
      } else {
        passthrough.push({ raw: line });
      }
    }
  }
  sortable = sortItemsByName(sortable);
  var merged = sortable.concat(passthrough);
  var output = [];
  for (var k = 0; k < merged.length; k++) {
    output.push(merged[k].left
      ? merged[k].left + encodeURIComponent(merged[k].name)
      : merged[k].raw);
  }
  var plain = output.join("\n");
  console.log("[解析器] 已修改节点数: " + sortable.length);
  return plain;
}

function quoteValue(v) {
  return '"' + str(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

function yamlScalar(v) {
  v = str(v).trim();
  if (!v) return "";
  var c = v.charAt(0);
  if ((c === '"' && v.charAt(v.length - 1) === '"') || (c === "'" && v.charAt(v.length - 1) === "'")) {
    return v.slice(1, -1);
  }
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  return v;
}

function splitFlowItems(s) {
  var items = [];
  var cur = "";
  var quote = "";
  var depth = 0;
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (quote) {
      cur += ch;
      if (ch === quote && s.charAt(i - 1) !== "\\") quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      items.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) items.push(cur.trim());
  return items;
}

function parseFlowMap(s) {
  s = str(s).trim();
  if (s.charAt(0) === "{" && s.charAt(s.length - 1) === "}") s = s.slice(1, -1);
  var obj = {};
  var pairs = splitFlowItems(s);
  for (var i = 0; i < pairs.length; i++) {
    var part = pairs[i];
    var quote = "";
    var depth = 0;
    var idx = -1;
    for (var j = 0; j < part.length; j++) {
      var ch = part.charAt(j);
      if (quote) {
        if (ch === quote && part.charAt(j - 1) !== "\\") quote = "";
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") depth--;
      else if (ch === ":" && depth === 0) { idx = j; break; }
    }
    if (idx < 0) continue;
    var key = part.slice(0, idx).trim();
    var value = part.slice(idx + 1).trim();
    if (value.charAt(0) === "{" && value.charAt(value.length - 1) === "}") obj[key] = parseFlowMap(value);
    else obj[key] = yamlScalar(value);
  }
  return obj;
}

function parseClashYamlProxies(text) {
  var lines = normalizeText(text).split("\n");
  var inProxies = false;
  var baseIndent = -1;
  var current = null;
  var stack = [];
  var nodes = [];

  function finishNode() {
    if (current && current.name && current.type) nodes.push(current);
    current = null;
    stack = [];
  }

  function setNested(path, key, value) {
    var obj = current;
    for (var i = 0; i < path.length; i++) {
      var p = path[i];
      if (!obj[p]) obj[p] = {};
      obj = obj[p];
    }
    obj[key] = value;
  }

  for (var i = 0; i < lines.length; i++) {
    var raw = lines[i];
    var trimmed = raw.trim();
    if (!trimmed || trimmed.charAt(0) === "#") continue;
    var mIndent = raw.match(/^\s*/);
    var indent = mIndent ? mIndent[0].length : 0;

    if (!inProxies) {
      if (/^proxies\s*:\s*$/.test(trimmed)) {
        inProxies = true;
        baseIndent = indent;
      }
      continue;
    }

    if (indent <= baseIndent && /^[A-Za-z0-9_-]+\s*:/.test(trimmed)) {
      finishNode();
      break;
    }

    var item = raw.match(/^\s*-\s+(.*)$/);
    if (item) {
      finishNode();
      current = {};
      stack = [];
      var rest = item[1].trim();
      if (rest.charAt(0) === "{" && rest.charAt(rest.length - 1) === "}") {
        current = parseFlowMap(rest);
        finishNode();
        continue;
      }
      var mm = rest.match(/^([^:]+):\s*(.*)$/);
      if (mm) current[mm[1].trim()] = yamlScalar(mm[2]);
      continue;
    }

    if (!current) continue;
    var kv = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!kv) continue;
    var key = kv[1].trim();
    var value = kv[2];
    while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
    var path = stack.map(function(x) { return x.key; });
    if (value.trim() === "") {
      setNested(path, key, {});
      stack.push({ indent: indent, key: key });
    } else {
      setNested(path, key, yamlScalar(value));
    }
  }
  finishNode();
  return nodes;
}

function boolOption(key, value) {
  if (value === undefined || value === null || value === "") return null;
  return key + "=" + (value === true || str(value).toLowerCase() === "true" ? "true" : "false");
}

function convertClashProxy(node, index) {
  var type = str(node.type).toLowerCase();
  var name = modifyName(node.name || ("node-" + index));
  var server = node.server;
  var port = node.port;
  var opts = [];
  var line = "";

  if (!server || !port) return null;

  if (type === "anytls") {
    line = name + " = AnyTLS," + server + "," + port + "," + quoteValue(node.password || "");
    var skip = boolOption("skip-cert-verify", node["skip-cert-verify"]);
    if (skip) opts.push(skip);
    if (node.sni) opts.push("sni=" + node.sni);
    var udp = boolOption("udp", node.udp);
    if (udp) opts.push(udp);
    opts.push("block-quic=false");
    return line + (opts.length ? "," + opts.join(",") : "");
  }

  if (type === "hysteria2" || type === "hy2") {
    line = name + " = Hysteria2," + server + "," + port + "," + quoteValue(node.auth || node.password || "");
    var skipHy2 = boolOption("skip-cert-verify", node["skip-cert-verify"]);
    if (skipHy2) opts.push(skipHy2);
    if (node.sni) opts.push("sni=" + node.sni);
    var udpHy2 = boolOption("udp", node.udp);
    if (udpHy2) opts.push(udpHy2);
    if (node["obfs-password"]) opts.push("salamander-password=" + node["obfs-password"]);
    return line + (opts.length ? "," + opts.join(",") : "");
  }

  if (type === "vless") {
    line = name + " = VLESS," + server + "," + port + "," + quoteValue(node.uuid || "");
    var network = str(node.network).toLowerCase();
    if (network === "ws") {
      opts.push("transport=ws");
      var wsOpts = node["ws-opts"] || {};
      var headers = wsOpts.headers || node["ws-headers"] || {};
      var path = wsOpts.path || node["ws-path"];
      var host = headers.Host || headers.host || node.host;
      if (path) opts.push("path=" + path);
      if (host) opts.push("host=" + host);
    } else {
      opts.push("transport=tcp");
      if (node.flow && str(node.flow) !== "null") opts.push("flow=" + node.flow);
      var reality = node["reality-opts"] || {};
      if (reality["public-key"]) opts.push("public-key=" + quoteValue(reality["public-key"]));
      if (reality["short-id"]) opts.push("short-id=" + reality["short-id"]);
    }
    if (node.tls !== undefined) opts.push("over-tls=" + (node.tls ? "true" : "false"));
    else opts.push("over-tls=false");
    if (node.servername) opts.push("sni=" + node.servername);
    else if (node.sni) opts.push("sni=" + node.sni);
    var skip2 = boolOption("skip-cert-verify", node["skip-cert-verify"]);
    if (skip2) opts.push(skip2);
    var udp2 = boolOption("udp", node.udp);
    if (udp2) opts.push(udp2);
    return line + "," + opts.join(",");
  }

  return null;
}

function processClashYaml(text) {
  if (!/^\s*proxies\s*:/m.test(text)) return null;
  var proxies = parseClashYamlProxies(text);
  if (!proxies.length) return null;
  var items = [];
  var skipped = 0;
  for (var i = 0; i < proxies.length; i++) {
    var line = convertClashProxy(proxies[i], i + 1);
    if (line) {
      var name = line.split("=")[0].trim();
      items.push({ index: items.length, name: name, line: line });
    } else {
      skipped++;
    }
  }
  sortItemsByName(items);
  console.log("[解析器] 已转换 YAML 节点数: " + items.length + (skipped ? ", 跳过: " + skipped : ""));
  return items.map(function(x) { return x.line; }).join("\n");
}
function processResource(content) {
  var raw = normalizeText(content);
  var configParts = [];
  if (ua) configParts.push("ua");
  if (emoji) configParts.push("emoji");
  if (rename) configParts.push("rename=" + rename);
  if (pre) configParts.push("pre=" + pre);
  if (suf) configParts.push("suf=" + suf);
  if (sort) configParts.push("sort=" + sort);
  console.log("[解析器] 当前配置: " + (configParts.length ? configParts.join(", ") : "无"));
  console.log("[解析器] 订阅内容长度: " + raw.length);
  var trimmed = raw.trim();
  if (!trimmed) return "";
  if (looksLikeBase64(trimmed)) {
    var base64Result = processBase64UriList(trimmed);
    if (base64Result !== null) return base64Result;
  }
  var yamlResult = processClashYaml(trimmed);
  if (yamlResult !== null) return yamlResult;
  return processLoonStyle(trimmed);
}

function refetchWithUserAgent() {
  if (typeof $httpClient === "undefined" || !$httpClient) {
    console.log("[解析器] 当前环境不支持自定义 UA 拉取，已回退默认内容");
    finish(typeof $resource !== "undefined" ? $resource : "");
    return;
  }
  if (typeof $resourceUrl === "undefined" || !$resourceUrl) {
    console.log("[解析器] 缺少资源地址，已回退默认内容");
    finish(typeof $resource !== "undefined" ? $resource : "");
    return;
  }
  var headers = { "User-Agent": userAgent };
  if (noCache) headers["Cache-Control"] = "no-cache";
  var req = {
    url: String($resourceUrl),
    headers: headers
  };
  console.log("[解析器] 已启用自定义 UA: " + userAgent);
  $httpClient.get(req, function(error, response, data) {
    if (error || !data) {
      console.log("[解析器] 自定义 UA 拉取失败，已回退默认内容");
      finish(typeof $resource !== "undefined" ? $resource : "");
      return;
    }
    console.log("[解析器] 自定义 UA 拉取成功");
    finish(data);
  });
}

var typeName = { 0: "config", 1: "nodes", 2: "rules", 3: "rewrites", 4: "scripts", 5: "plugin" };

function finish(content) {
  console.log("[解析器] 资源类型: " + (typeName[type] || type));
  var result = type === 1 ? processResource(content) : str(content);
  console.log("[解析器] 处理完成");
  $done(result);
}

(function init() {
  var arg = typeof $argument !== "undefined" ? $argument : null;
  if (arg && typeof arg === "object") {
    if (arg.pre !== undefined) pre = str(arg.pre);
    if (arg.suf !== undefined) suf = str(arg.suf);
    if (arg.emoji !== undefined) emoji = bool(arg.emoji);
    if (arg.rename !== undefined) rename = str(arg.rename);
    if (arg.sort !== undefined) sort = str(arg.sort);
    if (arg.ua !== undefined) ua = bool(arg.ua);
    if (arg.userAgent !== undefined) userAgent = str(arg.userAgent);
    if (arg.noCache !== undefined) noCache = bool(arg.noCache);
  }
  parseRename();
  parseSort();
  console.log("[解析器] 已读取插件参数");
  if (ua && type === 1) refetchWithUserAgent();
  else finish(typeof $resource !== "undefined" ? $resource : "");
})();
