/**
 * Loon Resource Parser
 *
 * Author: mc2u
 * Repository: https://github.com/mc2u/Loon
 *
 * 用于 Loon 节点订阅的资源解析脚本，主要用于节点名称修改和排序；也可通过 `Shadowrocket/3082` User-Agent 重新拉取订阅，以解决部分订阅未向 Loon 下发新协议节点或下发不及时的情况。
 *
 * 功能：
 * - 添加节点名前缀
 * - 添加节点名后缀
 * - 去除节点名中的 emoji
 * - 普通文本替换
 * - 按关键词自定义节点排序
 * - 使用 Shadowrocket User-Agent 重新拉取订阅
 * - 按订阅 URL 保存独立配置
 * - 重置当前订阅配置
 *
 * 支持参数：
 * - pre=      给节点名添加前缀，例如 pre=🍑
 * - suf=      给节点名添加后缀，例如 suf=🍓
 * - emoji     去除节点名中的 emoji
 * - rename=   普通文本替换，例如 rename=香港:HK,日本:JP
 * - sort=     按关键词顺序排序节点，例如 sort=香港,日本,新加坡,美国
 * - ua        使用 Shadowrocket User-Agent 重新拉取订阅
 * - reset     清空当前订阅已保存的配置
 *
 * 参数说明：
 * - pre=🍑
 *   给所有节点名称前面添加 🍑
 * - suf=🍓
 *   给所有节点名称后面添加 🍓
 * - emoji
 *   去除节点名称中的 emoji
 * - rename=香港:HK,日本:JP,新加坡:SG
 *   将香港、日本、新加坡分别替换为 HK、JP、SG
 * - rename=0.1倍:
 *   删除节点名中的 0.1倍
 * - sort=香港,日本,新加坡,美国
 *   按关键词顺序排序节点
 * - ua
 *   使用 Shadowrocket User-Agent 重新拉取当前订阅
 * - reset
 *   清空当前订阅已保存的参数配置
 *
 * 组合示例：
 * - ua&pre=🍑
 *   使用 Shadowrocket UA 并添加前缀
 * - ua&emoji
 *   使用 Shadowrocket UA 并去除 emoji
 * - ua&emoji&rename=0.1倍:&pre=🍑
 *   使用 Shadowrocket UA，去 emoji，删除倍率并添加前缀
 * - emoji&pre=🍑
 *   去除 emoji 后添加前缀
 * - rename=0.1倍:&pre=🍑
 *   删除倍率后添加前缀
 * - emoji&pre=🍑&suf=🍓
 *   同时添加前缀、后缀并去除 emoji
 * - sort=香港,日本,新加坡,美国
 *   按香港、日本、新加坡、美国的顺序排列节点
 *
 * 建议配置顺序：
 * - ua -> emoji -> rename -> pre -> suf -> sort
 *
 * 配置说明：
 * - 参数按订阅 URL 单独保存
 * - 不同订阅互不影响
 * - 不重新填写参数时，会优先使用已保存配置
 * - 如果订阅编辑界面的参数输入框内出现 xxx = https...，直接点 x 删除掉后重新填写参数即可
 * - 修改参数后需要手动更新订阅才会生效
 * - 如果仍不生效，请前往“设置 -> 外部资源 -> 资源解析器”更新一次
 */

var type = $resourceType;
var result = "";

var pre = "";
var suf = "";
var emoji = false;
var rename = "";
var sort = "";
var ua = false;
var HAS_SUPPORTED_PARAM = false;

function getStorageKey() {
    var url = "default";
    if (typeof $resourceUrl !== 'undefined' && $resourceUrl) url = String($resourceUrl);
    return "loon_parser_config_" + encodeURIComponent(url);
}

function isSupportedParamKey(key) {
    return key === 'pre' || key === 'suf' || key === 'emoji' || key === 'rename' || key === 'sort' || key === 'ua' || key === 'reset';
}

function cleanEmoji(text) {
    return String(text || '').replace(/[\u{1F1E0}-\u{1F1FF}]|[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1FA00}-\u{1FAFF}]|[\u{1FB00}-\u{1FBFF}]|[\u{1F900}-\u{1F9FF}]/gu, '').replace(/\s+/g, ' ').trim();
}

function normalizeText(s) {
    s = String(s || '');
    if (s && s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
    return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function parseRename(raw) {
    var pairs = [];
    if (!raw) return pairs;
    var items = String(raw).split(',');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item) continue;
        var idx = item.indexOf(':');
        if (idx === -1) continue;
        var from = item.slice(0, idx).trim();
        var to = item.slice(idx + 1).trim();
        if (from === '') continue;
        pairs.push([from, to]);
    }
    return pairs;
}

