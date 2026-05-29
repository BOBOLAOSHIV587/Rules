/*
 * Bilibili 关键词屏蔽与清理插件。
 * 同时处理首页推荐页 JSON 和首页热门、视频页的 protobuf gRPC 响应。
 */

/* -------------------------------------------------------------------------- */
/* 配置、参数与日志                                                           */
/* -------------------------------------------------------------------------- */

// 插件参数默认值。
const DEFAULTS = {
  titleKeywords: "",
  blockedUps: "",
  deepFilter: false,
  videoTagKeywords: "",
  dynamicKeywords: "",
  searchResultKeywords: "",
  searchSuggestKeywords: "",
  cleanFeedAds: true,
  cleanFeedPromotedVideos: true,
  cleanVideoRelatedPromotedContent: true,
  cleanVideoRelatedAds: true,
  cleanVideoBannerAds: true,
  cleanVideoRelatedLiveRecommendations: true,
  cleanVideoUpGoodsAds: true,
  cleanSplashAds: true,
  cleanStartupAds: true,
  cleanSearchTrending: true,
  cleanSearchHistory: true,
  cleanSearchDiscovery: true,
  cleanSearchDefaultWords: true,
  cleanSearchResultAds: true,
  cleanSearchResultCreatorPromotions: true,
  cleanSearchResultLiveRooms: true,
  cleanSearchResultAggregationCards: true,
  cleanBottomExtraButtons: true,
  cleanMineCreationCenter: true,
  cleanMineServices: true,
  cleanDynamicUpRecommendations: "移除推荐动态",
  caseSensitive: false,
  notifyRemove: false,
  notifyFilter: false,
  notifyPersonalization: false,
  logLevel: "warn",
};

// 脚本日志级别映射。
const LogLevel = { debug: 1, info: 2, warn: 3, error: 4, off: 5 };

// 持久化存储 key。
const TAG_CACHE_KEY = "BilibiliFilter.tagCache.v1";

// Tag 缓存和远端请求限制。并发会按待请求数量动态收缩，最高 24 路。
const TAG_CACHE_LIMIT = 500;
const TAG_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const TAG_FETCH_TIMEOUT_MS = 1500;
const TAG_FETCH_CONCURRENCY_LIMIT = 24;

// 首页普通视频卡类型白名单。
const HOME_FEED_VIDEO_CARD_TYPES = ["small_cover_v2", "large_cover_single_v9", "large_cover_v1"];

// 规则名到用户可见文案的唯一映射，避免通知、日志和测试里各自维护一份。
const BLOCK_RULE_LABELS = {
  titleContains: "屏蔽-视频标题（关键词）",
  upExact: "屏蔽-UP 主（名称）",
  tagRegex: "深度屏蔽-视频 Tag（可正则）",
  dynamicKeywords: "屏蔽-动态页动态（关键词）",
  searchResultKeywords: "屏蔽-搜索结果（关键词）",
  searchSuggestKeywords: "屏蔽-搜索候选词条（关键词）",
  searchResultAds: "移除-搜索结果的广告",
  searchResultCreatorPromotions: "移除-搜索结果的创作推广",
  searchResultLiveRooms: "移除-搜索结果的直播",
  searchResultAggregationCards: "移除-搜索结果聚合卡片",
  contentContains: "关键词",
};

// SearchAll 清理规则按通知展示顺序声明；priority 控制实际命中优先级。
const SEARCH_RESULT_CLEANUP_RULES = [
  {
    rule: "searchResultAds",
    key: "ads",
    argKey: "cleanSearchResultAds",
    subtitle: "清理广告",
    priority: 40,
    matches: ({ info }) => isSearchResultAdType(info.type, info.topLevelTypes),
  },
  {
    rule: "searchResultCreatorPromotions",
    key: "creatorPromotions",
    argKey: "cleanSearchResultCreatorPromotions",
    subtitle: "清理创作推广",
    priority: 30,
    matches: ({ types }) => types.includes("video_ad"),
  },
  {
    rule: "searchResultLiveRooms",
    key: "liveRooms",
    argKey: "cleanSearchResultLiveRooms",
    subtitle: "清理直播",
    priority: 20,
    matches: ({ types }) => types.some((type) => type === "live_room" || type === "live"),
  },
  {
    rule: "searchResultAggregationCards",
    key: "aggregationCards",
    argKey: "cleanSearchResultAggregationCards",
    subtitle: "清理聚合卡片",
    priority: 10,
    matches: ({ types }) => types.includes("pedia_card_pic"),
  },
];
const SEARCH_RESULT_CLEANUP_RULES_BY_PRIORITY = [...SEARCH_RESULT_CLEANUP_RULES]
  .sort((left, right) => left.priority - right.priority);

// 需要按布尔值解释的参数名。
const BOOLEAN_ARG_KEYS = [
  "caseSensitive",
  "deepFilter",
  "cleanFeedAds",
  "cleanFeedPromotedVideos",
  "cleanVideoRelatedPromotedContent",
  "cleanVideoRelatedAds",
  "cleanVideoBannerAds",
  "cleanVideoRelatedLiveRecommendations",
  "cleanVideoUpGoodsAds",
  "cleanSplashAds",
  "cleanStartupAds",
  "cleanSearchTrending",
  "cleanSearchHistory",
  "cleanSearchDiscovery",
  "cleanSearchDefaultWords",
  "cleanSearchResultAds",
  "cleanSearchResultCreatorPromotions",
  "cleanSearchResultLiveRooms",
  "cleanSearchResultAggregationCards",
  "cleanBottomExtraButtons",
  "cleanMineCreationCenter",
  "cleanMineServices",
  "notifyRemove",
  "notifyFilter",
  "notifyPersonalization",
];

// 当前脚本实际使用的参数集合。
const arg = parseArgument(DEFAULTS);
applyBooleanArgs(arg, BOOLEAN_ARG_KEYS);

// 动态页推荐清理模式会单独规范化成固定枚举。
const dynamicUpRecommendationMode = normalizeDynamicUpRecommendationMode(arg.cleanDynamicUpRecommendations);

// 当前执行的日志等级。
const logLevel = LogLevel[String(arg.logLevel || "warn").toLowerCase()] || LogLevel.warn;

// 按日志等级输出脚本日志。
function log(level, ...items) {
  if ((LogLevel[level] || LogLevel.info) >= logLevel) {
    console.log(`[BilibiliFilter][${level}] ${items.map(stringify).join(" ")}`);
  }
}

