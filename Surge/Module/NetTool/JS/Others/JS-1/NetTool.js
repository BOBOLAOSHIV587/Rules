/* =========================================================
 * 模块：网络信息 + 服务检测  Beta版（BoxJS / Surge / Loon / QuanX / Egern 兼容）
 * 作者：ByteValley
 * 版本：2025-11-27R1
 *
 * 概述 · 功能边界
 *  · 展示 本地 / 入口 / 落地 网络信息（IPv4/IPv6），并按并发队列检测常见服务解锁状态
 *  · 标题显示网络类型；正文首行紧邻展示：执行时间 / 代理策略
 *  · Netflix 区分“完整解锁 / 仅自制剧”；其他服务统一“已解锁 / 不可达”
 *  · 台湾旗模式可切换：TW_FLAG_MODE = 0(🇨🇳) / 1(🇹🇼) / 2(🇼🇸)
 *
 * 运行环境 · 依赖接口
 *  · 兼容：Surge（Panel/Script）、Loon、Quantumult X、Egern、BoxJS
 *  · 依赖：$httpClient / $httpAPI / $persistentStore|$prefs / $notification / $network
 *
 * 渲染结构 · 版式控制
 *  · 分组子标题：本地 / 入口 / 落地 / 服务检测；组间留白由 GAP_LINES 控制（0~2）
 *  · IPv4/IPv6 分行显示；IP 脱敏由 MASK_IP 控制；位置脱敏由 MASK_POS 控制（未显式设置时随 MASK_IP）
 *  · 子标题样式由 SUBTITLE_STYLE 控制；SUBTITLE_MINIMAL=1 输出极简标题（仅文字）
 *
 * 数据源 · 抓取策略
 *  · 直连 IPv4：表驱动逐级回退（cip | 163 | 126 | bilibili | pingan | ipip）
 *    - 命中“市级”定位优先返回；否则继续下一个源；全失败回落至 ipip
 *    - 若直连 isp 缺失：尝试“同 IP”从其他直连源补齐（仅缺失时触发）
 *  · 直连 IPv6：ddnspod | neu6
 *  · 落地 IPv4：ipapi | ipwhois | ipsb（失败逐级回退）
 *  · 落地 IPv6：ipsb | ident | ipify（失败逐级回退；运行前会先快速探测 v6 可用性）
 *
 * 入口 · 策略名获取（稳态）
 *  · 预触发一次落地端点（v4/v6），确保代理产生可被记录的外连请求
 *  · 扫描 /v1/requests/recent 捕获入口 IPv4/IPv6 与 policyName；必要时用任意代理请求兜底
 *  · 入口定位采用“双源并行 + 回退链”：平安接口 +（ipapi → ipwhois → ipsb）
 *  · 入口定位缓存 TTL 跟 Update 联动：TTL = max(30, min(Update, 3600)) 秒
 *
 * 服务检测 · 显示风格
 *  · 覆盖：YouTube / Netflix / Disney+ / Hulu(美) / Hulu(日) / Max(HBO) / ChatGPT Web / ChatGPT App(API)
 *  · 样式：SD_STYLE = icon|text；SD_REGION_MODE = full|abbr|flag；SD_ICON_THEME = check|lock|circle
 *  · ChatGPT App(API) 地区优先读取 Cloudflare 头（CF-IPCountry）；无则走多源回退
 *  · 别名映射（示例）：
 *    - yt|youtube|油管 → youtube
 *    - nf|netflix|奈飞 → netflix
 *    - disney|disney+|迪士尼 → disney
 *    - chatgpt → chatgpt_app；chatgpt_web|chatgpt-web|chatgpt web → chatgpt_web
 *    - hulu|葫芦|huluus → hulu_us；hulujp → hulu_jp；hbo|max → hbo
 *
 * 服务清单 · 选择优先级
 *  · 模块 arguments（SERVICES=...，显式修改时优先）
 *  · BoxJS 多选（@Panel.NetworkInfo.Settings.SERVICES；[] 视为“未指定”）
 *  · BoxJS 文本（@Panel.NetworkInfo.Settings.SERVICES_TEXT）
 *  · 以上都为空 ⇒ 默认（全部）
 *
 * 参数 · 默认值 & 取值优先级
 *  · 默认顺序（单值参数）：
 *     1）模块 arguments 若与脚本默认 defVal 不同 ⇒ 视为“显式修改”，优先级最高
 *     2）否则若 BoxJS（@Panel.NetworkInfo.Settings.*）有值 ⇒ BoxJS 覆盖默认
 *     3）否则退回模块 arguments / 脚本默认 defVal
 *
 *  · Update                 刷新间隔（秒）                 默认 10
 *  · Timeout                全局超时（秒）                 默认 12
 *  · IPv6                   启用 IPv6                      默认 1
 *  · MASK_IP                脱敏 IP                        默认 1
 *  · MASK_POS               脱敏位置                       默认 1（未设时随 MASK_IP）
 *  · DOMESTIC_IPv4          直连 IPv4 源                   默认 ipip
 *  · DOMESTIC_IPv6          直连 IPv6 源                   默认 ddnspod
 *  · LANDING_IPv4           落地 IPv4 源                   默认 ipapi
 *  · LANDING_IPv6           落地 IPv6 源                   默认 ipsb
 *  · TW_FLAG_MODE           台湾旗模式 0/1/2               默认 1
 *
 *  · IconPreset             图标预设                       默认 globe（globe|wifi|dots|antenna|point）
 *  · Icon / IconColor       自定义图标/颜色                Icon 非空时优先；否则使用 IconPreset
 *
 *  · SUBTITLE_STYLE         子标题样式                      line|cnBracket|cnQuote|square|curly|angle|pipe|bullet|plain
 *  · SUBTITLE_MINIMAL       极简子标题                      1=仅文字，无装饰
 *  · GAP_LINES              分组留白                        0~2（默认 1）
 *
 *  · SD_STYLE               服务显示样式                    icon|text（默认 icon）
 *  · SD_REGION_MODE         地区风格                        full|abbr|flag（默认 full）
 *  · SD_ICON_THEME          图标主题                        check|lock|circle（默认 check）
 *  · SD_ARROW               使用“➟”连接服务名与地区        默认 1
 *  · SD_SHOW_LAT            显示耗时(ms)                    默认 1
 *  · SD_SHOW_HTTP           显示 HTTP 状态码                默认 1
 *  · SD_LANG                语言包                          zh-Hans|zh-Hant（默认 zh-Hans）
 *  · SD_TIMEOUT             单项检测超时（秒）              默认 0（0=跟随 Timeout；内部最小 2000ms）
 *  · SD_CONCURRENCY         服务检测并发数                   默认 6（脚本内 clamp 到 1~8）
 *
 *  · SERVICES               服务清单（数组/逗号分隔）       为空则默认全开（顺序按输入）
 *
 * 日志 · 调试
 *  · LOG                    开启日志                        默认 1
 *  · LOG_LEVEL              级别：debug|info|warn|error      默认 info
 *  · LOG_TO_PANEL           面板追加“调试”尾巴               默认 0
 *  · LOG_PUSH               异常系统通知推送                 默认 1
 *
 * 常见问题 · 提示
 *  · 入口为空：需确保近期访问过 ip-api / ip.sb 等落地接口；脚本已内置“预触发”
 *  · Netflix 仅自制剧：地区可用但目录受限，属正常判定
 *  · 台湾旗样式：按 TW_FLAG_MODE 切换（合规/默认/彩蛋）
 *
 * 示例 · 组合参数
 *  · SERVICES=Netflix,YouTube,Disney,ChatGPT,ChatGPT_Web,Hulu_US,Hulu_JP,HBO
 *  · SD_STYLE=text&SD_REGION_MODE=abbr&SD_ARROW=0&SD_CONCURRENCY=8
 * ========================================================= */

// ====================== 常量 & 配置基线 ======================
const CONSTS = Object.freeze({
  MAX_RECENT_REQ: 150,
  PRETOUCH_TO_MS: 700,

  SD_MIN_TIMEOUT: 2000,

  LOG_RING_MAX: 120,
  DEBUG_TAIL_LINES: 18,

  ENT_MIN_TTL: 30,
  ENT_MAX_TTL: 3600,

  // IPv6 快速探测：每次运行先确认是否支持 v6，再决定是否跑 v6 链路
  V6_PROBE_TO_MS: 1200,

  // 预算相关
  BUDGET_HARD_MS: 10000,
  BUDGET_SOFT_GUARD_MS: 260
});

/* ===== 语言字典（固定 UI 词收口）===== */
const SD_STR = {
  "zh-Hans": {
    panelTitle: "网络信息 𝕏",
    wifi: "Wi-Fi",
    cellular: "蜂窝网络",
    unknownNet: "网络 | 未知",
    gen: (g, r) => `${g ? `${g} - ${r}` : r}`,
    policy: "代理策略",
    ip: "IP",
    entrance: "入口",
    landingIP: "落地 IP",
    location: "位置",
    isp: "运营商",
    runAt: "执行时间",
    region: "区域",
    unlocked: "已解锁",
    partialUnlocked: "部分解锁",
    notReachable: "不可达",
    timeout: "超时",
    fail: "检测失败",
    regionBlocked: "区域受限",
    nfFull: "已完整解锁",
    nfOriginals: "仅解锁自制剧",
    debug: "调试"
  },
  "zh-Hant": {
    panelTitle: "網路資訊 𝕏",
    wifi: "Wi-Fi",
    cellular: "行動服務",
    unknownNet: "網路 | 未知",
    gen: (g, r) => `${g ? `${g} - ${r}` : r}`,
    policy: "代理策略",
    ip: "IP",
    entrance: "入口",
    landingIP: "落地 IP",
    location: "位置",
    isp: "運營商",
    runAt: "執行時間",
    region: "區域",
    unlocked: "已解鎖",
    partialUnlocked: "部分解鎖",
    notReachable: "不可達",
    timeout: "逾時",
    fail: "檢測失敗",
    regionBlocked: "區域受限",
    nfFull: "已完整解鎖",
    nfOriginals: "僅解鎖自製劇",
    debug: "除錯"
  }
};

/** 取词工具（注意：依赖后面的 SD_LANG 常量，但不会在定义前调用） */
function t(key, ...args) {
  const lang = (typeof SD_LANG === "string" ? SD_LANG : "zh-Hans");
  const pack = SD_STR[lang] || SD_STR["zh-Hans"];
  const v = pack[key];
  if (typeof v === "function") return v(...args);
  return v != null ? v : key;
}

// ====================== 运行环境适配层 ======================
/**
 * 统一 KV 存储抽象：
 *  · Surge / Loon：$persistentStore / $prefs
 *  · QuanX：$prefs
 *  · 其他环境：localStorage（若存在）
 */