function applyRename(name) {
    var n = String(name || '');
    var pairs = parseRename(rename);
    for (var i = 0; i < pairs.length; i++) {
        n = n.split(pairs[i][0]).join(pairs[i][1]);
    }
    return n;
}

function getSortIndex(name) {
    if (!sort) return -1;
    var rules = String(sort).split(',');
    var n = String(name || '');
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i].trim();
        if (rule && n.indexOf(rule) !== -1) return i;
    }
    return rules.length;
}

function sortItemsByName(items) {
    if (!sort || !items.length) return items;
    items.sort(function(a, b) {
        var ai = getSortIndex(a.name);
        var bi = getSortIndex(b.name);
        if (ai !== bi) return ai - bi;
        return a.index - b.index;
    });
    return items;
}

function modifyName(name) {
    var n = String(name || '');
    if (emoji) n = cleanEmoji(n);
    if (rename) n = applyRename(n);
    if (pre) n = pre + n;
    if (suf) n = n + suf;
    return n;
}

function base64DecodeUnicode(str) {
    try {
        if (typeof atob !== 'undefined') {
            var binary = atob(str);
            var bytes = [];
            for (var i = 0; i < binary.length; i++) bytes.push('%' + ('00' + binary.charCodeAt(i).toString(16)).slice(-2));
            return decodeURIComponent(bytes.join(''));
        }
    } catch (e) {}
    return null;
}

function base64EncodeUnicode(str) {
    try {
        if (typeof btoa !== 'undefined') {
            var enc = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            });
            return btoa(enc);
        }
    } catch (e) {}
    return null;
}

function looksLikeBase64(text) {
    var s = String(text || '').replace(/\s+/g, '');
    if (!s || s.length < 16) return false;
    if (s.length % 4 !== 0) return false;
    return /^[A-Za-z0-9+/=]+$/.test(s);
}

function renameLoonStyleText(text) {
    var raw = normalizeText(text).trim();
    if (!raw) return "";

    var lines = raw.split('\n');
    var output = [];
    var count = 0;
    var items = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.charAt(0) === '#') {
            output.push(line);
            continue;
        }

        var eqPos = line.indexOf('=');
        if (eqPos > 0) {
            var name = line.substring(0, eqPos).trim();
            var value = line.substring(eqPos + 1).trim();
            items.push({ index: items.length, name: modifyName(name), value: value });
            count++;
            continue;
        }

        output.push(line);
    }

    items = sortItemsByName(items);
    for (var j = 0; j < items.length; j++) {
        output.push(items[j].name + '=' + items[j].value);
    }

    console.log('[解析器] 已修改节点数: ' + count);
    return output.join('\n');
}

function renameBase64UriList(text) {
    var compact = String(text || '').replace(/\s+/g, '');
    var decoded = base64DecodeUnicode(compact);
    if (!decoded) return null;

    var lines = normalizeText(decoded).split('\n');
    var changed = 0;
    var items = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;
        var hashPos = line.lastIndexOf('#');
        if (hashPos > -1 && hashPos < line.length - 1) {
            var left = line.slice(0, hashPos + 1);
            var frag = line.slice(hashPos + 1);
            var oldName = '';
            try { oldName = decodeURIComponent(frag); }
            catch (e) { oldName = frag; }
            items.push({ index: items.length, name: modifyName(oldName), left: left });
            changed++;
        } else {
            items.push({ index: items.length, name: '', raw: line, noHash: true });
        }
    }

    var sortable = [];
    var passthrough = [];
    for (var j = 0; j < items.length; j++) {
        if (items[j].noHash) passthrough.push(items[j]);
        else sortable.push(items[j]);
    }

    sortable = sortItemsByName(sortable);
    var merged = sortable.concat(passthrough);
    var output = [];
    for (var k = 0; k < merged.length; k++) {
        if (merged[k].noHash) output.push(merged[k].raw);
        else output.push(merged[k].left + encodeURIComponent(merged[k].name));
    }

    var encoded = base64EncodeUnicode(output.join('\n'));
    if (!encoded) return null;

    console.log('[解析器] 已修改节点数: ' + changed);
    return encoded;
}