// 把任意值转成便于日志输出的字符串。
function stringify(value) {
  if (value instanceof Error) return `${value.message} ${value.stack || ""}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// 解析 Loon 传入的参数。
function parseArgument(defaults) {
  const result = { ...defaults };
  if (typeof $argument === "object" && $argument) {
    return { ...result, ...$argument };
  }
  if (typeof $argument === "string" && $argument.trim()) {
    try {
      return { ...result, ...JSON.parse($argument) };
    } catch {
      for (const part of $argument.split(/[,&]/)) {
        const index = part.indexOf("=");
        if (index > 0) {
          result[part.slice(0, index).trim()] = part.slice(index + 1).trim();
        }
      }
    }
  }
  return result;
}

// 把常见布尔写法转成布尔值。
function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return /^(true|1|yes|on)$/i.test(value.trim());
  return false;
}

// 批量规范化布尔参数。
function applyBooleanArgs(target, keys) {
  for (const key of keys) target[key] = parseBoolean(target[key]);
}

// 规范化动态页推荐清理模式。
function normalizeDynamicUpRecommendationMode(value) {
  if (typeof value === "boolean") return value ? "module" : "off";
  if (typeof value === "number") return value ? "module" : "off";

  const text = String(value || "").trim();
  const normalized = text.toLowerCase();
  if (!text || /^(false|0|no|off|关闭|不处理)$/.test(normalized)) return "off";
  if (/^(removedynamic|remove_dynamic|dynamic|item|all|移除推荐动态|移除整条推荐动态|移除整条动态|整条动态)$/.test(normalized)) return "dynamic";
  if (/^(true|1|yes|on|removemodule|remove_module|module|移除推荐模块|移除模块|推荐模块)$/.test(normalized)) return "module";
  return parseBoolean(text) ? "module" : "off";
}

// 解析关键词列表。
function parseKeywords(value, caseSensitive) {
  const words = Array.isArray(value)
    ? value
    : String(value || "")
        .split(/[\n,，|｜;；]+/)
        .map((word) => word.trim());
  const normalized = words.filter(Boolean);
  return caseSensitive ? normalized : normalized.map((word) => word.toLowerCase());
}

// 解析用于展示的关键词列表。
function parseDisplayKeywords(value) {
  return (Array.isArray(value) ? value : String(value || "").split(/[\n,，|｜;；]+/))
    .map((word) => String(word).trim())
    .filter(Boolean);
}

// 解析视频 Tag 正则列表。
function parseVideoTagPatterns(value) {
  const words = Array.isArray(value)
    ? value
    : String(value || "")
        .replace(/｜/g, "|")
        .split(/[\n,，;；]+/);
  return words
    .map((word) => String(word).trim())
    .filter(Boolean);
}

// 构建可执行的正则规则。
function buildRegexRules(patterns, caseSensitive) {
  return patterns
    .map((pattern) => {
      try {
        return { pattern, regex: new RegExp(pattern, caseSensitive ? "" : "i") };
      } catch (error) {
        log("warn", "invalid video tag regex", pattern, error);
        return null;
      }
    })
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* 字节、gRPC 与 protobuf 基础工具                                            */
/* -------------------------------------------------------------------------- */

// 解压 gzip 字节数据。
function gunzip(bytes) {
  bytes = toBytes(bytes);
  if (typeof $utils !== "undefined" && typeof $utils.ungzip === "function") {
    return toBytes($utils.ungzip(bytes));
  }
  if (typeof require === "function") {
    return new Uint8Array(require("zlib").gunzipSync(Buffer.from(bytes)));
  }
  throw new Error("gzip is unavailable in this runtime");
}

// 把不同输入统一转成字节数组。
function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (Array.isArray(value)) return new Uint8Array(value);
  if (typeof value === "string") return new TextEncoder().encode(value);
  throw new Error(`unsupported bytes type: ${Object.prototype.toString.call(value)}`);
}

// 读取 protobuf varint。
function readVarint(buffer, offset) {
  let value = 0;
  let shift = 0;
  let pos = offset;
  while (pos < buffer.length) {
    const byte = buffer[pos++];
    value += (byte & 0x7f) * 2 ** shift;
    if ((byte & 0x80) === 0) return { value, offset: pos };
    shift += 7;
    if (shift > 63) throw new Error("invalid varint");
  }
  throw new Error("truncated varint");
}

// 跳过当前 protobuf 值。
function skipValue(buffer, offset, wireType) {
  switch (wireType) {
    case 0:
      return readVarint(buffer, offset).offset;
    case 1:
      return offset + 8;
    case 2: {
      const length = readVarint(buffer, offset);
      return length.offset + length.value;
    }
    case 5:
      return offset + 4;
    default:
      throw new Error(`unsupported wire type ${wireType}`);
  }
}

// 解析 protobuf 字段列表。
function parseFields(buffer) {
  const fields = [];
  let offset = 0;
  while (offset < buffer.length) {
    const start = offset;
    const tag = readVarint(buffer, offset);
    offset = tag.offset;
    const no = Math.floor(tag.value / 8);
    const wireType = tag.value & 7;
    let valueStart = offset;
    let valueEnd;
    if (wireType === 2) {
      const length = readVarint(buffer, offset);
      valueStart = length.offset;
      valueEnd = valueStart + length.value;
      offset = valueEnd;
    } else {
      offset = skipValue(buffer, offset, wireType);
      valueEnd = offset;
    }
    if (offset > buffer.length) throw new Error("protobuf field exceeds buffer");
    fields.push({
      no,
      wireType,
      raw: buffer.subarray(start, offset),
      value: buffer.subarray(valueStart, valueEnd),
    });
  }
  return fields;
}

// 拼接多个字节数组。
function concat(chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

// 全局 UTF-8 解码器。
const decoder = new TextDecoder("utf-8");

// 把字节数组解码为字符串。
function decodeString(bytes) {
  try {
    return decoder.decode(bytes);
  } catch {
    return "";
  }
}

// 读取指定字段号下的字符串字段。
function fieldStrings(fields, no) {
  return fields
    .filter((field) => field.no === no && field.wireType === 2)
    .map((field) => decodeString(field.value))
    .filter(Boolean);
}

// 读取指定字段号下的首个嵌套消息。
function firstMessage(fields, no) {
  return fields.find((field) => field.no === no && field.wireType === 2)?.value || null;
}

// 提取热门卡片里的标题、UP 和 aid。
function extractCardText(cardBytes) {
  const result = { titles: [], upNames: [], aid: extractAidFromText(decodeString(cardBytes)) };

  const card = parseFields(cardBytes);
  const smallCoverBytes = firstMessage(card, 1);
  if (!smallCoverBytes) return result;

  const smallCover = parseFields(smallCoverBytes);
  result.upNames.push(...fieldStrings(smallCover, 5));

  const baseBytes = firstMessage(smallCover, 1);
  if (!baseBytes) return result;

  const base = parseFields(baseBytes);
  result.aid = extractAidFromText(fieldStrings(base, 2).join(" ")) || result.aid;
  result.titles.push(...fieldStrings(base, 6));

  // 当前 iOS 首页热门的分享元数据里也带有标题和 UP。
  for (const share of base.filter((field) => field.no === 18 && field.wireType === 2)) {
    try {
      const shareFields = parseFields(share.value);
      for (const shareItem of shareFields.filter((field) => field.no === 1 && field.wireType === 2)) {
        const itemFields = parseFields(shareItem.value);
        result.titles.push(...fieldStrings(itemFields, 1));
        result.upNames.push(...fieldStrings(itemFields, 8));
      }
    } catch (error) {
      log("debug", "failed to parse share metadata", error);
    }
  }

  return result;
}

// 从文本里提取 aid。
function extractAidFromText(text) {
  const value = String(text || "");
  const match = value.match(/bilibili:\/\/(?:video|story)\/(\d+)/)
    || value.match(/(?:^|[?&])aid=(\d+)/)
    || value.match(/"aid"\s*:\s*(\d+)/)
    || value.match(/\bav(\d{6,})\b/i);
  if (match) return match[1];

  const typedVideoIdMatch = value.match(/"id"\s*:\s*(\d+)\s*,\s*"type"\s*:\s*"video"/)
    || value.match(/"type"\s*:\s*"video"\s*,\s*"id"\s*:\s*(\d+)/);
  return typedVideoIdMatch ? typedVideoIdMatch[1] : "";
}

// 规范化 UP 主名称。
function normalizeUpName(value) {
  return String(value || "").replace(/^(UP主|频道)[:：]/, "").replace(/\s+/g, " ").trim();
}

// 判断当前通知类别是否开启。
function notificationEnabled(category) {
  if (Array.isArray(category)) return category.some((item) => notificationEnabled(item));
  if (category === "remove") return arg.notifyRemove;
  if (category === "filter") return arg.notifyFilter;
  if (category === "personalization") return arg.notifyPersonalization;
  return arg.notifyRemove || arg.notifyFilter || arg.notifyPersonalization;
}

// 弹窗开启时，通知内容始终同步写入脚本运行日志。
function logNotification(title, subtitle, message, attach) {
  const lines = [`[BilibiliFilter][notify] ${title || ""}`];
  if (subtitle) lines.push(String(subtitle));
  if (message) lines.push(String(message));
  if (attach) lines.push(`attach=${stringify(attach)}`);
  console.log(lines.join("\n"));
}

// 发送脚本通知。
function notify(category, title, subtitle, message, attach) {
  if (!notificationEnabled(category)) return;
  logNotification(title, subtitle, message, attach);
  try {
    if (typeof $notification !== "undefined" && typeof $notification.post === "function") {
      $notification.post(title, subtitle, message, attach);
      return;
    }
    if (typeof $notify === "function") {
      $notify(title, subtitle, message);
    }
  } catch (error) {
    log("debug", "notification failed", error);
  }
}

// 解码 gRPC 响应体。
function decodeGrpcBody(bodyBytes) {
  bodyBytes = toBytes(bodyBytes);
  if (!bodyBytes || bodyBytes.length < 5) throw new Error("invalid grpc body");
  const compressed = bodyBytes[0] === 1;
  const length =
    bodyBytes[1] * 2 ** 24 + (bodyBytes[2] << 16) + (bodyBytes[3] << 8) + bodyBytes[4];
  const message = bodyBytes.subarray(5, 5 + length);
  return compressed ? gunzip(message) : message;
}

// 编码 gRPC 响应体。
function encodeGrpcBody(message) {
  const output = new Uint8Array(5 + message.length);
  output[0] = 0;
  output[1] = message.length >>> 24;
  output[2] = (message.length >>> 16) & 255;
  output[3] = (message.length >>> 8) & 255;
  output[4] = message.length & 255;
  output.set(message, 5);
  return output;
}

// 读取响应体字节。
function getResponseBodyBytes() {
  if ($response.bodyBytes !== undefined) return toBytes($response.bodyBytes);
  if ($response.body !== undefined) return toBytes($response.body);
  throw new Error("response body is unavailable");
}

// 读取响应体文本。
function getResponseBodyText() {
  if (typeof $response.body === "string") return $response.body;
  return decoder.decode(getResponseBodyBytes());
}

// 安全读取请求体字节。
function getRequestBodyBytesSafely() {
  if (typeof $request === "undefined" || !$request) return undefined;
  try {
    if ($request.bodyBytes !== undefined) return $request.bodyBytes;
  } catch (error) {
    log("debug", "failed to read request bodyBytes", error);
  }
  return undefined;
}

// 安全读取请求体内容。
function getRequestBodySafely() {
  if (typeof $request === "undefined" || !$request) return undefined;
  try {
    return $request.body;
  } catch (error) {
    log("debug", "failed to read request body", error);
    return undefined;
  }
}

// 写回响应体字节。
function setResponseBodyBytes(bytes) {
  if ($response.bodyBytes !== undefined) {
    $response.bodyBytes = bytes;
  } else {
    $response.body = bytes;
  }
}

// 写回响应体文本。
function setResponseBodyText(text) {
  $response.body = text;
}

// 读取当前请求 URL。
function getRequestUrl() {
  return (typeof $request !== "undefined" && $request && $request.url) || "";
}

/* -------------------------------------------------------------------------- */
/* 屏蔽规则与关键词                                                           */
/* -------------------------------------------------------------------------- */

// 构建当前执行所需的屏蔽规则。
function buildKeywords() {
  const videoTagPatterns = parseVideoTagPatterns(arg.videoTagKeywords);
  const displayTitleKeywords = mergeDisplayKeywords(parseDisplayKeywords(arg.titleKeywords));
  const displayBlockedUps = mergeDisplayKeywords(parseDisplayKeywords(arg.blockedUps));
  return {
    titleKeywords: parseKeywords(displayTitleKeywords, arg.caseSensitive),
    blockedUps: parseKeywords(displayBlockedUps, arg.caseSensitive),
    videoTagKeywords: videoTagPatterns,
    videoTagRegexes: buildRegexRules(videoTagPatterns, arg.caseSensitive),
    displayTitleKeywords,
    displayBlockedUps,
    displayVideoTagKeywords: videoTagPatterns,
  };
}

// 构建普通内容关键词规则。
function buildContentKeywords(value) {
  const displayKeywords = parseDisplayKeywords(value);
  return {
    keywords: parseKeywords(displayKeywords, arg.caseSensitive),
    displayKeywords,
  };
}

// 判断普通内容关键词是否存在。
function hasContentKeywords(keywords) {
  return keywords.displayKeywords.length > 0;
}

// 查找普通内容关键词命中。
function findContentKeywordMatch(values, keywords, rule = "contentContains") {
  if (!hasContentKeywords(keywords)) return null;
  const match = findContainsMatch(
    values,
    keywords.keywords,
    keywords.displayKeywords,
    arg.caseSensitive
  );
  return match ? { rule, keyword: match.keyword, value: match.value } : null;
}

// 判断是否启用视频 Tag 过滤。
function hasVideoTagFilter(keywords) {
  return arg.deepFilter && keywords.videoTagKeywords.length > 0;
}

// 判断是否存在任一屏蔽规则。
function hasAnyFilterRule(keywords) {
  return keywords.titleKeywords.length > 0 ||
    keywords.blockedUps.length > 0 ||
    hasVideoTagFilter(keywords);
}

// 解析 JSON 响应体。
function parseResponseJson() {
  return JSON.parse(getResponseBodyText());
}

// 汇总通用过滤统计。
function filterSummary(page, kept, removed, keywords) {
  return {
    page,
    kept,
    removed,
    titleBlockKeywords: keywords.displayTitleKeywords,
    blockedUps: keywords.displayBlockedUps,
    deepFilter: arg.deepFilter,
    videoTagKeywords: keywords.displayVideoTagKeywords,
  };
}

// 构建统一的过滤行结构。
function createFilterRow({ item = null, titles = [], upNames = [], aid = "", inlineTags = [] }) {
  return {
    item,
    titles,
    upNames,
    aid: String(aid || ""),
    inlineTags,
  };
}

// 生成命中过滤规则的展示项。
function matchedFilterItem(row) {
  return {
    title: firstNonEmpty(row.titles),
    up: firstNonEmpty(row.upNames),
    aid: row.aid,
    rule: row.match?.rule,
    keyword: row.match?.keyword,
    matchedValue: row.match?.value,
  };
}

// 查找标题或 UP 规则命中。
function findTextMatch(titles, upNames, keywords) {
  const titleMatch = findContainsMatch(titles, keywords.titleKeywords, keywords.displayTitleKeywords, arg.caseSensitive);
  if (titleMatch) {
    return { rule: "titleContains", keyword: titleMatch.keyword, value: titleMatch.value };
  }

  const upMatch = findExactMatch(upNames, keywords.blockedUps, keywords.displayBlockedUps, arg.caseSensitive);
  if (upMatch) {
    return { rule: "upExact", keyword: upMatch.keyword, value: upMatch.value };
  }

  return null;
}

// 查找视频 Tag 规则命中。
function findTagMatch(tags, keywords) {
  if (!hasVideoTagFilter(keywords)) return null;
  const tagMatch = findRegexMatch(
    tags || [],
    keywords.videoTagRegexes
  );
  return tagMatch ? { rule: "tagRegex", keyword: tagMatch.keyword, value: tagMatch.value } : null;
}

// 按文本和 Tag 规则批量匹配行。
async function applyFilterMatches(rows, keywords) {
  for (const row of rows) {
    row.match = findTextMatch(row.titles, row.upNames, keywords);
  }
  await applyTagMatches(rows, keywords);
}

// 按指定并发上限处理列表。
async function mapLimited(items, limit, worker) {
  const concurrency = Math.max(1, Math.min(Number(limit) || 1, items.length || 1));
  let index = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await worker(current);
    }
  }));
}

// 批量应用视频 Tag 匹配。
async function applyTagMatches(rows, keywords) {
  if (!hasVideoTagFilter(keywords)) return;

  const needsRemoteTags = [];
  for (const row of rows) {
    if (row.match) continue;

    const inlineTagMatch = findTagMatch(row.inlineTags || [], keywords);
    if (inlineTagMatch) {
      row.match = inlineTagMatch;
      continue;
    }

    const cachedTags = getCachedTags(row.aid);
    const cachedTagMatch = findTagMatch([...(row.inlineTags || []), ...cachedTags], keywords);
    if (cachedTagMatch) {
      row.match = cachedTagMatch;
      continue;
    }

    if (row.aid) needsRemoteTags.push(row);
  }

  await mapLimited(needsRemoteTags, TAG_FETCH_CONCURRENCY_LIMIT, async (row) => {
    const tags = await ensureTagsForAid(row.aid);
    const tagMatch = findTagMatch([...(row.inlineTags || []), ...tags], keywords);
    if (tagMatch) row.match = tagMatch;
  });
}

// 查找包含匹配命中。
function findContainsMatch(values, normalizedKeywords, displayKeywords, caseSensitive) {
  if (!normalizedKeywords.length) return null;
  for (const value of values) {
    const text = caseSensitive ? String(value) : String(value).toLowerCase();
    for (let i = 0; i < normalizedKeywords.length; i += 1) {
      if (text.includes(normalizedKeywords[i])) {
        return { keyword: displayKeywords[i] || normalizedKeywords[i], value: String(value) };
      }
    }
  }
  return null;
}

// 查找完全匹配命中。
function findExactMatch(values, normalizedKeywords, displayKeywords, caseSensitive) {
  if (!normalizedKeywords.length) return null;
  for (const value of values) {
    const text = normalizeUpName(caseSensitive ? value : String(value).toLowerCase());
    for (let i = 0; i < normalizedKeywords.length; i += 1) {
      if (text === normalizeUpName(normalizedKeywords[i])) {
        return { keyword: displayKeywords[i] || normalizedKeywords[i], value: String(value) };
      }
    }
  }
  return null;
}

// 查找正则匹配命中。
function findRegexMatch(values, regexRules) {
  if (!regexRules.length) return null;
  for (const value of values) {
    const text = String(value || "");
    for (let i = 0; i < regexRules.length; i += 1) {
      const rule = regexRules[i];
      rule.regex.lastIndex = 0;
      if (rule.regex.test(text)) {
        return { keyword: rule.pattern, value: text };
      }
    }
  }
  return null;
}

// 返回首个非空字符串。
function firstNonEmpty(values) {
  return values.find((value) => String(value || "").trim()) || "";
}

// 去重并清理字符串列表。
function uniqueStrings(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

/* -------------------------------------------------------------------------- */
/* 本地存储与 Tag 缓存                                                       */
/* -------------------------------------------------------------------------- */

// 读取持久化存储。
function readStore(key) {
  try {
    if (typeof $persistentStore !== "undefined" && typeof $persistentStore.read === "function") {
      return $persistentStore.read(key);
    }
  } catch (error) {
    log("debug", "persistent read failed", error);
  }
  return null;
}

// 写入持久化存储。
function writeStore(key, value) {
  try {
    if (typeof $persistentStore !== "undefined" && typeof $persistentStore.write === "function") {
      return $persistentStore.write(value, key);
    }
  } catch (error) {
    log("debug", "persistent write failed", error);
  }
  return false;
}

// 清理展示用关键词。
function cleanDisplayKeyword(value) {
  return String(value || "")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 合并展示用关键词列表。
function mergeDisplayKeywords(...groups) {
  const result = [];
  const seen = new Set();
  for (const group of groups) {
    for (const value of group || []) {
      const keyword = cleanDisplayKeyword(value);
      if (!keyword) continue;
      const key = arg.caseSensitive ? keyword : keyword.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(keyword);
    }
  }
  return result;
}

// 读取 URL 查询参数。
function queryParam(url, name) {
  const query = String(url || "").split("?")[1] || "";
  for (const part of query.split("&")) {
    const index = part.indexOf("=");
    const key = index >= 0 ? part.slice(0, index) : part;
    if (key !== name) continue;
    const value = index >= 0 ? part.slice(index + 1) : "";
    try {
      return decodeURIComponent(value.replace(/\+/g, "%20"));
    } catch {
      return value;
    }
  }
  return "";
}

// 构造开屏广告空响应。请求阶段也使用它来阻断客户端继续按本地缓存拉取素材。
function emptySplashResponseBody() {
  return JSON.stringify({
    code: 0,
    message: "OK",
    ttl: 1,
    data: {
      max_time: 0,
      min_interval: 0,
      pull_interval: 0,
      keep_ids: [],
      show: [],
      list: [],
      event_list: [],
      preload: [],
      query_list: [],
      splash_request_id: "",
      new_splash_hash: "",
      show_hash: "",
      has_new_splash_set: false,
      force_show_times: 0,
      forcibly: false,
      brand_list: [],
      splash_list: [],
      ad_list: [],
      card_list: [],
      material_list: [],
      force_list: [],
      topview_list: [],
      top_view_list: [],
    },
  });
}

let tagCacheMemo = null;

// 读取 Tag 缓存。
function readTagCache() {
  if (tagCacheMemo) return tagCacheMemo;
  try {
    tagCacheMemo = JSON.parse(readStore(TAG_CACHE_KEY) || '{"items":{}}');
  } catch {
    tagCacheMemo = { items: {} };
  }
  return tagCacheMemo;
}

// 写入 Tag 缓存。
function writeTagCache(cache) {
  tagCacheMemo = cache;
  writeStore(TAG_CACHE_KEY, JSON.stringify(cache));
}

// 读取指定 aid 的缓存 Tag。
function getCachedTags(aid) {
  if (!aid) return [];
  const cache = readTagCache();
  const item = cache.items?.[String(aid)];
  if (!item || Date.now() - (item.updatedAt || 0) > TAG_CACHE_TTL) return [];
  return Array.isArray(item.tags) ? item.tags : [];
}

// 保存指定 aid 的 Tag 缓存。
function saveCachedTags(aid, tags, title) {
  if (!aid || !tags.length) return { status: "skipped", tags: [] };
  const cache = readTagCache();
  const key = String(aid);
  const now = Date.now();
  const nextTags = uniqueStrings(tags);
  const previous = cache.items?.[key];
  const previousTags = Array.isArray(previous?.tags) ? previous.tags : [];
  const previousFresh = previous && now - (previous.updatedAt || 0) <= TAG_CACHE_TTL;
  const status = previousFresh
    ? (sameStringSet(previousTags, nextTags) ? "unchanged" : "updated")
    : "created";
  cache.items = cache.items || {};
  cache.items[key] = {
    tags: nextTags,
    title: title || cache.items[key]?.title || "",
    updatedAt: now,
  };

  const entries = Object.entries(cache.items)
    .filter(([, item]) => now - (item.updatedAt || 0) <= TAG_CACHE_TTL)
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .slice(0, TAG_CACHE_LIMIT);
  cache.items = Object.fromEntries(entries);
  writeTagCache(cache);
  return { status, tags: nextTags };
}

// 比较两个字符串集合是否一致。
function sameStringSet(left, right) {
  const a = uniqueStrings(left).sort();
  const b = uniqueStrings(right).sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

// 单次执行内的 Tag 请求去重表。
const pendingTagRequests = {};

// 确保指定 aid 已拿到可用 Tag。
async function ensureTagsForAid(aid) {
  if (!aid || !arg.deepFilter) return [];
  const cachedTags = getCachedTags(aid);
  if (cachedTags.length) return cachedTags;
  if (pendingTagRequests[aid]) return pendingTagRequests[aid];

  pendingTagRequests[aid] = fetchArchiveTags(aid)
    .then((tags) => {
      if (tags.length) saveCachedTags(aid, tags, "");
      return tags;
    })
    .catch((error) => {
      log("debug", "failed to fetch archive tags", aid, error);
      return [];
    })
    .finally(() => {
      delete pendingTagRequests[aid];
    });
  return pendingTagRequests[aid];
}

// 请求远端视频 Tag。
async function fetchArchiveTags(aid) {
  const url = `https://api.bilibili.com/x/tag/archive/tags?aid=${encodeURIComponent(aid)}`;
  const text = await httpGetText(url);
  const json = JSON.parse(text);
  const data = Array.isArray(json?.data) ? json.data : [];
  const tags = uniqueStrings(data.map((item) => item?.tag_name || item?.name || item?.title));
  log("debug", "fetched archive tags", aid, tags);
  return tags;
}