const KVStore = (() => {
  if (typeof $prefs !== 'undefined' && $prefs.valueForKey) {
    return {
      read: (k) => $prefs.valueForKey(k),
      write: (v, k) => $prefs.setValueForKey(v, k)
    };
  }
  if (typeof $persistentStore !== 'undefined' && $persistentStore.read) {
    return {
      read: (k) => $persistentStore.read(k),
      write: (v, k) => $persistentStore.write(v, k)
    };
  }
  try {
    if (typeof localStorage !== 'undefined') {
      return {
        read: (k) => localStorage.getItem(k),
        write: (v, k) => localStorage.setItem(k, v)
      };
    }
  } catch (_) {}
  return {
    read: () => null,
    write: () => {}
  };
})();

// ====================== 启动阶段临时日志（专门抓 BoxJS 读写） ======================
const BOOT_DEBUG = [];

function bootLog(...args) {
  const line = '[NI][BOOT] ' + args.map((x) =>
    typeof x === 'string' ? x : JSON.stringify(x)
  ).join(' ');
  BOOT_DEBUG.push(line);
  try { console.log(line); } catch (_) {}
}

/**
 * 读取 BoxJS 设置对象（NetworkInfo）
 */
function readBoxSettings() {
  let raw;
  try {
    raw = KVStore.read('Panel');
  } catch (e) {
    bootLog('BoxSettings.read Panel error:', String(e));
    return {};
  }

  if (raw === null || raw === undefined || raw === '') {
    bootLog('BoxSettings.Panel.empty');
    return {};
  }

  let panel = raw;
  if (typeof raw === 'string') {
    try {
      panel = JSON.parse(raw);
    } catch (e) {
      const tag = raw.length > 120 ? raw.slice(0, 120) + '…' : raw;
      bootLog('BoxSettings.Panel.parse.fail:', String(e));
      bootLog('BoxSettings.Panel.raw.snip:', tag);
      return {};
    }
  }

  if (!panel || typeof panel !== 'object') {
    bootLog('BoxSettings.Panel.invalid type:', typeof panel);
    return {};
  }

  try { bootLog('BoxSettings.Panel.keys:', Object.keys(panel)); } catch (_) {}

  if (
    panel.NetworkInfo &&
    panel.NetworkInfo.Settings &&
    typeof panel.NetworkInfo.Settings === 'object'
  ) {
    bootLog('BoxSettings.path: Panel.NetworkInfo.Settings');
    return panel.NetworkInfo.Settings;
  }

  if (panel.Settings && typeof panel.Settings === 'object') {
    bootLog('BoxSettings.path: Panel.Settings (fallback)');
    return panel.Settings;
  }

  bootLog('BoxSettings.no NetworkInfo.Settings, use {}');
  return {};
}

const BOX = readBoxSettings();

function readBoxKey(key) {
  if (!BOX || typeof BOX !== 'object') return undefined;
  if (!Object.prototype.hasOwnProperty.call(BOX, key)) return undefined;
  const v = BOX[key];
  if (v === '' || v === null || v === undefined) return undefined;
  return v;
}

/** 解析 $argument（支持字符串或对象） */
function parseArgs(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    return raw.split('&').reduce((acc, kv) => {
      if (!kv) return acc;
      const [k, v = ''] = kv.split('=');
      const key = decodeURIComponent(k || '');
      acc[key] = decodeURIComponent(String(v).replace(/\+/g, '%20'));
      return acc;
    }, {});
  }
  return {};
}

const $args = parseArgs(typeof $argument !== 'undefined' ? $argument : undefined);

function readArgRaw(name) {
  try {
    if (typeof $argument === 'string') {
      const re = new RegExp(`(?:^|&)${name}=([^&]*)`);
      const m = $argument.match(re);
      if (m) return decodeURIComponent(String(m[1]).replace(/\+/g, '%20'));
    }
  } catch (_) {}
  return undefined;
}

// ====================== 小工具（类型/拼接/格式） ======================
const toBool = (v, d = false) => {
  if (v == null || v === '') return d;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (['1', 'true', 'on', 'yes', 'y'].includes(s)) return true;
  if (['0', 'false', 'off', 'no', 'n'].includes(s)) return false;
  return d;
};

const toNum = (v, d) => {
  if (v == null || v === '') return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const joinNonEmpty = (arr, sep = ' ') => arr.filter(Boolean).join(sep);

/**
 * ENV：统一参数优先级
 */
function ENV(key, defVal, opt = {}) {
  const typeHint = typeof defVal;
  const argKeys = [key].concat(opt.argAlias || []);
  const boxKeys = [key].concat(opt.boxAlias || []);

  let argRaw;
  let hasArg = false;
  for (const k of argKeys) {
    if ($args && Object.prototype.hasOwnProperty.call($args, k)) {
      const v = $args[k];
      if (v !== undefined && v !== null && v !== '') {
        argRaw = v;
        hasArg = true;
        break;
      }
    }
  }

  let boxRaw;
  let hasBox = false;
  for (const bk of boxKeys) {
    const v = readBoxKey(bk);
    if (v !== undefined && v !== null && v !== '') {
      boxRaw = v;
      hasBox = true;
      break;
    }
  }

  const convert = (val) => {
    if (typeHint === 'number') return toNum(val, defVal);
    if (typeHint === 'boolean') return toBool(val, defVal);
    return val;
  };

  const canon = (val) => {
    if (typeHint === 'number') return String(toNum(val, defVal));
    if (typeHint === 'boolean') return toBool(val, defVal) ? 'true' : 'false';
    return String(val);
  };

  const argChanged = hasArg && !opt.skipArgDiff && canon(argRaw) !== canon(defVal);

  if (argChanged) return convert(argRaw);
  if (hasBox) return convert(boxRaw);
  if (hasArg) return convert(argRaw);
  return defVal;
}

// ====================== 统一配置对象（CFG.*） ======================
const CFG = {
  /* —— 基本 —— */
  Update: toNum(ENV('Update', 10), 10),
  Timeout: toNum(ENV('Timeout', 12), 12),
  BUDGET_SEC_RAW: ENV('BUDGET', 0),

  /* —— 开关类（0/1 / true/false 都支持）—— */
  MASK_IP: toBool(ENV('MASK_IP', true), true),
  MASK_POS_MODE: ENV('MASK_POS', 'auto'),
  IPv6: toBool(ENV('IPv6', true), true),

  /* —— 数据源 —— */
  DOMESTIC_IPv4: (() => {
    const v = ENV('DOMESTIC_IPv4', 'ipip');
    if (v !== '' && v != null) return v;
    return $args.DOMIC_IPv4 || 'ipip';
  })(),
  DOMESTIC_IPv6: (() => {
    const v = ENV('DOMESTIC_IPv6', 'ddnspod');
    if (v !== '' && v != null) return v;
    return $args.DOMIC_IPv6 || 'ddnspod';
  })(),
  LANDING_IPv4: ENV('LANDING_IPv4', 'ipapi'),
  LANDING_IPv6: ENV('LANDING_IPv6', 'ipsb'),

  /* —— 台湾旗模式 —— */
  TW_FLAG_MODE: toNum(ENV('TW_FLAG_MODE', 1), 1),

  /* —— 图标接管 —— */
  IconPreset: ENV('IconPreset', 'globe'),
  Icon: ENV('Icon', ''), // R5：默认不写死，避免 IconPreset 永远不生效
  IconColor: ENV('IconColor', '#1E90FF'),

  /* —— 服务检测基本样式 —— */
  SD_STYLE: ENV('SD_STYLE', 'icon'),
  SD_SHOW_LAT: toBool(ENV('SD_SHOW_LAT', true), true),
  SD_SHOW_HTTP: toBool(ENV('SD_SHOW_HTTP', true), true),
  SD_LANG: ENV('SD_LANG', 'zh-Hans'),

  /* —— 单项检测超时（秒）—— */
  SD_TIMEOUT_SEC_RAW: ENV('SD_TIMEOUT', 0), // R5：默认 0 跟随 Timeout
  SD_CONCURRENCY: toNum(ENV('SD_CONCURRENCY', 6), 6),

  SD_REGION_MODE: ENV('SD_REGION_MODE', 'full'),
  SD_ICON_THEME: ENV('SD_ICON_THEME', 'check'),
  SD_ARROW: toBool(ENV('SD_ARROW', true), true),

  /* —— Services —— */
  SERVICES_BOX_CHECKED_RAW: (() => {
    const v = readBoxKey('SERVICES');
    if (v == null) return null;
    if (Array.isArray(v)) {
      if (!v.length) return null;
      return JSON.stringify(v);
    }
    const s = String(v).trim();
    if (!s || s === '[]' || /^null$/i.test(s)) return null;
    return s;
  })(),
  SERVICES_BOX_TEXT: (() => {
    const v = readBoxKey('SERVICES_TEXT');
    return v != null ? String(v).trim() : '';
  })(),
  SERVICES_ARG_TEXT: (() => {
    let v = $args.SERVICES;
    if (Array.isArray(v)) return JSON.stringify(v);
    if (v == null || v === '') v = readArgRaw('SERVICES');
    return v != null ? String(v).trim() : '';
  })(),

  /* —— 子标题 —— */
  SUBTITLE_STYLE: ENV('SUBTITLE_STYLE', 'line'),
  SUBTITLE_MINIMAL: ENV('SUBTITLE_MINIMAL', false),
  GAP_LINES: ENV('GAP_LINES', 1),

  /* —— 日志 —— */
  LOG: toBool(ENV('LOG', true), true),
  LOG_LEVEL: (ENV('LOG_LEVEL', 'info') + '').toLowerCase(),
  LOG_TO_PANEL: toBool(ENV('LOG_TO_PANEL', false), false),
  LOG_PUSH: toBool(ENV('LOG_PUSH', true), true)
};

// ====================== 子标题样式（与 CFG 联动） ======================
const SUBTITLE_STYLES = Object.freeze({
  line: (s) => `——${s}——`,
  cnBracket: (s) => `【${s}】`,
  cnQuote: (s) => `「${s}」`,
  square: (s) => `[${s}]`,
  curly: (s) => `{${s}}`,
  angle: (s) => `《${s}》`,
  pipe: (s) => `║${s}║`,
  bullet: (s) => `·${s}·`,
  plain: (s) => `${s}`
});

function normalizeSubStyle(v) {
  const k = String(v ?? 'line').trim();
  return SUBTITLE_STYLES[k] ? k : 'line';
}

function makeSubTitleRenderer(styleKey, minimal = false) {
  const key = normalizeSubStyle(styleKey);
  const fn = SUBTITLE_STYLES[key] || SUBTITLE_STYLES.line;
  return minimal ? (s) => String(s) : (s) => fn(String(s));
}

function pushGroupTitle(parts, title) {
  for (let i = 0; i < CFG.GAP_LINES; i++) parts.push('');
  const render = makeSubTitleRenderer(CFG.SUBTITLE_STYLE, CFG.SUBTITLE_MINIMAL);
  parts.push(render(title));
}

CFG.SUBTITLE_STYLE = normalizeSubStyle(CFG.SUBTITLE_STYLE);
CFG.SUBTITLE_MINIMAL = toBool(CFG.SUBTITLE_MINIMAL, false);
CFG.GAP_LINES = Math.max(0, Math.min(2, toNum(CFG.GAP_LINES, 1)));

// ====================== 图标 & 开关映射 ======================
const ICON_PRESET_MAP = Object.freeze({
  wifi: 'wifi.router',
  globe: 'globe.asia.australia',
  dots: 'dot.radiowaves.left.and.right',
  antenna: 'antenna.radiowaves.left.and.right',
  point: 'point.3.connected.trianglepath.dotted'
});
const ICON_NAME = (CFG.Icon || '').trim()
  || ICON_PRESET_MAP[String(CFG.IconPreset).trim()] || 'globe.asia.australia';
const ICON_COLOR = CFG.IconColor;

const WANT_V6 = !!CFG.IPv6;
const HAS_V6 = !!($network?.v6?.primaryAddress);
const IPV6_EFF = WANT_V6 && HAS_V6;

const SD_TIMEOUT_MS = (() => {
  const baseSec = Number(CFG.Timeout) || 8;
  const secRaw = Number(CFG.SD_TIMEOUT_SEC_RAW);
  const sec = (Number.isFinite(secRaw) && secRaw > 0) ? secRaw : baseSec;
  return Math.max(CONSTS.SD_MIN_TIMEOUT, sec * 1000);
})();

const V6_TO = Math.min(
  Math.max(CONSTS.SD_MIN_TIMEOUT, SD_TIMEOUT_MS),
  2500
);

const MASK_IP = !!CFG.MASK_IP;

const _maskPosMode = String(CFG.MASK_POS_MODE ?? 'auto').trim().toLowerCase();
CFG.MASK_POS = (_maskPosMode === '' ||
  _maskPosMode === 'auto' ||
  _maskPosMode === 'follow' ||
  _maskPosMode === 'same')
  ? MASK_IP
  : toBool(_maskPosMode, true);
const MASK_POS = !!CFG.MASK_POS;

const TW_FLAG_MODE = Number(CFG.TW_FLAG_MODE) || 0;

const DOMESTIC_IPv4 = CFG.DOMESTIC_IPv4;
const DOMESTIC_IPv6 = CFG.DOMESTIC_IPv6;
const LANDING_IPv4 = CFG.LANDING_IPv4;
const LANDING_IPv6 = CFG.LANDING_IPv6;

// ====================== 服务检测参数 ======================
const SD_STYLE = (String(CFG.SD_STYLE).toLowerCase() === 'text') ? 'text' : 'icon';
const SD_SHOW_LAT = !!CFG.SD_SHOW_LAT;
const SD_SHOW_HTTP = !!CFG.SD_SHOW_HTTP;
const SD_LANG = (String(CFG.SD_LANG).toLowerCase() === 'zh-hant') ? 'zh-Hant' : 'zh-Hans';

const SD_REGION_MODE = ['full', 'abbr', 'flag'].includes(String(CFG.SD_REGION_MODE))
  ? CFG.SD_REGION_MODE : 'full';
const SD_ICON_THEME = ['lock', 'circle', 'check'].includes(String(CFG.SD_ICON_THEME))
  ? CFG.SD_ICON_THEME : 'check';
const SD_ARROW = !!CFG.SD_ARROW;

const SD_ICONS = (() => {
  switch (SD_ICON_THEME) {
    case 'lock':
      return {full: '🔓', partial: '🔐', blocked: '🔒'};
    case 'circle':
      return {full: '⭕️', partial: '⛔️', blocked: '🚫'};
    default:
      return {full: '✅', partial: '❇️', blocked: '❎'};
  }
})();

// ====================== 预算系统（总时长“兜底收工”） ======================
const BUDGET_MS = (() => {
  const raw = Number(CFG.BUDGET_SEC_RAW);
  const base = Math.max(1, Number(CFG.Timeout) || 8) * 1000;
  if (Number.isFinite(raw) && raw > 0) return Math.max(3500, raw * 1000);
  return Math.min(CONSTS.BUDGET_HARD_MS, Math.max(5500, base));
})();
const DEADLINE = Date.now() + BUDGET_MS;

function budgetLeft() {
  return Math.max(0, DEADLINE - Date.now());
}

/**
 * 预算感知 cap：
 *  - 临近截止会把单次请求的 cap 压短，避免把脚本拖到超时
 */
function capByBudget(capMs, floorMs = 220) {
  const left = budgetLeft();
  if (left <= CONSTS.BUDGET_SOFT_GUARD_MS) return Math.max(120, floorMs);
  const room = Math.max(120, left - CONSTS.BUDGET_SOFT_GUARD_MS);
  return Math.max(120, Math.min(Number(capMs) || room, room));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withTimeout(promise, ms, onTimeoutValue) {
  const lim = Math.max(120, Number(ms) || 0);
  let tmr;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise((resolve) => {
        tmr = setTimeout(() => resolve(onTimeoutValue), lim);
      })
    ]);
  } finally {
    if (tmr) clearTimeout(tmr);
  }
}

