var type = $resourceType;
var pre = "";
var suf = "";
var emoji = false;
var rename = "";
var sort = "";
var exc = "";
var ua = false;
var userAgent = "";
var noCache = false;
var importNodes = "";
var tlsProfile = "";
var importItemsCache = null;
var importExcluded = 0;
var importMerged = false;
var processStartedAt = Date.now();
var processResultMeta = { nodeCount: 0, subCount: 0, reason: "", excluded: 0 };
var processStartupLogged = false;
var processIsRetry = false;
function describeConfig() {
  var parts = [];
  if (ua) parts.push("自定义 UA");
  if (emoji) parts.push("去除 Emoji");
  if (rename) parts.push("文本替换=" + rename);
  if (pre) parts.push("节点前缀=" + pre);
  if (suf) parts.push("节点后缀=" + suf);
  if (sort) parts.push("节点排序=" + sort);
  if (exc) parts.push("排除节点=" + exc);
  if (tlsProfile && str(tlsProfile).trim() !== "不处理") parts.push("指纹=" + tlsProfile);
  return parts.join("，");
}
function logJoin(parts) {
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var item = parts[i];
    if (!item) continue;
    if (typeof item === "string") { out.push(item); continue; }
    if (item.zero && !item.value) continue;
    out.push(item.key ? item.key + "=" + item.value : String(item.value));
  }
  return out.join("，");
}
function logTag() {
  return processIsRetry ? "[回退]" : "";
}
function logStartupOnce() {
  if (processStartupLogged) return;
  processStartupLogged = true;
  var cfgText = describeConfig();
  console.log("[解析器][启动] 资源类型=" + (typeName[type] || type) + (cfgText ? "，配置：" + cfgText : ""));
  if (type !== 1) console.log("[解析器][启动] 非 nodes 资源，原样返回");
}
function str(v) {
  return v == null ? "" : String(v);
}
function bool(v) {
  return parseBooleanLike(v) === true;
}
function normalizeText(s) {
  s = str(s);
  if (s && s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function cleanEmoji(text) {
  return str(text)
    .replace(/[\u{1F1E0}-\u{1F1FF}]|[\u{1F300}-\u{1FAFF}]|[\u{1FB00}-\u{1FBFF}]|[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u200B-\u200F\u2028-\u202E\u2060-\u2064\u2066-\u2069\uFE00-\uFE0F\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
var renamePairs = [];
function splitEscaped(s, sep) {
  var out = [];
  var cur = "";
  var esc = false;
  s = str(s);
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (esc) {
      cur += "\\" + ch;
      esc = false;
      continue;
    }
    if (ch === "\\") {
      esc = true;
      continue;
    }
    if (ch === sep) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (esc) cur += "\\";
  out.push(cur);
  return out;
}
function indexOfUnescaped(s, ch) {
  var esc = false;
  s = str(s);
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === ch) return i;
  }
  return -1;
}
function unescapeRenameText(s) {
  return str(s)
    .replace(/\\\\/g, "\u0000")
    .replace(/\\:/g, ":")
    .replace(/\\,/g, ",")
    .replace(/\u0000/g, "\\");
}
function parseRename() {
  renamePairs = [];
  if (!rename) return;
  var items = splitEscaped(rename, ",");
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (!item) continue;
    var idx = indexOfUnescaped(item, ":");
    if (idx === -1) continue;
    var from = unescapeRenameText(item.slice(0, idx)).trim();
    var to = unescapeRenameText(item.slice(idx + 1)).trim();
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
var excludeKeywords = [];
var hasExclude = false;
function parseExclude() {
  excludeKeywords = [];
  hasExclude = false;
  if (!exc) return;
  var items = str(exc).split(",");
  for (var i = 0; i < items.length; i++) {
    var kw = items[i].trim();
    if (kw) excludeKeywords.push(kw);
  }
  hasExclude = excludeKeywords.length > 0;
}
function isExcludedName(name) {
  if (!hasExclude) return false;
  var n = str(name);
  for (var i = 0; i < excludeKeywords.length; i++) {
    if (n.indexOf(excludeKeywords[i]) !== -1) return true;
  }
  return false;
}
function filterExcludedItems(items) {
  if (!hasExclude || !items.length) return { kept: items, dropped: 0 };
  var kept = [];
  for (var i = 0; i < items.length; i++) {
    if (!isExcludedName(items[i].name)) kept.push(items[i]);
  }
  return { kept: kept, dropped: items.length - kept.length };
}
function modifyName(name) {
  var original = str(name);
  var n = original;
  if (emoji) n = cleanEmoji(n);
  if (rename) n = applyRename(n);
  if (pre) n = pre + n;
  if (suf) n = n + suf;
  if (!n.trim() && original.trim()) return original;
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
function looksLikeLooseBase64(text) {
  var s = str(text).replace(/\s+/g, "");
  if (!s || s.length < 16) return false;
  if (!/^[A-Za-z0-9+/_=-]+$/.test(s)) return false;
  var core = s.replace(/=+$/, "");
  if (!core) return false;
  if (core.length % 4 === 1) return false;
  return s.indexOf("-") !== -1 || s.indexOf("_") !== -1 || s.length % 4 !== 0;
}
var uriFingerprintProxy = {
  chrome: "chrome",
  chrome147: "chrome",
  "safari-ios18": "safari",
  "safari-ios-26": "safari"
};
function forceUriTlsProfile(line, forced) {
  var core = str(line).trim();
  var schemeMatch = /^([A-Za-z][A-Za-z0-9+.-]*):\/\//.exec(core);
  if (!schemeMatch) return null;
  var proto = schemeMatch[1].toLowerCase();
  if (!clashForcedProfileTypes[proto]) return null;
  if (/^(vmess|ssr):\/\//i.test(core)) return null;
  var uriValue = uriFingerprintProxy[forced];
  if (!uriValue) return null;
  var hashPos = core.lastIndexOf("#");
  var head = hashPos >= 0 ? core.slice(0, hashPos) : core;
  var frag = hashPos >= 0 ? core.slice(hashPos) : "";
  var qPos = head.indexOf("?");
  var base = qPos >= 0 ? head.slice(0, qPos) : head;
  var query = qPos >= 0 ? head.slice(qPos + 1) : "";
  var rawParts = query ? query.split("&") : [];
  var seen = false;
  var kept = [];
  for (var i = 0; i < rawParts.length; i++) {
    if (!rawParts[i]) continue;
    var eq = rawParts[i].indexOf("=");
    var k = (eq >= 0 ? rawParts[i].slice(0, eq) : rawParts[i]).toLowerCase();
    if (k === "tls-profile" || k === "fingerprint" || k === "fp") {
      if (seen) continue;
      seen = true;
      kept.push((eq >= 0 ? rawParts[i].slice(0, eq) : rawParts[i]) + "=" + encodeURIComponent(uriValue));
    } else {
      kept.push(rawParts[i]);
    }
  }
  if (!seen) kept.push("fp=" + encodeURIComponent(uriValue));
  var next = base + "?" + kept.join("&") + frag;
  return next === line ? line : next;
}
function forceLoonTlsProfile(value, forced) {
  var s = str(value);
  var proto = s.split(",", 1)[0].trim().toLowerCase();
  if (!clashForcedProfileTypes[proto]) return null;
  var stripped = s.replace(/,\s*tls-profile\s*=\s*("[^"]*"|[^,]*)/i, "");
  return stripped + ",tls-profile=" + forced;
}
function sectionHeaderOf(line) {
  var m = /^\s*\[([A-Za-z][A-Za-z0-9 _.-]*)\]\s*(?:#.*)?$/.exec(str(line));
  return m ? m[1].toLowerCase() : null;
}
function processLoonStyle(text) {
  var raw = str(text);
  var imports = takeImportItems();
  var forcedProfile = clashForcedTlsProfile();
  var section = null;
  var newlineMatch = /\r\n|\r|\n/.exec(raw);
  var newline = newlineMatch ? newlineMatch[0] : "\n";
  var lines = raw.split(/\r\n|\r|\n/);
  var slots = [];
  var items = [];
  var renamed = 0;
  var uriNormalized = 0;
  var uriRenamed = 0;
  var profileForced = 0;
  var uriProfileForced = 0;
  var unnamedCount = 0;
  for (var i = 0; i < lines.length; i++) {
    var trimmed = lines[i].trim();
    if (!trimmed) continue;
    var header = sectionHeaderOf(trimmed);
    if (header !== null) {
      section = header === "proxy" ? "proxy" : "other";
      continue;
    }
    if (section === "other") continue;
    if (isGenericUriLine(trimmed)) {
      var uriItem = buildUriItem(lines[i], forcedProfile);
      if (!uriItem) continue;
      if (uriItem.normalized) uriNormalized++;
      if (uriItem.renamed) uriRenamed++;
      if (uriItem.profileForced) uriProfileForced++;
      if (!uriItem.named) { unnamedCount++; lines[i] = uriItem.line; continue; }
      items.push({ index: items.length, name: uriItem.name, line: uriItem.line });
      slots.push(i);
      continue;
    }
    if (trimmed.charAt(0) === "#") continue;
    if (!looksLikeLoonNodeLine(trimmed)) continue;
    var eqPos = trimmed.indexOf("=");
    if (eqPos <= 0) continue;
    var originalNamePart = trimmed.substring(0, eqPos);
    var originalName = originalNamePart.trim();
    var nodeName = sanitizeNameText(modifyName(originalName));
    var nodeValue = trimmed.substring(eqPos + 1).trim();
    var separator = originalNamePart === originalName ? "=" : " = ";
    if (nodeName !== originalName) renamed++;
    if (forcedProfile) {
      var forcedValue = forceLoonTlsProfile(nodeValue, forcedProfile);
      if (forcedValue !== null && forcedValue !== nodeValue) {
        nodeValue = forcedValue;
        profileForced++;
      }
    }
    items.push({ index: items.length, name: nodeName, value: nodeValue, line: nodeName + separator + nodeValue });
    slots.push(i);
  }
  var keptItems = items;
  var keptSlots = slots;
  var excluded = 0;
  if (hasExcludeConfig() && items.length) {
    keptItems = [];
    keptSlots = [];
    for (var fi = 0; fi < items.length; fi++) {
      if (isExcludedName(items[fi].name)) {
        excluded++;
        lines[slots[fi]] = "";
      } else {
        keptItems.push(items[fi]);
        keptSlots.push(slots[fi]);
      }
    }
  }
  processResultMeta.nodeCount = keptItems.length + imports.length + unnamedCount;
  processResultMeta.subCount = keptItems.length + unnamedCount;
  processResultMeta.excluded = excluded;
  if (!renamed && !uriRenamed && !uriNormalized && !profileForced && !uriProfileForced && !hasNameMutation() && !hasSort && !hasExcludeConfig() && !imports.length) {
    console.log("[解析器]" + logTag() + "[Loon] 订阅节点=" + slots.length + "，处理=原样透传");
    return raw;
  }
  var merged = sortItemsByName(mergeItems(keptItems, imports));
  if (section !== null && imports.length && !slots.length) {
    lines = appendSectionLines(lines, merged);
  } else {
    lines = insertItemsIntoLines(lines, keptSlots, merged);
  }
  console.log("[解析器]" + logTag() + "[Loon] 订阅节点=" + items.length);
  return lines.join(newline);
}
function appendSectionLines(lines, merged) {
  var extra = plainLines(merged);
  var proxyAt = -1;
  for (var i = 0; i < lines.length; i++) {
    if (sectionHeaderOf(lines[i].trim()) === "proxy") proxyAt = i;
  }
  if (proxyAt < 0) {
    var tail = [];
    for (var t = lines.length - 1; t >= 0; t--) {
      if (lines[t].trim()) break;
      tail.unshift(lines.pop());
    }
    lines.push("[Proxy]");
    for (var k = 0; k < extra.length; k++) lines.push(extra[k]);
    for (var u = 0; u < tail.length; u++) lines.push(tail[u]);
    return lines;
  }
  var insertAt = proxyAt + 1;
  while (insertAt < lines.length && sectionHeaderOf(lines[insertAt].trim()) === null) insertAt++;
  var head = lines.slice(0, insertAt);
  var rest = lines.slice(insertAt);
  return head.concat(extra, rest);
}
function hasNameMutation() {
  return emoji || !!rename || !!pre || !!suf;
}
function hasExcludeConfig() {
  return hasExclude;
}
function parseImportNodes(value) {
  var text = normalizeText(value);
  var compact = text.replace(/\s+/g, "");
  if (compact.length >= 16 && /^[A-Za-z0-9+/_=-]+$/.test(compact)) {
    var decoded = base64DecodeLoose(compact);
    if (decoded && looksLikeNodeResource(decoded)) {
      text = normalizeText(decoded);
      console.log("[解析器][导入] 识别为 Base64，已解码");
    }
  }
  var lines = text.split("\n");
  var nodes = [];
  var invalid = 0;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line || line.charAt(0) === "#" || line.charAt(0) === ";") continue;
    if (!isGenericUriLine(line) && !looksLikeLoonNodeLine(line)) {
      invalid++;
      continue;
    }
    nodes.push(line);
  }
  if (invalid) console.log("[解析器][导入] 跳过无法识别的行数=" + invalid);
  return nodes;
}
function buildLoonImportItem(line, forcedProfile) {
  var trimmed = str(line).trim();
  var eq = trimmed.indexOf("=");
  if (eq <= 0) return null;
  var origPart = trimmed.substring(0, eq);
  var origName = origPart.trim();
  var value = trimmed.substring(eq + 1).trim();
  if (!value) return null;
  var sep = origPart === origName ? "=" : " = ";
  var mutated = sanitizeNameText(modifyName(origName));
  var name = mutated || origName;
  var profileForced = false;
  if (forcedProfile) {
    var forced = forceLoonTlsProfile(value, forcedProfile);
    if (forced !== null && forced !== value) { value = forced; profileForced = true; }
  }
  return { line: name + sep + value, name: name, profileForced: profileForced };
}
function collectImportItems() {
  if (importItemsCache !== null) return importItemsCache;
  importItemsCache = [];
  var nodes = parseImportNodes(importNodes);
  if (!nodes.length) {
    if (str(importNodes).trim()) console.log("[解析器][导入] 未发现有效节点行，结果=忽略");
    return importItemsCache;
  }
  var items = [];
  var forcedProfile = clashForcedTlsProfile();
  for (var i = 0; i < nodes.length; i++) {
    var importedItem = isGenericUriLine(nodes[i])
      ? buildUriItem(nodes[i], forcedProfile)
      : buildLoonImportItem(nodes[i], forcedProfile);
    if (!importedItem) continue;
    items.push({ index: items.length, name: importedItem.name, line: importedItem.line });
  }
  var importFiltered = filterExcludedItems(items);
  importExcluded = importFiltered.dropped;
  items = importFiltered.kept;
  for (var j = 0; j < items.length; j++) items[j].index = j;
  console.log("[解析器][导入] 导入节点=" + items.length);
  importItemsCache = items;
  return importItemsCache;
}
function takeImportItems() {
  if (importMerged) return [];
  importMerged = true;
  return collectImportItems().slice();
}
function mergeItems(baseItems, extraItems) {
  var all = baseItems.concat(extraItems);
  for (var i = 0; i < all.length; i++) all[i].index = i;
  return all;
}
function plainLines(items) {
  var out = [];
  for (var i = 0; i < items.length; i++) out.push(items[i].line);
  return out;
}
function appendPlainLines(result, extraItems) {
  var extra = plainLines(extraItems);
  if (!extra.length) return result;
  var base = str(result).replace(/\s+$/, "");
  return base ? base + "\n" + extra.join("\n") : extra.join("\n");
}
function insertItemsIntoLines(lines, slots, merged) {
  var next = 0;
  for (var j = 0; j < slots.length; j++) lines[slots[j]] = merged[next++].line;
  if (next >= merged.length) return lines;
  var extra = [];
  for (; next < merged.length; next++) extra.push(merged[next].line);
  if (!slots.length) {
    var kept = [];
    for (var k = 0; k < lines.length; k++) if (lines[k] !== "") kept.push(lines[k]);
    return kept.concat(extra);
  }
  var insertAt = slots[slots.length - 1] + 1;
  return lines.slice(0, insertAt).concat(extra, lines.slice(insertAt));
}
function isGenericUriLine(line) {
  return /^[A-Za-z][A-Za-z0-9+.-]*:\/\/\S+$/.test(str(line).trim());
}
function decodeUriComponentLoose(value) {
  try { return decodeURIComponent(value); } catch (e) { return value; }
}
function base64DecodeLoose(value) {
  var s = str(value).replace(/\s+/g, "");
  if (!s) return null;
  s = decodeUriComponentLoose(s);
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  var remainder = s.length % 4;
  if (remainder === 1) return null;
  if (remainder) s += "====".slice(0, 4 - remainder);
  return base64DecodeUnicode(s);
}
function encodeBase64Utf8(text, urlSafe, unpadded) {
  if (typeof btoa !== "function") return null;
  var encoded;
  try { encoded = btoa(unescape(encodeURIComponent(str(text)))); } catch (e) { return null; }
  if (urlSafe) encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_");
  if (unpadded) encoded = encoded.replace(/=+$/, "");
  return encoded;
}
function wrapUriRenderer(raw, core, renderCore) {
  var start = raw.indexOf(core);
  var prefix = start > 0 ? raw.slice(0, start) : "";
  var suffix = raw.slice(start + core.length);
  return function(name) {
    var rendered = renderCore(name);
    return rendered === null ? raw : prefix + rendered + suffix;
  };
}
function replaceUriCore(raw, core, next) {
  var start = raw.indexOf(core);
  var prefix = start > 0 ? raw.slice(0, start) : "";
  var suffix = raw.slice(start + core.length);
  return prefix + next + suffix;
}
function parseQueryPairs(query) {
  var pairs = [];
  var parts = str(query).split("&");
  for (var i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    var eq = parts[i].indexOf("=");
    pairs.push({
      key: eq === -1 ? parts[i] : parts[i].slice(0, eq),
      value: eq === -1 ? "" : parts[i].slice(eq + 1)
    });
  }
  return pairs;
}
function queryValueOf(pairs, names) {
  for (var i = 0; i < pairs.length; i++) {
    for (var j = 0; j < names.length; j++) {
      if (pairs[i].key.toLowerCase() === names[j]) return pairs[i].value;
    }
  }
  return null;
}
function parseNonStandardAuthority(decoded) {
  if (decoded === null || str(decoded).indexOf("@") === -1) return null;
  var text = str(decoded);
  var atPos = text.lastIndexOf("@");
  var head = text.slice(0, atPos);
  var tail = text.slice(atPos + 1);
  if (!tail) return null;
  var host = "";
  var portText = "";
  if (tail.charAt(0) === "[") {
    var close = tail.indexOf("]");
    if (close < 0) return null;
    host = tail.slice(1, close);
    var after = tail.slice(close + 1);
    if (after.charAt(0) !== ":") return null;
    portText = after.slice(1);
  } else {
    var colon = tail.lastIndexOf(":");
    if (colon <= 0) return null;
    host = tail.slice(0, colon);
    portText = tail.slice(colon + 1);
    if (host.indexOf(":") === -1 && !/^[A-Za-z0-9._-]+$/.test(host)) return null;
  }
  if (!host || !portText) return null;
  var isIpv6 = host.indexOf(":") !== -1;
  if (isIpv6) {
    if (!/^[0-9A-Fa-f:.]+$/.test(host)) return null;
  } else if (!/^[A-Za-z0-9._-]+$/.test(host)) {
    return null;
  }
  if (!/^\d{1,5}$/.test(portText)) return null;
  var port = Number(portText);
  if (!(port >= 1 && port <= 65535)) return null;
  var prefix = "";
  var credential = head;
  var sep = head.indexOf(":");
  if (sep > 0) {
    prefix = head.slice(0, sep);
    credential = head.slice(sep + 1);
  }
  if (!credential) return null;
  return { prefix: prefix, credential: credential, host: host, port: str(port), ipv6: isIpv6 };
}
function uriHost(authority) {
  if (!authority) return "";
  return authority.ipv6 ? "[" + authority.host + "]" : authority.host;
}
function appendMissingQuery(query, additions) {
  var out = str(query);
  for (var i = 0; i < additions.length; i++) {
    if (!additions[i]) continue;
    out += (out ? "&" : "") + additions[i];
  }
  return out;
}
function truthyParam(value) {
  if (value === null) return false;
  var parsed = parseBooleanLike(value);
  return parsed === null ? str(value).trim() !== "" : parsed;
}
function parseBooleanLike(value) {
  var s = str(value).trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  return null;
}
function normalizeNonStandardUri(rawLine) {
  var raw = str(rawLine);
  var core = raw.trim();
  if (!isGenericUriLine(core)) return rawLine;
  var schemeMatch = /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([\s\S]+)$/.exec(core);
  if (!schemeMatch) return rawLine;
  var scheme = schemeMatch[1].toLowerCase();
  var body = schemeMatch[2];
  var fragment = null;
  var hashIndex = body.indexOf("#");
  if (hashIndex >= 0) {
    fragment = body.slice(hashIndex + 1);
    body = body.slice(0, hashIndex);
  }
  var query = "";
  var queryIndex = body.indexOf("?");
  if (queryIndex >= 0) {
    query = body.slice(queryIndex + 1);
    body = body.slice(0, queryIndex);
  }
  if (!body || body.indexOf("@") >= 0) return rawLine;
  var decodedBody = base64DecodeLoose(body);
  if (decodedBody === null) return rawLine;
  if (scheme === "vmess" && str(decodedBody).charAt(0) === "{") return rawLine;
  var authority = parseNonStandardAuthority(decodedBody);
  if (!authority) return rawLine;
  var pairs = parseQueryPairs(query);
  var name = fragment !== null ? decodeUriComponentLoose(fragment) : "";
  if (!str(name).trim()) {
    var nameKeys = ["remark", "remarks", "ps"];
    for (var n = 0; n < nameKeys.length && !str(name).trim(); n++) {
      var rawName = queryValueOf(pairs, [nameKeys[n]]);
      if (rawName !== null) name = str(decodeUriComponentLoose(rawName)).trim();
    }
  } else {
    name = str(name).trim();
  }
  var hash = name ? "#" + encodeURIComponent(name) : "";
  var endpoint = authority.credential + "@" + uriHost(authority) + ":" + authority.port;
  var normalized;
  if (scheme === "vless") {
    var extra = [];
    if (queryValueOf(pairs, ["encryption"]) === null) extra.push("encryption=none");
    if (queryValueOf(pairs, ["security"]) === null) {
      if (queryValueOf(pairs, ["pbk", "publickey", "public-key"]) !== null) extra.push("security=reality");
      else if (truthyParam(queryValueOf(pairs, ["tls"]))) extra.push("security=tls");
    }
    if (queryValueOf(pairs, ["flow"]) === null && str(queryValueOf(pairs, ["xtls"])).trim() === "2") {
      extra.push("flow=xtls-rprx-vision");
    }
    normalized = "vless://" + endpoint + "?" + appendMissingQuery(query, extra) + hash;
  } else if (scheme === "trojan") {
    normalized = "trojan://" + endpoint + (query ? "?" + query : "") + hash;
  } else if (scheme === "vmess") {
    var vmessObject = {
      v: "2", ps: name, add: authority.host, port: authority.port, id: authority.credential,
      aid: "0", scy: authority.prefix && authority.prefix !== "auto" ? authority.prefix : "auto",
      net: "tcp", type: "none", host: "", path: "", tls: "", sni: ""
    };
    var vmessFields = {
      aid: "aid", alterid: "aid", scy: "scy", cipher: "scy",
      net: "net", network: "net", type: "type", headertype: "type",
      host: "host", path: "path", sni: "sni", servername: "sni", peer: "sni",
      alpn: "alpn", fp: "fp", ps: "ps", remark: "ps", remarks: "ps",
      obfsparam: "host", wspath: "path", "ws-path": "path", "ws-host": "host"
    };
    for (var i = 0; i < pairs.length; i++) {
      var key = pairs[i].key;
      var lower = key.toLowerCase();
      var value = str(decodeUriComponentLoose(pairs[i].value));
      if (lower === "tls") {
        vmessObject.tls = truthyParam(pairs[i].value) ? "tls" : "";
        continue;
      }
      if (lower === "obfs") {
        var obfsNet = value.toLowerCase();
        if (obfsNet === "websocket" || obfsNet === "ws") vmessObject.net = "ws";
        else if (obfsNet === "http" || obfsNet === "h2") vmessObject.net = "http";
        continue;
      }
      var target = vmessFields[lower];
      if (target) {
        vmessObject[target] = value;
        continue;
      }
      if (key && vmessObject[key] === undefined) vmessObject[key] = value;
    }
    vmessObject.ps = name || str(vmessObject.ps);
    var payload = encodeBase64Utf8(JSON.stringify(vmessObject), false, false);
    if (payload === null) return rawLine;
    normalized = "vmess://" + payload;
  } else {
    var credential = authority.prefix ? authority.prefix + ":" + authority.credential : authority.credential;
    normalized = scheme + "://" + credential + "@" + uriHost(authority) + ":" + authority.port +
      (query ? "?" + query : "") + hash;
  }
  return replaceUriCore(raw, core, normalized);
}
function normalizeUriNameLine(line, name) {
  var raw = str(line);
  var core = raw.trim();
  if (!isGenericUriLine(core)) return raw;
  var hashPos = core.lastIndexOf("#");
  if (hashPos >= 0) {
    var replaced = core.slice(0, hashPos + 1) + encodeURIComponent(name);
    return replaced === core ? raw : replaceUriCore(raw, core, replaced);
  }
  return replaceUriCore(raw, core, core + "#" + encodeURIComponent(name));
}
function syncRemarkName(line, name) {
  var text = str(line);
  if (!/[?&](?:remarks?)=/i.test(text)) return text;
  return text.replace(/([?&](?:remarks?)=)([^&#]*)/gi, function(match, key) {
    return key + encodeURIComponent(name);
  });
}
function renderUriNodeLine(line, accessor, name) {
  if (!str(name).trim()) return line;
  if (accessor.source === "vmess" || accessor.source === "ssr") {
    if (!hasNameMutation()) return line;
    var rendered = accessor.render(name);
    return rendered === null ? line : rendered;
  }
  if (accessor.source === "hash" && !hasNameMutation()) return line;
  return syncRemarkName(normalizeUriNameLine(line, name), name);
}
function looksLikeLoonNodeLine(line) {
  var m = /^([^=\r\n]+?)\s*=\s*([A-Za-z][A-Za-z0-9+.-]*)\s*,/.exec(str(line));
  if (!m) return false;
  if (/^(?:dns|doh|doq|doh3)-server$/i.test(m[1].trim())) return false;
  return true;
}
function getUriNameAccessor(rawLine) {
  var raw = str(rawLine);
  var core = raw.trim();
  if (!isGenericUriLine(core)) return null;
  var hashPos = core.lastIndexOf("#");
  if (hashPos >= 0) {
    var fragment = core.slice(hashPos + 1);
    return {
      source: "hash",
      name: decodeUriComponentLoose(fragment),
      render: wrapUriRenderer(raw, core, function(name) {
        return core.slice(0, hashPos + 1) + encodeURIComponent(name);
      })
    };
  }
  var remarkMatch = /([?&]remarks?=)([^&#]*)/i.exec(core);
  if (remarkMatch) {
    var remarkStart = remarkMatch.index + remarkMatch[1].length;
    var remarkEnd = remarkStart + remarkMatch[2].length;
    return {
      source: "remark",
      name: decodeUriComponentLoose(remarkMatch[2]),
      render: wrapUriRenderer(raw, core, function(name) {
        return core.slice(0, remarkStart) + encodeURIComponent(name) + core.slice(remarkEnd);
      })
    };
  }
  var vmessMatch = /^vmess:\/\/([^?#\s]+)/i.exec(core);
  if (vmessMatch) {
    var vmessText = base64DecodeUnicode(vmessMatch[1]);
    if (vmessText !== null) {
      try {
        var vmessObject = JSON.parse(vmessText);
        if (vmessObject && typeof vmessObject === "object" && vmessObject.ps !== undefined && vmessObject.ps !== null) {
          return {
            source: "vmess",
            name: str(vmessObject.ps),
            render: wrapUriRenderer(raw, core, function(name) {
              vmessObject.ps = name;
              var payload = null;
              try {
                var binary = unescape(encodeURIComponent(JSON.stringify(vmessObject)));
                payload = btoa(binary);
              } catch (err) { return null; }
              return payload === null ? null : core.slice(0, vmessMatch.index + 8) + payload + core.slice(vmessMatch.index + 8 + vmessMatch[1].length);
            })
          };
        }
      } catch (e) {}
    }
  }
  var ssrMatch = /^ssr:\/\/([^?#\s]+)/i.exec(core);
  if (ssrMatch) {
    var ssrPayload = ssrMatch[1];
    var ssrText = base64DecodeLoose(ssrPayload);
    var ssrRemark = ssrText === null ? null : /([?&]remarks=)([^&]*)/i.exec(ssrText);
    if (ssrRemark) {
      var ssrName = base64DecodeLoose(ssrRemark[2]);
      if (ssrName !== null) {
        return {
          source: "ssr",
          name: ssrName,
          render: wrapUriRenderer(raw, core, function(name) {
            var nested = encodeBase64Utf8(name, true, true);
            if (nested === null) return null;
            var nestedStart = ssrRemark.index + ssrRemark[1].length;
            var nextText = ssrText.slice(0, nestedStart) + nested + ssrText.slice(nestedStart + ssrRemark[2].length);
            var payload = encodeBase64Utf8(nextText, /[-_]/.test(ssrPayload), !/=/.test(ssrPayload));
            return payload === null ? null : core.slice(0, ssrMatch.index + 6) + payload + core.slice(ssrMatch.index + 6 + ssrPayload.length);
          })
        };
      }
    }
  }
  return null;
}
function processBase64UriList(text) {
  var compact = str(text).replace(/\s+/g, "");
  var decoded = base64DecodeLoose(compact);
  if (!decoded) return null;
  var normalized = normalizeText(decoded);
  var lines = normalized.split("\n");
  var named = [];
  var slots = [];
  var renamed = 0;
  var uriNormalized = 0;
  var forcedProfile = clashForcedTlsProfile();
  var uriProfileForced = 0;
  var section = null;
  var profileForced = 0;
  var foundNodes = 0;
  var bUnnamedCount = 0;
  for (var i = 0; i < lines.length; i++) {
    var bTrimmed = lines[i].trim();
    if (!bTrimmed) continue;
    var bHeader = sectionHeaderOf(bTrimmed);
    if (bHeader !== null) {
      section = bHeader === "proxy" ? "proxy" : "other";
      continue;
    }
    if (section === "other") continue;
    if (!looksLikeLoonNodeLine(bTrimmed) && !isGenericUriLine(bTrimmed)) continue;
    if (looksLikeLoonNodeLine(bTrimmed)) {
      var bEq = bTrimmed.indexOf("=");
      var bOrigPart = bTrimmed.substring(0, bEq);
      var bOrig = bOrigPart.trim();
      var bName = sanitizeNameText(modifyName(bOrig));
      var bValue = bTrimmed.substring(bEq + 1).trim();
      var bSep = bOrigPart === bOrig ? "=" : " = ";
      if (bName !== bOrig) renamed++;
      foundNodes++;
      if (forcedProfile) {
        var bForced = forceLoonTlsProfile(bValue, forcedProfile);
        if (bForced !== null && bForced !== bValue) {
          bValue = bForced;
          profileForced++;
        }
      }
      named.push({ index: named.length, name: bName, line: bName + bSep + bValue });
      slots.push(i);
      continue;
    }
    var bUriItem = buildUriItem(lines[i], forcedProfile);
    if (!bUriItem) continue;
    foundNodes++;
    if (bUriItem.normalized) uriNormalized++;
    if (bUriItem.renamed) renamed++;
    if (bUriItem.profileForced) uriProfileForced++;
    if (!bUriItem.named) { bUnnamedCount++; lines[i] = bUriItem.line; continue; }
    named.push({ index: named.length, name: bUriItem.name, line: bUriItem.line });
    slots.push(i);
  }
  if (!foundNodes) return null;
  var imports = takeImportItems();
  var keptNamed = named;
  var keptSlots = slots;
  var excluded = 0;
  if (hasExcludeConfig() && named.length) {
    keptNamed = [];
    keptSlots = [];
    for (var bfi = 0; bfi < named.length; bfi++) {
      if (isExcludedName(named[bfi].name)) {
        excluded++;
        lines[slots[bfi]] = "";
      } else {
        keptNamed.push(named[bfi]);
        keptSlots.push(slots[bfi]);
      }
    }
  }
  processResultMeta.nodeCount = keptNamed.length + imports.length + bUnnamedCount;
  processResultMeta.subCount = keptNamed.length + bUnnamedCount;
  processResultMeta.excluded = excluded;
  if (!renamed && !uriNormalized && !uriProfileForced && !profileForced && !hasNameMutation() && !hasSort && !hasExcludeConfig() && !imports.length) {
    console.log("[解析器]" + logTag() + "[Base64] 订阅节点=" + named.length + "，处理=原样透传");
    return normalized;
  }
  var merged = sortItemsByName(mergeItems(keptNamed, imports));
  var outLines;
  if (section !== null && imports.length && !slots.length) {
    outLines = appendSectionLines(lines, merged);
  } else {
    outLines = insertItemsIntoLines(lines, keptSlots, merged);
  }
  console.log("[解析器]" + logTag() + "[Base64] 订阅节点=" + named.length);
  return outLines.join("\n");
}
function yamlScalar(v) {
  v = str(v).trim();
  if (!v) return "";
  var c = v.charAt(0);
  if ((c === '"' && v.charAt(v.length - 1) === '"') || (c === "'" && v.charAt(v.length - 1) === "'")) {
    return v.slice(1, -1);
  }
  if (c === "[" && v.charAt(v.length - 1) === "]") {
    var inner = v.slice(1, -1).trim();
    if (!inner) return [];
    var parts = splitFlowItems(inner);
    var arr = [];
    for (var i = 0; i < parts.length; i++) arr.push(yamlScalar(parts[i]));
    return arr;
  }
  if (c === "{" && v.charAt(v.length - 1) === "}") return parseFlowMap(v);
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
    var key = clashCanonicalKey(unquoteYamlKey(part.slice(0, idx).trim()));
    var value = part.slice(idx + 1).trim();
    if (value.charAt(0) === "{" && value.charAt(value.length - 1) === "}") obj[key] = parseFlowMap(value);
    else obj[key] = yamlScalar(value);
  }
  return obj;
}
var yamlStringFields = {};
(function () {
  var keys = [
    "name", "password", "uuid", "id", "psk", "auth", "auth-str", "auth_str",
    "cipher", "encryption", "short-id", "short_id", "private-key", "private_key",
    "public-key", "public_key", "servername", "server-name", "server_name", "sni",
    "host", "path", "ws-path", "obfs-password", "obfs-param", "protocol-param",
    "group", "fingerprint", "client-fingerprint", "tls-fingerprint", "obfs", "protocol",
    "username", "plugin", "flow", "preshared-key", "preshared_key",
    "obfs-uri", "interface-name", "remote-dns"
  ];
  for (var i = 0; i < keys.length; i++) yamlStringFields[keys[i]] = true;
})();
function preprocessYaml(text) {
  var s = str(text);
  if (s && s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  s = s.replace(/\r\n|\r/g, "\n");
  var guard = 0;
  while (s.indexOf("\t") !== -1 && guard < 100) {
    var next = s.replace(/^([ \t]*)\t/gm, function (m, pre) { return pre + "    "; });
    if (next === s) break;
    s = next;
    guard++;
  }
  return s;
}
function protectYamlScalarLine(line) {
  var match = /^(\s*(?:-\s+)?)(?:'([^']+)'|"([^"]+)"|([A-Za-z0-9_.-]+))\s*:\s*(.*)$/.exec(line);
  if (!match) return line;
  var prefix = match[1];
  var key = match[2] || match[3] || match[4];
  if (!key || !yamlStringFields[key.toLowerCase()]) return line;
  var rest = match[5];
  var comment = "";
  for (var i = 0; i < rest.length; i++) {
    if (rest.charAt(i) === "#" && i > 0 && /\s/.test(rest.charAt(i - 1))) {
      comment = rest.slice(i);
      rest = rest.slice(0, i);
      break;
    }
  }
  var value = rest.replace(/\s+$/, "");
  if (!value) return line;
  var first = value.charAt(0);
  if (first === '"' || first === "'" || first === "[" || first === "{" ||
      first === "|" || first === ">" || first === "&" || first === "*" ||
      first === "!" || first === "?") return line;
  if (/^(?:~|null|Null|NULL)$/.test(value)) return line;
  var quoted = '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  return prefix + key + ": " + quoted + (comment ? " " + comment.replace(/^\s+/, "") : "");
}
function protectYamlScalars(text) {
  var lines = str(text).split("\n");
  for (var i = 0; i < lines.length; i++) lines[i] = protectYamlScalarLine(lines[i]);
  return lines.join("\n");
}
var clashCanonicalKeys = {};
(function () {
  var keys = [
    "type", "name", "server", "port", "uuid", "id", "password", "cipher", "encryption",
    "alterid", "tls", "sni", "servername", "server-name", "skip-cert-verify", "network",
    "ws-opts", "ws_opts", "ws-path", "ws-headers", "http-opts", "http_opts", "grpc-opts",
    "reality-opts", "reality_opts", "public-key", "public_key", "short-id", "short_id",
    "support-x25519mlkem768", "support_x25519mlkem768",
    "client-fingerprint", "fingerprint", "alpn", "udp", "block-quic", "flow",
    "tfo", "fast-open",
    "obfs", "obfs-password", "obfs_password", "obfs-param", "obfs_param",
    "plugin", "plugin-opts", "plugin_opts", "username",
    "protocol", "protocol-param", "protocol_param",
    "ip", "ipv6", "private-key", "private_key", "preshared-key", "preshared_key",
    "reserved", "allowed-ips", "allowed_ips", "mtu", "dns", "keepalive", "persistent-keepalive",
    "auth", "auth-str", "host", "path", "headers",
    "tls-verification", "tls_verification", "tls-alpn", "tls_alpn",
    "tls-host", "tls_host", "udp-relay", "udp_relay",
    "obfs-path", "obfs_path", "obfs-header", "obfs_header", "wss",
    "script-path", "script_path",
    "always-use-connect", "always_use_connect",
    "udp-over-tcp", "udp_over_tcp", "udp-port", "udp_port",
    "ip-mode", "ip_mode", "server-dns", "server_dns",
    "server-ports", "server_ports", "hop-interval", "hop_interval",
    "download-bandwidth", "download_bandwidth", "down",
    "idle-session-timeout", "idle_session_timeout",
    "max-stream-count", "max_stream_count",
    "shadow-tls-password", "shadow_tls_password",
    "shadow-tls-sni", "shadow_tls_sni",
    "shadow-tls-version", "shadow_tls_version",
    "tls-cert-sha256", "tls_cert_sha256",
    "tls-pubkey-sha256", "tls_pubkey_sha256",
    "over-tls", "over_tls", "ports", "ws"
  ];
  for (var i = 0; i < keys.length; i++) clashCanonicalKeys[keys[i]] = keys[i].toLowerCase();
})();
function clashCanonicalKey(key) {
  var text = str(key);
  if (clashCanonicalKeys[text] !== undefined && clashCanonicalKeys[text] === text) return text;
  var lower = text.toLowerCase();
  if (clashCanonicalKeys[lower] !== undefined) return lower;
  return text;
}
function parseClashYamlProxies(text) {
  var source = protectYamlScalars(preprocessYaml(text));
  return parseClashYamlProxiesFallback(source);
}
function stripYamlComment(s) {
  s = str(s);
  var quote = "";
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (quote) {
      if (ch === quote && s.charAt(i - 1) !== "\\") quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "#" && (i === 0 || s.charAt(i - 1) === " " || s.charAt(i - 1) === "\t")) {
      return s.slice(0, i);
    }
  }
  return s;
}
function unquoteYamlKey(k) {
  k = str(k).trim();
  if (k.length >= 2) {
    var a = k.charAt(0), b = k.charAt(k.length - 1);
    if ((a === '"' && b === '"') || (a === "'" && b === "'")) return k.slice(1, -1).trim();
  }
  return k;
}
function parseClashYamlProxiesFallback(text) {
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
    obj[clashCanonicalKey(key)] = value;
  }
  function nestedContainer(path) {
    var obj = current;
    for (var i = 0; i < path.length; i++) {
      var p = path[i];
      if (!obj[p] || typeof obj[p] !== "object") obj[p] = {};
      obj = obj[p];
    }
    return obj;
  }
  for (var i = 0; i < lines.length; i++) {
    var raw = lines[i];
    var trimmed = raw.trim();
    if (!trimmed || trimmed.charAt(0) === "#") continue;
    var mIndent = raw.match(/^\s*/);
    var indent = mIndent ? mIndent[0].length : 0;
    if (!inProxies) {
      var pm = trimmed.match(/^proxies\s*:(.*)$/);
      if (pm) {
        var rest0 = stripYamlComment(pm[1]).trim();
        if (!rest0) {
          inProxies = true;
          baseIndent = indent;
        } else if (rest0.charAt(0) === "[") {
          var inner0 = rest0.slice(1).trim();
          if (inner0.charAt(inner0.length - 1) === "]") inner0 = inner0.slice(0, -1);
          var parts0 = splitFlowItems(inner0);
          for (var pi = 0; pi < parts0.length; pi++) {
            var p0 = parts0[pi].trim();
            if (!p0) continue;
            var n0 = null;
            if (p0.charAt(0) === "{" && p0.charAt(p0.length - 1) === "}") n0 = parseFlowMap(p0);
            if (n0 && n0.name && n0.type) nodes.push(n0);
          }
          inProxies = true;
          baseIndent = indent;
        }
      }
      continue;
    }
    if (indent <= baseIndent && /^[A-Za-z0-9_-]+\s*:/.test(trimmed)) {
      finishNode();
      break;
    }
    var item = raw.match(/^(\s*)-\s*(.*)$/);
    if (item && (item[2].trim() !== "" || /^(\s*)-\s*$/.test(raw))) {
      var itemIndent = item[1].length;
      var itemRest = item[2].trim();
      if (!itemRest) {
        finishNode();
        current = {};
        stack = [];
        stack.push({ indent: itemIndent, key: "" });
        continue;
      }
      if (stack.length && itemIndent > stack[stack.length - 1].indent) {
        var seqPath = stack.map(function (x) { return clashCanonicalKey(x.key); });
        var seqKey = seqPath[seqPath.length - 1];
        var container = nestedContainer(seqPath.slice(0, -1));
        if (!Array.isArray(container[seqKey])) container[seqKey] = [];
        container[seqKey].push(yamlScalar(stripYamlComment(itemRest)));
        continue;
      }
      finishNode();
      current = {};
      stack = [];
      var rest = itemRest;
      if (rest.charAt(0) === "{" && rest.charAt(rest.length - 1) === "}") {
        current = parseFlowMap(rest);
        finishNode();
        continue;
      }
      var mm = rest.match(/^([^:]+):\s*(.*)$/);
      if (mm) {
        var firstKey = clashCanonicalKey(unquoteYamlKey(mm[1]));
        if (mm[2].trim() === "") {
          setNested([], firstKey, {});
          stack.push({ indent: item[0].length - item[2].length, key: firstKey });
        } else {
          current[firstKey] = yamlScalar(stripYamlComment(mm[2]));
        }
      }
      continue;
    }
    if (!current) continue;
    while (stack.length && stack[stack.length - 1].key === "" && indent > stack[stack.length - 1].indent) stack.pop();
    var kv = trimmed.match(/^([^:]+):(?:\s+(.*)|\s*)$/);
    if (!kv) {
      if (stack.length && stack[stack.length - 1].key !== "" && indent > stack[stack.length - 1].indent) {
        var topKey = clashCanonicalKey(stack[stack.length - 1].key);
        var holder = current;
        var pth = stack.map(function(x) { return clashCanonicalKey(x.key); });
        for (var hi = 0; hi < pth.length - 1; hi++) holder = holder[pth[hi]];
        if (holder && typeof holder === "object" && holder[topKey] && typeof holder[topKey] === "object" && Object.keys(holder[topKey]).length === 0) {
          holder[topKey] = yamlScalar(stripYamlComment(trimmed));
          stack.pop();
          continue;
        }
      }
      continue;
    }
    var key = clashCanonicalKey(unquoteYamlKey(kv[1]));
    var value = kv[2];
    while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
    var path = [];
    for (var qi = 0; qi < stack.length; qi++) {
      if (stack[qi].key !== "") path.push(clashCanonicalKey(stack[qi].key));
    }
    value = stripYamlComment(value);
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
var clashProtocolTokens = {
  ss: "Shadowsocks", shadowsocks: "Shadowsocks",
  ssr: "ShadowsocksR", shadowsocksr: "ShadowsocksR",
  vmess: "vmess",
  vless: "VLESS",
  trojan: "trojan",
  hysteria2: "Hysteria2", hy2: "Hysteria2",
  anytls: "AnyTLS",
  http: "http", https: "https",
  socks5: "socks5", socks: "socks5",
  wireguard: "wireguard",
  custom: "Custom"
};
var clashTransportTokens = { tcp: "tcp", ws: "ws", http: "http", raw: "tcp" };
var clashSsCiphers = {};
(function () {
  var list = ("2022-blake3-aes-128-gcm,2022-blake3-aes-256-gcm," +
    "aes-128-gcm,aes-192-gcm,aes-256-gcm," +
    "chacha20-ietf-poly1305,xchacha20-ietf-poly1305," +
    "rc4,rc4-md5,aes-128-cfb,aes-192-cfb,aes-256-cfb," +
    "aes-128-ctr,aes-192-ctr,aes-256-ctr,bf-cfb," +
    "camellia-128-cfb,camellia-192-cfb,camellia-256-cfb," +
    "cast5-cfb,des-cfb,idea-cfb,rc2-cfb,seed-cfb," +
    "salsa20,chacha20,chacha20-ietf").split(",");
  for (var i = 0; i < list.length; i++) clashSsCiphers[list[i]] = true;
})();
var clashSsrCiphers = {};
(function () {
  var list = ("none,rc4,rc4-md5-6,rc4-md5," +
    "aes-128-cfb,aes-192-cfb,aes-256-cfb," +
    "aes-128-ctr,aes-192-ctr,aes-256-ctr,bf-cfb," +
    "camellia-128-cfb,camellia-192-cfb,camellia-256-cfb," +
    "salsa20,chacha20,chacha20-ietf").split(",");
  for (var i = 0; i < list.length; i++) clashSsrCiphers[list[i]] = true;
})();
var clashVmessCiphers = { none: true, auto: true, "aes-128-cfb": true, "aes-128-gcm": true, "chacha20-ietf-poly1305": true };
var clashSsrProtocols = { origin: true, auth_chain_a: true, auth_chain_b: true, auth_aes128_md5: true, auth_aes128_sha1: true, auth_sha1_v4: true, auth_sha1_v2: true, auth_sha1: true };
var clashSsrObfs = { plain: true, tls1_2_ticket_auth: true, tls1_2_ticket_fastauth: true, http_simple: true, http_post: true };
var CLASH_CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
var clashUnsupportedTransports = {
  grpc: true, gun: true,
  h2: true, h2c: true,
  xhttp: true, splithttp: true, httpupgrade: true,
  quic: true
};
function clashText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length ? clashText(value[0]) : "";
  if (typeof value === "object") return "";
  return String(value);
}
function clashFirst(value) {
  if (Array.isArray(value)) return value.length ? clashText(value[0]) : "";
  return clashText(value);
}
function clashBool(value) {
  return parseBooleanLike(clashText(value));
}
function clashInt(value) {
  var text = clashText(value).trim();
  if (!text || !/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(text)) return null;
  var number = Number(text);
  if (!isFinite(number) || Math.floor(number) !== number) return null;
  return number;
}
function clashPort(value) {
  var port = clashInt(value);
  if (port === null || port < 1 || port > 65535) return null;
  return port;
}
function clashQuote(value) {
  var text = clashText(value);
  return '"' + text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, function (ch) {
      return "\\u" + ("000" + ch.charCodeAt(0).toString(16)).slice(-4);
    }) + '"';
}
function clashValue(value) {
  var text = clashText(value);
  if (!text) return "";
  if (/[,"\\]/.test(text) || /^\s|\s$/.test(text) || CLASH_CONTROL_CHARS.test(text)) return clashQuote(text);
  return text;
}
function clashPush(list, key, value) {
  var text = clashText(value);
  if (!text) return;
  list.push(key + "=" + text);
}
function clashCredential(value) {
  var text = clashText(value).trim();
  if (!text) return "";
  var lower = text.toLowerCase();
  if (lower === "none" || lower === "null" || lower === "nil" || lower === "undefined") return "";
  return text;
}
function clashPushFastOpen(node, opts) {
  if (clashBool(node.tfo) === true) opts.push("fast-open=true");
  else if (clashBool(node["fast-open"]) === true) opts.push("fast-open=true");
}
function sanitizeNameText(value) {
  return clashText(value)
    .replace(/[\r\n\t\u0000-\u001F\u007F\u2028\u2029]+/g, " ")
    .replace(/=/g, "＝")
    .replace(/,/g, "，")
    .replace(/\s+/g, " ")
    .trim();
}
function clashNodeName(node, index) {
  var name = clashText(node && node.name).trim();
  if (!name) {
    var host = clashText(node && node.server).trim();
    var port = clashText(node && node.port).trim();
    name = host ? (host + (port ? ":" + port : "")) : ("node-" + index);
  }
  return sanitizeNameText(modifyName(name));
}
function clashNetwork(node) {
  return clashText(node.network).trim().toLowerCase();
}
function clashWsOpts(node) {
  return node["ws-opts"] || node.ws_opts || {};
}
function clashEffectiveNetwork(node, protocol) {
  var net = clashText(node.network).trim().toLowerCase();
  if (protocol === "trojan" && net === "http") return "ws";
  if (net) return net;
  if (clashBool(node.ws) === true) return "ws";
  if (clashText(node["ws-path"]).trim()) return "ws";
  var wh = node["ws-headers"];
  if (wh && typeof wh === "object") return "ws";
  return "";
}
function clashHttpOpts(node) {
  return node["http-opts"] || node.http_opts || {};
}
function clashTransportPath(node, network) {
  var net = network || clashNetwork(node);
  if (net === "ws") {
    var ws = clashWsOpts(node);
    return clashText(ws.path) || clashText(node["ws-path"]) || clashFirst(clashHttpOpts(node).path);
  }
  if (net === "http") return clashFirst(clashHttpOpts(node).path);
  return "";
}
function clashTransportHost(node, network) {
  var net = network || clashNetwork(node);
  if (net === "ws") {
    var ws = clashWsOpts(node);
    var headers = ws.headers || node["ws-headers"] || {};
    var h = clashText(headers.Host || headers.host || headers.Hostname || headers.hostname);
    if (h) return h;
    var ho = clashHttpOpts(node).headers || {};
    return clashFirst(ho.Host || ho.host) || clashText(node.host);
  }
  if (net === "http") {
    var opts = clashHttpOpts(node);
    var httpHeaders = opts.headers || {};
    return clashFirst(httpHeaders.Host || httpHeaders.host) || clashText(node.host);
  }
  return "";
}
function clashPushTransport(node, opts, protocol) {
  var network = clashEffectiveNetwork(node, protocol);
  if (!network) network = "tcp";
  if (clashUnsupportedTransports[network]) return "unsupported-transport:" + network;
  if (!clashTransportTokens[network]) return "unsupported-transport:" + (/^[a-z0-9+._-]{1,24}$/.test(network) ? network : "unknown");
  opts.push("transport=" + clashTransportTokens[network]);
  if (network === "ws" || network === "http") {
    var path = clashTransportPath(node, network);
    var host = clashTransportHost(node, network);
    if (path) clashPush(opts, "path", clashValue(path));
    if (host) clashPush(opts, "host", clashValue(host));
  }
  return "";
}
var clashLoonFingerprints = {
  chrome: { pq: "chrome147", noPq: "chrome" },
  safari: { pq: "safari-ios-26", noPq: "safari-ios18" },
  ios: { pq: "safari-ios-26", noPq: "safari-ios18" }
};
var clashLoonProfiles = { global: true, "default": true, "safari-ios18": true, "safari-ios-26": true, chrome: true, chrome147: true };
function clashPQSupport(node) {
  if (!node) return null;
  var reality = node["reality-opts"] || node.reality_opts || {};
  var candidates = [reality["support-x25519mlkem768"], reality.support_x25519mlkem768,
    node["support-x25519mlkem768"], node.support_x25519mlkem768];
  for (var i = 0; i < candidates.length; i++) {
    var parsed = clashBool(candidates[i]);
    if (parsed !== null) return parsed;
  }
  return null;
}
function clashTlsProfile(node, pqSupport) {
  var value = clashText(node["client-fingerprint"] || node.fingerprint).trim();
  if (!value) {
    var reality = node["reality-opts"] || node.reality_opts || {};
    value = clashText(reality.fingerprint).trim();
  }
  if (!value) return "";
  var lower = value.toLowerCase();
  if (lower === "random") return "";
  if (/[,\r\n]/.test(value)) return "";
  var mapped = clashLoonFingerprints[lower];
  if (mapped) {
    return pqSupport === true ? mapped.pq : mapped.noPq;
  }
  if (clashLoonProfiles[lower]) return lower;
  return "";
}
function clashAlpn(node) {
  var values = Array.isArray(node.alpn) ? node.alpn : (clashText(node.alpn) ? [node.alpn] : []);
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var text = clashText(values[i]).trim();
    if (!text) continue;
    var lower = text.toLowerCase();
    if (lower === "http/1.1" || lower === "http1.1") out.push("http/1.1");
    else if (lower === "h2") out.push("h2");
    else if (lower === "h3") out.push("h3");
    else out.push(lower);
  }
  return out.join(",");
}
function clashSni(node) {
  return clashText(node.servername || node["server-name"] || node.sni).trim();
}
var clashForcedProfileTypes = { vmess: true, vless: true, trojan: true, anytls: true, http: true, https: true, socks5: true, custom: true };
var tlsProfileForced = "";
var tlsProfileWarned = false;
function clashForcedTlsProfile() {
  var raw = str(tlsProfile).trim();
  if (!raw || raw === "不处理") return "";
  if (tlsProfileForced || tlsProfileWarned) return tlsProfileForced;
  var v = raw.toLowerCase();
  if (clashLoonProfiles[v]) tlsProfileForced = v;
  else tlsProfileWarned = true;
  return tlsProfileForced;
}
function clashPushTlsVerify(node, opts, type) {
  var skip = clashBool(node["skip-cert-verify"]);
  if (skip !== null) clashPush(opts, "skip-cert-verify", skip ? "true" : "false");
  if (type !== "hysteria2") clashPush(opts, "tls-profile", clashTlsProfile(node, clashPQSupport(node)));
  clashPush(opts, "tls-cert-sha256", clashValue(node["tls-cert-sha256"] !== undefined ? node["tls-cert-sha256"] : node.tls_cert_sha256));
  clashPush(opts, "tls-pubkey-sha256", clashValue(node["tls-pubkey-sha256"] !== undefined ? node["tls-pubkey-sha256"] : node.tls_pubkey_sha256));
  var forced = clashForcedTlsProfile();
  if (forced && clashForcedProfileTypes[type]) {
    for (var i = opts.length - 1; i >= 0; i--) {
      if (opts[i].indexOf("tls-profile=") === 0) opts.splice(i, 1);
    }
    opts.push("tls-profile=" + forced);
  }
}
function clashBoolText(value) {
  var b = clashBool(value);
  if (b === null) return "";
  return b ? "true" : "false";
}
function clashPushCommon(node, opts) {
  clashPush(opts, "udp", clashBoolText(node.udp));
  clashPush(opts, "block-quic", clashBoolText(node["block-quic"]));
  clashPushFastOpen(node, opts);
  clashPush(opts, "udp-over-tcp", clashBoolText(node["udp-over-tcp"] !== undefined ? node["udp-over-tcp"] : node.udp_over_tcp));
  var ipMode = clashText(node["ip-mode"] || node.ip_mode).trim().toLowerCase();
  if (ipMode === "v4-only" || ipMode === "dual" || ipMode === "prefer-v4" || ipMode === "prefer-v6" || ipMode === "v6-only") opts.push("ip-mode=" + ipMode);
  var dnsRaw = node["server-dns"] !== undefined ? node["server-dns"] : node.server_dns;
  if (dnsRaw !== undefined && dnsRaw !== null) {
    var dnsText = Array.isArray(dnsRaw) ? dnsRaw.map(function (v) { return clashText(v).trim(); }).filter(function (v) { return !!v; }).join(",") : clashText(dnsRaw).trim();
    if (dnsText) opts.push("server-dns=" + clashQuote(dnsText));
  }
}
function clashPushShadowTls(node, opts) {
  var pw = clashText(node["shadow-tls-password"] !== undefined ? node["shadow-tls-password"] : node.shadow_tls_password);
  if (!pw) {
    var po = node["plugin-opts"] || node.plugin_opts || {};
    pw = clashText(po.password);
  }
  if (!pw) return;
  opts.push("shadow-tls-password=" + clashQuote(pw));
  var sni = clashText(node["shadow-tls-sni"] !== undefined ? node["shadow-tls-sni"] : node.shadow_tls_sni);
  if (!sni) {
    var po2 = node["plugin-opts"] || node.plugin_opts || {};
    sni = clashText(po2.host);
  }
  clashPush(opts, "shadow-tls-sni", clashValue(sni));
  var verRaw = node["shadow-tls-version"] !== undefined ? node["shadow-tls-version"] : node.shadow_tls_version;
  if (verRaw === undefined) {
    var po3 = node["plugin-opts"] || node.plugin_opts || {};
    verRaw = po3.version;
  }
  var ver = clashInt(verRaw);
  clashPush(opts, "shadow-tls-version", ver === 2 || ver === 3 ? String(ver) : "3");
  var up = clashPort(node["udp-port"] !== undefined ? node["udp-port"] : node.udp_port);
  clashPush(opts, "udp-port", up === null ? "" : String(up));
}
function clashRealityField(node, key, fallbackKey) {
  var reality = node["reality-opts"] || node.reality_opts || {};
  var candidates = [node[key], fallbackKey ? node[fallbackKey] : undefined, reality[key], fallbackKey ? reality[fallbackKey] : undefined];
  for (var i = 0; i < candidates.length; i++) {
    var text = clashText(candidates[i]).trim();
    if (text) return text;
  }
  return "";
}
function clashHasReality(node) {
  return !!clashRealityField(node, "public-key", "public_key");
}
function clashConvertSs(node, name) {
  var cipher = clashText(node.cipher || node.encryption).trim();
  var password = clashCredential(node.password);
  if (!cipher) return { reason: "missing-cipher" };
  if (!password) return { reason: "missing-password" };
  if (!clashSsCiphers[cipher.toLowerCase()]) return { reason: "unsupported-cipher:" + cipher.toLowerCase() };
  var opts = [];
  var plugin = clashText(node.plugin).trim().toLowerCase();
  if (plugin === "obfs" || plugin === "simple-obfs") {
    var obfsOpts = node["plugin-opts"] || node.plugin_opts || {};
    var mode = clashText(obfsOpts.mode).trim().toLowerCase();
    if (mode !== "none" && mode !== "http" && mode !== "tls") return { reason: "unsupported-obfs-mode" };
    clashPush(opts, "obfs-name", mode);
    clashPush(opts, "obfs-host", clashValue(obfsOpts.host));
    clashPush(opts, "obfs-uri", clashValue(obfsOpts.path));
  } else if (plugin === "shadow-tls") {
    var stOpts = node["plugin-opts"] || node.plugin_opts || {};
    var stPassword = clashText(stOpts.password || node["shadow-tls-password"] || node.shadow_tls_password);
    if (!stPassword) return { reason: "missing-shadow-tls-password" };
    opts.push("shadow-tls-password=" + clashQuote(stPassword));
    clashPush(opts, "shadow-tls-sni", clashValue(stOpts.host || node["shadow-tls-sni"] || node.shadow_tls_sni));
    var stVerRaw = stOpts.version !== undefined ? stOpts.version : (node["shadow-tls-version"] !== undefined ? node["shadow-tls-version"] : node.shadow_tls_version);
    var version = clashInt(stVerRaw);
    clashPush(opts, "shadow-tls-version", version === 2 || version === 3 ? String(version) : "3");
    var stUp = clashPort(node["udp-port"] !== undefined ? node["udp-port"] : node.udp_port);
    clashPush(opts, "udp-port", stUp === null ? "" : String(stUp));
  } else if (plugin && plugin !== "none") {
    return { reason: "unsupported-plugin:" + (/^[a-z0-9+._-]{1,24}$/.test(plugin) ? plugin : "unknown") };
  }
  clashPushCommon(node, opts);
  var line = name + " = Shadowsocks," + clashText(node.server).trim() + "," + clashPort(node.port) + "," +
    clashValue(cipher) + "," + clashQuote(password);
  return { name: name, line: opts.length ? line + "," + opts.join(",") : line };
}
function clashConvertSsr(node, name) {
  var cipher = clashText(node.cipher || node.encryption).trim();
  var password = clashCredential(node.password);
  if (!cipher) return { reason: "missing-cipher" };
  if (!password) return { reason: "missing-password" };
  if (!clashSsrCiphers[cipher.toLowerCase()]) return { reason: "unsupported-cipher:" + cipher.toLowerCase() };
  var protocol = clashText(node.protocol).trim();
  if (!protocol) return { reason: "missing-protocol" };
  var obfs = clashText(node.obfs).trim();
  if (!obfs) return { reason: "missing-obfs" };
  if (!clashSsrProtocols[protocol.toLowerCase()]) return { reason: "unsupported-protocol:" + protocol.toLowerCase() };
  if (!clashSsrObfs[obfs.toLowerCase().replace(/\./g, "_").replace(/-/g, "_")]) return { reason: "unsupported-obfs:" + obfs.toLowerCase() };
  var opts = [];
  clashPush(opts, "protocol", clashValue(protocol));
  clashPush(opts, "protocol-param", clashValue(node["protocol-param"] || node.protocol_param));
  clashPush(opts, "obfs", clashValue(obfs));
  clashPush(opts, "obfs-param", clashValue(node["obfs-param"] || node.obfs_param));
  clashPushShadowTls(node, opts);
  clashPushCommon(node, opts);
  var line = name + " = ShadowsocksR," + clashText(node.server).trim() + "," + clashPort(node.port) + "," +
    clashValue(cipher) + "," + clashQuote(password);
  return { name: name, line: opts.length ? line + "," + opts.join(",") : line };
}
function clashConvertVmess(node, name) {
  var uuid = clashCredential(node.uuid) || clashCredential(node.id);
  if (!uuid) return { reason: "missing-uuid" };
  var cipher = clashText(node.cipher).trim() || "auto";
  if (!clashVmessCiphers[cipher.toLowerCase()]) return { reason: "unsupported-cipher:" + cipher.toLowerCase() };
  var opts = [];
  var transportIssue = clashPushTransport(node, opts);
  if (transportIssue) return { reason: transportIssue };
  var alterId = clashInt(node.alterId !== undefined ? node.alterId : node.alterid);
  clashPush(opts, "alterId", alterId === null ? "0" : String(alterId));
  var reality = clashHasReality(node);
  var publicKey = clashRealityField(node, "public-key", "public_key");
  if (publicKey) opts.push("public-key=" + clashQuote(publicKey));
  var shortId = clashRealityField(node, "short-id", "short_id");
  if (shortId) clashPush(opts, "short-id", clashValue(shortId));
  var tls = clashBool(node.tls);
  clashPush(opts, "over-tls", (reality || tls === true) ? "true" : "false");
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPush(opts, "alpn", clashValue(clashAlpn(node)));
  clashPushTlsVerify(node, opts, "vmess");
  clashPushShadowTls(node, opts);
  clashPushCommon(node, opts);
  var line = name + " = VMess," + clashText(node.server).trim() + "," + clashPort(node.port) + "," +
    clashValue(cipher) + "," + clashQuote(uuid);
  return { name: name, line: opts.length ? line + "," + opts.join(",") : line };
}
function clashConvertVless(node, name) {
  var uuid = clashCredential(node.uuid) || clashCredential(node.id);
  if (!uuid) return { reason: "missing-uuid" };
  var opts = [];
  var transportIssue = clashPushTransport(node, opts);
  if (transportIssue) return { reason: transportIssue };
  var reality = clashHasReality(node);
  var flow = clashText(node.flow).trim();
  if (flow && flow.toLowerCase() !== "null" && flow.toLowerCase() !== "none") {
    if (flow !== "xtls-rprx-vision") return { reason: "unsupported-flow:" + flow };
    clashPush(opts, "flow", clashValue(flow));
  }
  var publicKey = clashRealityField(node, "public-key", "public_key");
  if (publicKey) opts.push("public-key=" + clashQuote(publicKey));
  var shortId = clashRealityField(node, "short-id", "short_id");
  if (shortId) clashPush(opts, "short-id", clashValue(shortId));
  var tls = clashBool(node.tls);
  clashPush(opts, "over-tls", (reality || tls === true) ? "true" : "false");
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPush(opts, "alpn", clashValue(clashAlpn(node)));
  clashPushTlsVerify(node, opts, "vless");
  clashPushShadowTls(node, opts);
  clashPushCommon(node, opts);
  var line = name + " = VLESS," + clashText(node.server).trim() + "," + clashPort(node.port) + "," + clashQuote(uuid);
  return { name: name, line: opts.length ? line + "," + opts.join(",") : line };
}
function clashConvertTrojan(node, name) {
  var password = clashCredential(node.password);
  if (!password) return { reason: "missing-password" };
  var opts = [];
  var transportIssue = clashPushTransport(node, opts, "trojan");
  if (transportIssue) return { reason: transportIssue };
  var publicKey = clashRealityField(node, "public-key", "public_key");
  if (publicKey) opts.push("public-key=" + clashQuote(publicKey));
  var shortId = clashRealityField(node, "short-id", "short_id");
  if (shortId) clashPush(opts, "short-id", clashValue(shortId));
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPush(opts, "alpn", clashValue(clashAlpn(node)));
  clashPushTlsVerify(node, opts, "trojan");
  clashPushShadowTls(node, opts);
  clashPushCommon(node, opts);
  var line = name + " = Trojan," + clashText(node.server).trim() + "," + clashPort(node.port) + "," + clashQuote(password);
  return { name: name, line: opts.length ? line + "," + opts.join(",") : line };
}
function clashConvertHysteria2(node, name) {
  var password = clashCredential(node.password) || clashCredential(node.auth) || clashCredential(node["auth-str"]);
  if (!password) return { reason: "missing-password" };
  var opts = [];
  var obfsRaw = clashText(node.obfs).trim();
  var obfs = obfsRaw.toLowerCase();
  // "none"/"null" 等占位符表示未启用混淆（部分订阅显式写 obfs=none），不应视为不支持
  if (obfs === "none" || obfs === "null" || obfs === "nil" || obfs === "undefined") obfs = "";
  if (obfs && obfs !== "salamander") return { reason: "unsupported-obfs:" + (/^[a-z0-9+._-]{1,24}$/.test(obfs) ? obfs : "unknown") };
  var obfsPassword = clashText(node["obfs-password"] || node.obfs_password);
  if (obfsPassword) opts.push("salamander-password=" + clashQuote(obfsPassword));
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPushTlsVerify(node, opts, "hysteria2");
  clashPush(opts, "alpn", clashValue(clashAlpn(node)));
  var serverPorts = clashText(node["server-ports"] !== undefined ? node["server-ports"] : node.server_ports);
  if (!serverPorts) serverPorts = clashText(node.ports);
  if (serverPorts) opts.push("server-ports=" + clashQuote(serverPorts));
  var hopIv = clashInt(node["hop-interval"] !== undefined ? node["hop-interval"] : node.hop_interval);
  clashPush(opts, "hop-interval", hopIv === null ? "" : String(hopIv));
  var dlBw = clashInt(node["download-bandwidth"] !== undefined ? node["download-bandwidth"] : (node.download_bandwidth !== undefined ? node.download_bandwidth : node.down));
  clashPush(opts, "download-bandwidth", dlBw === null ? "" : String(dlBw));
  clashPushCommon(node, opts);
  var line = name + " = Hysteria2," + clashText(node.server).trim() + "," + clashPort(node.port) + "," + clashQuote(password);
  return { name: name, line: opts.length ? line + "," + opts.join(",") : line };
}
function clashConvertAnytls(node, name) {
  var password = clashCredential(node.password);
  if (!password) return { reason: "missing-password" };
  var opts = [];
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPushTlsVerify(node, opts, "anytls");
  var atPk = clashRealityField(node, "public-key", "public_key");
  if (atPk) opts.push("public-key=" + clashQuote(atPk));
  var atSid = clashRealityField(node, "short-id", "short_id");
  if (atSid) clashPush(opts, "short-id", clashValue(atSid));
  var idleTo = clashInt(node["idle-session-timeout"] !== undefined ? node["idle-session-timeout"] : node.idle_session_timeout);
  clashPush(opts, "idle-session-timeout", idleTo === null ? "" : String(idleTo));
  var maxSt = clashInt(node["max-stream-count"] !== undefined ? node["max-stream-count"] : node.max_stream_count);
  clashPush(opts, "max-stream-count", maxSt === null ? "" : String(maxSt));
  clashPushCommon(node, opts);
  var line = name + " = AnyTLS," + clashText(node.server).trim() + "," + clashPort(node.port) + "," + clashQuote(password);
  return { name: name, line: opts.length ? line + "," + opts.join(",") : line };
}
function clashConvertHttp(node, name) {
  var type = clashText(node.type).trim().toLowerCase();
  var tls = clashBool(node.tls);
  var label = (type === "https" || tls === true) ? "https" : "http";
  var username = clashCredential(node.username);
  var password = clashCredential(node.password);
  if (username && !password) return { reason: "missing-password" };
  if (!username && password) return { reason: "missing-username" };
  var opts = [];
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPushTlsVerify(node, opts, label);
  clashPushShadowTls(node, opts);
  clashPush(opts, "always-use-connect", clashBoolText(node["always-use-connect"] !== undefined ? node["always-use-connect"] : node.always_use_connect));
  clashPushCommon(node, opts);
  var line = name + " = " + label + "," + clashText(node.server).trim() + "," + clashPort(node.port);
  if (username) line += "," + clashValue(username) + "," + clashQuote(password);
  if (opts.length) line += "," + opts.join(",");
  return { name: name, line: line };
}
function clashConvertSocks5(node, name) {
  var username = clashCredential(node.username);
  var password = clashCredential(node.password);
  if (username && !password) return { reason: "missing-password" };
  if (!username && password) return { reason: "missing-username" };
  var opts = [];
  clashPush(opts, "over-tls", clashBoolText(node.tls !== undefined ? node.tls : (node["over-tls"] !== undefined ? node["over-tls"] : node.over_tls)));
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPushTlsVerify(node, opts, "socks5");
  clashPushShadowTls(node, opts);
  clashPushCommon(node, opts);
  var line = name + " = socks5," + clashText(node.server).trim() + "," + clashPort(node.port);
  if (username) line += "," + clashValue(username) + "," + clashQuote(password);
  if (opts.length) line += "," + opts.join(",");
  return { name: name, line: line };
}
function clashConvertWireguard(node, name) {
  var privateKey = clashCredential(node["private-key"]) || clashCredential(node.private_key);
  var publicKey = clashCredential(node["public-key"]) || clashCredential(node.public_key);
  var ifaceIp = clashText(node.ip).trim();
  if (!privateKey) return { reason: "missing-private-key" };
  if (!publicKey) return { reason: "missing-public-key" };
  if (!ifaceIp) return { reason: "missing-interface-ip" };
  var opts = [];
  clashPush(opts, "interface-ip", clashValue(ifaceIp));
  clashPush(opts, "interface-ipv6", clashValue(clashText(node.ipv6).trim()));
  opts.push("private-key=" + clashQuote(privateKey));
  var mtu = clashInt(node.mtu);
  clashPush(opts, "mtu", mtu === null ? "" : String(mtu));
  var dnsList = Array.isArray(node.dns) ? node.dns : (clashText(node.dns) ? [node.dns] : []);
  var dnsV4 = [], dnsV6 = [];
  for (var i = 0; i < dnsList.length; i++) {
    var dns = clashText(dnsList[i]).trim();
    if (!dns) continue;
    if (dns.indexOf(":") !== -1) dnsV6.push(dns); else dnsV4.push(dns);
  }
  clashPush(opts, "dns", dnsV4.join(","));
  clashPush(opts, "dnsv6", dnsV6.join(","));
  var keepalive = clashInt(node.keepalive !== undefined ? node.keepalive : node["persistent-keepalive"]);
  clashPush(opts, "keepalive", keepalive === null ? "" : String(keepalive));
  var peer = [];
  peer.push("public-key=" + clashQuote(publicKey));
  var preshared = clashText(node["preshared-key"] || node.preshared_key);
  if (preshared) peer.push("preshared-key=" + clashQuote(preshared));
  var reserved = Array.isArray(node.reserved) ? node.reserved : [];
  if (reserved.length) {
    var reservedText = [];
    for (var r = 0; r < reserved.length; r++) {
      var value = clashInt(reserved[r]);
      if (value === null || value < 0 || value > 255) { reservedText = []; break; }
      reservedText.push(String(value));
    }
    if (reservedText.length) peer.push("reserved=[" + reservedText.join(",") + "]");
  }
  var allowed = Array.isArray(node["allowed-ips"]) ? node["allowed-ips"] : (node["allowed-ips"] !== undefined ? [node["allowed-ips"]] : []);
  var allowedText = [];
  for (var a = 0; a < allowed.length; a++) {
    var item = clashText(allowed[a]).trim();
    if (item) allowedText.push(item);
  }
  if (allowedText.length) peer.push("allowed-ips=" + clashQuote(allowedText.join(",")));
  var host = clashText(node.server).trim();
  var port = clashPort(node.port);
  if (host) peer.push("endpoint=" + (/[:]/.test(host) && host.charAt(0) !== "[" ? "[" + host + "]" : host) + (port === null ? "" : ":" + port));
  opts.push("peers=[{" + peer.join(",") + "}]");
  clashPushCommon(node, opts);
  return { name: name, line: name + " = WireGuard," + opts.join(",") };
}
function shallowCopyNode(node, patch) {
  var out = {};
  for (var k in node) {
    if (Object.prototype.hasOwnProperty.call(node, k)) out[k] = node[k];
  }
  for (var p in patch) {
    if (Object.prototype.hasOwnProperty.call(patch, p)) out[p] = patch[p];
  }
  return out;
}
function clashConvertCustom(node, name) {
  var scriptPath = clashText(node["script-path"] !== undefined ? node["script-path"] : node.script_path).trim();
  if (!scriptPath) return { reason: "missing-script-path" };
  var opts = [];
  opts.push("script-path=" + clashValue(scriptPath));
  clashPush(opts, "sni", clashValue(clashSni(node)));
  clashPush(opts, "alpn", clashValue(clashAlpn(node)));
  clashPushTlsVerify(node, opts, "custom");
  clashPushCommon(node, opts);
  var cipher = clashText(node.cipher || node.encryption).trim();
  var line = name + " = Custom," + clashText(node.server).trim() + "," + clashPort(node.port);
  if (cipher) line += "," + clashValue(cipher) + "," + clashQuote(clashCredential(node.password));
  return { name: name, line: line + "," + opts.join(",") };
}
function convertClashProxy(node, index) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return { reason: "invalid-node-structure" };
  var type = clashText(node.type).trim().toLowerCase();
  if (!type) return { reason: "missing-type" };
  var token = clashProtocolTokens[type];
  if (!token) return { reason: "unsupported-type:" + (/^[a-z0-9+._-]{1,24}$/.test(type) ? type : "unknown") };
  if (!clashText(node.server).trim()) return { reason: "missing-server" };
  if (CLASH_CONTROL_CHARS.test(clashText(node.server))) return { reason: "invalid-server" };
  if (token === "Hysteria2" && clashPort(node.port) === null) {
    var hopText = clashText(node.ports || node["server-ports"] || node.server_ports).trim();
    var hopM = hopText.match(/^(\d{1,5})/);
    if (hopM) node = shallowCopyNode(node, { port: parseInt(hopM[1], 10) });
  }
  if (clashPort(node.port) === null) return { reason: "invalid-port" };
  var name = clashNodeName(node, index);
  switch (token) {
    case "Shadowsocks": return clashConvertSs(node, name);
    case "ShadowsocksR": return clashConvertSsr(node, name);
    case "vmess": return clashConvertVmess(node, name);
    case "VLESS": return clashConvertVless(node, name);
    case "trojan": return clashConvertTrojan(node, name);
    case "Hysteria2": return clashConvertHysteria2(node, name);
    case "AnyTLS": return clashConvertAnytls(node, name);
    case "http":
    case "https": return clashConvertHttp(node, name);
    case "socks5": return clashConvertSocks5(node, name);
    case "wireguard": return clashConvertWireguard(node, name);
    case "Custom": return clashConvertCustom(node, name);
  }
  return { reason: "unsupported-type:" + type };
}
function processClashYaml(text) {
  if (!/^\s*proxies\s*:/m.test(text)) return null;
  var proxies = parseClashYamlProxies(text);
  if (!proxies) return null;
  if (!proxies.length) {
    processResultMeta.reason = "yaml-empty-proxies";
    console.log("[解析器]" + logTag() + "[YAML] proxies 为空，结果=无节点输出");
    return "";
  }
  var items = [];
  var reasons = {};
  var skipLogLimit = 5;
  var skipLogged = 0;
  for (var i = 0; i < proxies.length; i++) {
    var result = convertClashProxy(proxies[i], i + 1);
    if (result && result.line) {
      items.push({ index: items.length, name: result.name, line: result.line });
      continue;
    }
    var reason = (result && result.reason) || "unknown";
    reasons[reason] = (reasons[reason] || 0) + 1;
    if (skipLogged < skipLogLimit) {
      var typeText = clashText(proxies[i] && proxies[i].type).trim().toLowerCase();
      console.log("[解析器][YAML] 跳过节点#" + (i + 1) + "，类型=" +
        (/^[a-z0-9+._-]{1,24}$/.test(typeText) ? typeText : "unknown") + "，原因=" + reason);
      skipLogged++;
      if (skipLogged === skipLogLimit && proxies.length > skipLogLimit * 2) {
        console.log("[解析器][YAML] 后续跳过明细不再逐条输出，见下方汇总");
      }
    }
  }
  var reasonParts = [];
  for (var key in reasons) {
    if (Object.prototype.hasOwnProperty.call(reasons, key)) reasonParts.push(key + "=" + reasons[key]);
  }
  var skipped = proxies.length - items.length;
  var filtered = filterExcludedItems(items);
  var kept = filtered.kept;
  console.log("[解析器]" + logTag() + "[YAML] " + logJoin([
    { key: "订阅节点", value: items.length },
    { key: "跳过", value: skipped, zero: true },
    reasonParts.length ? "跳过原因=" + reasonParts.join(",") : ""
  ]));
  var imports = takeImportItems();
  var merged = sortItemsByName(mergeItems(kept, imports));
  processResultMeta.nodeCount = kept.length + imports.length;
  processResultMeta.subCount = kept.length;
  processResultMeta.excluded = filtered.dropped;
  if (!processResultMeta.nodeCount) processResultMeta.reason = "yaml-all-skipped";
  return merged.map(function (x) { return x.line; }).join("\n");
}
function processResource(content) {
  var raw = normalizeText(content);
  uriConvertReset();
  var trimmed = raw.trim();
  if (!trimmed) {
    processResultMeta.reason = "empty-response";
    if (processIsRetry) console.log("[解析器][回退] 原订阅内容为空，结果=空输出");
    else console.log("[解析器][输入] 内容为空，结果=空输出");
    return "";
  }
  if (looksLikeBase64(trimmed)) {
    console.log("[解析器]" + logTag() + "[识别] 格式候选=Base64，开始解码确认");
    var base64Decoded = base64DecodeUnicode(trimmed);
    if (base64Decoded) {
      var yamlInBase64 = processClashYaml(base64Decoded);
      if (yamlInBase64 !== null) return yamlInBase64;
    } else {
      console.log("[解析器]" + logTag() + "[识别] Base64 解码失败，按明文继续判断");
    }
    var base64Result = processBase64UriList(trimmed);
    if (base64Result !== null) return base64Result;
  } else if (looksLikeLooseBase64(trimmed)) {
    var looseDecoded = base64DecodeLoose(trimmed);
    if (looseDecoded && looksLikeNodeResource(looseDecoded)) {
      console.log("[解析器]" + logTag() + "[识别] 格式候选=Base64（无填充/URL-safe），开始解码确认");
      var looseYaml = processClashYaml(looseDecoded);
      if (looseYaml !== null) return looseYaml;
      var looseResult = processBase64UriList(trimmed);
      if (looseResult !== null) return looseResult;
    }
  }
  var yamlResult = processClashYaml(trimmed);
  if (yamlResult !== null) return yamlResult;
  return processLoonStyle(trimmed);
}
function looksLikeNodeResource(text) {
  var normalized = normalizeText(text);
  var trimmed = normalized.trim();
  if (!trimmed) return false;
  if (/^\s*proxies\s*:/m.test(trimmed)) return true;
  function scanLines(source) {
    var lines = source.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      if (isGenericUriLine(line) || looksLikeLoonNodeLine(line)) return true;
    }
    return false;
  }
  if (scanLines(normalized)) return true;
  if (looksLikeBase64(trimmed)) {
    var decoded = base64DecodeUnicode(trimmed);
    if (decoded && (/^\s*proxies\s*:/m.test(decoded) || scanLines(decoded))) return true;
  }
  return false;
}
function refetchWithUserAgent() {
  if (typeof $httpClient === "undefined" || !$httpClient) {
    console.log("[解析器][请求] 环境不支持自定义 UA 拉取，结果=回退原订阅");
    finish(typeof $resource !== "undefined" ? $resource : "");
    return;
  }
  if (typeof $resourceUrl === "undefined" || !$resourceUrl) {
    console.log("[解析器][请求] 缺少资源地址，结果=回退原订阅");
    finish(typeof $resource !== "undefined" ? $resource : "");
    return;
  }
  var headers = { "User-Agent": userAgent };
  if (noCache) headers["Cache-Control"] = "no-cache";
  var req = {
    url: String($resourceUrl),
    headers: headers
  };
  console.log("[解析器][请求] 使用自定义 UA 拉取，UA=" + userAgent);
  $httpClient.get(req, function(error, response, data) {
    var status = response && response.status !== undefined ? Number(response.status) : null;
    var badStatus = status !== null && (!isFinite(status) || status < 200 || status >= 300);
    if (error || !data || badStatus) {
      console.log("[解析器][请求] 拉取失败" + (badStatus ? "，HTTP状态=" + status : "") + "，结果=回退原订阅");
      finish(typeof $resource !== "undefined" ? $resource : "");
      return;
    }
    if (!looksLikeNodeResource(data)) {
      console.log("[解析器][请求] 响应内容未确认是订阅资源，结果=回退原订阅");
      finish(typeof $resource !== "undefined" ? $resource : "");
      return;
    }
    console.log("[解析器][请求] 拉取成功，HTTP状态=" + (status === null ? "未知" : status));
    finish(data, true);
  });
}
var typeName = { 0: "config", 1: "nodes", 2: "rules", 3: "rewrites", 4: "scripts", 5: "plugin" };
function finish(content, fromUserAgent) {
  logStartupOnce();
  processResultMeta = { nodeCount: 0, subCount: 0, reason: "", excluded: 0 };
  importExcluded = 0;
  processIsRetry = false;
  var result = type === 1 ? processResource(content) : str(content);
  var importAdded = 0;
  if (type === 1 && !importMerged) {
    var leftover = sortItemsByName(takeImportItems());
    if (leftover.length) {
      result = appendPlainLines(result, leftover);
      importAdded = leftover.length;
      processResultMeta.nodeCount += importAdded;
    }
  }
  if (type === 1 && fromUserAgent && processResultMeta.subCount === 0) {
    console.log("[解析器][回退] 自定义 UA 响应未产出节点，原因=" + (processResultMeta.reason || "no-nodes") +
      "，开始处理 Loon 原始订阅");
    processResultMeta = { nodeCount: 0, subCount: 0, reason: "", excluded: 0 };
    importMerged = false;
    processIsRetry = true;
    result = processResource(typeof $resource !== "undefined" ? $resource : "");
    if (!importMerged) {
      var rest = sortItemsByName(takeImportItems());
      if (rest.length) {
        result = appendPlainLines(result, rest);
        processResultMeta.nodeCount += rest.length;
      }
    }
    processIsRetry = false;
  }
  if (type === 1) uriConvertFlush();
  var tail = logJoin([
    { key: "导入", value: (importItemsCache && importItemsCache.length) ? importItemsCache.length : 0, zero: true },
    { key: "排除", value: processResultMeta.excluded + importExcluded, zero: true }
  ]);
  console.log("[解析器][完成] 节点=" + (type === 1 ? processResultMeta.nodeCount : "-") +
    (tail ? "（" + tail + "）" : "") +
    "，耗时=" + (Date.now() - processStartedAt) + "ms");
  if (type === 1) console.log("[解析器][提示] Loon 会自动排除流量信息等节点，数量有出入属正常");
  $done(result);
}
var uriConvertStats = { converted: 0, kept: 0, reasons: {} };
function uriConvertReset() {
  uriConvertStats = { converted: 0, kept: 0, reasons: {} };
}
function uriKeepReasonOf(code) {
  var s = str(code);
  var i = s.indexOf(":");
  var head = i >= 0 ? s.slice(0, i) : s;
  return /^[a-z0-9-]{1,24}$/.test(head) ? head : "other";
}
function uriConvertLogKeep(reason) {
  uriConvertStats.kept++;
  var key = uriKeepReasonOf(reason);
  uriConvertStats.reasons[key] = (uriConvertStats.reasons[key] || 0) + 1;
}
function uriConvertFlush() {
  if (!uriConvertStats.converted && !uriConvertStats.kept) return;
  var parts = [];
  for (var k in uriConvertStats.reasons) {
    if (Object.prototype.hasOwnProperty.call(uriConvertStats.reasons, k)) {
      parts.push(k + "=" + uriConvertStats.reasons[k]);
    }
  }
  console.log("[解析器][URI] 成功=" + uriConvertStats.converted +
    (uriConvertStats.kept ? "，保留原 URI=" + uriConvertStats.kept + (parts.length ? "（" + parts.join("，") + "）" : "") : ""));
}
function withNameMutationSuspended(fn) {
  var sEmoji = emoji, sRename = rename, sPre = pre, sSuf = suf, sPairs = renamePairs;
  emoji = false; rename = ""; pre = ""; suf = ""; renamePairs = [];
  try {
    return fn();
  } finally {
    emoji = sEmoji; rename = sRename; pre = sPre; suf = sSuf; renamePairs = sPairs;
  }
}
var uriFpNativeProfile = { chrome: "chrome", safari: "safari-ios18", ios: "safari-ios18" };
function uriNativeProfileOf(fpValue) {
  var v = str(fpValue).trim().toLowerCase();
  if (!v) return "";
  if (uriFpNativeProfile[v]) return uriFpNativeProfile[v];
  return "";
}
function uriSplitCore(core) {
  var m = /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([\s\S]+)$/.exec(str(core).trim());
  if (!m) return null;
  var scheme = m[1].toLowerCase();
  var rest = m[2];
  var fragment = null;
  var hi = rest.indexOf("#");
  if (hi >= 0) { fragment = rest.slice(hi + 1); rest = rest.slice(0, hi); }
  var query = "";
  var qi = rest.indexOf("?");
  if (qi >= 0) { query = rest.slice(qi + 1); rest = rest.slice(0, qi); }
  return { scheme: scheme, body: rest, query: query, fragment: fragment };
}
function uriAuthority(body) {
  var text = str(body);
  var at = text.lastIndexOf("@");
  if (at < 0) return null;
  var head = text.slice(0, at);
  var tail = text.slice(at + 1);
  if (!head || !tail) return null;
  var slash = tail.indexOf("/");
  if (slash >= 0) tail = tail.slice(0, slash);
  var host = "";
  var portText = "";
  if (tail.charAt(0) === "[") {
    var close = tail.indexOf("]");
    if (close < 0) return null;
    host = tail.slice(1, close);
    var after = tail.slice(close + 1);
    if (after.charAt(0) !== ":") return null;
    portText = after.slice(1);
  } else {
    var colon = tail.lastIndexOf(":");
    if (colon <= 0) return null;
    host = tail.slice(0, colon);
    portText = tail.slice(colon + 1);
  }
  if (!host || !/^\d{1,5}$/.test(portText)) return null;
  var port = Number(portText);
  if (!(port >= 1 && port <= 65535)) return null;
  var ipv6 = host.indexOf(":") !== -1;
  if (ipv6) {
    if (!/^[0-9A-Fa-f:.]+$/.test(host)) return null;
  } else if (!/^[A-Za-z0-9._-]+$/.test(host)) {
    return null;
  }
  return { head: head, host: host, port: port, ipv6: ipv6 };
}
function uriQueryMap(query) {
  var pairs = parseQueryPairs(query);
  var map = {};
  for (var i = 0; i < pairs.length; i++) {
    var k = str(pairs[i].key).toLowerCase();
    if (!k || map[k] !== undefined) continue;
    map[k] = decodeUriComponentLoose(pairs[i].value);
  }
  return map;
}
function uriPick(map, keys) {
  for (var i = 0; i < keys.length; i++) {
    var v = map[keys[i]];
    if (v !== undefined && str(v).trim() !== "") return str(v).trim();
  }
  return "";
}
function uriTruthy(v) {
  if (v === undefined || v === null || v === "") return false;
  return truthyParam(v);
}
function uriWsOpts(q, node) {
  var net = str(node.network).toLowerCase();
  if (net !== "ws" && net !== "http" && net !== "h2") return;
  var path = uriPick(q, ["path", "wspath", "ws-path"]);
  var host = uriPick(q, ["host", "obfsparam", "ws-host"]);
  var opts = {};
  if (path) opts.path = path;
  if (host) opts.headers = { Host: host };
  node["ws-opts"] = opts;
}
function uriNameOfSplit(split) {
  var name = "";
  if (split.fragment !== null) name = str(decodeUriComponentLoose(split.fragment)).trim();
  if (!name) {
    var q = uriQueryMap(split.query);
    name = uriPick(q, ["remark", "remarks", "ps"]);
  }
  return name;
}
function uriNodeVless(split) {
  var auth = uriAuthority(split.body);
  if (!auth) return { reason: "unparsed-authority" };
  var q = uriQueryMap(split.query);
  var security = uriPick(q, ["security"]).toLowerCase();
  var net = uriPick(q, ["type", "network"]).toLowerCase();
  if (!net) {
    var obfs = uriPick(q, ["obfs"]).toLowerCase();
    if (obfs === "websocket" || obfs === "ws") net = "ws";
    else if (obfs === "http" || obfs === "h2") net = "http";
    else net = "tcp";
  }
  var vlessCred = str(auth.head);
  var vlessColon = vlessCred.indexOf(":");
  if (vlessColon > 0) vlessCred = vlessCred.slice(vlessColon + 1);
  var node = {
    type: "vless",
    server: auth.host,
    port: auth.port,
    uuid: vlessCred,
    network: net,
    tls: (security === "tls" || security === "reality" || uriTruthy(q["tls"])),
    servername: uriPick(q, ["sni", "peer", "servername", "server-name"]),
    alpn: uriPick(q, ["alpn"]),
    flow: uriPick(q, ["flow"]),
    "client-fingerprint": ""
  };
  node.__loonUriProfile = uriNativeProfileOf(uriPick(q, ["fp", "fingerprint"]));
  uriWsOpts(q, node);
  var pbk = uriPick(q, ["pbk", "publickey", "public-key"]);
  var sid = uriPick(q, ["sid", "shortid", "short-id"]);
  if (pbk || sid || security === "reality") {
    node["reality-opts"] = { "public-key": pbk, "short-id": sid };
  }
  if (uriTruthy(uriPick(q, ["allowinsecure", "insecure", "skip-cert-verify"]))) node["skip-cert-verify"] = true;
  if (uriTruthy(q["tfo"])) node.tfo = true;
  if (!node.flow && str(q["xtls"]).trim() === "2") node.flow = "xtls-rprx-vision";
  return { node: node };
}
function uriNodeVmess(split) {
  var decoded = base64DecodeLoose(split.body);
  if (!decoded) return { reason: "unparsed-vmess-json" };
  var obj;
  try { obj = JSON.parse(decoded); } catch (e) { return { reason: "unparsed-vmess-json" }; }
  if (!obj || typeof obj !== "object") return { reason: "unparsed-vmess-json" };
  var net = clashText(obj.net).trim().toLowerCase() || "tcp";
  var node = {
    type: "vmess",
    server: clashText(obj.add).trim(),
    port: clashInt(obj.port),
    uuid: clashText(obj.id).trim(),
    alterId: clashInt(obj.aid),
    cipher: clashText(obj.scy).trim() || clashText(obj.cipher).trim() || "auto",
    network: net,
    tls: clashText(obj.tls).trim().toLowerCase() === "tls",
    servername: clashText(obj.sni || obj.servername).trim(),
    alpn: clashText(obj.alpn).trim(),
    "client-fingerprint": ""
  };
  node.__loonUriProfile = uriNativeProfileOf(clashText(obj.fp).trim());
  if (net === "ws" || net === "http" || net === "h2") {
    var opts = {};
    var path = clashText(obj.path).trim();
    var host = clashText(obj.host).trim();
    if (path) opts.path = path;
    if (host) opts.headers = { Host: host };
    node["ws-opts"] = opts;
  }
  if (uriTruthy(obj.tfo) || uriTruthy(obj["fast-open"])) node.tfo = true;
  return { node: node };
}
function uriNodeTrojan(split) {
  var auth = uriAuthority(split.body);
  if (!auth) return { reason: "unparsed-authority" };
  var q = uriQueryMap(split.query);
  var security = uriPick(q, ["security"]).toLowerCase();
  var node = {
    type: "trojan",
    server: auth.host,
    port: auth.port,
    password: decodeUriComponentLoose(auth.head),
    sni: uriPick(q, ["sni", "peer", "servername"]),
    network: uriPick(q, ["type", "network"]).toLowerCase() || "tcp",
    alpn: uriPick(q, ["alpn"]),
    "client-fingerprint": ""
  };
  node.__loonUriProfile = uriNativeProfileOf(uriPick(q, ["fp", "fingerprint"]));
  uriWsOpts(q, node);
  var pbk = uriPick(q, ["pbk", "publickey", "public-key"]);
  var sid = uriPick(q, ["sid", "shortid", "short-id"]);
  if (pbk || sid || security === "reality") {
    node["reality-opts"] = { "public-key": pbk, "short-id": sid };
  }
  if (uriTruthy(uriPick(q, ["allowinsecure", "insecure", "skip-cert-verify"]))) node["skip-cert-verify"] = true;
  if (uriTruthy(q["tfo"])) node.tfo = true;
  return { node: node };
}
function uriNodeSs(split) {
  var auth = uriAuthority(split.body);
  if (!auth) return { reason: "unparsed-authority" };
  var plain = decodeUriComponentLoose(auth.head);
  var method = "";
  var password = "";
  if (plain.indexOf(":") >= 0) {
    var idx = plain.indexOf(":");
    method = plain.slice(0, idx);
    password = plain.slice(idx + 1);
  } else {
    var dec = base64DecodeLoose(auth.head);
    if (dec && dec.indexOf(":") >= 0) {
      var i2 = dec.indexOf(":");
      method = dec.slice(0, i2);
      password = dec.slice(i2 + 1);
    }
  }
  if (!method || !password) return { reason: "unparsed-ss-credential" };
  var node = { type: "ss", server: auth.host, port: auth.port, cipher: method.trim(), password: password };
  var plugin = uriPick(uriQueryMap(split.query), ["plugin"]);
  if (plugin) {
    var parts = plugin.split(";");
    var pname = str(parts[0]).trim().toLowerCase();
    var po = {};
    for (var i = 1; i < parts.length; i++) {
      var eq = parts[i].indexOf("=");
      if (eq > 0) po[str(parts[i].slice(0, eq)).trim().toLowerCase()] = parts[i].slice(eq + 1);
    }
    if (pname === "obfs-local" || pname === "simple-obfs" || pname === "obfs") {
      node.plugin = "obfs";
      node["plugin-opts"] = { mode: po.obfs || po.mode, host: po["obfs-host"] || po.host, path: po["obfs-uri"] || po.path };
    } else if (pname === "shadow-tls") {
      node.plugin = "shadow-tls";
      node["plugin-opts"] = { password: po.password, host: po.host, version: po.version };
    } else {
      return { reason: "unsupported-plugin" };
    }
  }
  return { node: node };
}
function uriNodeHysteria2(split) {
  var auth = uriAuthority(split.body);
  if (!auth) return { reason: "unparsed-authority" };
  var q = uriQueryMap(split.query);
  var password = decodeUriComponentLoose(auth.head);
  if (!password) password = uriPick(q, ["auth", "auth-str", "password"]);
  if (!password) return { reason: "missing-password" };
  var node = {
    type: "hysteria2",
    server: auth.host,
    port: auth.port,
    password: password,
    sni: uriPick(q, ["sni", "peer"]),
    alpn: uriPick(q, ["alpn"]),
    obfs: uriPick(q, ["obfs"])
  };
  var obfsPw = uriPick(q, ["obfs-password", "obfs_password"]);
  if (obfsPw) node["obfs-password"] = obfsPw;
  var ports = uriPick(q, ["server-ports", "ports", "mport"]);
  if (ports) node["server-ports"] = ports;
  var hop = uriPick(q, ["hop-interval"]);
  if (hop) node["hop-interval"] = hop;
  if (uriTruthy(uriPick(q, ["allowinsecure", "insecure", "skip-cert-verify"]))) node["skip-cert-verify"] = true;
  return { node: node };
}
function uriNodeAnytls(split) {
  var auth = uriAuthority(split.body);
  if (!auth) return { reason: "unparsed-authority" };
  var q = uriQueryMap(split.query);
  var password = decodeUriComponentLoose(auth.head);
  if (!password) return { reason: "missing-password" };
  var node = {
    type: "anytls",
    server: auth.host,
    port: auth.port,
    password: password,
    sni: uriPick(q, ["sni", "peer", "servername"]),
    "client-fingerprint": ""
  };
  node.__loonUriProfile = uriNativeProfileOf(uriPick(q, ["fp", "fingerprint"]));
  var pbk = uriPick(q, ["pbk", "publickey", "public-key"]);
  var sid = uriPick(q, ["sid", "shortid", "short-id"]);
  if (pbk || sid) node["reality-opts"] = { "public-key": pbk, "short-id": sid };
  if (uriTruthy(uriPick(q, ["allowinsecure", "insecure", "skip-cert-verify"]))) node["skip-cert-verify"] = true;
  // AnyTLS 依赖 TCP 复用承载 UDP，URI 规范本身不含 udp 参数，缺省按协议能力启用
  var atUdp = uriPick(q, ["udp", "udp-relay"]);
  node.udp = atUdp === "" ? true : uriTruthy(atUdp);
  return { node: node };
}
function uriNodeHttp(split) {
  var auth = uriAuthority(split.body);
  if (!auth) return { reason: "ambiguous-url" };
  var body = str(split.body);
  var after = body.slice(body.lastIndexOf("@") + 1);
  var slash = after.indexOf("/");
  if (slash >= 0 && after.slice(slash) !== "/") return { reason: "ambiguous-url" };
  var head = str(auth.head);
  var ci = head.indexOf(":");
  if (ci < 0) return { reason: "ambiguous-url" };
  var q = uriQueryMap(split.query);
  return { node: {
    type: split.scheme === "https" ? "https" : "http",
    server: auth.host,
    port: auth.port,
    username: decodeUriComponentLoose(head.slice(0, ci)),
    password: decodeUriComponentLoose(head.slice(ci + 1)),
    sni: uriPick(q, ["sni", "peer", "servername"]),
    tls: split.scheme === "https" ? true : ""
  } };
}
function uriNodeSocks5(split) {
  var auth = uriAuthority(split.body);
  if (!auth) {
    var bare = str(split.body);
    var bslash = bare.indexOf("/");
    if (bslash >= 0) bare = bare.slice(0, bslash);
    var bcolon = bare.lastIndexOf(":");
    if (bcolon <= 0) return { reason: "unparsed-authority" };
    var bHost = bare.slice(0, bcolon);
    var bPort = Number(bare.slice(bcolon + 1));
    if (!bHost || !(bPort >= 1 && bPort <= 65535)) return { reason: "unparsed-authority" };
    var bq = uriQueryMap(split.query);
    var bSec = uriPick(bq, ["tls", "security"]).toLowerCase();
    return { node: {
      type: "socks5",
      server: bHost,
      port: bPort,
      username: "",
      password: "",
      tls: (bSec === "tls" || bSec === "1" || bSec === "true") ? true : "",
      sni: uriPick(bq, ["sni", "peer", "servername"])
    } };
  }
  var head = str(auth.head);
  var ci = head.indexOf(":");
  var q = uriQueryMap(split.query);
  var sec = uriPick(q, ["tls", "security"]).toLowerCase();
  return { node: {
    type: "socks5",
    server: auth.host,
    port: auth.port,
    username: ci >= 0 ? decodeUriComponentLoose(head.slice(0, ci)) : decodeUriComponentLoose(head),
    password: ci >= 0 ? decodeUriComponentLoose(head.slice(ci + 1)) : "",
    tls: (sec === "tls" || sec === "1" || sec === "true") ? true : "",
    sni: uriPick(q, ["sni", "peer", "servername"])
  } };
}
function uriNodeSsr(split) {
  var decoded = base64DecodeLoose(split.body);
  if (!decoded) return { reason: "unparsed-ssr" };
  var text = str(decoded);
  var slash = text.indexOf("/?");
  var query = "";
  if (slash >= 0) { query = text.slice(slash + 2); text = text.slice(0, slash); }
  var parts = text.split(":");
  if (parts.length < 6) return { reason: "unparsed-ssr" };
  var passwordB64 = parts.slice(5).join(":");
  var password = base64DecodeLoose(passwordB64);
  if (password === null) return { reason: "unparsed-ssr-password" };
  var port = Number(parts[1]);
  if (!(port >= 1 && port <= 65535)) return { reason: "invalid-port" };
  var q = uriQueryMap(query);
  var protocol = str(parts[2]).trim();
  var method = str(parts[3]).trim();
  var obfs = str(parts[4]).trim();
  if (!method) method = "none";
  if (!protocol) protocol = "origin";
  if (!obfs) obfs = "plain";
  var node = {
    type: "ssr",
    server: str(parts[0]).trim(),
    port: port,
    cipher: method,
    password: password,
    protocol: protocol,
    obfs: obfs
  };
  var pp = uriPick(q, ["protoparam"]);
  if (pp) {
    var ppDec = base64DecodeLoose(pp);
    node["protocol-param"] = ppDec === null ? pp : ppDec;
  }
  var op = uriPick(q, ["obfsparam"]);
  if (op) {
    var opDec = base64DecodeLoose(op);
    node["obfs-param"] = opDec === null ? op : opDec;
  }
  return { node: node };
}
function uriBuildNode(split) {
  switch (split.scheme) {
    case "vless": return uriNodeVless(split);
    case "vmess": return uriNodeVmess(split);
    case "trojan": return uriNodeTrojan(split);
    case "ss": return uriNodeSs(split);
    case "ssr": return uriNodeSsr(split);
    case "hysteria2": case "hy2": return uriNodeHysteria2(split);
    case "anytls": return uriNodeAnytls(split);
    case "http": case "https": return uriNodeHttp(split);
    case "socks5": case "socks": return uriNodeSocks5(split);
  }
  return null;
}
function uriApplyLoonParams(q, node) {
  if (!q || !node) return;
  if (uriTruthy(q["wss"]) && (node.type === "vmess" || node.type === "vless" || node.type === "trojan")) {
    var explicitNet = uriPick(q, ["type", "network"]).toLowerCase();
    if (!explicitNet || explicitNet === "tcp") {
      node.network = "ws";
      node.tls = true;
    }
  }
  if (!clashText(node.servername || node["server-name"] || node.sni).trim()) {
    var tlsHost = uriPick(q, ["tls-host"]);
    if (tlsHost) node.servername = tlsHost;
  }
  if (!clashText(node.alpn).trim()) {
    var tlsAlpn = uriPick(q, ["tls-alpn"]);
    if (tlsAlpn) node.alpn = tlsAlpn;
  }
  if (node["skip-cert-verify"] === undefined) {
    var tvBool = parseBooleanLike(uriPick(q, ["tls-verification"]));
    if (tvBool !== null) node["skip-cert-verify"] = !tvBool;
  }
  if (node.udp === undefined) {
    var udpRelay = uriPick(q, ["udp-relay"]);
    if (udpRelay !== "") node.udp = uriTruthy(udpRelay);
  }
  var net = str(node.network).toLowerCase();
  if (net === "ws" || net === "http" || net === "h2") {
    var obfsPath = uriPick(q, ["obfs-path"]);
    var obfsHeader = uriPick(q, ["obfs-header"]);
    if (obfsPath || obfsHeader) {
      var wsOpts = node["ws-opts"] || {};
      if (obfsPath && !str(wsOpts.path).trim()) wsOpts.path = obfsPath;
      if (obfsHeader) {
        wsOpts.headers = wsOpts.headers || {};
        if (!str(wsOpts.headers.Host).trim()) wsOpts.headers.Host = obfsHeader;
      }
      node["ws-opts"] = wsOpts;
    }
  }
}
function uriLineToNative(uriLine, explicitName) {
  var core = str(uriLine).trim();
  var split = uriSplitCore(core);
  if (!split) return { reason: "not-uri" };
  var built = uriBuildNode(split);
  if (!built) return { reason: "unsupported-scheme:" + split.scheme };
  var node = built.node;
  if (!node) return { reason: built.reason || "unparsed" };
  uriApplyLoonParams(uriQueryMap(split.query), node);
  node.name = str(explicitName).trim() || uriNameOfSplit(split);
  var res = withNameMutationSuspended(function () { return convertClashProxy(node, 1); });
  if (!res || !res.line) return { reason: (res && res.reason) || "convert-failed" };
  var line = res.line;
  var profile = str(node.__loonUriProfile);
  var sep = line.indexOf(" = ");
  if (sep > 0) {
    var namePart = line.slice(0, sep);
    var valuePart = line.slice(sep + 3).replace(/,\s*tls-profile\s*=\s*("[^"]*"|[^,]*)/i, "");
    if (profile) valuePart += ",tls-profile=" + profile;
    line = namePart + " = " + valuePart;
  }
  var idx = line.indexOf(" = ");
  return { line: line, name: idx > 0 ? line.slice(0, idx) : "" };
}
function forceNativeLineTlsProfile(fullLine, forced) {
  var sep = str(fullLine).indexOf(" = ");
  if (sep <= 0) return null;
  var next = forceLoonTlsProfile(str(fullLine).slice(sep + 3), forced);
  if (next === null) return null;
  return str(fullLine).slice(0, sep) + " = " + next;
}
function buildUriItem(rawLine, forcedProfile) {
  var normalizedLine = normalizeNonStandardUri(rawLine);
  var normalized = normalizedLine !== rawLine;
  var accessor = getUriNameAccessor(normalizedLine);
  var uriName = accessor ? modifyName(accessor.name) : "";
  var converted = uriLineToNative(normalizedLine, uriName);
  if (converted && converted.line) {
    var nativeLine = converted.line;
    var pf = false;
    if (forcedProfile) {
      var forcedNative = forceNativeLineTlsProfile(nativeLine, forcedProfile);
      if (forcedNative !== null && forcedNative !== nativeLine) { nativeLine = forcedNative; pf = true; }
    }
    uriConvertStats.converted++;
    return {
      line: nativeLine,
      name: str(converted.name).trim() || uriName,
      normalized: normalized,
      renamed: nativeLine !== rawLine,
      profileForced: pf,
      named: accessor !== null
    };
  }
  uriConvertLogKeep((converted && converted.reason) || "convert-failed");
  if (!accessor) {
    return { line: normalizedLine, name: uriName, normalized: normalized, renamed: normalizedLine !== rawLine, profileForced: false, named: false };
  }
  var uriLine = renderUriNodeLine(normalizedLine, accessor, uriName);
  var uriPf = false;
  if (forcedProfile) {
    var forcedUri = forceUriTlsProfile(uriLine, forcedProfile);
    if (forcedUri !== null && forcedUri !== uriLine) { uriLine = forcedUri; uriPf = true; }
  }
  return {
    line: uriLine,
    name: uriName,
    normalized: normalized,
    renamed: uriLine !== rawLine,
    profileForced: uriPf,
    named: accessor !== null
  };
}

(function init() {
  var arg = typeof $argument !== "undefined" ? $argument : null;
  if (arg && typeof arg === "object") {
    if (arg.pre !== undefined) pre = str(arg.pre);
    if (arg.suf !== undefined) suf = str(arg.suf);
    if (arg.emoji !== undefined) emoji = bool(arg.emoji);
    if (arg.rename !== undefined) rename = str(arg.rename);
    if (arg.sort !== undefined) sort = str(arg.sort);
    if (arg.exc !== undefined) exc = str(arg.exc);
    if (arg.ua !== undefined) ua = bool(arg.ua);
    if (arg.userAgent !== undefined) userAgent = str(arg.userAgent);
    if (arg.noCache !== undefined) noCache = bool(arg.noCache);
    if (arg.importNodes !== undefined) importNodes = str(arg.importNodes);
    if (arg.tlsProfile !== undefined) tlsProfile = str(arg.tlsProfile);
  }
  parseRename();
  parseSort();
  parseExclude();
  logStartupOnce();
  if (ua && type === 1) refetchWithUserAgent();
  else finish(typeof $resource !== "undefined" ? $resource : "");
})();