// 发起文本 GET 请求。
function httpGetText(url) {
  return new Promise((resolve, reject) => {
    if (typeof $httpClient !== "undefined" && typeof $httpClient.get === "function") {
      $httpClient.get({
        url,
        timeout: TAG_FETCH_TIMEOUT_MS,
        headers: {
          Accept: "application/json",
          "User-Agent": "bili-universal/89200100",
        },
      }, (error, response, body) => {
        if (error) return reject(error);
        const status = Number(response?.status || response?.statusCode || 200);
        if (status >= 400) return reject(new Error(`HTTP ${status}`));
        resolve(typeof body === "string" ? body : decoder.decode(toBytes(body)));
      });
      return;
    }

    if (typeof fetch === "function") {
      fetch(url, { headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then(resolve, reject);
      return;
    }

    reject(new Error("http client is unavailable"));
  });
}

/* -------------------------------------------------------------------------- */
/* 请求参数与 protobuf 结构提取                                               */
/* -------------------------------------------------------------------------- */

// 读取指定字段号的 varint 值。
function varintField(fields, no) {
  const field = fields.find((item) => item.no === no && item.wireType === 0);
  return field ? readVarint(field.value, 0).value : "";
}

// 从 View 请求里提取 aid。
function extractViewAidFromRequest() {
  try {
    const bodyBytes = getRequestBodyBytesSafely();
    const requestBody = bodyBytes !== undefined ? bodyBytes : getRequestBodySafely();
    if (requestBody === undefined) return "";
    const message = decodeGrpcBody(toBytes(requestBody));
    return String(varintField(parseFields(message), 1) || "");
  } catch (error) {
    log("debug", "failed to extract view aid from request", error);
    return "";
  }
}

// 从 View 响应里提取 aid。
function extractViewAidFromMessage(message) {
  try {
    const viewFields = parseFields(firstMessage(parseFields(message), 2) || new Uint8Array());
    const aid = String(varintField(viewFields, 1) || "");
    if (aid) return aid;
    return String(firstNonEmpty(fieldStrings(viewFields, 1)).replace(/^#/, "") || "");
  } catch (error) {
    log("debug", "failed to extract view aid from response", error);
    return "";
  }
}

// 递归收集消息里的话题 Tag。
function collectTopicTags(messageBytes) {
  const tags = [];

  walkProtobufFields(messageBytes, ({ fields }) => {
    const names = fieldStrings(fields, 2);
    const links = fieldStrings(fields, 3);
    if (names.length && links.some((link) => /app_comment_topic|search\?keyword=/.test(link))) {
      tags.push(...names);
    }
    return null;
  }, { maxDepth: 12 });

  return uniqueStrings(tags);
}

// 编码 protobuf varint。
function encodeVarint(value) {
  const bytes = [];
  let next = Number(value);
  do {
    let byte = next & 0x7f;
    next = Math.floor(next / 128);
    if (next) byte |= 0x80;
    bytes.push(byte);
  } while (next);
  return new Uint8Array(bytes);
}

// 编码单个 protobuf 字段。
function encodeField(no, wireType, value) {
  const tag = encodeVarint(no * 8 + wireType);
  if (wireType === 2) {
    return concat([tag, encodeVarint(value.length), value]);
  }
  return concat([tag, value]);
}

// 尝试解析 protobuf 字段。
function tryParseFields(bytes) {
  try {
    const fields = parseFields(bytes);
    return fields.length ? fields : null;
  } catch {
    return null;
  }
}

// 判断字段是否为可继续解析的嵌套消息。
function isProtobufMessageField(field) {
  return field.wireType === 2 && field.value.length > 0;
}

// 只读遍历 protobuf 消息树，visitor 返回 { stop: true } 可提前结束。
function walkProtobufFields(bytes, visitor, options = {}) {
  const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : 12;
  const visited = options.visited || new Set();

  function walk(part, depth, path) {
    if (depth > maxDepth) return false;
    const visitKey = `${part.byteOffset}:${part.byteLength}`;
    if (visited.has(visitKey)) return false;
    visited.add(visitKey);

    const fields = tryParseFields(part);
    if (!fields) return false;

    const decision = visitor({ bytes: part, fields, depth, path }) || {};
    if (decision.stop) return true;
    if (decision.skipChildren) return false;

    for (const field of fields) {
      if (!isProtobufMessageField(field)) continue;
      if (walk(field.value, depth + 1, path.concat(field.no))) return true;
    }
    return false;
  }

  return walk(bytes, 0, []);
}

// 按字段回调重写 protobuf 消息树；未变化时返回原字节。
function transformProtobufFields(bytes, visitor, options = {}) {
  const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : 12;

  function transform(part, depth, path) {
    if (depth > maxDepth) return { bytes: part, changed: false };
    const fields = tryParseFields(part);
    if (!fields) return { bytes: part, changed: false };

    let changed = false;
    const chunks = [];
    for (const field of fields) {
      const childPath = path.concat(field.no);
      const action = visitor({ field, fields, depth, path, childPath }) || {};
      if (action.remove) {
        changed = true;
        continue;
      }

      let nextValue = field.value;
      let fieldChanged = false;
      if (Object.prototype.hasOwnProperty.call(action, "value")) {
        nextValue = toBytes(action.value);
        fieldChanged = true;
      } else if (isProtobufMessageField(field) && depth < maxDepth) {
        const nested = transform(field.value, depth + 1, childPath);
        if (nested.changed) {
          nextValue = nested.bytes;
          fieldChanged = true;
        }
      }

      if (fieldChanged) {
        chunks.push(encodeField(field.no, field.wireType, nextValue));
        changed = true;
      } else {
        chunks.push(field.raw);
      }
    }

    return changed ? { bytes: concat(chunks), changed: true } : { bytes: part, changed: false };
  }

  return transform(bytes, 0, []);
}

/* -------------------------------------------------------------------------- */
/* 视频页与推荐流清理                                                         */
/* -------------------------------------------------------------------------- */

// 创建视频页清理统计对象。
function videoCleanupSummary() {
  return {
    blockedVideos: [],
    promotedContent: [],
    relatedAds: [],
    bannerAds: [],
    liveRecommendations: [],
    upGoodsAds: [],
  };
}

// 向清理统计里追加一项。
function pushCleanupItem(summary, type, bytes) {
  const title = firstNonEmpty(extractReadableStrings(bytes));
  summary[type].push({ title });
}

// 提取消息里的可读文本。
function extractReadableStrings(bytes) {
  const values = [];
  const text = decodeString(bytes);

  const encodedTitleMatch = text.match(/(?:title_encode|title)=([^&\s"]+)/);
  if (encodedTitleMatch) {
    try {
      values.push(decodeURIComponent(encodedTitleMatch[1]));
    } catch {
      values.push(encodedTitleMatch[1]);
    }
  }

  walkProtobufFields(bytes, ({ fields }) => {
    for (const field of fields) {
      if (!isProtobufMessageField(field)) continue;
      const value = decodeString(field.value).replace(/\s+/g, ' ').trim();
      if (value && /[\u4e00-\u9fff]/.test(value) && value.length <= 80 && !/[\x00-\x08\x0e-\x1f]/.test(value)) {
        values.push(value);
      }
    }
    return null;
  }, { maxDepth: 8 });

  return uniqueStrings(values.filter((value) =>
    !/^(广告|推荐了|操作成功|不感兴趣|反馈|我不想看|恐怖血腥|色情低俗|封面恶心|标题党\/封面党|引人不适|对立争议)$/.test(value) &&
    !/(选择后|将减少|将优化|相似推荐|相似广告|当前视频无关|开启个性化推荐|UP主：|分区：)/.test(value)
  ));
}

// 提取视频推荐流里的 UP 名称。
function extractVideoRelatedUpNames(bytes) {
  const values = [];
  const text = decodeString(bytes);

  for (const match of text.matchAll(/UP主[:：]\s*([^\x00-\x1f\n\r]{1,40})/g)) {
    values.push(cleanVideoRelatedUpName(match[1]));
  }

  walkProtobufFields(bytes, ({ fields, path }) => {
    for (const field of fields) {
      if (!isProtobufMessageField(field)) continue;
      const nextPath = path.concat(field.no);
      const value = decodeString(field.value).replace(/\s+/g, ' ').trim();
      const upMatch = value.match(/^UP主[:：]\s*(.+)$/);
      if (upMatch) values.push(upMatch[1]);

      // 视频页推荐流卡片的 UP 名常见于 owner 字段。
      if (nextPath.slice(-3).join('.') === '12.11.3') values.push(value);
    }
    return null;
  }, { maxDepth: 8 });

  return uniqueStrings(values.map(normalizeUpName));
}

// 清理视频推荐流里的 UP 名称。
function cleanVideoRelatedUpName(value) {
  return normalizeUpName(value)
    .replace(/(?:和当前视频无关|不感兴趣|反馈|选择后|将减少|将优化).*$/, "")
    .replace(/([^0-9])2$/, "$1")
    .trim();
}

// 判断视频推荐项的清理类型。
function videoRelatedCleanupType(bytes, scope) {
  const text = decodeString(bytes);

  if (scope === 'banner' && /type\.googleapis\.com\/bilibili\.ad\.v1\.|\bads?\.|广告|ad-complain|ad-introduce/.test(text)) {
    return arg.cleanVideoBannerAds ? 'bannerAds' : '';
  }

  if (/bilibili:\/\/live|https?:\/\/live\.bilibili\.com\/|\/bfs\/live\/new_room_cover\/|live_room|直播中|直播间|看直播/.test(text)) {
    return arg.cleanVideoRelatedLiveRecommendations ? 'liveRecommendations' : '';
  }

  if (scope === 'upGoods' && /UP主(?:推荐|分享)好物|type\.googleapis\.com\/bilibili\.ad\.v1\.SourceContentDto|商品来自淘宝|来自淘宝|去看看/.test(text)) {
    return arg.cleanVideoUpGoodsAds ? 'upGoodsAds' : '';
  }

  const hasAdPayload = /type\.googleapis\.com\/bilibili\.ad\.v1\.|cm\.bilibili\.com\/ldad|ad-complain|ad-introduce|我为什么会看到此广告|屏蔽广告|广告质量差/.test(text);
  if (!hasAdPayload) return '';

  if (/title_encode=|image_material_id=|space\.bilibili\.com\/\d+ 推荐了| 推荐了/.test(text)) {
    return arg.cleanVideoRelatedPromotedContent ? 'promotedContent' : '';
  }

  return arg.cleanVideoRelatedAds ? 'relatedAds' : '';
}

// 清理视频页消息。
function sanitizeVideoPageMessage(message, summary, options = {}) {
  const result = transformProtobufFields(message, ({ field, depth, path }) => {
    if (!isProtobufMessageField(field)) return null;

    // View/View 中 field 22 是推荐流，顶层 field 7 是横幅，field 46 是 UP 主好物。
    const isRelatedContainer = path[path.length - 1] === 22;
    const scope = field.no === 46 ? 'upGoods' : (options.bannerFieldNo && depth === 0 && field.no === options.bannerFieldNo ? 'banner' : 'related');
    const cleanupType = ((isRelatedContainer && field.no === 1) || field.no === 46 || scope === 'banner' || options.topRelatedFieldNo === field.no)
      ? videoRelatedCleanupType(field.value, scope)
      : '';
    if (cleanupType) {
      pushCleanupItem(summary, cleanupType, field.value);
      return { remove: true };
    }
    return null;
  }, { maxDepth: 12 });

  return result.changed ? result.bytes : message;
}

// 生成视频页通知内容。
function videoPageNotifyMessage(summary) {
  return presentItemListMessages([
    ['屏蔽-视频页推荐流视频', summary.blockedVideos],
    ['清理-视频页推荐流推广内容', summary.promotedContent],
    ['清理-视频页推荐流广告卡片', summary.relatedAds],
    ['清理-视频页横幅广告', summary.bannerAds],
    ['清理-视频页推荐流直播卡片', summary.liveRecommendations],
    ['清理-视频页 UP 主推荐好物', summary.upGoodsAds],
  ], '未命中视频页清理规则');
}

// 统计视频页清理数量。
function videoPageCleanCount(summary) {
  return summary.promotedContent.length + summary.relatedAds.length + summary.bannerAds.length + summary.liveRecommendations.length + summary.upGoodsAds.length;
}

// 统计视频页屏蔽数量。
function videoPageBlockCount(summary) {
  return summary.blockedVideos.length;
}

// 生成视频推荐流通知副标题。
function videoFeedFilterSubtitle(prefix, cleaned, blocked) {
  return prefix + (blocked ? ' / 屏蔽 ' + blocked : '') + ' / 清理 ' + cleaned;
}

// 汇总视频推荐流通知内容。
function videoFeedNotifyPayload(summary, kept) {
  const cleaned = videoPageCleanCount(summary);
  const blocked = videoPageBlockCount(summary);
  return {
    title: "Bilibili 视频页推荐流清理",
    subtitle: videoFeedFilterSubtitle(`保留 ${kept}`, cleaned, blocked),
    message: videoPageNotifyMessage(summary),
    cleaned,
    blocked,
  };
}

// 生成视频详情页通知副标题。
function videoViewFilterSubtitle(cleaned, blocked) {
  return '清理 ' + cleaned + (blocked ? ' / 屏蔽 ' + blocked : '');
}

// 汇总视频详情页通知内容。
function videoViewNotifyPayload(summary, cacheResult = null, aid = "") {
  const cleaned = videoPageCleanCount(summary);
  const blocked = videoPageBlockCount(summary);
  return {
    title: cacheResult ? "Bilibili 视频页清理 / Tag 缓存" : "Bilibili 视频页清理",
    subtitle: cacheResult
      ? `${videoViewFilterSubtitle(cleaned, blocked)} / ${cacheStatusText(cacheResult.status, aid)}`
      : videoViewFilterSubtitle(cleaned, blocked),
    message: videoPageNotifyMessage(summary),
    cleaned,
    blocked,
  };
}

// 构建视频推荐流过滤行。
function videoRelatedFilterRow(bytes) {
  const title = firstNonEmpty(extractReadableStrings(bytes));
  const text = decodeString(bytes);
  return {
    bytes,
    titles: title ? [title] : [],
    upNames: extractVideoRelatedUpNames(bytes),
    aid: extractAidFromText(text),
    inlineTags: collectTopicTags(bytes),
  };
}

// 记录被屏蔽的视频推荐项。
function pushBlockedVideoFeedItem(summary, row) {
  summary.blockedVideos.push({
    title: firstNonEmpty(row.titles),
    up: firstNonEmpty(row.upNames),
    aid: row.aid,
    rule: row.match?.rule,
    keyword: row.match?.keyword,
    matchedValue: row.match?.value,
  });
}

// 递归过滤视频页内嵌推荐流。
async function filterVideoRelatedMatchesPart(bytes, summary, keywords, depth, isRelatedContainer) {
  if (depth > 12) return null;
  const fields = tryParseFields(bytes);
  if (!fields) return null;

  let changed = false;
  const chunks = [];
  const relatedRows = [];
  const relatedIndexes = [];

  for (const field of fields) {
    if (field.wireType === 2 && field.value.length && isRelatedContainer && field.no === 1) {
      relatedIndexes.push(chunks.length);
      relatedRows.push(videoRelatedFilterRow(field.value));
      chunks.push(field.raw);
      continue;
    }

    if (field.wireType === 2 && field.value.length) {
      const nested = await filterVideoRelatedMatchesPart(field.value, summary, keywords, depth + 1, field.no === 22);
      if (nested) {
        chunks.push(encodeField(field.no, field.wireType, nested));
        changed = true;
        continue;
      }
    }
    chunks.push(field.raw);
  }

  if (relatedRows.length) {
    await applyFilterMatches(relatedRows, keywords);
    for (let i = relatedRows.length - 1; i >= 0; i -= 1) {
      const row = relatedRows[i];
      if (!row.match) continue;
      pushBlockedVideoFeedItem(summary, row);
      chunks.splice(relatedIndexes[i], 1);
      changed = true;
    }
  }

  return changed ? concat(chunks) : null;
}

// 过滤视频页内嵌推荐流。
async function filterVideoRelatedMatches(message, summary, keywords) {
  if (!hasAnyFilterRule(keywords)) return message;
  const filtered = await filterVideoRelatedMatchesPart(message, summary, keywords, 0, false);
  return filtered || message;
}

// 处理 gRPC 视频推荐流响应。
async function handleRelatesFeedResponse() {
  const message = decodeGrpcBody(getResponseBodyBytes());
  const fields = parseFields(message);
  const keywords = buildKeywords();
  const summary = videoCleanupSummary();
  const entries = [];
  const rows = [];

  for (const field of fields) {
    if (field.no === 1 && field.wireType === 2) {
      const cleanupType = videoRelatedCleanupType(field.value, 'related');
      if (cleanupType) {
        pushCleanupItem(summary, cleanupType, field.value);
        continue;
      }
      const row = videoRelatedFilterRow(field.value);
      rows.push(row);
      entries.push({ field, row });
      continue;
    }
    entries.push({ field });
  }

  await applyFilterMatches(rows, keywords);

  let kept = 0;
  const chunks = [];
  for (const entry of entries) {
    if (entry.row?.match) {
      pushBlockedVideoFeedItem(summary, entry.row);
      continue;
    }
    if (entry.row) kept += 1;
    chunks.push(entry.field.raw);
  }

  setResponseBodyBytes(encodeGrpcBody(concat(chunks)));
  const notifyPayload = videoFeedNotifyPayload(summary, kept);
  log('info', { page: 'videoFeed', endpoint: 'relatesFeed', kept, cleaned: notifyPayload.cleaned, blocked: notifyPayload.blocked, summary });
  notify(
    ["remove", "filter"],
    notifyPayload.title,
    notifyPayload.subtitle,
    notifyPayload.message
  );
  $done({ response: $response });
}

// 处理视频详情页响应。
async function handleViewResponse() {
  const message = decodeGrpcBody(getResponseBodyBytes());
  const keywords = buildKeywords();
  const summary = videoCleanupSummary();
  let nextMessage = sanitizeVideoPageMessage(message, summary, { bannerFieldNo: 7 });
  nextMessage = await filterVideoRelatedMatches(nextMessage, summary, keywords);
  const notifyPayload = videoViewNotifyPayload(summary);
  if (notifyPayload.cleaned || notifyPayload.blocked) {
    setResponseBodyBytes(encodeGrpcBody(nextMessage));
  }

  if (arg.deepFilter || arg.videoTagKeywords) {
    const tags = collectTopicTags(nextMessage);
    const aid = extractViewAidFromRequest() || extractViewAidFromMessage(nextMessage);
    const cacheResult = saveCachedTags(aid, tags, "");
    const cacheNotifyPayload = videoViewNotifyPayload(summary, cacheResult, aid);
    log("info", { page: "view", aid, tags, cacheStatus: cacheResult.status, cleaned: cacheNotifyPayload.cleaned, blocked: cacheNotifyPayload.blocked, summary });
    notify(
      ["remove", "filter"],
      cacheNotifyPayload.title,
      cacheNotifyPayload.subtitle,
      cacheNotifyPayload.message
    );
  } else {
    log("info", { page: "view", cleaned: notifyPayload.cleaned, blocked: notifyPayload.blocked, summary });
    notify(
      ["remove", "filter"],
      notifyPayload.title,
      notifyPayload.subtitle,
      notifyPayload.message
    );
  }
  $done({ response: $response });
}

// 生成缓存状态文案。
function cacheStatusText(status, aid) {
  const suffix = aid ? ` aid ${aid}` : "";
  if (status === "created") return `新增缓存${suffix}`;
  if (status === "updated") return `更新缓存${suffix}`;
  if (status === "skipped") return aid ? `未缓存${suffix}` : "未解析到 aid";
  return `已有缓存${suffix}`;
}

// 生成热门页屏蔽结果文案。
function removedItemsMessage(removedItems, emptyMessage = "未命中屏蔽规则") {
  if (!removedItems.length) return emptyMessage;
  return itemListMessage("屏蔽视频", removedItems);
}

// 生成屏蔽规则名称。
function blockRuleLabel(rule) {
  return BLOCK_RULE_LABELS[rule] || "";
}

// 生成列表型通知文案。
function itemListMessage(label, items) {
  if (!items.length) return `${label}：无`;
  return `${label}：\n` + items
    .slice(0, 5)
    .map((item, index) => {
      const rule = blockRuleLabel(item.rule);
      return `${index + 1}、标题：${item.title || "-"}｜UP：${item.up || "-"}${rule ? `｜规则：${rule}` : ""}`;
    })
    .join("\n");
}

// 清理用于通知展示的文本。
function cleanNotifyText(value) {
  return compactDisplayText(String(value || "").replace(/<[^>]+>/g, ""));
}

// 判断字符串是否包含二进制解码残片或卡片类型字段，不适合展示给用户。
function isDirtySummaryText(value) {
  const text = String(value || "");
  return /[\x00-\x08\x0e-\x1f\ufffd]/.test(text) ||
    /\b(?:picture_ad|cm_ad|banner_ad|inline_av|inline_pgc)\b/i.test(text);
}

// 提取带路径的可读 protobuf 字符串，供通知摘要做结构化兜底。
function readableProtobufEntries(bytes, maxDepth = 8) {
  const entries = [];
  walkProtobufFields(bytes, ({ fields, path }) => {
    for (const field of fields) {
      if (field.wireType !== 2 || !field.value.length) continue;
      const value = cleanNotifyText(decodeString(field.value).replace(/\s+/g, " ").trim());
      if (!value || !/[\u4e00-\u9fff]/.test(value) || isDirtySummaryText(value)) continue;
      entries.push({ path: path.concat(field.no).join("."), value });
    }
    return null;
  }, { maxDepth });

  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.path}\n${entry.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 判断字段路径是否以指定字段序列结尾。
function pathEndsWith(path, suffix) {
  return path === suffix || path.endsWith(`.${suffix}`);
}

// 判断字符串是否不适合作为通知里的标题摘要。
function isSummaryMetaText(value) {
  const text = cleanNotifyText(value);
  if (!text) return true;
  return isDirtySummaryText(text) ||
    /^(\d+\s*(秒|分钟|小时|天)前|刚刚|昨天)(\s*·\s*.+)?$/.test(text) ||
    /^·?\s*\d{1,2}月\d{1,2}日(投递)?$/.test(text) ||
    /^\d+(\.\d+)?[万亿]?(播放|弹幕|粉丝|个视频|次|万次)$/.test(text) ||
    /^共\d+集\b/.test(text) ||
    /^\[[^\]]+\]$/.test(text) ||
    /^(已关注|关注|全文|分享|搜索反馈|添加至稍后再看|UP主的推荐|去看看|视频|综合|用户)$/.test(text) ||
    /^(与搜索词无关|不是我想找的up主|只想看视频|看后发现质量差|内容过时|我不想看该视频)$/.test(text) ||
    /^(这条动态已被封印|该专属内容暂不支持|还不能点赞|暂无权查看当前评论)/.test(text);
}

// 按路径优先级读取第一个可作为标题的字段值。
function firstSummaryEntry(entries, suffixes, ignoredValues = []) {
  for (const suffix of suffixes) {
    const found = entries.find((entry) =>
      pathEndsWith(entry.path, suffix) &&
      !isSummaryMetaText(entry.value) &&
      !ignoredValues.includes(entry.value)
    );
    if (found) return found.value;
  }
  return "";
}

// 从命中关键词的可读字段里兜底生成标题。
function firstKeywordSummaryEntry(entries, match, ignoredValues = []) {
  const keyword = String(match?.keyword || "");
  const matchedValue = cleanNotifyText(match?.value || "");
  return firstNonEmpty(entries
    .map((entry) => entry.value)
    .concat(matchedValue)
    .filter((value) =>
      value &&
      !isSummaryMetaText(value) &&
      !ignoredValues.includes(value) &&
      (!keyword || value.includes(keyword) || matchedValue.includes(value))
    ));
}

// 生成未解析到结构化标题时的安全兜底标题。
function fallbackKeywordTitle(match) {
  const keyword = cleanNotifyText(match?.keyword || "");
  const matchedValue = cleanNotifyText(match?.value || "");
  if (keyword) return `命中关键词：${keyword}`;
  return isSummaryMetaText(matchedValue) ? "命中关键词" : matchedValue;
}

// 从候选字段里提取 UP 主。
function firstSummaryUp(entries, suffixes) {
  const value = firstSummaryEntry(entries, suffixes);
  return normalizeUpName(value);
}

// 拼接多组列表文案。
function presentItemListMessages(groups, emptyMessage) {
  const messages = groups
    .filter(([, items]) => items.length)
    .map(([label, items]) => itemListMessage(label, items));
  return messages.length ? messages.join("\n\n") : emptyMessage;
}

// 提取 JSON 推荐项的标题和 UP。
function extractVideoFeedItemText(item) {
  const titles = [
    item?.title,
    item?.player_args?.title,
    item?.part,
    item?.ad_info?.creative_content?.title,
    item?.ad_info?.creative_content?.card?.title,
    item?.ad_info?.extra?.card?.title,
  ].filter(Boolean);
  const upNames = [
    item?.owner?.name,
    item?.args?.up_name,
    item?.desc_button?.text,
    item?.name,
    item?.ad_info?.extra?.card?.adver_name,
    item?.ad_info?.extra?.card?.adver?.adver_name,
  ].filter(Boolean);
  return { titles, upNames };
}

// 判断 JSON 推荐项是否为广告。
function isVideoFeedAdItem(item) {
  if (!item) return false;
  const goto = String(item.card_goto || item.goto || item.card_type || "");
  return !!item.ad_info || /(^|_)ad(_|$)/.test(goto);
}

// 判断 JSON 推荐项是否为直播推荐。
function isVideoFeedLiveRecommendation(item) {
  if (!item) return false;
  const directType = String(item.card_goto || item.goto || item.card_type || item.type || "");
  if (/^(live|live_room|vertical_live|live_rcmd)$/.test(directType) || /(^|_)live(_|$)/.test(directType)) return true;

  let matched = false;
  // 递归遍历当前结构。
  function walk(value, key, depth) {
    if (matched || depth > 5 || value === null || value === undefined) return;

    if (typeof value === "string") {
      if (/^bilibili:\/\/live(?:\/|\?|$)/.test(value)) matched = true;
      return;
    }

    if (typeof value === "number") {
      if (value > 0 && /^(roomid|room_id|live_room_id|liveroom_id)$/.test(key)) matched = true;
      return;
    }

    if (typeof value === "boolean") return;

    if (Array.isArray(value)) {
      for (const item of value) walk(item, key, depth + 1);
      return;
    }

    if (typeof value === "object") {
      for (const [childKey, childValue] of Object.entries(value)) {
        if (/^(live_info|live_play_info|live_room_info)$/.test(childKey) && childValue && typeof childValue === "object") {
          matched = true;
          return;
        }
        walk(childValue, childKey, depth + 1);
      }
    }
  }

  walk(item, "", 0);
  return matched;
}

// 提取 JSON 推荐项 aid。
function videoFeedItemAid(item) {
  return String(item?.args?.aid || item?.player_args?.aid || item?.param || extractAidFromText(item?.uri) || "");
}

// 构建 JSON 推荐流过滤行。
function videoFeedFilterRow(item) {
  const { titles, upNames } = extractVideoFeedItemText(item);
  return {
    item,
    titles,
    upNames,
    aid: videoFeedItemAid(item),
    inlineTags: [],
  };
}

// 处理 JSON 视频推荐流响应。
async function handleVideoFeedIndex() {
  const json = parseResponseJson();
  if (!Array.isArray(json?.data?.items)) {
    log("info", { page: "videoFeed", endpoint: "feedIndex", message: "items not found" });
    return $done({ response: $response });
  }
  const items = json.data.items;
  const keywords = buildKeywords();
  const summary = videoCleanupSummary();
  const rows = [];
  const nextItems = [];

  for (const item of items) {
    const { titles, upNames } = extractVideoFeedItemText(item);
    if (arg.cleanVideoRelatedLiveRecommendations && isVideoFeedLiveRecommendation(item)) {
      summary.liveRecommendations.push({ title: firstNonEmpty(titles), up: firstNonEmpty(upNames) });
      continue;
    }
    if (arg.cleanVideoRelatedAds && isVideoFeedAdItem(item)) {
      summary.relatedAds.push({ title: firstNonEmpty(titles), up: firstNonEmpty(upNames) });
      continue;
    }
    rows.push(videoFeedFilterRow(item));
  }

  await applyFilterMatches(rows, keywords);

  for (const row of rows) {
    if (row.match) {
      pushBlockedVideoFeedItem(summary, row);
      continue;
    }
    nextItems.push(row.item);
  }

  json.data.items = nextItems;
  setResponseBodyText(JSON.stringify(json));
  const notifyPayload = videoFeedNotifyPayload(summary, nextItems.length);
  log("info", { page: "videoFeed", endpoint: "feedIndex", kept: nextItems.length, cleaned: notifyPayload.cleaned, blocked: notifyPayload.blocked, summary });
  notify(
    ["remove", "filter"],
    notifyPayload.title,
    notifyPayload.subtitle,
    notifyPayload.message
  );
  $done({ response: $response });
}

// 生成首页推荐页通知内容。
function homeFeedNotifyMessage(removedItems, cleanedAdItems, cleanedPromotedVideoItems) {
  return presentItemListMessages([
    ["屏蔽视频", removedItems],
    ["清理-首页推荐页广告", cleanedAdItems],
    ["清理-首页推荐页推广视频", cleanedPromotedVideoItems],
  ], "未命中屏蔽或清理规则");
}

// 生成首页推荐页通知副标题。
function homeFeedNotifySubtitle(kept, removed, cleanedAds, cleanedPromotedVideos) {
  return `保留 ${kept} / 屏蔽 ${removed} / 清理广告 ${cleanedAds} / 清理推广 ${cleanedPromotedVideos}`;
}

// 请求阶段直接拦截开屏广告素材请求，避免客户端把本地缓存 id 带给服务端后继续拿到可展示素材。
function handleSplashRequest() {
  const url = getRequestUrl();
  const openEvent = queryParam(url, "open_event") || "-";
  const clientKeepIds = queryParam(url, "client_keep_ids");
  const loadedCreativeList = queryParam(url, "loaded_creative_list");
  const shouldBlock = Boolean(
    /\/x\/v2\/splash\/list\?/.test(url) &&
    (openEvent === "background" || clientKeepIds || loadedCreativeList)
  );
  const response = {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: emptySplashResponseBody(),
  };

  log("info", {
    page: "splash",
    stage: "request",
    blocked: arg.cleanSplashAds && shouldBlock,
    openEvent,
    clientKeepIdsCount: clientKeepIds ? clientKeepIds.split(",").filter(Boolean).length : 0,
    loadedCreativeCount: loadedCreativeList ? loadedCreativeList.split(",").filter(Boolean).length : 0,
  });

  if (arg.cleanSplashAds && shouldBlock) {
    notify(
      "remove",
      "Bilibili 开屏广告清理",
      `拦截素材请求 / open_event=${openEvent}`,
      "移除-开屏广告：已阻断开屏素材缓存请求"
    );
    return $done({ response });
  }

  return $done({});
}

// 清理搜索结果卡片里用于匹配的文本，保留完整长度供关键词判断。
function cleanSearchResultMatchText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 提取搜索结果卡片里的可读字段，供全量搜索结果关键词和 UP 主匹配。
function searchResultReadableEntries(bytes, maxDepth = 8) {
  const entries = [];
  walkProtobufFields(bytes, ({ fields, path }) => {
    for (const field of fields) {
      if (field.wireType !== 2 || !field.value.length) continue;
      const value = cleanSearchResultMatchText(decodeString(field.value));
      if (!value || !/[\u4e00-\u9fff]/.test(value) || isDirtySummaryText(value)) continue;
      entries.push({ path: path.concat(field.no).join("."), value });
    }
    return null;
  }, { maxDepth });

  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.path}\n${entry.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 搜索结果卡片里可参与内容关键词匹配的文本。
function searchResultCandidateValues(bytes) {
  return uniqueStrings([
    ...searchResultReadableEntries(bytes).map((entry) => entry.value),
    ...extractReadableStrings(bytes),
  ]);
}

// 提取搜索结果卡片里的 UP 主名称。普通视频、用户卡片和动态卡片的字段路径不同。
function searchResultUpNames(bytes) {
  const upPaths = [
    "37.10",
    "23.1",
    "23.14",
    "23.14.2",
    "23.32",
  ];
  return uniqueStrings(searchResultReadableEntries(bytes)
    .filter((entry, _index, entries) =>
      upPaths.some((suffix) => pathEndsWith(entry.path, suffix)) ||
      (
        pathEndsWith(entry.path, "42.5.2") &&
        entries.some((candidate) =>
          pathEndsWith(candidate.path, "42.5.4") &&
          /^(\d+\s*(秒|分钟|小时|天)前|刚刚|昨天|·?\s*\d{1,2}月\d{1,2}日)/.test(candidate.value)
        )
      )
    )
    .map((entry) => normalizeUpName(cleanNotifyText(entry.value)))
    .filter((value) => value && !isSummaryMetaText(value)));
}

// 提取搜索结果里用于通知展示的标题和 UP。
function searchResultTextSummary(bytes, match = null) {
  const entries = readableProtobufEntries(bytes, 8);
  const up = firstSummaryUp(entries, [
    "37.10",
    "23.1",
    "23.14",
    "23.14.2",
    "23.32",
  ]) || firstNonEmpty(searchResultUpNames(bytes));
  const ignoredValues = up ? [up] : [];
  const title = firstSummaryEntry(entries, [
    "37.1",
    "42.1",
    "10.1",
    "52.2.1",
    "23.14.2",
    "23.1",
    "23.8",
    "44.2.1",
    "23.21.1",
  ], ignoredValues) ||
    (match ? firstKeywordSummaryEntry(entries, match, ignoredValues) : "") ||
    (match?.rule === "upExact" ? firstNonEmpty(searchResultReadableEntries(bytes)
      .map((entry) => entry.value)
      .filter((value) => !isSummaryMetaText(value) && !ignoredValues.includes(value))) : "") ||
    (match ? fallbackKeywordTitle(match) : firstNonEmpty(entries
      .map((entry) => entry.value)
      .filter((value) => !isSummaryMetaText(value) && !ignoredValues.includes(value))));
  return { title, up };
}

// 生成搜索结果过滤项摘要。
function searchResultSummary(bytes, match) {
  const { title, up } = searchResultTextSummary(bytes, match);
  return {
    title,
    up,
    rule: match?.rule || "searchResultKeywords",
    keyword: match?.keyword,
    matchedValue: cleanNotifyText(match?.value || ""),
  };
}

// 读取 SearchAll 的 field 4 卡片类型。
function searchResultCardInfo(bytes) {
  const fields = tryParseFields(bytes) || [];
  const topLevelTypes = [
    ...fieldStrings(fields, 2),
    ...fieldStrings(fields, 3),
    ...fieldStrings(fields, 4),
  ].map((value) => String(value || "").trim().toLowerCase());
  const metadataTypes = fieldStrings(fields, 63)
    .map((value) => {
      try {
        return String(JSON.parse(value)?.type || "").trim().toLowerCase();
      } catch {
        return "";
      }
    })
    .filter(Boolean);
  return {
    fields,
    type: metadataTypes[0] || topLevelTypes.find(Boolean) || "",
    topLevelTypes,
    metadataTypes,
  };
}

// 判断 SearchAll 的 field 4 条目是否为普通视频结果。只有普通视频需要 Tag 过滤。
function isVideoSearchResult(bytes) {
  const info = searchResultCardInfo(bytes);
  const types = [...info.metadataTypes, ...info.topLevelTypes];
  return types.includes("video") || types.includes("av");
}

// 构建搜索结果过滤行。标题关键词和 Tag 只处理普通视频，UP 主名称可处理混合搜索卡片。
function searchResultFilterRow(bytes, keywords, isVideo) {
  const summary = searchResultTextSummary(bytes);
  return createFilterRow({
    titles: isVideo && summary.title ? [summary.title] : [],
    upNames: uniqueStrings([
      summary.up,
      ...searchResultUpNames(bytes),
    ]),
    aid: isVideo ? extractAidFromText(decodeString(bytes)) : "",
    inlineTags: isVideo && hasVideoTagFilter(keywords) ? collectTopicTags(bytes) : [],
  });
}

// 判断 SearchAll 卡片是否为广告型卡片。video_ad 单独归入创作推广，便于按开关区分。
function isSearchResultAdType(type, topLevelTypes) {
  const values = [type, ...topLevelTypes]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  return values.some((value) =>
    value !== "video_ad" &&
    (/^(ad|ads|cm|commercial)$/.test(value) ||
      /(^|_)(ad|ads)($|_)/.test(value) ||
      /(^|_)cm(_|$)/.test(value))
  );
}

// 判断 SearchAll 卡片是否需要按移除类规则清理。
function searchResultCleanupRule(bytes) {
  const info = searchResultCardInfo(bytes);
  const types = [info.type, ...info.metadataTypes, ...info.topLevelTypes]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  const context = { info, types };
  const cleanupRule = SEARCH_RESULT_CLEANUP_RULES_BY_PRIORITY.find((item) =>
    arg[item.argKey] && item.matches(context)
  );
  return cleanupRule?.rule || "";
}

// 生成被移除的搜索结果卡片摘要。
function searchResultCleanupSummary(bytes, rule) {
  const { title, up } = searchResultTextSummary(bytes);
  return {
    title: title || firstNonEmpty(extractReadableStrings(bytes)) || blockRuleLabel(rule),
    up,
    rule,
  };
}

// 创建 SearchAll 清理结果容器。
function emptySearchResultCleanedItems() {
  const cleaned = {};
  for (const item of SEARCH_RESULT_CLEANUP_RULES) cleaned[item.key] = [];
  return cleaned;
}

// 统计 SearchAll 各清理规则总命中数。
function searchResultCleanedCount(cleaned) {
  return SEARCH_RESULT_CLEANUP_RULES.reduce((sum, item) => sum + cleaned[item.key].length, 0);
}

// 生成 SearchAll 清理日志中的计数字段。
function searchResultCleanedLogCounts(cleaned) {
  const counts = {};
  for (const item of SEARCH_RESULT_CLEANUP_RULES) counts[item.key] = cleaned[item.key].length;
  return counts;
}

// 按规则名把被清理的 SearchAll 卡片放回对应类别。
function pushSearchResultCleanedItem(cleaned, item) {
  const cleanupRule = SEARCH_RESULT_CLEANUP_RULES.find((candidate) => candidate.rule === item.rule);
  if (cleanupRule) cleaned[cleanupRule.key].push(item);
}

// 当前是否启用搜索结果移除类规则。
function hasSearchResultCleanupRule() {
  return SEARCH_RESULT_CLEANUP_RULES.some((item) => arg[item.argKey]);
}

// 生成搜索结果处理通知标题。
function searchAllNotifyTitle(cleaned, blocked) {
  if (cleaned && blocked) return "Bilibili 搜索结果处理";
  if (cleaned) return "Bilibili 搜索结果清理";
  return "Bilibili 搜索结果屏蔽";
}

// 生成搜索结果处理通知副标题。
function searchAllNotifySubtitle(kept, blocked, cleaned) {
  const parts = [`保留 ${kept}`, `屏蔽 ${blocked}`];
  const cleanedCount = searchResultCleanedCount(cleaned);
  if (cleanedCount) {
    parts.push(...SEARCH_RESULT_CLEANUP_RULES.map((item) => `${item.subtitle} ${cleaned[item.key].length}`));
  }
  return parts.join(" / ");
}

// 生成搜索结果处理通知正文。
function searchAllNotifyMessage(blockedItems, cleaned, cleanupEnabled) {
  return presentItemListMessages([
    ["屏蔽搜索结果", blockedItems],
    ...SEARCH_RESULT_CLEANUP_RULES.map((item) => [blockRuleLabel(item.rule), cleaned[item.key]]),
  ], cleanupEnabled ? "未命中搜索结果清理或屏蔽规则" : "未命中搜索结果屏蔽规则");
}

// 搜索候选词条里可参与关键词匹配的文本。
function searchSuggestCandidateValues(bytes) {
  const fields = tryParseFields(bytes) || [];
  return uniqueStrings([
    decodeString(bytes),
    ...fieldStrings(fields, 2),
    ...fieldStrings(fields, 3),
    ...extractReadableStrings(bytes),
  ]);
}

// 生成搜索候选词条过滤项摘要。
function searchSuggestSummary(bytes, match) {
  const entries = readableProtobufEntries(bytes, 4);
  const ignoredValues = ["search"];
  const title = firstSummaryEntry(entries, [
    "3",
    "2",
    "1",
  ], ignoredValues) ||
    firstKeywordSummaryEntry(entries, match, ignoredValues) ||
    fallbackKeywordTitle(match);
  return {
    title,
    up: "",
    rule: match?.rule || "searchSuggestKeywords",
    keyword: match?.keyword,
    matchedValue: cleanNotifyText(match?.value || ""),
  };
}

// 处理搜索候选词条响应。
function handleSearchSuggestResponse() {
  const keywords = buildContentKeywords(arg.searchSuggestKeywords);
  if (!hasContentKeywords(keywords)) {
    log("info", { page: "searchSuggest", message: "no search suggest keywords configured" });
    return $done({ response: $response });
  }

  const message = decodeGrpcBody(getResponseBodyBytes());
  const fields = parseFields(message);
  let kept = 0;
  let removed = 0;
  const removedItems = [];
  const chunks = [];

  for (const field of fields) {
    if (field.no === 2 && field.wireType === 2) {
      const match = findContentKeywordMatch(
        searchSuggestCandidateValues(field.value),
        keywords,
        "searchSuggestKeywords"
      );
      if (match) {
        removed += 1;
        removedItems.push(searchSuggestSummary(field.value, match));
        continue;
      }
      kept += 1;
    }
    chunks.push(field.raw);
  }

  if (removed) setResponseBodyBytes(encodeGrpcBody(concat(chunks)));
  log("info", {
    page: "searchSuggest",
    kept,
    removed,
    keywords: keywords.displayKeywords,
    removedItems,
  });
  notify(
    "filter",
    "Bilibili 搜索候选词条屏蔽",
    `保留 ${kept} / 屏蔽 ${removed}`,
    removedItems.length ? itemListMessage("屏蔽搜索候选词条", removedItems) : "未命中搜索候选词条屏蔽规则"
  );
  $done({ response: $response });
}

// 处理搜索结果响应。
async function handleSearchAllResponse() {
  const contentKeywords = buildContentKeywords(arg.searchResultKeywords);
  const videoKeywords = buildKeywords();
  const hasSearchResultKeywords = hasContentKeywords(contentKeywords);
  const hasSearchVideoFilter = hasAnyFilterRule(videoKeywords);
  const hasSearchCleanupRule = hasSearchResultCleanupRule();
  if (!hasSearchCleanupRule && !hasSearchResultKeywords && !hasSearchVideoFilter) {
    log("info", { page: "searchAll", message: "no search cleanup rules, video search result keywords, title/up rules or video tag rules configured" });
    return $done({ response: $response });
  }

  const message = decodeGrpcBody(getResponseBodyBytes());
  const fields = parseFields(message);
  const entries = [];
  const tagRows = [];

  for (const field of fields) {
    if (field.no === 4 && field.wireType === 2) {
      const cleanupRule = searchResultCleanupRule(field.value);
      if (cleanupRule) {
        entries.push({ field, row: null, isVideo: false, cleanupRule });
        continue;
      }
      const isVideo = isVideoSearchResult(field.value);
      const row = searchResultFilterRow(field.value, videoKeywords, isVideo);
      row.match = findTextMatch(row.titles, row.upNames, videoKeywords);
      const contentMatch = hasSearchResultKeywords
        ? findContentKeywordMatch(searchResultCandidateValues(field.value), contentKeywords, "searchResultKeywords")
        : null;
      if (!row.match && contentMatch) row.match = contentMatch;
      if (isVideo) tagRows.push(row);
      entries.push({ field, row, isSearchCard: true, cleanupRule: "" });
      continue;
    }
    entries.push({ field, row: null, isSearchCard: false, cleanupRule: "" });
  }

  await applyTagMatches(tagRows, videoKeywords);

  let kept = 0;
  let removed = 0;
  const removedItems = [];
  const cleanedItems = emptySearchResultCleanedItems();
  const chunks = [];
  for (const entry of entries) {
    const { field, row, isSearchCard, cleanupRule } = entry;
    if (cleanupRule) {
      const item = searchResultCleanupSummary(field.value, cleanupRule);
      pushSearchResultCleanedItem(cleanedItems, item);
      continue;
    }
    if (isSearchCard) {
      if (row?.match) {
        removed += 1;
        removedItems.push(searchResultSummary(field.value, row.match));
        continue;
      }
      kept += 1;
    }
    chunks.push(field.raw);
  }

  const cleanedCount = searchResultCleanedCount(cleanedItems);
  if (removed || cleanedCount) setResponseBodyBytes(encodeGrpcBody(concat(chunks)));
  log("info", {
    page: "searchAll",
    kept,
    removed,
    cleaned: searchResultCleanedLogCounts(cleanedItems),
    keywords: contentKeywords.displayKeywords,
    titleBlockKeywords: videoKeywords.displayTitleKeywords,
    blockedUps: videoKeywords.displayBlockedUps,
    deepFilter: arg.deepFilter,
    videoTagKeywords: videoKeywords.displayVideoTagKeywords,
    removedItems,
    cleanedItems,
  });
  const cleanupOnly = hasSearchCleanupRule && !hasSearchResultKeywords && !hasSearchVideoFilter;
  const notifyTitle = searchAllNotifyTitle(cleanedCount > 0 || cleanupOnly, removed > 0);
  const notifyCategory = cleanedCount > 0 && removed > 0
    ? ["remove", "filter"]
    : (cleanedCount > 0 || cleanupOnly ? "remove" : "filter");
  notify(
    notifyCategory,
    notifyTitle,
    searchAllNotifySubtitle(kept, removed, cleanedItems),
    searchAllNotifyMessage(removedItems, cleanedItems, hasSearchCleanupRule)
  );
  $done({ response: $response });
}

/* -------------------------------------------------------------------------- */
/* 各接口处理器                                                               */
/* -------------------------------------------------------------------------- */

const SPLASH_ARRAY_KEYS = [
  "show",
  "list",
  "event_list",
  "keep_ids",
  "preload",
  "query_list",
  "brand_list",
  "splash_list",
  "ad_list",
  "card_list",
  "material_list",
  "force_list",
  "topview_list",
  "top_view_list",
];
const SPLASH_NUMERIC_KEYS = [
  "max_time",
  "min_interval",
  "pull_interval",
  "list_update_time",
  "last_show_time",
  "cold_start_interval",
  "hot_start_interval",
  "show_interval",
  "force_show_times",
];
const SPLASH_STRING_KEYS = [
  "splash_request_id",
  "new_splash_hash",
  "show_hash",
];
const SPLASH_BOOLEAN_KEYS = [
  "has_new_splash_set",
  "forcibly",
];
const SPLASH_ITEM_SOURCES = [
  ["show", "展示"],
  ["list", "素材"],
  ["event_list", "活动"],
  ["preload", "预加载"],
  ["query_list", "候选"],
  ["brand_list", "品牌"],
  ["splash_list", "开屏"],
  ["ad_list", "广告"],
  ["card_list", "卡片"],
  ["material_list", "素材"],
  ["force_list", "强制"],
  ["topview_list", "TopView"],
  ["top_view_list", "TopView"],
];

// 读取开屏广告内容对象。
function splashContent(item) {
  return item?.splash_content && typeof item.splash_content === "object" ? item.splash_content : item;
}

// 规范化开屏广告目标地址。
function splashTarget(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  try {
    const decoded = decodeURIComponent(text);
    return decoded || text;
  } catch {}

  return text;
}

// 汇总单条开屏广告信息。
function splashItemSummary(item, source) {
  const content = splashContent(item) || {};
  const guides = Array.isArray(content.guide_button_list)
    ? content.guide_button_list.map((guide) => guide?.guide_instructions_new || guide?.guide_instructions)
    : [];
  const downloadNames = Array.isArray(content.extra?.download_whitelist)
    ? content.extra.download_whitelist.map((download) => download?.display_name || download?.apk_name)
    : [];
  const title = firstNonEmpty([
    content.schema_title_new,
    content.schema_title,
    content.uri_title,
    ...downloadNames,
    ...guides,
  ]);
  const target = firstNonEmpty([
    content.schema_package_name,
    splashTarget(content.universal_app),
    splashTarget(content.schema),
    splashTarget(content.uri),
  ]);
  const id = content.id || item?.id || "-";
  return {
    source,
    id,
    title: title || "开屏广告",
    target,
    details: {
      schema_package_name: content.schema_package_name || "",
      universal_app: splashTarget(content.universal_app),
      schema: splashTarget(content.schema),
      uri: splashTarget(content.uri),
      ad_cb: content.ad_cb || item?.ad_cb || "",
    },
  };
}

// 生成开屏广告通知文案。
function splashItemsMessage(items) {
  const lines = items
    .slice(0, 8)
    .map((item, index) => `${index + 1}、id ${item.id}：${item.title}`);
  if (items.length > 8) lines.push(`...另有 ${items.length - 8} 项`);
  return lines.length ? `移除-开屏广告：\n${lines.join("\n")}` : "未命中开屏广告";
}

// 汇总开屏广告通知内容。
function splashNotifyPayload(summary, removedItems, cleaned) {
  const extra = [];
  if (summary.eventList) extra.push(`清理活动 ${summary.eventList}`);
  return {
    title: "Bilibili 开屏广告清理",
    subtitle: cleaned
      ? [`清理展示 ${summary.show} / 清理素材 ${summary.list}`, ...extra].join(" / ")
      : "已关闭",
    message: cleaned ? splashItemsMessage(removedItems) : "开屏广告清理开关已关闭",
  };
}

// 统计开屏广告响应里的数组字段数量。
function splashArrayCount(data, key) {
  return Array.isArray(data?.[key]) ? data[key].length : 0;
}

// 清空开屏广告响应里可能参与展示、缓存和后台唤醒的字段。
function clearSplashData(data) {
  for (const key of SPLASH_ARRAY_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) data[key] = [];
  }
  for (const key of SPLASH_NUMERIC_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) data[key] = 0;
  }
  for (const key of SPLASH_STRING_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) data[key] = "";
  }
  for (const key of SPLASH_BOOLEAN_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) data[key] = false;
  }
}

// 汇总会被清理的开屏广告素材。
function splashRemovedItems(data) {
  return SPLASH_ITEM_SOURCES.flatMap(([key, source]) => {
    if (!Array.isArray(data?.[key])) return [];
    return data[key]
      .filter((item) => item && typeof item === "object")
      .map((item) => splashItemSummary(item, source));
  });
}

// 处理开屏广告响应。
function handleSplashResponse() {
  const json = parseResponseJson();
  const data = json?.data;
  if (!data || typeof data !== "object") {
    log("info", { page: "splash", message: "data not found" });
    return $done({ response: $response });
  }

  const summary = {
    show: splashArrayCount(data, "show"),
    list: splashArrayCount(data, "list"),
    eventList: splashArrayCount(data, "event_list"),
    keepIds: splashArrayCount(data, "keep_ids"),
    preload: splashArrayCount(data, "preload"),
    queryList: splashArrayCount(data, "query_list"),
    brandList: splashArrayCount(data, "brand_list"),
    splashList: splashArrayCount(data, "splash_list"),
    adList: splashArrayCount(data, "ad_list"),
    cardList: splashArrayCount(data, "card_list"),
    materialList: splashArrayCount(data, "material_list"),
    forceList: splashArrayCount(data, "force_list"),
    topviewList: splashArrayCount(data, "topview_list") + splashArrayCount(data, "top_view_list"),
  };
  const removedItems = splashRemovedItems(data);

  if (arg.cleanSplashAds) {
    clearSplashData(data);
  }

  setResponseBodyText(JSON.stringify(json));
  const notifyPayload = splashNotifyPayload(summary, removedItems, arg.cleanSplashAds);
  log("info", {
    page: "splash",
    cleaned: arg.cleanSplashAds,
    summary,
    removedItems: arg.cleanSplashAds ? removedItems : [],
  });
  notify(
    "remove",
    notifyPayload.title,
    notifyPayload.subtitle,
    notifyPayload.message
  );
  $done({ response: $response });
}

const STARTUP_ACTIVITY_TAB_PATTERN = /\/home_activity_tab\//i;
const STARTUP_PEAK_RESOURCE_TYPES = new Set(["brand_splash", "egg"]);
const BOTTOM_EXTRA_BUTTON_NAME_PATTERN = /^(?:\+|＋|加号|发布|投稿|会员购)$/;
const BOTTOM_EXTRA_BUTTON_URI_PATTERN = /(?:bilibili:\/\/(?:mall|shopping)|\/mall(?:\/|$)|bmall|会员购|add_archive|archive_selection|publish|creation\/center|uper\/user_center)/i;
const MINE_PAGE_SECTION_ARRAY_KEYS = ["sections_v2", "sections"];
const MINE_CREATION_CENTER_TITLE = "创作中心";
const MINE_SERVICES_TITLE = "我的服务";

function startupAdsSummary() {
  return {
    activityTabs: [],
    bottomButtons: [],
    skinEquips: 0,
    peakResources: [],
  };
}

function startupTabSummary(item) {
  return {
    id: item?.id || "-",
    name: firstNonEmpty([item?.name, item?.tab_id, item?.uri]) || "活动入口",
    uri: item?.uri || "",
  };
}

function bottomButtonSummary(item) {
  return {
    id: item?.id || "-",
    name: firstNonEmpty([item?.name, item?.tab_id, item?.uri]) || "底部按钮",
    uri: item?.uri || "",
  };
}

function isBottomExtraButton(item) {
  const name = String(firstNonEmpty([item?.name, item?.tab_id]) || "").trim();
  const uri = String(item?.uri || "");
  return BOTTOM_EXTRA_BUTTON_NAME_PATTERN.test(name) || BOTTOM_EXTRA_BUTTON_URI_PATTERN.test(uri);
}

function cleanStartupTabData(data, summary) {
  if (!Array.isArray(data?.tab)) return;
  const kept = [];
  for (const item of data.tab) {
    if (STARTUP_ACTIVITY_TAB_PATTERN.test(String(item?.uri || ""))) {
      summary.activityTabs.push(startupTabSummary(item));
      continue;
    }
    kept.push(item);
  }
  data.tab = kept;
}

function cleanBottomExtraButtonsData(data, summary) {
  if (!Array.isArray(data?.bottom)) return;
  const kept = [];
  for (const item of data.bottom) {
    if (isBottomExtraButton(item)) {
      summary.bottomButtons.push(bottomButtonSummary(item));
      continue;
    }
    kept.push(item);
  }
  data.bottom = kept;
}

function cleanStartupSkinData(data, summary) {
  if (!data || typeof data !== "object") return;
  if (Object.prototype.hasOwnProperty.call(data, "common_equip")) {
    const value = data.common_equip;
    summary.skinEquips += Array.isArray(value) ? value.length : (value ? 1 : 0);
    delete data.common_equip;
  }
}

function cleanStartupPeakData(data, summary) {
  if (!Array.isArray(data?.resource)) return;
  for (const resource of data.resource) {
    const type = String(resource?.type || "");
    if (!STARTUP_PEAK_RESOURCE_TYPES.has(type)) continue;
    const removed = Array.isArray(resource.list) ? resource.list.length : 0;
    if (removed > 0) summary.peakResources.push({ type, count: removed });
    resource.list = [];
  }
}

function startupAdsMessage(summary, cleaned) {
  if (!cleaned) return "软件启动时推广资源清理开关已关闭";

  const lines = [];
  for (const item of summary.activityTabs.slice(0, 6)) {
    lines.push(`活动 Tab：${item.name}`);
  }
  if (summary.activityTabs.length > 6) lines.push(`活动 Tab：另有 ${summary.activityTabs.length - 6} 项`);
  if (summary.skinEquips) lines.push(`皮肤装扮：${summary.skinEquips} 项`);
  for (const item of summary.peakResources) {
    lines.push(`预加载资源 ${item.type}：${item.count} 项`);
  }
  return lines.length ? lines.join("\n") : "未命中软件启动时推广资源";
}

function startupAdsNotifyPayload(summary, cleaned) {
  const peakCount = summary.peakResources.reduce((total, item) => total + item.count, 0);
  return {
    title: "Bilibili 软件启动时推广资源清理",
    subtitle: cleaned
      ? `清理活动 Tab ${summary.activityTabs.length} / 清理皮肤 ${summary.skinEquips} / 清理预加载资源 ${peakCount}`
      : "已关闭",
    message: startupAdsMessage(summary, cleaned),
  };
}

function personalizationMessage(summary, cleaned) {
  if (!cleaned) return "软件底部多余按钮删除开关已关闭";
  return summary.bottomButtons.length
    ? `底部按钮：${summary.bottomButtons.map((item) => item.name).join("、")}`
    : "未命中软件底部多余按钮";
}

function personalizationNotifyPayload(summary, cleaned) {
  return {
    title: "Bilibili 个性化清理",
    subtitle: cleaned ? `清理底部按钮 ${summary.bottomButtons.length}` : "已关闭",
    message: personalizationMessage(summary, cleaned),
  };
}

function handleStartupAdsResponse() {
  const json = parseResponseJson();
  const data = json?.data;
  if (!data || typeof data !== "object") {
    log("info", { page: "startupAds", message: "data not found" });
    return $done({ response: $response });
  }

  const url = getRequestUrl();
  const summary = startupAdsSummary();
  const isTabResource = /\/x\/resource\/show\/tab\/v2\?/.test(url);
  if (arg.cleanStartupAds) {
    if (isTabResource) cleanStartupTabData(data, summary);
    if (/\/x\/resource\/show\/skin\?/.test(url)) cleanStartupSkinData(data, summary);
    if (/\/x\/resource\/peak\/download\?/.test(url)) cleanStartupPeakData(data, summary);
  }
  if (isTabResource && arg.cleanBottomExtraButtons) {
    cleanBottomExtraButtonsData(data, summary);
  }

  setResponseBodyText(JSON.stringify(json));
  const notifyPayload = startupAdsNotifyPayload(summary, arg.cleanStartupAds);
  log("info", {
    page: "startupAds",
    cleanStartupAds: arg.cleanStartupAds,
    cleanBottomExtraButtons: arg.cleanBottomExtraButtons,
    summary,
  });
  notify("remove", notifyPayload.title, notifyPayload.subtitle, notifyPayload.message);
  if (isTabResource) {
    const personalizationPayload = personalizationNotifyPayload(summary, arg.cleanBottomExtraButtons);
    notify(
      "personalization",
      personalizationPayload.title,
      personalizationPayload.subtitle,
      personalizationPayload.message
    );
  }
  $done({ response: $response });
}

function minePageSummary() {
  return {
    creationCenters: [],
    services: [],
  };
}

function minePageText(value) {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (value && typeof value === "object" && typeof value.text === "string") {
    return value.text.trim();
  }
  return "";
}

function minePageSectionTitle(section) {
  return firstNonEmpty([
    minePageText(section?.title),
    minePageText(section?.up_title),
    minePageText(section?.module_title),
    minePageText(section?.section_title),
    minePageText(section?.name),
  ]);
}

function minePageSectionItemCount(section) {
  return Array.isArray(section?.items) ? section.items.length : 0;
}

function minePageSectionSummary(section) {
  return {
    title: minePageSectionTitle(section) || "我的页面模块",
    itemCount: minePageSectionItemCount(section),
  };
}

function hasMinePageItem(section, predicate) {
  return Array.isArray(section?.items) && section.items.some((item) => predicate(item));
}

function isMineCreationCenterSection(section) {
  const title = minePageSectionTitle(section);
  if (title === MINE_CREATION_CENTER_TITLE) return true;
  return hasMinePageItem(section, (item) =>
    minePageText(item?.title) === MINE_CREATION_CENTER_TITLE ||
    /bilibili:\/\/uper\/homevc|\/uper\/user_center\/archive_|member\.bilibili\.com\/york\/data-center/.test(String(item?.uri || ""))
  );
}

function isMineServicesSection(section) {
  return minePageSectionTitle(section) === MINE_SERVICES_TITLE;
}

function cleanMinePageSectionArray(data, key, summary) {
  if (!Array.isArray(data?.[key])) return;
  const kept = [];
  for (const section of data[key]) {
    if (arg.cleanMineCreationCenter && isMineCreationCenterSection(section)) {
      summary.creationCenters.push(minePageSectionSummary(section));
      continue;
    }
    if (arg.cleanMineServices && isMineServicesSection(section)) {
      summary.services.push(minePageSectionSummary(section));
      continue;
    }
    kept.push(section);
  }
  data[key] = kept;
}

function cleanMinePageData(data, summary) {
  if (!data || typeof data !== "object") return;
  for (const key of MINE_PAGE_SECTION_ARRAY_KEYS) {
    cleanMinePageSectionArray(data, key, summary);
  }
}

function minePagePersonalizationMessage(summary, cleaned) {
  if (!cleaned) return "我的页面个性化清理开关已关闭";
  const lines = [];
  for (const item of summary.creationCenters) {
    lines.push(`创作中心：${item.itemCount} 个入口`);
  }
  for (const item of summary.services) {
    lines.push(`我的服务：${item.itemCount} 个入口`);
  }
  return lines.length ? lines.join("\n") : "未命中我的页面个性化模块";
}

function minePagePersonalizationNotifyPayload(summary, cleaned) {
  return {
    title: "Bilibili 个性化清理",
    subtitle: cleaned
      ? `清理创作中心 ${summary.creationCenters.length} / 清理我的服务 ${summary.services.length}`
      : "已关闭",
    message: minePagePersonalizationMessage(summary, cleaned),
  };
}

function handleMinePageResponse() {
  const json = parseResponseJson();
  const data = json?.data;
  if (!data || typeof data !== "object") {
    log("info", { page: "minePage", message: "data not found" });
    return $done({ response: $response });
  }

  const summary = minePageSummary();
  const cleaned = arg.cleanMineCreationCenter || arg.cleanMineServices;
  if (cleaned) cleanMinePageData(data, summary);

  setResponseBodyText(JSON.stringify(json));
  log("info", {
    page: "minePage",
    cleanMineCreationCenter: arg.cleanMineCreationCenter,
    cleanMineServices: arg.cleanMineServices,
    summary,
  });
  const notifyPayload = minePagePersonalizationNotifyPayload(summary, cleaned);
  notify(
    "personalization",
    notifyPayload.title,
    notifyPayload.subtitle,
    notifyPayload.message
  );
  $done({ response: $response });
}

// 首页搜索页面可清理模块的配置表。
const SEARCH_SQUARE_MODULES = {
  trending: {
    enabled: () => arg.cleanSearchTrending,
    label: "移除-首页搜索页的bilibili热搜",
    shortLabel: "bilibili热搜",
  },
  history: {
    enabled: () => arg.cleanSearchHistory,
    label: "移除-首页搜索页的搜索历史",
    shortLabel: "搜索历史",
  },
  recommend: {
    enabled: () => arg.cleanSearchDiscovery,
    label: "移除-首页搜索页的搜索发现",
    shortLabel: "搜索发现",
  },
};

// 判断首页搜索模块类型。
function searchSquareModuleType(module) {
  const type = String(module?.type || "");
  if (SEARCH_SQUARE_MODULES[type]) return type;

  const title = String(module?.title || "");
  if (title === "bilibili热搜") return "trending";
  if (title === "搜索历史") return "history";
  if (title === "搜索发现") return "recommend";
  return "";
}

// 生成首页搜索清理文案。
function searchSquareMessage(removedModules) {
  if (!removedModules.length) return "未命中首页搜索页面模块";
  return removedModules
    .map((item, index) => `${index + 1}、${item.label}`)
    .join("\n");
}

// 汇总首页搜索通知内容。
function searchSquareNotifyPayload(nextModules, removedModules) {
  return {
    title: "Bilibili 首页搜索页面移除",
    subtitle: `保留 ${nextModules.length} / 移除 ${removedModules.length}`,
    message: searchSquareMessage(removedModules),
  };
}

// 处理首页搜索响应。
function handleSearchSquareResponse() {
  const json = parseResponseJson();
  if (!Array.isArray(json?.data)) {
    log("info", { page: "searchSquare", message: "data not found" });
    return $done({ response: $response });
  }

  const removedModules = [];
  const nextModules = [];
  for (const module of json.data) {
    const type = searchSquareModuleType(module);
    const config = SEARCH_SQUARE_MODULES[type];
    if (config?.enabled()) {
      removedModules.push({ type, label: config.label, shortLabel: config.shortLabel });
      continue;
    }
    nextModules.push(module);
  }

  json.data = nextModules;
  setResponseBodyText(JSON.stringify(json));
  const notifyPayload = searchSquareNotifyPayload(nextModules, removedModules);
  log("info", {
    page: "searchSquare",
    kept: nextModules.length,
    removed: removedModules.map((item) => item.type),
  });
  notify(
    "remove",
    notifyPayload.title,
    notifyPayload.subtitle,
    notifyPayload.message
  );
  $done({ response: $response });
}

// 汇总搜索框默认词通知内容。
function searchDefaultWordsNotifyPayload(words, cleaned) {
  return {
    title: "Bilibili 搜索框推荐词移除",
    subtitle: cleaned ? `移除 ${words.length ? 1 : 0}` : "已关闭",
    message: cleaned ? "移除-首页搜索框里滚动的推荐词" : "搜索框推荐词移除开关已关闭",
  };
}

// 处理搜索框默认词响应。
function handleSearchDefaultWordsResponse() {
  const message = decodeGrpcBody(getResponseBodyBytes());
  const fields = parseFields(message);
  const words = uniqueStrings([
    ...fieldStrings(fields, 3),
    ...fieldStrings(fields, 4),
  ]);

  if (arg.cleanSearchDefaultWords) {
    setResponseBodyBytes(encodeGrpcBody(new Uint8Array()));
  }

  const notifyPayload = searchDefaultWordsNotifyPayload(words, arg.cleanSearchDefaultWords);
  log("info", {
    page: "searchDefaultWords",
    cleaned: arg.cleanSearchDefaultWords,
    words,
  });
  notify(
    "remove",
    notifyPayload.title,
    notifyPayload.subtitle,
    notifyPayload.message
  );
  $done({ response: $response });
}

// 压缩展示文本长度。
function compactDisplayText(value, maxLength = 48) {
  const text = String(value || "")
    .replace(/\u200b/g, "")
    .replace(/\ufffd/g, "")
    .replace(/https?:\/\/\S+|tbopen:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

// 汇总动态页推荐商品信息。
function dynamicUpRecommendationSummary(bytes) {
  const rawText = decodeString(bytes);
  const values = extractReadableStrings(bytes)
    .map((value) => compactDisplayText(value))
    .filter((value) => value && !/^(UP主的推荐|淘宝|商品来自淘宝|去看看)$/.test(value));
  return {
    title: firstNonEmpty(values) || "UP主的推荐",
    source: /商品来自淘宝/.test(rawText) ? "商品来自淘宝" : (/淘宝|taobao|tbopen:/.test(rawText) ? "淘宝" : ""),
  };
}

// 汇总被动态页关键词屏蔽的整条动态。
function dynamicKeywordBlockSummary(bytes, match) {
  const entries = readableProtobufEntries(bytes, 8);
  const up = firstSummaryUp(entries, [
    "3.2.3.2",
    "4.4",
    "4.30",
  ]);
  const ignoredValues = up ? [up] : [];
  const title = firstSummaryEntry(entries, [
    "4.6.1",
    "4.6.10",
    "3.5.2.1",
    "3.5.20.10",
    "3.8.9.2",
  ], ignoredValues) ||
    firstKeywordSummaryEntry(entries, match, ignoredValues) ||
    fallbackKeywordTitle(match);
  return {
    title,
    up,
    rule: "dynamicKeywords",
    keyword: match?.keyword,
    matchedValue: cleanNotifyText(match?.value || ""),
  };
}

// 判断整条动态是否命中动态页关键词。
function findDynamicKeywordMatch(bytes, keywords) {
  return findContentKeywordMatch([
    decodeString(bytes),
    ...extractReadableStrings(bytes),
  ], keywords, "dynamicKeywords");
}

// 判断是否为动态页推荐模块。
function isDynamicUpRecommendationModule(bytes) {
  const fields = tryParseFields(bytes);
  if (!fields || varintField(fields, 1) !== 8) return false;

  const text = decodeString(bytes);
  return /UP主的推荐/.test(text) &&
    /(商品来自淘宝|schema_name":"淘宝|tbopen:|taobao|com\.taobao|\/bfs\/mall\/|去看看|is_ad_loc)/.test(text);
}

// 判断是否为动态页扩展商品信息。
function isDynamicUpRecommendationExtendGoods(bytes) {
  const text = decodeString(bytes);
  return /(商品来自淘宝|schema_name":"淘宝|tbopen:|taobao|com\.taobao|\/bfs\/mall\/|\/bfs\/sycp\/|is_ad_loc)/.test(text);
}

// 判断是否为动态页推荐详情。
function isDynamicUpRecommendationDetail(bytes) {
  const fields = tryParseFields(bytes);
  if (!fields) return false;

  const labels = [
    ...fieldStrings(fields, 7),
    ...fieldStrings(fields, 13),
  ];
  if (!labels.some((label) => /UP主的推荐/.test(label))) return false;

  return isDynamicUpRecommendationExtendGoods(bytes);
}

// 递归清理动态页嵌套推荐。
function sanitizeDynamicNestedRecommendations(bytes, summary, alreadyCounted) {
  const result = transformProtobufFields(bytes, ({ field }) => {
    if (isProtobufMessageField(field) && isDynamicUpRecommendationDetail(field.value)) {
      if (!alreadyCounted) summary.upRecommendations.push(dynamicUpRecommendationSummary(field.value));
      return { remove: true };
    }
    return null;
  }, { maxDepth: 10 });

  return result.changed ? result.bytes : bytes;
}

// 清理动态页扩展信息。
function sanitizeDynamicExtend(extendBytes, summary, alreadyCounted) {
  const result = transformProtobufFields(extendBytes, ({ field, depth }) => {
    if (!isProtobufMessageField(field)) return null;

    const isTopExtendGoods = depth === 0 && field.no === 6 && isDynamicUpRecommendationExtendGoods(field.value);
    if (isTopExtendGoods || isDynamicUpRecommendationDetail(field.value)) {
      if (!alreadyCounted) summary.upRecommendations.push(dynamicUpRecommendationSummary(field.value));
      return { remove: true };
    }
    return null;
  }, { maxDepth: 10 });

  return result.changed ? result.bytes : extendBytes;
}

// 清理单条动态里的推荐模块。
function sanitizeDynamicItemModules(itemBytes, summary) {
  const fields = tryParseFields(itemBytes);
  if (!fields) return itemBytes;

  let changed = false;
  let removedRecommendation = false;
  const hasRecommendationModule = fields.some((field) =>
    field.no === 3 && field.wireType === 2 && isDynamicUpRecommendationModule(field.value)
  );
  const chunks = [];
  for (const field of fields) {
    if (field.no === 3 && field.wireType === 2 && isDynamicUpRecommendationModule(field.value)) {
      summary.upRecommendations.push(dynamicUpRecommendationSummary(field.value));
      removedRecommendation = true;
      changed = true;
      continue;
    }
    if (field.no === 4 && field.wireType === 2) {
      const nextExtend = sanitizeDynamicExtend(field.value, summary, hasRecommendationModule || removedRecommendation);
      if (nextExtend !== field.value) {
        chunks.push(encodeField(field.no, field.wireType, nextExtend));
        changed = true;
        continue;
      }
    }
    if (field.wireType === 2 && field.value.length) {
      const nextValue = sanitizeDynamicNestedRecommendations(field.value, summary, hasRecommendationModule || removedRecommendation);
      if (nextValue !== field.value) {
        chunks.push(encodeField(field.no, field.wireType, nextValue));
        changed = true;
        continue;
      }
    }
    chunks.push(field.raw);
  }

  return changed ? concat(chunks) : itemBytes;
}

// 查找动态里的推荐商品片段。
function findDynamicUpRecommendationBytes(bytes) {
  let matched = null;
  walkProtobufFields(bytes, ({ fields }) => {
    for (const field of fields) {
      if (!isProtobufMessageField(field)) continue;
      if (isDynamicUpRecommendationModule(field.value) || isDynamicUpRecommendationDetail(field.value)) {
        matched = field.value;
        return { stop: true };
      }
    }
    return null;
  }, { maxDepth: 10 });
  return matched;
}

// 清理动态列表。
function sanitizeDynamicAllList(listBytes, summary, mode, dynamicKeywords) {
  const fields = tryParseFields(listBytes);
  if (!fields) return listBytes;

  let changed = false;
  const chunks = [];
  for (const field of fields) {
    if (field.no === 1 && field.wireType === 2) {
      summary.dynamicItems += 1;
      const dynamicMatch = findDynamicKeywordMatch(field.value, dynamicKeywords);
      if (dynamicMatch) {
        summary.blockedDynamics.push(dynamicKeywordBlockSummary(field.value, dynamicMatch));
        changed = true;
        continue;
      }

      if (mode === "dynamic") {
        const recommendationBytes = findDynamicUpRecommendationBytes(field.value);
        if (recommendationBytes) {
          summary.upRecommendations.push(dynamicUpRecommendationSummary(recommendationBytes));
          changed = true;
          continue;
        }
        summary.kept += 1;
        chunks.push(field.raw);
        continue;
      }

      const nextItem = sanitizeDynamicItemModules(field.value, summary);
      if (nextItem !== field.value) {
        chunks.push(encodeField(field.no, field.wireType, nextItem));
        changed = true;
        summary.kept += 1;
        continue;
      }
      summary.kept += 1;
    }
    chunks.push(field.raw);
  }

  return changed ? concat(chunks) : listBytes;
}

// 清理动态页消息。
function sanitizeDynamicAllMessage(messageBytes, summary, mode, dynamicKeywords) {
  const fields = parseFields(messageBytes);
  let changed = false;
  const chunks = [];
  for (const field of fields) {
    if (field.no === 1 && field.wireType === 2) {
      const nextList = sanitizeDynamicAllList(field.value, summary, mode, dynamicKeywords);
      if (nextList !== field.value) {
        chunks.push(encodeField(field.no, field.wireType, nextList));
        changed = true;
        continue;
      }
    }
    chunks.push(field.raw);
  }
  return changed ? concat(chunks) : messageBytes;
}

// 生成动态页清理文案。
function dynamicUpRecommendationMessage(items) {
  if (!items.length) return "未命中动态页 UP 主推荐";
  return "移除-动态页 UP 主的推荐：\n" + items
    .slice(0, 5)
    .map((item, index) => `${index + 1}、标题：${item.title || "UP主的推荐"}${item.source ? "｜来源：" + item.source : ""}`)
    .join("\n");
}

// 汇总动态页通知内容。
function dynamicNotifyPayload(summary, mode, cleaned = true) {
  if (!cleaned) {
    return {
      title: "Bilibili 动态页清理",
      subtitle: "已关闭",
      message: "动态页 UP 主推荐清理开关已关闭",
    };
  }
  const actionParts = [];
  if (mode !== "off") actionParts.push(`${mode === "dynamic" ? "移除推荐动态" : "移除推荐模块"} ${summary.upRecommendations.length}`);
  if (summary.blockedDynamics.length) actionParts.push(`屏蔽动态 ${summary.blockedDynamics.length}`);
  return {
    title: "Bilibili 动态页清理",
    subtitle: `保留 ${summary.kept}${actionParts.length ? " / " + actionParts.join(" / ") : ""}`,
    message: dynamicNotifyMessage(summary, mode),
  };
}

// 生成动态页通知正文。
function dynamicNotifyMessage(summary, mode) {
  const messages = [];
  if (summary.upRecommendations.length) messages.push(dynamicUpRecommendationMessage(summary.upRecommendations));
  if (summary.blockedDynamics.length) messages.push(itemListMessage("屏蔽-动态页动态", summary.blockedDynamics));
  if (messages.length) return messages.join("\n\n");
  return mode === "off" ? "未命中动态页清理规则" : dynamicUpRecommendationMessage([]);
}

// 处理动态页响应。
function handleDynamicAllResponse() {
  const dynamicKeywords = buildContentKeywords(arg.dynamicKeywords);
  if (dynamicUpRecommendationMode === "off" && !hasContentKeywords(dynamicKeywords)) {
    const notifyPayload = dynamicNotifyPayload({ kept: 0, upRecommendations: [], blockedDynamics: [] }, dynamicUpRecommendationMode, false);
    log("info", { page: "dynamic", endpoint: "DynAll", mode: dynamicUpRecommendationMode, cleaned: false });
    notify("remove", notifyPayload.title, notifyPayload.subtitle, notifyPayload.message);
    return $done({ response: $response });
  }

  const message = decodeGrpcBody(getResponseBodyBytes());
  const summary = { dynamicItems: 0, kept: 0, upRecommendations: [], blockedDynamics: [] };
  const nextMessage = sanitizeDynamicAllMessage(message, summary, dynamicUpRecommendationMode, dynamicKeywords);
  if (summary.upRecommendations.length || summary.blockedDynamics.length) {
    setResponseBodyBytes(encodeGrpcBody(nextMessage));
  }

  const notifyPayload = dynamicNotifyPayload(summary, dynamicUpRecommendationMode);
  log("info", {
    page: "dynamic",
    endpoint: "DynAll",
    mode: dynamicUpRecommendationMode,
    total: summary.dynamicItems,
    kept: summary.kept,
    removed: summary.upRecommendations.length,
    blocked: summary.blockedDynamics.length,
    dynamicKeywords: dynamicKeywords.displayKeywords,
    removedItems: summary.upRecommendations,
    blockedItems: summary.blockedDynamics,
  });
  notify(
    ["remove", "filter"],
    notifyPayload.title,
    notifyPayload.subtitle,
    notifyPayload.message
  );
  $done({ response: $response });
}

// 提取首页推荐项的标题和 UP。
function extractHomeFeedItemText(item) {
  return {
    titles: [
      item?.title,
      item?.player_args?.title,
      item?.ad_info?.creative_content?.title,
      item?.ad_info?.creative_content?.card?.title,
      item?.ad_info?.extra?.card?.title,
    ].filter(Boolean),
    upNames: [
      item?.args?.up_name,
      item?.desc_button?.text,
      item?.desc,
      item?.name,
      item?.owner?.name,
      item?.ad_info?.extra?.card?.adver_name,
      item?.ad_info?.extra?.card?.adver?.adver_name,
    ].filter(Boolean),
  };
}

// 构建首页推荐页过滤行。
function homeFeedFilterRow(item) {
  const { titles, upNames } = extractHomeFeedItemText(item);
  return createFilterRow({
    item,
    titles,
    upNames,
    aid: item?.args?.aid || item?.player_args?.aid || item?.param || extractAidFromText(item?.uri) || "",
    inlineTags: [],
  });
}

// 构建首页热门过滤行。
function extractPopularFilterRow(cardBytes, keywords) {
  try {
    const text = extractCardText(cardBytes);
    return createFilterRow({
      titles: text.titles,
      upNames: text.upNames,
      aid: text.aid,
      inlineTags: hasVideoTagFilter(keywords) ? collectTopicTags(cardBytes) : [],
    });
  } catch (error) {
    log("debug", "failed to extract card fields", error);
    return createFilterRow({});
  }
}

// 过滤首页推荐页响应。
async function filterHomeFeedIndex() {
  const keywords = buildKeywords();
  const hasKeywordFilter = hasAnyFilterRule(keywords);
  if (!hasKeywordFilter) {
    log("info", "no keywords configured");
  }

  const json = parseResponseJson();
  const items = Array.isArray(json?.data?.items) ? json.data.items : [];
  let kept = 0;
  let removed = 0;
  let cleanedAds = 0;
  let cleanedPromotedVideos = 0;

  // removedItems / cleaned*Items 只用于通知和日志展示。
  const removedItems = [];
  const cleanedAdItems = [];
  const cleanedPromotedVideoItems = [];

  // rows 保存还需要继续跑屏蔽规则的普通视频项。
  const rows = [];
  const nextItems = [];
  for (const item of items) {
    const row = homeFeedFilterRow(item);
    const { titles, upNames } = row;
    const cleanupType = getHomeFeedCleanupType(item);
    if (cleanupType === "ad" && arg.cleanFeedAds) {
      cleanedAds += 1;
      cleanedAdItems.push({ title: firstNonEmpty(titles), up: firstNonEmpty(upNames) });
      continue;
    }
    if (cleanupType === "promotedVideo" && arg.cleanFeedPromotedVideos) {
      cleanedPromotedVideos += 1;
      cleanedPromotedVideoItems.push({ title: firstNonEmpty(titles), up: firstNonEmpty(upNames) });
      continue;
    }

    rows.push(row);
  }

  if (hasKeywordFilter) await applyFilterMatches(rows, keywords);

  for (const row of rows) {
    if (row.match) {
      removed += 1;
      removedItems.push(matchedFilterItem(row));
      continue;
    }
    kept += 1;
    nextItems.push(row.item);
  }
  json.data.items = nextItems;

  setResponseBodyText(JSON.stringify(json));
  log("info", {
    ...filterSummary("homeFeed", kept, removed, keywords),
    cleanedAds,
    cleanedPromotedVideos,
    removedItems,
    cleanedAdItems,
    cleanedPromotedVideoItems,
  });
  notify(
    ["remove", "filter"],
    "Bilibili 首页推荐页屏蔽",
    homeFeedNotifySubtitle(kept, removed, cleanedAds, cleanedPromotedVideos),
    homeFeedNotifyMessage(removedItems, cleanedAdItems, cleanedPromotedVideoItems)
  );
  $done({ response: $response });
}

// 判断首页推荐项的清理类型。
function getHomeFeedCleanupType(item) {
  if (isHomeFeedVideoItem(item)) return "";
  if (isHomeFeedPromotedVideoItem(item)) return "promotedVideo";
  return "ad";
}

// 判断是否为普通首页视频卡。
function isHomeFeedVideoItem(item) {
  return !!item &&
    !item.banner_item &&
    !item.ad_info &&
    item.card_goto === "av" &&
    HOME_FEED_VIDEO_CARD_TYPES.includes(item.card_type);
}

// 判断是否为首页推广视频卡。
function isHomeFeedPromotedVideoItem(item) {
  if (!item?.ad_info) return false;
  const goto = String(item.card_goto || item.goto || "");
  const aid = item?.args?.aid ||
    item?.player_args?.aid ||
    item?.param ||
    item?.ad_info?.creative_content?.video_id ||
    extractAidFromText(item?.uri) ||
    extractAidFromText(item?.ad_info?.creative_content?.url);
  if (!aid) return false;
  return goto === "av" ||
    goto === "ad_av" ||
    item.goto === "av" ||
    item.card_type === "cm_v2" ||
    HOME_FEED_VIDEO_CARD_TYPES.includes(item.card_type);
}

// 处理首页热门响应。
async function handleHomePopularIndex() {
  const keywords = buildKeywords();
  const message = decodeGrpcBody(getResponseBodyBytes());
  const fields = parseFields(message);

  // rows 与顶层 field 1 一一对应，后面会按原顺序决定保留或删除。
  const rows = [];
  for (const field of fields) {
    if (field.no === 1 && field.wireType === 2) {
      rows.push(extractPopularFilterRow(field.value, keywords));
    }
  }
  if (!hasAnyFilterRule(keywords)) {
    log("info", { page: "homePopular", message: "no keywords configured" });
    notify("filter", "Bilibili 首页热门屏蔽", "未配置屏蔽规则", "请填写视频标题关键词、UP 主名称或视频 Tag");
    return $done({ response: $response });
  }

  await applyFilterMatches(rows, keywords);

  let kept = 0;
  let removed = 0;
  const removedItems = [];
  const chunks = [];
  let rowIndex = 0;
  for (const field of fields) {
    if (field.no === 1 && field.wireType === 2) {
      const row = rows[rowIndex++] || createFilterRow({});
      log("debug", { titles: row.titles, upNames: row.upNames, inlineTags: row.inlineTags, matched: !!row.match });

      if (row.match) {
        removed += 1;
        removedItems.push(matchedFilterItem(row));
        continue;
      }
      kept += 1;
    }
    chunks.push(field.raw);
  }

  setResponseBodyBytes(encodeGrpcBody(concat(chunks)));
  log("info", { ...filterSummary("homePopular", kept, removed, keywords), removedItems });
  notify(
    "filter",
    "Bilibili 首页热门屏蔽",
    `保留 ${kept} / 屏蔽 ${removed}`,
    removedItemsMessage(removedItems)
  );
  $done({ response: $response });
}

/* -------------------------------------------------------------------------- */
/* 路由入口                                                                   */
/* -------------------------------------------------------------------------- */

// 按 URL 把请求分发到对应处理器。
async function main() {
  const url = getRequestUrl();
  if (/\/x\/v2\/splash\/(?:show|list|brand\/list|brand\/show|event\/list|event\/list2|ad\/list|topview\/list)\?/.test(url) && typeof $response === "undefined") {
    return handleSplashRequest();
  }

  if (/\/x\/v2\/splash\/(?:show|list|brand\/list|brand\/show|event\/list|event\/list2|ad\/list|topview\/list)\?/.test(url)) {
    return handleSplashResponse();
  }

  if (/\/x\/resource\/(?:show\/tab\/v2|show\/skin|peak\/download)\?/.test(url)) {
    return handleStartupAdsResponse();
  }

  if (/\/x\/v2\/account\/mine\?/.test(url)) {
    return handleMinePageResponse();
  }

  if (/\/x\/v2\/search\/square\?/.test(url)) {
    return handleSearchSquareResponse();
  }

  if (/\/bilibili\.app\.interface\.v1\.Search\/DefaultWords$/.test(url)) {
    return handleSearchDefaultWordsResponse();
  }

  if (/\/bilibili\.app\.interface\.v1\.Search\/Suggest3$/.test(url)) {
    return handleSearchSuggestResponse();
  }

  if (/\/bilibili\.polymer\.app\.search\.v1\.Search\/SearchAll$/.test(url)) {
    return await handleSearchAllResponse();
  }

  if (/\/x\/v2\/feed\/index\/story\?/.test(url)) {
    return handleVideoFeedIndex();
  }

  if (/\/x\/v2\/feed\/index\?/.test(url)) {
    return await filterHomeFeedIndex();
  }

  if (/\/bilibili\.app\.viewunite\.v1\.View\/View$/.test(url)) {
    return handleViewResponse();
  }

  if (/\/bilibili\.app\.viewunite\.v1\.View\/RelatesFeed$/.test(url)) {
    return handleRelatesFeedResponse();
  }

  if (/\/bilibili\.app\.dynamic\.v2\.Dynamic\/DynAll$/.test(url)) {
    return handleDynamicAllResponse();
  }

  return await handleHomePopularIndex();
}

Promise.resolve(main()).catch((error) => {
  const url = getRequestUrl();
  const pageName = /\/bilibili\.app\.viewunite\.v1\.View\//.test(url)
    ? "视频页"
    : (/\/bilibili\.app\.dynamic\.v2\.Dynamic\/DynAll$/.test(url)
      ? "动态页"
      : (/\/x\/v2\/splash\//.test(url)
        ? "开屏广告"
        : (/\/bilibili\.app\.interface\.v1\.Search\/Suggest3$/.test(url)
          ? "搜索候选词条"
          : (/\/bilibili\.polymer\.app\.search\.v1\.Search\/SearchAll$/.test(url)
          ? "搜索结果"
          : (/\/x\/v2\/account\/mine\?/.test(url)
            ? "我的页面"
            : (/\/x\/v2\/feed\/index/.test(url) ? "首页推荐页" : "首页热门"))))));
  log("error", error);
  notify(["remove", "filter"], `Bilibili ${pageName}处理`, "脚本错误", stringify(error).slice(0, 180));
  $done(typeof $response !== "undefined" ? { response: $response } : {});
});