// ====================== 日志系统（基于 CFG） ======================
const LOG_ON = !!CFG.LOG;
const LOG_TO_PANEL = !!CFG.LOG_TO_PANEL;
const LOG_PUSH = !!CFG.LOG_PUSH;
const LOG_LEVEL = CFG.LOG_LEVEL || 'info';

const LOG_LEVELS = {debug: 10, info: 20, warn: 30, error: 40};
const LOG_THRESH = LOG_LEVELS[LOG_LEVEL] ?? 20;
const DEBUG_LINES = BOOT_DEBUG.slice();

function _maskMaybe(ip) {
  if (!ip) return '';
  if (!MASK_IP) return ip;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    const p = ip.split('.');
    return `${p[0]}.${p[1]}.*.*`;
  }
  if (/:/.test(ip)) {
    const p = ip.split(':');
    return joinNonEmpty([...p.slice(0, 4), '*', '*', '*', '*'], ':');
  }
  return ip;
}

function log(level, ...args) {
  if (!LOG_ON) return;
  const L = LOG_LEVELS[level] ?? 20;
  if (L < LOG_THRESH) return;
  const msg = args.map((x) => typeof x === 'string' ? x : JSON.stringify(x));
  const line = `[NI][${level.toUpperCase()}] ${msg.join(' ')}`;
  try { console.log(line); } catch (_) {}
  DEBUG_LINES.push(line);
  if (DEBUG_LINES.length > CONSTS.LOG_RING_MAX) DEBUG_LINES.shift();
}

function logErrPush(title, body) {
  if (LOG_PUSH) $notification?.post?.(title, "", body);
  log('error', title, body);
}

// ====================== 源常量 & 解析器 ======================
function safeJSON(s, d = {}) {
  try { return JSON.parse(s || ''); } catch { return d; }
}

function hasCityLevel(loc) {
  if (!loc) return false;
  try {
    const s = String(loc).replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, '').trim();
    if (/市|区|縣|县|州|市辖/.test(s)) return true;
    const parts = s.split(/\s+/).filter(Boolean);
    return parts.length >= 3;
  } catch {
    return false;
  }
}

const DIRECT_V4_SOURCES = Object.freeze({
  ipip: {
    url: 'https://myip.ipip.net/json',
    parse: (r) => {
      const j = safeJSON(r.body, {});
      const loc = j?.data?.location || [];
      const c0 = loc[0];
      const flag = flagOf(c0 === '中国' ? 'CN' : c0);

      // ===== R5：ipip 的 isp 位序兼容（有时在 loc[3]）=====
      let isp = '';
      if (Array.isArray(loc)) {
        if (loc.length >= 5) isp = loc[4] || '';
        else if (loc.length >= 4) isp = loc[3] || '';
      }

      return {
        ip: j?.data?.ip || '',
        loc: joinNonEmpty([flag, loc[0], loc[1], loc[2]], ' ').replace(/\s*中国\s*/, ''),
        isp: (isp || '').toString().trim()
      };
    }
  },
  cip: {
    url: 'http://cip.cc/',
    parse: (r) => {
      const b = String(r.body || '');
      const ip = (b.match(/IP.*?:\s*(\S+)/) || [])[1] || '';
      const addr = (b.match(/地址.*?:\s*(.+)/) || [])[1] || '';
      const isp = (b.match(/运营商.*?:\s*(.+)/) || [])[1] || '';
      const isCN = /中国/.test(addr);
      return {
        ip,
        loc: joinNonEmpty([flagOf(isCN ? 'CN' : ''), addr.replace(/中国\s*/, '')], ' '),
        isp: isp.replace(/中国\s*/, '')
      };
    }
  },
  '163': {
    url: 'https://dashi.163.com/fgw/mailsrv-ipdetail/detail',
    parse: (r) => {
      const d = safeJSON(r.body, {})?.result || {};
      return {
        ip: d.ip || '',
        loc: joinNonEmpty([flagOf(d.countryCode), d.country, d.province, d.city], ' ').replace(/\s*中国\s*/, ''),
        isp: d.isp || d.org || ''
      };
    }
  },
  bilibili: {
    url: 'https://api.bilibili.com/x/web-interface/zone',
    parse: (r) => {
      const d = safeJSON(r.body, {})?.data || {};
      const flag = flagOf(d.country === '中国' ? 'CN' : d.country);
      return {
        ip: d.addr || '',
        loc: joinNonEmpty([flag, d.country, d.province, d.city], ' ').replace(/\s*中国\s*/, ''),
        isp: d.isp || ''
      };
    }
  },
  '126': {
    url: 'https://ipservice.ws.126.net/locate/api/getLocByIp',
    parse: (r) => {
      const d = safeJSON(r.body, {})?.result || {};
      return {
        ip: d.ip || '',
        loc: joinNonEmpty([flagOf(d.countrySymbol), d.country, d.province, d.city], ' ').replace(/\s*中国\s*/, ''),
        isp: d.operator || ''
      };
    }
  },
  pingan: {
    url: 'https://rmb.pingan.com.cn/itam/mas/linden/ip/request',
    parse: (r) => {
      const d = safeJSON(r.body, {})?.data || {};
      return {
        ip: d.ip || '',
        loc: joinNonEmpty([flagOf(d.countryIsoCode), d.country, d.region, d.city], ' ').replace(/\s*中国\s*/, ''),
        isp: d.isp || d.ispName || d.operator || d.org || d.as || ''
      };
    }
  }
});