function processResourceContent(content) {
    var raw = normalizeText(content);
    var configParts = [];
    if (ua) configParts.push('ua');
    if (emoji) configParts.push('emoji');
    if (rename) configParts.push('rename=' + rename);
    if (pre) configParts.push('pre=' + pre);
    if (suf) configParts.push('suf=' + suf);
    if (sort) configParts.push('sort=' + sort);
    console.log('[解析器] 当前配置: ' + (configParts.length ? configParts.join(', ') : '无'));
    console.log('[解析器] 订阅内容长度: ' + raw.length);

    var trimmed = raw.trim();
    if (!trimmed) {
        return "";
    }

    var base64Result = null;
    if (looksLikeBase64(trimmed)) {
        base64Result = renameBase64UriList(trimmed);
        if (base64Result !== null) return base64Result;
    }

    return renameLoonStyleText(trimmed);
}

function finishWithContent(content) {
    if (type == 1) result = processResourceContent(content);
    else result = String(content || "");
    console.log('[解析器] 处理完成');
    $done(result);
}

var STORAGE_KEY = getStorageKey();

var savedConfig = $persistentStore.read(STORAGE_KEY);
if (savedConfig) {
    try {
        var c = JSON.parse(savedConfig);
        pre = c.pre || "";
        suf = c.suf || "";
        emoji = c.emoji || false;
        rename = c.rename || "";
        sort = c.sort || "";
        ua = c.ua === true;
        console.log('[解析器] 已读取本地配置');
    } catch (e) {
        console.log('[解析器] 本地配置解析失败');
    }
} else {
    console.log('[解析器] 未找到本地配置，使用默认值');
}

var argStr = "";
if (typeof $argument !== 'undefined' && $argument) {
    argStr = $argument.toString();
} else if (typeof $args !== 'undefined' && $args) {
    argStr = $args.toString();
} else if (typeof $parameter !== 'undefined' && $parameter) {
    argStr = $parameter.toString();
}

var params = [];
var canUpdateConfig = false;
var doReset = false;
if (argStr) {
    params = argStr.split('&');
    for (var i = 0; i < params.length; i++) {
        var kv0 = params[i].split('=');
        var key0 = (kv0[0] || "").trim().toLowerCase();
        var value0 = kv0.length > 1 ? decodeURIComponent(kv0.slice(1).join('=').trim()) : '';
        if (isSupportedParamKey(key0)) HAS_SUPPORTED_PARAM = true;
        if (key0 === 'reset' && value0 === '') doReset = true;
    }
}

if (argStr && !argStr.match(/^https?:\/\//) && HAS_SUPPORTED_PARAM) {
    canUpdateConfig = true;
}

if (canUpdateConfig) {
    if (doReset) {
        pre = "";
        suf = "";
        emoji = false;
        rename = "";
        sort = "";
        ua = false;
    }
    for (var j = 0; j < params.length; j++) {
        var kv = params[j].split('=');
        var key = (kv[0] || "").trim().toLowerCase();
        var value = kv.length > 1 ? decodeURIComponent(kv.slice(1).join('=').trim()) : '';

        if (key === 'pre') pre = value;
        else if (key === 'suf') suf = value;
        else if (key === 'emoji') emoji = value === '';
        else if (key === 'rename') rename = value;
        else if (key === 'sort') sort = value;
        else if (key === 'ua') ua = value === '';
        else if (key === 'reset') {}
    }

    var config = { pre: pre, suf: suf, emoji: emoji, rename: rename, sort: sort, ua: ua };
    $persistentStore.write(JSON.stringify(config), STORAGE_KEY);
    console.log('[解析器] 已更新本地配置');
} else {
    console.log('[解析器] 未更新本地配置');
}

function refetchWithShadowrocketUA() {
    if (typeof $httpClient === 'undefined' || !$httpClient) {
        console.log('[解析器] 当前环境不支持自定义 UA 拉取，已回退默认内容');
        finishWithContent($resource || "");
        return;
    }
    if (typeof $resourceUrl === 'undefined' || !$resourceUrl) {
        console.log('[解析器] 缺少资源地址，已回退默认内容');
        finishWithContent($resource || "");
        return;
    }

    var req = {
        url: String($resourceUrl),
        headers: {
            'User-Agent': 'Shadowrocket/3082'
        }
    };

    console.log('[解析器] 已启用 Shadowrocket UA');

    $httpClient.get(req, function(error, response, data) {
        if (error || !data) {
            console.log('[解析器] Shadowrocket UA 拉取失败，已回退默认内容');
            finishWithContent($resource || "");
            return;
        }
        console.log('[解析器] Shadowrocket UA 拉取成功');
        finishWithContent(data);
    });
}

if (ua && type == 1) refetchWithShadowrocketUA();
else finishWithContent($resource || "");