const LANDING_V4_SOURCES = Object.freeze({
  ipapi: {
    url: 'http://ip-api.com/json?lang=zh-CN',
    parse: (r) => {
      const j = safeJSON(r.body, {});
      return {
        ip: j.query || '',
        loc: joinNonEmpty([flagOf(j.countryCode), j.country?.replace(/\s*中国\s*/, ''), j.regionName?.split(/\s+or\s+/)[0], j.city], ' '),
        isp: j.isp || j.org || ''
      };
    }
  },
  ipwhois: {
    url: 'https://ipwhois.app/widget.php?lang=zh-CN',
    parse: (r) => {
      const j = safeJSON(r.body, {});
      return {
        ip: j.ip || '',
        loc: joinNonEmpty([flagOf(j.country_code), j.country?.replace(/\s*中国\s*/, ''), j.region, j.city], ' '),
        isp: (j?.connection?.isp) || ''
      };
    }
  },
  ipsb: {
    url: 'https://api-ipv4.ip.sb/geoip',
    parse: (r) => {
      const j = safeJSON(r.body, {});
      return {
        ip: j.ip || '',
        loc: joinNonEmpty([flagOf(j.country_code), j.country, j.region, j.city], ' ').replace(/\s*中国\s*/, ''),
        isp: j.isp || j.organization || ''
      };
    }
  }
});

const IPV6_IP_ENDPOINTS = Object.freeze({
  ddnspod: 'https://ipv6.ddnspod.com',
  neu6: 'https://speed.neu6.edu.cn/getIP.php',
  ipsb: 'https://api-ipv6.ip.sb/ip',
  ident: 'https://v6.ident.me',
  ipify: 'https://api6.ipify.org'
});

const ORDER = Object.freeze({
  directV4: ['cip', '163', '126', 'bilibili', 'pingan', 'ipip'],
  landingV4: ['ipapi', 'ipwhois', 'ipsb'],
  directV6: ['ddnspod', 'neu6'],
  landingV6: ['ipsb', 'ident', 'ipify']
});

function makeTryOrder(prefer, fallbackList) {
  return [prefer, ...fallbackList].filter((x, i, a) => x && a.indexOf(x) === i);
}

// ====================== 启动日志 ======================
log('info', 'Start', JSON.stringify({
  Update: CFG.Update,
  Timeout: CFG.Timeout,
  Budget_ms: BUDGET_MS,
  Budget_left_ms: budgetLeft(),
  IPv6_local: IPV6_EFF,
  WANT_V6,
  HAS_V6,
  SD_TIMEOUT_MS,
  SD_STYLE,
  SD_REGION_MODE,
  TW_FLAG_MODE,
  SUBTITLE_STYLE: CFG.SUBTITLE_STYLE,
  SUBTITLE_MINIMAL: CFG.SUBTITLE_MINIMAL,
  GAP_LINES: CFG.GAP_LINES,
  SD_CONCURRENCY: Math.max(1, Math.min(8, CFG.SD_CONCURRENCY || 6))
}));

log('debug', 'BoxSettings(BOX)', BOX);

// ====================== 主流程（IIFE） ======================
;(async () => {
  const preTouchV4 = touchLandingOnceQuick({v6: false}).catch(() => {});

  const t0 = Date.now();
  const cn = await getDirectV4(DOMESTIC_IPv4).catch((e) => {
    log('warn', 'DirectV4', String(e));
    return {};
  });
  log('info', 'DirectV4 fetched', (Date.now() - t0) + 'ms', {v4: _maskMaybe(cn.ip || '')});

  await preTouchV4;

  // 服务检测尽量提前启动（但最终渲染仍在后面）
  const sdPromise = runServiceChecks().catch(() => []);

  const t1 = Date.now();
  let {policyName, entrance4, entrance6} = await getPolicyAndEntranceBoth();
  log('info', 'EntranceBoth#1', {
    policy: policyName || '-',
    v4: _maskMaybe(entrance4 || ''),
    v6: _maskMaybe(entrance6 || ''),
    cost: (Date.now() - t1) + 'ms'
  });

  if (!entrance4) {
    await httpGet('https://api-ipv4.ip.sb/ip', {}, CONSTS.PRETOUCH_TO_MS, true).catch(() => {});
    await sleep(80);

    const t1a = Date.now();
    const r1a = await getPolicyAndEntranceBoth();
    policyName = policyName || r1a.policyName;
    entrance4 = entrance4 || r1a.entrance4;
    entrance6 = entrance6 || r1a.entrance6;

    log('info', 'EntranceBoth#1b(v4补齐)', {
      policy: policyName || '-',
      v4: _maskMaybe(entrance4 || ''),
      v6: _maskMaybe(entrance6 || ''),
      cost: (Date.now() - t1a) + 'ms'
    });
  }

  const probe = await probeLandingV6(LANDING_IPv6);
  const V6_READY = probe.ok;

  if (V6_READY) {
    await touchLandingOnceQuick({v6: true}).catch(() => {});
    if (!entrance6) {
      const t1b = Date.now();
      const r2 = await getPolicyAndEntranceBoth();
      entrance6 = r2.entrance6 || '';
      log('info', 'EntranceBoth#2(v6补齐)', {
        policy: policyName || '-',
        v4: _maskMaybe(entrance4 || ''),
        v6: _maskMaybe(entrance6 || ''),
        cost: (Date.now() - t1b) + 'ms'
      });
    }
  } else {
    entrance6 = '';
  }

  const cn6 = IPV6_EFF ? await getDirectV6(DOMESTIC_IPv6).catch((e) => {
    log('warn', 'DirectV6', String(e));
    return {};
  }) : {};

  const ent4 = isIPv4(entrance4 || '')
    ? await getEntranceBundle(entrance4).catch((e) => {
      log('warn', 'EntranceBundle v4', String(e));
      return {ip: entrance4};
    })
    : {};
  const ent6 = (V6_READY && isIPv6(entrance6 || ''))
    ? await getEntranceBundle(entrance6).catch((e) => {
      log('warn', 'EntranceBundle v6', String(e));
      return {ip: entrance6};
    })
    : {};

  const t2 = Date.now();
  const px = await getLandingV4(LANDING_IPv4).catch((e) => {
    log('warn', 'LandingV4', String(e));
    return {};
  });
  const px6 = V6_READY ? {ip: probe.ip} : {};
  log('info', 'Landing fetched', (Date.now() - t2) + 'ms', {
    v4: _maskMaybe(px.ip || ''),
    v6: _maskMaybe(px6.ip || ''),
    v6_ready: V6_READY
  });

  const title = netTypeLine() || t('unknownNet');

  const parts = [];
  parts.push(`${t('runAt')}: ${now()}`);
  parts.push(`${t('policy')}: ${policyName || '-'}`);

  pushGroupTitle(parts, '本地');
  const directIPv4 = ipLine('IPv4', cn.ip);
  const directIPv6 = ipLine('IPv6', cn6.ip);
  if (directIPv4) parts.push(directIPv4);
  if (directIPv6) parts.push(directIPv6);
  const directLoc = cn.loc ? (MASK_POS ? onlyFlag(cn.loc) : flagFirst(cn.loc)) : '-';
  parts.push(`${t('location')}: ${directLoc}`);
  if (cn.isp) parts.push(`${t('isp')}: ${fmtISP(cn.isp, cn.loc)}`);

  if ((ent4 && (ent4.ip || ent4.loc1 || ent4.loc2 || ent4.isp1 || ent4.isp2)) ||
    (ent6 && (ent6.ip || ent6.loc1 || ent6.loc2 || ent6.isp1 || ent6.isp2))) {

    pushGroupTitle(parts, '入口');

    const entIPv4 = ipLine('IPv4', ent4.ip && isIPv4(ent4.ip) ? ent4.ip : '');
    const entIPv6 = ipLine('IPv6', ent6.ip && isIPv6(ent6.ip) ? ent6.ip : '');
    if (entIPv4) parts.push(entIPv4);
    if (entIPv6) parts.push(entIPv6);

    const entShow = (ent4 && (ent4.loc1 || ent4.loc2 || ent4.isp1 || ent4.isp2)) ? ent4 : ent6;

    if (entShow?.loc1) parts.push(`${t('location')}¹: ${flagFirst(entShow.loc1)}`);
    if (entShow?.isp1) parts.push(`${t('isp')}¹: ${fmtISP(entShow.isp1, entShow.loc1)}`);
    if (entShow?.loc2) parts.push(`${t('location')}²: ${flagFirst(entShow.loc2)}`);
    if (entShow?.isp2) parts.push(`${t('isp')}²: ${String(entShow.isp2).trim()}`);
  }

  if (px.ip || px6.ip || px.loc || px.isp) {
    pushGroupTitle(parts, '落地');
    const landIPv4 = ipLine('IPv4', px.ip);
    const landIPv6 = ipLine('IPv6', px6.ip);
    if (landIPv4) parts.push(landIPv4);
    if (landIPv6) parts.push(landIPv6);
    if (px.loc) parts.push(`${t('location')}: ${flagFirst(px.loc)}`);
    if (px.isp) parts.push(`${t('isp')}: ${fmtISP(px.isp, px.loc)}`);
  }

  const sdLines = await sdPromise;
  if (sdLines.length) {
    pushGroupTitle(parts, '服务检测');
    parts.push(...sdLines);
  }

  if (LOG_TO_PANEL && DEBUG_LINES.length) {
    pushGroupTitle(parts, t('debug'));
    const tail = DEBUG_LINES.slice(-CONSTS.DEBUG_TAIL_LINES).join('\n');
    parts.push(tail);
  }

  const content = maybeTify(parts.join('\n'));
  $done({title: maybeTify(title), content, icon: ICON_NAME, 'icon-color': ICON_COLOR});
})().catch((err) => {
  const msg = String(err);
  logErrPush(t('panelTitle'), msg);
  $done({title: t('panelTitle'), content: maybeTify(msg), icon: ICON_NAME, 'icon-color': ICON_COLOR});
});

// ====================== 工具 & 渲染 ======================
const IPV4_RE = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/;
const IPV6_SRC = [
  '(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|',
  '([0-9a-fA-F]{1,4}:){1,7}:|',
  '([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|',
  '([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|',
  '([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|',
  '([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|',
  '([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|',
  '[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|',
  ':((:[0-9a-fA-F]{1,4}){1,7}|:)|',
  '::(ffff(:0{1,4}){0,1}:){0,1}(',
  '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}',
  '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|',
  '([0-9a-fA-F]{1,4}:){1,4}:(',
  '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}',
  '(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))'
].join('');
const IPV6_RE = new RegExp(`^${IPV6_SRC}$`);

function pad2(n) {
  return String(n).padStart(2, "0");
}

function now() {
  const d = new Date();
  const MM = pad2(d.getMonth() + 1);
  const DD = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${MM}-${DD} ${hh}:${mm}:${ss}`;
}

function isIPv4(ip) {
  return IPV4_RE.test(ip || '');
}

function isIPv6(ip) {
  return IPV6_RE.test(ip || '');
}

function maskIP(ip) {
  if (!ip || !MASK_IP) return ip || '';
  if (isIPv4(ip)) {
    const p = ip.split('.');
    return [p[0], p[1], '*', '*'].join('.');
  }
  if (isIPv6(ip)) {
    const p = ip.split(':');
    return [...p.slice(0, 4), '*', '*', '*', '*'].join(':');
  }
  return ip;
}

function ipLine(label, ip) {
  if (!ip) return null;
  const s = String(ip).trim();
  if (!s) return null;
  if (/ipv4/i.test(label) && !isIPv4(s)) return null;
  if (/ipv6/i.test(label) && !isIPv6(s)) return null;
  return `${label}: ${maskIP(s)}`;
}

function splitFlagRaw(s) {
  const re = /^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u;
  const m = String(s || '').match(re);
  let flag = m ? m[0] : '';
  const text = String(s || '').replace(re, '');
  if (flag.includes('🇹🇼')) {
    if (TW_FLAG_MODE === 0) flag = '🇨🇳';
    else if (TW_FLAG_MODE === 2) flag = '🇼🇸';
  }
  return {flag, text};
}

const onlyFlag = (loc) => splitFlagRaw(loc).flag || '-';
const flagFirst = (loc) => {
  const {flag, text} = splitFlagRaw(loc);
  return (flag || '') + (text || '');
};

function flagOf(code) {
  let cc = String(code || '').trim();
  if (!cc) return '';
  if (/^中国$|^CN$/i.test(cc)) cc = 'CN';
  if (cc.length !== 2 || !/^[A-Za-z]{2}$/.test(cc)) return '';
  try {
    if (cc.toUpperCase() === 'TW') {
      if (TW_FLAG_MODE === 0) return '🇨🇳';
      if (TW_FLAG_MODE === 2) return '🇼🇸';
    }
    return String.fromCodePoint(...[...cc.toUpperCase()].map((ch) => 127397 + ch.charCodeAt(0)));
  } catch (_) {
    return '';
  }
}

function fmtISP(isp, locStr) {
  const raw = String(isp || '').trim();
  if (!raw) return '';
  const txt = String(locStr || '');
  const isMainland = /^🇨🇳/.test(txt) || /(^|\s)中国(?!香港|澳门|台湾)/.test(txt);
  if (!isMainland) return raw;

  const norm = raw.replace(/\s*\(中国\)\s*/, '').replace(/\s+/g, ' ').trim();
  const s = norm.toLowerCase();
  if (/(^|[\s-])(cmcc|cmnet|cmi)\b/.test(s) || /china\s*mobile/.test(s) || /移动/.test(norm)) return '中国移动';
  if (/(^|[\s-])(chinanet|china\s*telecom|ctcc|ct)\b/.test(s) || /电信/.test(norm)) return '中国电信';
  if (/(^|[\s-])(china\s*unicom|cncgroup|netcom)\b/.test(s) || /联通/.test(norm)) return '中国联通';
  if (/(^|[\s-])(cbn|china\s*broadcast)/.test(s) || /广电/.test(norm)) return '中国广电';
  if ((/cernet|china\s*education/).test(s) || /教育网/.test(norm)) return '中国教育网';
  if (/^中国(移动|联通|电信|广电)$/.test(norm)) return norm;
  return raw;
}

function radioToGen(r) {
  if (!r) return '';
  const x = String(r).toUpperCase().replace(/\s+/g, '');
  const alias = {'NR5G': 'NR', 'NRSA': 'NR', 'NRNSA': 'NRNSA', 'LTEA': 'LTE', 'LTE+': 'LTE', 'LTEPLUS': 'LTE'};
  const k = alias[x] || x;
  const MAP = {
    GPRS: '2.5G',
    EDGE: '2.75G',
    CDMA1X: '2.5G',
    WCDMA: '3G',
    HSDPA: '3.5G',
    HSUPA: '3.75G',
    CDMAEVD0REV0: '3.5G',
    CDMAEVD0REVA: '3.5G',
    CDMAEVD0REVB: '3.75G',
    EHRPD: '3.9G',
    LTE: '4G',
    NRNSA: '5G',
    NR: '5G'
  };
  return MAP[k] || '';
}

function netTypeLine() {
  try {
    const n = $network || {};
    const ssid = n.wifi?.ssid;
    const bssid = n.wifi?.bssid;

    if (ssid || bssid) return `${t('wifi')} | ${ssid || '-'}`;

    const radio = (n.cellular?.radio) || (n['cellular-data']?.radio);
    if (radio) return `${t('cellular')} | ${t('gen', radioToGen(radio), radio)}`;

    const iface = n.v4?.primaryInterface || n.v6?.primaryInterface || '';
    if (/^pdp/i.test(iface)) return `${t('cellular')} | -`;
    if (/^(en|eth|wlan)/i.test(iface)) return `${t('wifi')} | -`;
  } catch (_) {}

  return t('unknownNet');
}

// ====================== HTTP 基础（预算感知） ======================
function httpCall(method, req, timeoutMs = null, capMs = null, logTag = 'HTTP') {
  return new Promise((resolve, reject) => {
    if (typeof $httpClient === 'undefined' || !$httpClient || (!$httpClient.get && !$httpClient.post)) {
      return reject(new Error('no-$httpClient'));
    }

    const base = (Number(CFG.Timeout) || 8) * 1000;

    let to = (timeoutMs == null) ? base : Number(timeoutMs);
    if (!Number.isFinite(to) || to <= 0) to = base;

    const cap = capMs == null ? 3500 : Number(capMs);
    const capped = capByBudget(Number.isFinite(cap) ? cap : 3500);
    to = Math.min(to, capped);

    if (budgetLeft() <= CONSTS.BUDGET_SOFT_GUARD_MS) {
      log('warn', `${logTag} skip (budget empty)`, req.url);
      return reject(new Error('budget-empty'));
    }

    const start = Date.now();
    let done = false;

    const wd = setTimeout(() => {
      if (done) return;
      done = true;
      const cost = Date.now() - start;
      log('warn', `${logTag} watchdog`, req.url, 'cost', cost + 'ms');
      reject(new Error('watchdog-timeout'));
    }, to + 220);

    const payload = Object.assign({}, req, {timeout: to});
    const fn = (String(method).toUpperCase() === 'POST') ? $httpClient.post : $httpClient.get;

    fn(payload, (err, resp, body) => {
      if (done) return;
      done = true;
      clearTimeout(wd);

      const cost = Date.now() - start;
      if (err || !resp) {
        log('warn', `${logTag} fail`, req.url, 'cost', cost + 'ms', String(err || 'no-resp'));
        return reject(err || new Error('no-resp'));
      }
      const status = resp.status || resp.statusCode || 0;
      log('debug', logTag, req.url, 'status', status, 'cost', cost + 'ms');
      resolve({status, headers: resp.headers || {}, body, cost});
    });
  });
}

function httpGet(url, headers = {}, timeoutMs = null, followRedirect = false) {
  const req = {url, headers};
  if (followRedirect) req.followRedirect = true;
  return httpCall('GET', req, timeoutMs, 3500, 'HTTP GET');
}

function httpPost(url, headers = {}, body = "", timeoutMs = null) {
  const req = {url, headers, body};
  return httpCall('POST', req, timeoutMs, 3500, 'HTTP POST');
}

function httpAPI(path = '/v1/requests/recent') {
  return new Promise((res) => {
    if (typeof $httpAPI === 'function') {
      $httpAPI('GET', path, null, (x) => res(x));
    } else {
      res({});
    }
  });
}

// ====================== 统一抓取器（减少重复） ======================
async function trySources(order, sourceMap, {preferLogTag, needCityPrefer = false, acceptIp = null}) {
  log('info', `${preferLogTag} begin`, JSON.stringify(order));
  let firstOK = null;

  for (const key of order) {
    if (budgetLeft() <= 300) break;

    const def = sourceMap[key];
    if (!def) {
      log('warn', `${preferLogTag} missing def`, key);
      continue;
    }

    const t0 = Date.now();
    try {
      const r = await httpGet(def.url);
      const res = def.parse(r) || {};
      const ip = String(res.ip || '').trim();

      const ok = acceptIp ? acceptIp(ip) : !!ip;
      const cityOK = ok && hasCityLevel(res.loc);
      const cost = Date.now() - t0;

      log('debug', `${preferLogTag} try`, JSON.stringify({
        key, ok, cityOK, ip: _maskMaybe(ip), loc: res.loc || '', isp: res.isp || '', cost_ms: cost
      }));

      if (ok) {
        res.ip = ip;
        if (!firstOK) firstOK = res;
        if (!needCityPrefer) return res;
        if (needCityPrefer && cityOK) {
          log('info', `${preferLogTag} HIT city-level at`, key, 'cost', cost + 'ms');
          return res;
        }
      }
    } catch (e) {
      const cost = Date.now() - t0;
      log('warn', `${preferLogTag} fail`, key, 'cost', cost + 'ms', String(e));
    }
  }

  if (firstOK) {
    log('info', `${preferLogTag} fallback to firstOK (no city-level hit)`, JSON.stringify({
      ip: _maskMaybe(firstOK.ip || ''), loc: firstOK.loc || '', isp: firstOK.isp || ''
    }));
    return firstOK;
  }
  return {};
}

async function tryIPv6Ip(order, opt = {}) {
  const timeoutMs = (opt.timeoutMs != null) ? opt.timeoutMs : V6_TO;
  const maxTries = Math.max(1, Math.min(Number(opt.maxTries || order.length), order.length));

  for (const key of order.slice(0, maxTries)) {
    if (budgetLeft() <= 260) break;

    const url = IPV6_IP_ENDPOINTS[key];
    if (!url) continue;
    try {
      const r = await httpGet(url, {}, timeoutMs);
      const ip = String(r.body || '').trim();
      if (isIPv6(ip)) return {ip};
    } catch (e) {
      log('warn', 'IPv6 endpoint fail', key, String(e));
    }
  }
  return {};
}

// ===== R5：本地 ISP 缺失时的“同 IP”补齐（只在 isp 空时触发）=====
async function fillDirectIspSameIp(targetIp, skipKey) {
  const ip = String(targetIp || '').trim();
  if (!ip) return '';
  const order = (ORDER.directV4 || []).filter((k) => k && k !== skipKey);
  for (const key of order) {
    if (budgetLeft() <= 320) break;
    const def = DIRECT_V4_SOURCES[key];
    if (!def) continue;
    try {
      const r = await httpGet(def.url);
      const x = def.parse(r) || {};
      const ip2 = String(x.ip || '').trim();
      const isp2 = String(x.isp || '').trim();
      if (ip2 && ip2 === ip && isp2) return isp2;
    } catch (_) {}
  }
  return '';
}

async function getDirectV4(preferKey) {
  const order = makeTryOrder(preferKey, ORDER.directV4);
  const res = await trySources(order, DIRECT_V4_SOURCES, {
    preferLogTag: 'DirectV4',
    needCityPrefer: true,
    acceptIp: isIPv4
  });

  if (!res || !res.ip) {
    try {
      log('warn', 'DirectV4 all failed, final ipip fallback');
      const r = await httpGet(DIRECT_V4_SOURCES.ipip.url);
      return DIRECT_V4_SOURCES.ipip.parse(r) || {};
    } catch (e2) {
      log('error', 'DirectV4 ipip final fail', String(e2));
      return {};
    }
  }

  // R5：本地 isp 为空，就按“同 IP”从其他直连源补齐
  if (!String(res.isp || '').trim()) {
    const filled = await fillDirectIspSameIp(res.ip, preferKey).catch(() => '');
    if (filled) res.isp = filled;
  }

  return res;
}

async function getDirectV6(preferKey) {
  const order = makeTryOrder(preferKey, ORDER.directV6);
  const res = await tryIPv6Ip(order, {timeoutMs: V6_TO, maxTries: order.length});
  if (!res || !res.ip) log('warn', 'DirectV6 fail (all)');
  return res || {};
}

async function getLandingV4(preferKey) {
  const order = makeTryOrder(preferKey, ORDER.landingV4);
  const res = await trySources(order, LANDING_V4_SOURCES, {
    preferLogTag: 'LandingV4',
    needCityPrefer: false,
    acceptIp: isIPv4
  });
  if (!res || !res.ip) log('error', 'LandingV4 all sources failed');
  return res || {};
}

async function probeLandingV6(preferKey) {
  const order = makeTryOrder(preferKey, ORDER.landingV6);
  const r = await tryIPv6Ip(order, {
    timeoutMs: Math.min(CONSTS.V6_PROBE_TO_MS, 900),
    maxTries: 2
  });
  return {ok: !!r.ip, ip: r.ip || ''};
}

// ====================== 入口/策略（稳态获取） ======================
const ENT_SOURCES_RE = /(ip-api\.com|ipwhois\.app|ip\.sb|ipinfo\.io|ident\.me|ipify\.org|ifconfig\.co)/i;

function extractIP(str) {
  const s = String(str || '').replace(/\(Proxy\)/i, '').trim();
  let m = s.match(/\[([0-9a-fA-F:]+)]/);
  if (m && isIPv6(m[1])) return m[1];
  m = s.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  if (m && isIPv4(m[1])) return m[1];
  m = s.match(/([0-9a-fA-F:]{2,})/);
  if (m && isIPv6(m[1])) return m[1];
  return '';
}

async function touchLandingOnceQuick(opt = {}) {
  const doV6 = !!opt.v6;

  await Promise.allSettled([
    httpGet('http://ip-api.com/json?lang=zh-CN', {}, CONSTS.PRETOUCH_TO_MS, true),
    httpGet('https://api-ipv4.ip.sb/ip', {}, CONSTS.PRETOUCH_TO_MS, true)
  ]);

  if (doV6) {
    await Promise.allSettled([
      httpGet('https://api-ipv6.ip.sb/ip', {}, Math.min(CONSTS.PRETOUCH_TO_MS, V6_TO), true)
    ]);
  }

  log('debug', 'Pre-touch landing endpoints done', {v6: doV6});
}

async function getPolicyAndEntranceBoth() {
  const data = await httpAPI('/v1/requests/recent');
  const reqs = Array.isArray(data?.requests) ? data.requests : [];
  const hits = reqs.slice(0, CONSTS.MAX_RECENT_REQ).filter((i) => ENT_SOURCES_RE.test(i.URL || ''));

  let policy = '';
  let ip4 = '', ip6 = '';
  for (const i of hits) {
    if (!policy && i.policyName) policy = i.policyName;
    const ip = extractIP(i.remoteAddress || '');
    if (!ip) continue;
    if (isIPv6(ip)) {
      if (!ip6) ip6 = ip;
    } else if (isIPv4(ip)) {
      if (!ip4) ip4 = ip;
    }
    if (policy && ip4 && ip6) break;
  }

  if (!policy && !ip4 && !ip6) {
    const d = await httpAPI('/v1/requests/recent');
    const rs = Array.isArray(d?.requests) ? d.requests : [];
    const hit = rs.find((i) => /\(Proxy\)/.test(i.remoteAddress || '') && i.policyName);
    if (hit) {
      policy = hit.policyName;
      const eip = extractIP(hit.remoteAddress);
      if (eip) (isIPv6(eip) ? (ip6 = eip) : (ip4 = eip));
    }
  }
  return {policyName: policy, entrance4: ip4, entrance6: ip6};
}

// —— 入口位置缓存（跟 Update 联动） ——
const ENT_REQ_TO = Math.min(2200, Math.max(1200, SD_TIMEOUT_MS || 0));
const ENT_TTL_SEC = Math.max(CONSTS.ENT_MIN_TTL, Math.min(Number(CFG.Update) || 10, CONSTS.ENT_MAX_TTL));
let ENT_CACHE = {ip: "", t: 0, data: null};

const ENT_LOC_CHAIN = Object.freeze({
  pingan: async (ip) => {
    const r = await httpGet('https://rmb.pingan.com.cn/itam/mas/linden/ip/request?ip=' + encodeURIComponent(ip), {}, ENT_REQ_TO);
    const d = safeJSON(r.body, {})?.data || {};
    if (!d || (!d.countryIsoCode && !d.country)) throw 'pingan-empty';
    return {
      loc: joinNonEmpty([flagOf(d.countryIsoCode), d.country, d.region, d.city], ' ').replace(/\s*中国\s*/, ''),
      isp: (d.isp || d.ispName || d.operator || d.org || d.as || '').toString().trim()
    };
  },
  ipapi: async (ip) => {
    const r = await httpGet(`http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN`, {}, ENT_REQ_TO);
    const j = safeJSON(r.body, {});
    if (j.status && j.status !== 'success') throw 'ipapi-fail';
    return {
      loc: joinNonEmpty([flagOf(j.countryCode), j.country?.replace(/\s*中国\s*/, ''), j.regionName?.split(/\s+or\s+/)[0], j.city], ' '),
      isp: (j.isp || j.org || j.as || '').toString().trim()
    };
  },
  ipwhois: async (ip) => {
    const r = await httpGet(`https://ipwhois.app/json/${encodeURIComponent(ip)}?lang=zh-CN`, {}, ENT_REQ_TO);
    const j = safeJSON(r.body, {});
    if (j.success === false || (!j.country && !j.country_code)) throw 'ipwhois-fail';
    return {
      loc: joinNonEmpty([flagOf(j.country_code), j.country?.replace(/\s*中国\s*/, ''), j.region, j.city], ' '),
      isp: ((j.connection && j.connection.isp) || j.org || '').toString().trim()
    };
  },
  ipsb: async (ip) => {
    const r = await httpGet(`https://api.ip.sb/geoip/${encodeURIComponent(ip)}`, {}, ENT_REQ_TO);
    const j = safeJSON(r.body, {});
    if (!j || (!j.country && !j.country_code)) throw 'ipsb-fail';
    return {
      loc: joinNonEmpty([flagOf(j.country_code), j.country, j.region, j.city], ' ').replace(/\s*中国\s*/, ''),
      isp: (j.isp || j.organization || '').toString().trim()
    };
  }
});

function _sameLoc(a, b) {
  const A = String(a || '').trim();
  const B = String(b || '').trim();
  if (!A || !B) return false;
  // 去掉旗子再比
  const strip = (s) => String(s).replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, '').trim();
  return strip(A) === strip(B);
}

async function getEntranceBundle(ip) {
  const nowT = Date.now();
  const fresh = (nowT - ENT_CACHE.t) < ENT_TTL_SEC * 1000;

  if (ENT_CACHE.ip === ip && fresh && ENT_CACHE.data) {
    return ENT_CACHE.data;
  }

  const [p, a, w, s] = await Promise.allSettled([
    ENT_LOC_CHAIN.pingan(ip),
    ENT_LOC_CHAIN.ipapi(ip),
    ENT_LOC_CHAIN.ipwhois(ip),
    ENT_LOC_CHAIN.ipsb(ip)
  ]);

  const pick = (arr) => {
    for (const x of arr) if (x.status === 'fulfilled') return x.value || {};
    return {};
  };

  const p1 = (p.status === 'fulfilled') ? (p.value || {}) : {};
  const c2 = pick([a, w, s]);

  // ===== R4：入口 ISP¹ 兜底补齐 + loc 去重 =====
  let loc1 = String(p1.loc || '').trim();
  let isp1 = String(p1.isp || '').trim();

  let loc2 = String(c2.loc || '').trim();
  let isp2 = String(c2.isp || '').trim();

  // 若 pingan 失败，直接把第二梯队提升为 ¹
  if (!loc1 && loc2) {
    loc1 = loc2;
    isp1 = isp2;
    loc2 = '';
    isp2 = '';
  }

  // 若 pingan 有 loc 但没 isp，用第二梯队补齐 isp¹
  if (loc1 && !isp1 && isp2) {
    isp1 = isp2;
  }

  // loc¹/loc² 重复则清空 loc²（避免 UI 重复）
  if (_sameLoc(loc1, loc2)) {
    loc2 = '';
  }

  const res = {
    ip,
    loc1,
    isp1,
    loc2,
    isp2
  };

  ENT_CACHE = {ip, t: nowT, data: res};
  return res;
}

// ====================== 服务清单解析 & 检测 ======================
const SD_I18N = ({
  "zh-Hans": {
    youTube: "YouTube", chatgpt_app: "ChatGPT", chatgpt: "ChatGPT Web",
    netflix: "Netflix", disney: "Disney+", huluUS: "Hulu(美)",
    huluJP: "Hulu(日)", hbo: "Max(HBO)"
  },
  "zh-Hant": {
    youTube: "YouTube", chatgpt_app: "ChatGPT", chatgpt: "ChatGPT Web",
    netflix: "Netflix", disney: "Disney+", huluUS: "Hulu(美)",
    huluJP: "Hulu(日)", hbo: "Max(HBO)"
  }
})[SD_LANG];

const SD_TESTS_MAP = {
  youtube: () => sd_testYouTube(),
  netflix: () => sd_testNetflix(),
  disney: () => sd_testDisney(),
  chatgpt_web: () => sd_testChatGPTWeb(),
  chatgpt_app: () => sd_testChatGPTAppAPI(),
  hulu_us: () => sd_testHuluUS(),
  hulu_jp: () => sd_testHuluJP(),
  hbo: () => sd_testHBO()
};
const SD_DEFAULT_ORDER = Object.keys(SD_TESTS_MAP);

const SD_ALIAS = {
  yt: 'youtube', 'youtube': 'youtube', 'youtube premium': 'youtube', '油管': 'youtube',
  nf: 'netflix', 'netflix': 'netflix', '奈飞': 'netflix', '奈飛': 'netflix',
  'disney': 'disney', 'disney+': 'disney', '迪士尼': 'disney',
  'chatgpt': 'chatgpt_app', gpt: 'chatgpt_app', openai: 'chatgpt_app',
  'chatgpt_web': 'chatgpt_web', 'chatgpt-web': 'chatgpt_web', 'chatgpt web': 'chatgpt_web',
  hulu: 'hulu_us', '葫芦': 'hulu_us', '葫蘆': 'hulu_us', huluus: 'hulu_us', hulujp: 'hulu_jp',
  hbo: 'hbo', max: 'hbo'
};

function parseServices(raw) {
  if (raw == null) return [];
  let s = String(raw).trim();
  if (!s || s === '[]' || s === '{}' || /^null$/i.test(s) || /^undefined$/i.test(s)) return [];
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return normSvcList(arr);
  } catch {}
  const parts = s.split(/[,\uFF0C;|\/ \t\r\n]+/);
  return normSvcList(parts);
}

function normSvcList(list) {
  const out = [];
  for (let x of list) {
    let k = String(x ?? '').trim().toLowerCase();
    if (!k) continue;
    k = SD_ALIAS[k] || k;
    if (!SD_TESTS_MAP[k]) continue;
    if (!out.includes(k)) out.push(k);
  }
  return out;
}

function selectServices() {
  const argList = parseServices(CFG.SERVICES_ARG_TEXT);
  if (argList.length > 0) return argList;

  const boxCheckedList = parseServices(CFG.SERVICES_BOX_CHECKED_RAW);
  if (boxCheckedList.length > 0) return boxCheckedList;

  const boxTextList = parseServices(CFG.SERVICES_BOX_TEXT);
  if (boxTextList.length > 0) return boxTextList;

  return SD_DEFAULT_ORDER.slice();
}

// ====================== 服务检测 HTTP 工具（预算感知） ======================
const SD_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const SD_BASE_HEADERS = {"User-Agent": SD_UA, "Accept-Language": "en"};

function sd_httpGet(url, headers = {}, followRedirect = true) {
  const start = Date.now();
  return httpGet(url, {...SD_BASE_HEADERS, ...headers}, SD_TIMEOUT_MS, followRedirect)
    .then((r) => ({ok: true, status: r.status, cost: Date.now() - start, headers: r.headers || {}, data: r.body || ""}))
    .catch((e) => ({ok: false, status: 0, cost: Date.now() - start, headers: {}, data: "", err: String(e || '')}));
}

function sd_httpPost(url, headers = {}, body = "") {
  const start = Date.now();
  return httpPost(url, {...SD_BASE_HEADERS, ...headers}, body, SD_TIMEOUT_MS)
    .then((r) => ({ok: true, status: r.status, cost: Date.now() - start, headers: r.headers || {}, data: r.body || ""}))
    .catch((e) => ({ok: false, status: 0, cost: Date.now() - start, headers: {}, data: "", err: String(e || '')}));
}

// ====================== 台湾旗模式（服务检测渲染） ======================
function sd_flagFromCC(cc) {
  cc = (cc || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '';
  if (cc === 'TW') {
    if (TW_FLAG_MODE === 0) return '🇨🇳';
    if (TW_FLAG_MODE === 2) return '🇼🇸';
  }
  try {
    const cps = [...cc].map((c) => 0x1F1E6 + (c.charCodeAt(0) - 65));
    return String.fromCodePoint(...cps);
  } catch {
    return '';
  }
}

const SD_CC_NAME = ({
  "zh-Hans": {
    CN: "中国", TW: "台湾", HK: "中国香港", MO: "中国澳门", JP: "日本", KR: "韩国", US: "美国",
    SG: "新加坡", MY: "马来西亚", TH: "泰国", VN: "越南", PH: "菲律宾", ID: "印度尼西亚",
    IN: "印度", AU: "澳大利亚", NZ: "新西兰", CA: "加拿大", GB: "英国", DE: "德国", FR: "法国",
    NL: "荷兰", ES: "西班牙", IT: "意大利", BR: "巴西", AR: "阿根廷", MX: "墨西哥", RU: "俄罗斯"
  },
  "zh-Hant": {
    CN: "中國", TW: "台灣", HK: "中國香港", MO: "中國澳門", JP: "日本", KR: "南韓", US: "美國",
    SG: "新加坡", MY: "馬來西亞", TH: "泰國", VN: "越南", PH: "菲律賓", ID: "印尼",
    IN: "印度", AU: "澳洲", NZ: "紐西蘭", CA: "加拿大", GB: "英國", DE: "德國", FR: "法國",
    NL: "荷蘭", ES: "西班牙", IT: "義大利", BR: "巴西", AR: "阿根廷", MX: "墨西哥", RU: "俄羅斯"
  }
})[SD_LANG];

function sd_ccPretty(cc) {
  cc = (cc || '').toUpperCase();
  const flag = sd_flagFromCC(cc);
  const name = SD_CC_NAME[cc];
  if (!cc) return '—';
  if (SD_REGION_MODE === 'flag') return flag || '—';
  if (SD_REGION_MODE === 'abbr') return (flag || '') + cc;
  if (flag && name) return `${flag} ${cc} | ${name}`;
  if (flag) return `${flag} ${cc}`;
  return cc;
}

const isPartial = (tag) => /自制|自製|original/i.test(String(tag || '')) || /部分/i.test(String(tag || ''));

function sd_renderLine({name, ok, cc, cost, status, tag, state}) {
  const st = state ? state : (ok ? (isPartial(tag) ? 'partial' : 'full') : 'blocked');
  const icon = SD_ICONS[st];
  const regionChunk = cc ? sd_ccPretty(cc) : '';
  const regionText = regionChunk || '-';

  const unlockedShort = t('unlocked');
  const blockedText = t('notReachable');

  const isNetflix = /netflix/i.test(String(name));
  const stateTextLong = (st === 'full') ? t('nfFull') : (st === 'partial') ? t('nfOriginals') : blockedText;
  const stateTextShort = (st === 'blocked') ? blockedText : unlockedShort;
  const showTag = (isNetflix && SD_STYLE === 'text' && !SD_ARROW) ? '' : (tag || '');

  if (SD_STYLE === 'text' && !SD_ARROW) {
    const left = `${name}: ${isNetflix ? stateTextLong : stateTextShort}`;
    const head = `${left}，${t('region')}: ${regionText}`;
    const tail = [showTag, (SD_SHOW_LAT && cost != null) ? `${cost}ms` : '', (SD_SHOW_HTTP && status > 0) ? `HTTP ${status}` : '']
      .filter(Boolean).join(' ｜ ');
    return tail ? `${head} ｜ ${tail}` : head;
  }
  if (SD_STYLE === 'text') {
    const left = `${name}: ${st === 'full' ? t('unlocked') : st === 'partial' ? t('partialUnlocked') : t('notReachable')}`;
    const head = SD_ARROW ? `${left} ➟ ${regionText}` : `${left} ｜ ${regionText}`;
    const tail = [showTag, (SD_SHOW_LAT && cost != null) ? `${cost}ms` : '', (SD_SHOW_HTTP && status > 0) ? `HTTP ${status}` : '']
      .filter(Boolean).join(' ｜ ');
    return tail ? `${head} ｜ ${tail}` : head;
  }

  const head = SD_ARROW ? `${icon} ${name} ➟ ${regionText}` : `${icon} ${name} ｜ ${regionText}`;
  const tail = [showTag, (SD_SHOW_LAT && cost != null) ? `${cost}ms` : '', (SD_SHOW_HTTP && status > 0) ? `HTTP ${status}` : '']
    .filter(Boolean).join(' ｜ ');
  return tail ? `${head} ｜ ${tail}` : head;
}

function sd_nameOfKey(key) {
  switch (key) {
    case 'youtube': return SD_I18N.youTube;
    case 'netflix': return SD_I18N.netflix;
    case 'disney': return SD_I18N.disney;
    case 'hulu_us': return SD_I18N.huluUS;
    case 'hulu_jp': return SD_I18N.huluJP;
    case 'hbo': return SD_I18N.hbo;
    case 'chatgpt_web': return SD_I18N.chatgpt;
    case 'chatgpt_app': return SD_I18N.chatgpt_app;
    default: return key;
  }
}

// ====================== 各服务检测 ======================
const SD_NF_ORIGINAL = '80018499';
const SD_NF_NONORIG = '81280792';
const sd_nfGet = (id) => sd_httpGet(`https://www.netflix.com/title/${id}`, {}, true);

async function sd_testYouTube() {
  const r = await sd_httpGet('https://www.youtube.com/premium?hl=en', {}, true);
  if (!r.ok) return sd_renderLine({name: SD_I18N.youTube, ok: false, cc: '', cost: r.cost, status: r.status, tag: t('notReachable')});
  let cc = 'US';
  try {
    let m = r.data.match(/"countryCode":"([A-Z]{2})"/);
    if (!m) m = r.data.match(/["']GL["']\s*:\s*["']([A-Z]{2})["']/);
    if (m) cc = m[1];
  } catch (_) {}
  return sd_renderLine({name: SD_I18N.youTube, ok: true, cc, cost: r.cost, status: r.status, tag: ''});
}

async function sd_testChatGPTWeb() {
  const r = await sd_httpGet('https://chatgpt.com/cdn-cgi/trace', {}, true);
  if (!r.ok) return sd_renderLine({name: SD_I18N.chatgpt, ok: false, cc: '', cost: r.cost, status: r.status, tag: t('notReachable')});
  let cc = '';
  try {
    const m = r.data.match(/loc=([A-Z]{2})/);
    if (m) cc = m[1];
  } catch (_) {}
  return sd_renderLine({name: SD_I18N.chatgpt, ok: true, cc, cost: r.cost, status: r.status, tag: ''});
}

async function sd_testChatGPTAppAPI() {
  const r = await sd_httpGet('https://api.openai.com/v1/models', {}, true);
  if (!r.ok) return sd_renderLine({name: SD_I18N.chatgpt_app, ok: false, cc: '', cost: r.cost, status: r.status, tag: t('notReachable')});
  let cc = '';
  try {
    const h = r.headers || {};
    cc = (h['cf-ipcountry'] || h['CF-IPCountry'] || h['Cf-IpCountry'] || '').toString().toUpperCase();
    if (!/^[A-Z]{2}$/.test(cc)) cc = '';
  } catch (_) {}
  if (!cc) cc = await sd_queryLandingCCMulti();
  return sd_renderLine({name: SD_I18N.chatgpt_app, ok: true, cc, cost: r.cost, status: r.status, tag: ''});
}

async function sd_testNetflix() {
  const r1 = await sd_nfGet(SD_NF_NONORIG);
  if (!r1.ok) return sd_renderLine({name: SD_I18N.netflix, ok: false, cc: '', cost: r1.cost, status: r1.status, tag: t('fail')});
  if (r1.status === 403) return sd_renderLine({name: SD_I18N.netflix, ok: false, cc: '', cost: r1.cost, status: r1.status, tag: t('regionBlocked')});
  if (r1.status === 404) {
    const r2 = await sd_nfGet(SD_NF_ORIGINAL);
    if (!r2.ok) return sd_renderLine({name: SD_I18N.netflix, ok: false, cc: '', cost: r2.cost, status: r2.status, tag: t('fail')});
    if (r2.status === 404) return sd_renderLine({name: SD_I18N.netflix, ok: false, cc: '', cost: r2.cost, status: r2.status, tag: t('regionBlocked')});
    const cc = sd_parseNFRegion(r2) || '';
    return sd_renderLine({name: SD_I18N.netflix, ok: true, cc, cost: r2.cost, status: r2.status, tag: t('nfOriginals'), state: 'partial'});
  }
  if (r1.status === 200) {
    const cc = sd_parseNFRegion(r1) || '';
    return sd_renderLine({name: SD_I18N.netflix, ok: true, cc, cost: r1.cost, status: r1.status, tag: t('nfFull'), state: 'full'});
  }
  return sd_renderLine({name: SD_I18N.netflix, ok: false, cc: '', cost: r1.cost, status: r1.status, tag: `HTTP ${r1.status}`});
}

function sd_parseNFRegion(resp) {
  try {
    const xo = resp?.headers?.['x-originating-url'] || resp?.headers?.['X-Origining-URL'] || resp?.headers?.['X-Originating-URL'];
    if (xo) {
      const m = String(xo).match(/\/([A-Z]{2})(?:[-/]|$)/i);
      if (m) return m[1].toUpperCase();
    }
    const m2 = String(resp?.data || "").match(/"countryCode"\s*:\s*"([A-Z]{2})"/i);
    if (m2) return m2[1].toUpperCase();
  } catch (_) {}
  return "";
}

async function sd_testDisney() {
  const rHome = await sd_httpGet('https://www.disneyplus.com/', {'Accept-Language': 'en'}, true);
  if (!rHome.ok || rHome.status !== 200 || /Sorry,\s*Disney\+\s*is\s*not\s*available/i.test(rHome.data || '')) {
    const tag = (!rHome.ok) ? t('timeout') : t('regionBlocked');
    return sd_renderLine({name: SD_I18N.disney, ok: false, cc: '', cost: rHome.cost, status: rHome.status, tag});
  }

  let homeCC = '';
  try {
    const m = rHome.data.match(/"countryCode"\s*:\s*"([A-Z]{2})"/i) || rHome.data.match(/data-country=["']([A-Z]{2})["']/i);
    if (m) homeCC = m[1].toUpperCase();
  } catch (_) {}

  const headers = {
    'Accept-Language': 'en',
    'Authorization': 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
    'Content-Type': 'application/json',
    'User-Agent': SD_UA
  };
  const body = JSON.stringify({
    query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
    variables: {
      input: {
        applicationRuntime: 'chrome',
        attributes: {
          browserName: 'chrome',
          browserVersion: '120.0.0.0',
          manufacturer: 'apple',
          model: null,
          operatingSystem: 'macintosh',
          operatingSystemVersion: '10.15.7',
          osDeviceIds: []
        },
        deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx'
      }
    }
  });

  const rBam = await sd_httpPost('https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', headers, body);
  if (!rBam.ok || rBam.status !== 200) {
    const cc = homeCC || (await sd_queryLandingCCMulti()) || '';
    return sd_renderLine({name: SD_I18N.disney, ok: true, cc, cost: rHome.cost, status: rHome.status, tag: ''});
  }

  const d = safeJSON(rBam.data, {});
  if (d?.errors) {
    const cc = homeCC || (await sd_queryLandingCCMulti()) || '';
    return sd_renderLine({name: SD_I18N.disney, ok: true, cc, cost: rHome.cost, status: rHome.status, tag: ''});
  }

  const inLoc = d?.extensions?.sdk?.session?.inSupportedLocation;
  const bamCC = d?.extensions?.sdk?.session?.location?.countryCode;
  const blocked = (inLoc === false);
  const cc = blocked ? '' : ((bamCC || homeCC || (await sd_queryLandingCCMulti()) || '').toUpperCase());
  return sd_renderLine({
    name: SD_I18N.disney,
    ok: !blocked,
    cc,
    cost: Math.min(rHome.cost || 0, rBam.cost || 0) || (rBam.cost || rHome.cost || 0),
    status: rBam.status || rHome.status || 0,
    tag: blocked ? t('regionBlocked') : ''
  });
}

async function sd_testHuluUS() {
  const r = await sd_httpGet('https://www.hulu.com/', {}, true);
  if (!r.ok) return sd_renderLine({name: SD_I18N.huluUS, ok: false, cc: '', cost: r.cost, status: r.status, tag: t('notReachable')});
  const blocked = /not\s+available\s+in\s+your\s+region/i.test(r.data || '');
  return sd_renderLine({name: SD_I18N.huluUS, ok: !blocked, cc: blocked ? '' : 'US', cost: r.cost, status: r.status, tag: blocked ? t('regionBlocked') : ''});
}

async function sd_testHuluJP() {
  const r = await sd_httpGet('https://www.hulu.jp/', {'Accept-Language': 'ja'}, true);
  if (!r.ok) return sd_renderLine({name: SD_I18N.huluJP, ok: false, cc: '', cost: r.cost, status: r.status, tag: t('notReachable')});
  const blocked = /ご利用いただけません|サービスをご利用いただけません|not available/i.test(r.data || '');
  return sd_renderLine({name: SD_I18N.huluJP, ok: !blocked, cc: blocked ? '' : 'JP', cost: r.cost, status: r.status, tag: blocked ? t('regionBlocked') : ''});
}

async function sd_testHBO() {
  const r = await sd_httpGet('https://www.max.com/', {}, true);
  if (!r.ok) return sd_renderLine({name: SD_I18N.hbo, ok: false, cc: '', cost: r.cost, status: r.status, tag: t('notReachable')});
  const blocked = /not\s+available\s+in\s+your\s+region|country\s+not\s+supported/i.test(r.data || '');
  let cc = '';
  try {
    const m = String(r.data || '').match(/"countryCode"\s*:\s*"([A-Z]{2})"/i);
    if (m) cc = m[1].toUpperCase();
  } catch (_) {}
  if (!cc) cc = await sd_queryLandingCCMulti();
  return sd_renderLine({name: SD_I18N.hbo, ok: !blocked, cc: blocked ? '' : cc, cost: r.cost, status: r.status, tag: blocked ? t('regionBlocked') : ''});
}

async function sd_queryLandingCC() {
  const r = await sd_httpGet('http://ip-api.com/json', {}, true);
  if (r.ok && r.status === 200) {
    try {
      const j = safeJSON(r.data, {});
      return (j.countryCode || '').toUpperCase();
    } catch {
      return '';
    }
  }
  return '';
}

async function sd_queryLandingCCMulti() {
  let cc = await sd_queryLandingCC();
  if (cc) return cc;

  let r = await sd_httpGet('https://api.ip.sb/geoip', {}, true);
  if (r.ok && r.status === 200) try {
    const j = safeJSON(r.data, {});
    if (j.country_code) return j.country_code.toUpperCase();
  } catch {}

  r = await sd_httpGet('https://ipinfo.io/json', {}, true);
  if (r.ok && r.status === 200) try {
    const j = safeJSON(r.data, {});
    if (j.country) return j.country.toUpperCase();
  } catch {}

  r = await sd_httpGet('https://ifconfig.co/json', {'Accept-Language': 'en'}, true);
  if (r.ok && r.status === 200) try {
    const j = safeJSON(r.data, {});
    if (j.country_iso) return j.country_iso.toUpperCase();
  } catch {}

  return '';
}

/**
 * 服务检测“整体限时 + 并发队列”
 * - 未完成的服务补 “超时”，避免拖死脚本
 */
async function runServiceChecks() {
  const order = selectServices();
  if (!order.length) return [];

  const conc = Math.max(1, Math.min(8, Number(CFG.SD_CONCURRENCY) || 6));
  const stageCap = Math.max(800, Math.min(5200, capByBudget(5200)));

  const results = new Array(order.length);
  let cursor = 0;
  let inflight = 0;
  let finished = 0;
  let doneFlag = false;

  const finish = () => {
    if (doneFlag) return;
    doneFlag = true;
  };

  const tryLaunch = () => {
    while (!doneFlag && inflight < conc && cursor < order.length) {
      if (budgetLeft() <= 320) break;

      const idx = cursor++;
      const key = order[idx];
      const fn = SD_TESTS_MAP[key];

      if (!fn) {
        results[idx] = sd_renderLine({name: sd_nameOfKey(key), ok: false, cc: '', cost: 0, status: 0, tag: t('fail')});
        finished++;
        continue;
      }

      inflight++;
      Promise.resolve(fn())
        .then((line) => { results[idx] = line; })
        .catch(() => {
          results[idx] = sd_renderLine({name: sd_nameOfKey(key), ok: false, cc: '', cost: null, status: 0, tag: t('fail')});
        })
        .finally(() => {
          inflight--;
          finished++;
          if (finished >= order.length) finish();
          else tryLaunch();
        });
    }
  };

  tryLaunch();

  await withTimeout(
    new Promise((r) => {
      const tick = () => {
        if (doneFlag) return r(true);
        if (finished >= order.length) return r(true);
        if (budgetLeft() <= 260) return r(true);
        setTimeout(tick, 30);
      };
      tick();
    }),
    stageCap,
    false
  );

  finish();

  for (let i = 0; i < results.length; i++) {
    if (!results[i]) {
      results[i] = sd_renderLine({
        name: sd_nameOfKey(order[i]),
        ok: false,
        cc: '',
        cost: null,
        status: 0,
        tag: t('timeout')
      });
    }
  }
  return results.filter(Boolean);
}

// ====================== 简→繁（仅在 zh-Hant） ======================
function zhHansToHantOnce(s) {
  if (!s) return s;
  const phraseMap = [
    ['网络', '網路'], ['蜂窝网络', '行動服務'], ['代理策略', '代理策略'],
    ['执行时间', '執行時間'], ['落地 IP', '落地 IP'], ['入口', '入口'],
    ['位置', '位置'], ['运营商', '運營商'], ['区域', '區域'],
    ['不可达', '不可達'], ['检测失败', '檢測失敗'], ['超时', '逾時'],
    ['区域受限', '區域受限'], ['已解锁', '已解鎖'], ['部分解锁', '部分解鎖'],
    ['已完整解锁', '已完整解鎖'], ['仅解锁自制剧', '僅解鎖自製劇'],
    ['中国香港', '中國香港'], ['中国澳门', '中國澳門'],
    ['中国移动', '中國移動'], ['中国联通', '中國聯通'], ['中国电信', '中國電信'],
    ['中国广电', '中國廣電'], ['中国教育网', '中國教育網']
  ];
  for (const [hans, hant] of phraseMap) s = s.replace(new RegExp(hans, 'g'), hant);
  const charMap = {
    '网': '網',
    '络': '絡',
    '运': '運',
    '营': '營',
    '达': '達',
    '检': '檢',
    '测': '測',
    '时': '時',
    '区': '區',
    '术': '術',
    '产': '產',
    '广': '廣',
    '电': '電',
    '联': '聯',
    '动': '動',
    '数': '數',
    '汉': '漢',
    '气': '氣',
    '历': '曆',
    '宁': '寧'
  };
  return s.replace(/[\u4E00-\u9FFF]/g, (ch) => charMap[ch] || ch);
}

function maybeTify(content) {
  return SD_LANG === 'zh-Hant' ? zhHansToHantOnce(content) : content;
}
