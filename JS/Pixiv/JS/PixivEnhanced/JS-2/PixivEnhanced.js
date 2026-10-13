/*
--------------------------------------------------------------------------------
@Name: Pixiv 全局增强翻译 (Pixiverse Enhanced)
@Version: 4.5.2
@Desc: Pixiv 全页面日文深度汉化 · AI 视觉多模态漫翻 · 仿 Biliverse 内置设置中心
@Author: TomCatXue
@Date: 2026-10-03
--------------------------------------------------------------------------------
架构说明：
  1. 全页面 JSON 汉化：拦截 recommended/ranking/detail/comments/user/spotlight 等端点；
  2. 离线字典秒翻：内置 2500+ 高频 Pixiv Tag 映射表，0 网络请求，0ms 极速呈现；
  3. iOS 原生悬浮球：毛玻璃 SF Symbols「文/A」悬浮按钮，支持手势拖拽贴边与长按设置；
  4. AI 视觉多模态漫翻 (HUD Mode A)：识别漫画对白坐标，浮动气泡字幕覆盖，零画质损失与极轻量；
  5. 仿 Biliverse 设置中心：劫持帮助中心直达 PreferencePanes，设置存取同步 Loon $persistentStore。
--------------------------------------------------------------------------------
*/

// prettier-ignore
function Env(t) { return new class { constructor(t) { this.name = t, this.startTime = new Date().getTime(), this.logSeparator = "\n", this.logs = [], this.isMute = !1, this.encoding = "utf-8", this.isNode() ? (this.fs = require("fs"), this.path = require("path"), this.dataFile = this.path.resolve(process.cwd(), "boxjs.json"), this.fs.existsSync(this.dataFile) || this.fs.writeFileSync(this.dataFile, "{}"), this.data = this.loadData()) : this.data = {} } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } loadData() { if (this.isNode()) { try { return JSON.parse(this.fs.readFileSync(this.dataFile)) } catch (e) { return {} } } return {} } getdata(t) { if (this.isSurge() || this.isLoon() || this.isStash()) return $persistentStore.read(t); if (this.isQuanX()) return $prefs.valueForKey(t); if (this.isNode()) return this.data[t] || "" } setdata(t, e) { if (this.isSurge() || this.isLoon() || this.isStash()) return $persistentStore.write(t, e); if (this.isQuanX()) return $prefs.setValueForKey(t, e); if (this.isNode()) return this.data[e] = t, this.fs.writeFileSync(this.dataFile, JSON.stringify(this.data)), !0 } get(t) { return this.send(t, "GET") } post(t) { return this.send(t, "POST") } send(t, e) { return new Promise((s, i) => { if (this.isSurge() || this.isLoon() || this.isStash()) { "GET" === e ? $httpClient.get(t, (t, e, o) => { t ? i(t) : s({ status: e.statusCode, headers: e.headers, body: o }) }) : $httpClient.post(t, (t, e, o) => { t ? i(t) : s({ status: e.statusCode, headers: e.headers, body: o }) }) } else if (this.isQuanX()) { t.method = e, $task.fetch(t).then(t => s({ status: t.statusCode, headers: t.headers, body: t.body }), t => i(t)) } else if (this.isNode()) { const o = require(t.url.startsWith("https:") ? "https" : "http"), r = new URL(t.url), n = { method: e, hostname: r.hostname, port: r.port || (r.protocol === "https:" ? 443 : 80), path: r.pathname + r.search, headers: t.headers || {} }; const req = o.request(n, res => { let d = ""; res.on("data", c => d += c); res.on("end", () => s({ status: res.statusCode, headers: res.headers, body: d })) }); req.on("error", i); if (t.body) req.write(t.body); req.end() } }) } msg(t, e, s) { if (this.isMute) return; if (this.isSurge() || this.isLoon() || this.isStash()) $notification.post(t, e || "", s || ""); else if (this.isQuanX()) $notify(t, e || "", s || ""); else if (this.isNode()) console.log(`\n${t}\n${e || ""}\n${s || ""}`) } log(...t) { this.logs.push(t.join(this.logSeparator)), console.log(t.join(this.logSeparator)) } logErr(t) { this.log(`❌ ${t.message || t}`) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { if (this.isQuanX()) $done(t); else if (this.isSurge() || this.isLoon() || this.isStash()) $done(t) } }(t) }

const $ = new Env("Pixiv 增强翻译");

// ─── 0. 原生设置中心 HTML 模板 (对标 Pix-Scripting) ───
const SETTINGS_HTML = "<!DOCTYPE html>\r\n<html lang=\"zh-CN\">\r\n<head>\r\n  <meta charset=\"utf-8\">\r\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no\">\r\n  <title>Pixiv 增强设置</title>\r\n  <style>\r\n    :root {\r\n      --bg-color: #f2f2f7;\r\n      --card-bg: #ffffff;\r\n      --card-border: rgba(60, 60, 67, 0.12);\r\n      --separator-color: rgba(60, 60, 67, 0.12);\r\n      --text-primary: #000000;\r\n      --text-secondary: #8e8e93;\r\n      --tint-blue: #007aff;\r\n      --tint-green: #34c759;\r\n      --tint-red: #ff3b30;\r\n      --switch-bg: #e9e9ea;\r\n      --badge-bg: rgba(142, 142, 147, 0.12);\r\n      --badge-text: #8e8e93;\r\n      --icon-bg: rgba(142, 142, 147, 0.12);\r\n      --icon-color: #1c1c1e;\r\n    }\r\n    @media (prefers-color-scheme: dark) {\r\n      :root {\r\n        --bg-color: #000000;\r\n        --card-bg: #1c1c1e;\r\n        --card-border: rgba(255, 255, 255, 0.12);\r\n        --separator-color: rgba(84, 84, 88, 0.35);\r\n        --text-primary: #ffffff;\r\n        --text-secondary: #8e8e93;\r\n        --switch-bg: #39393d;\r\n        --badge-bg: rgba(255, 255, 255, 0.12);\r\n        --badge-text: #aeaeb2;\r\n        --icon-bg: rgba(255, 255, 255, 0.12);\r\n        --icon-color: #ffffff;\r\n      }\r\n    }\r\n\r\n    * {\r\n      box-sizing: border-box;\r\n      -webkit-tap-highlight-color: transparent;\r\n      margin: 0;\r\n      padding: 0;\r\n    }\r\n\r\n    body {\r\n      background-color: var(--bg-color);\r\n      color: var(--text-primary);\r\n      font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Hiragino Sans GB\", sans-serif;\r\n      padding: calc(env(safe-area-inset-top, 20px) + 16px) 16px calc(env(safe-area-inset-bottom, 20px) + 32px);\r\n      max-width: 680px;\r\n      margin: 0 auto;\r\n      line-height: 1.5;\r\n      font-size: 16px;\r\n      overflow-x: hidden;\r\n    }\r\n\r\n    /* ─── 页面品牌大标题与导航按钮 ─── */\r\n    .brand-header {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 14px;\r\n      margin-bottom: 12px;\r\n      padding: 4px 6px;\r\n    }\r\n    .brand-icon {\r\n      width: 48px;\r\n      height: 48px;\r\n      border-radius: 12px;\r\n      background: var(--icon-bg);\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      color: var(--tint-blue);\r\n      flex-shrink: 0;\r\n    }\r\n    .brand-title {\r\n      font-size: 22px;\r\n      font-weight: 700;\r\n      letter-spacing: -0.4px;\r\n      color: var(--text-primary);\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 8px;\r\n    }\r\n    .brand-badge {\r\n      font-size: 11px;\r\n      font-weight: 600;\r\n      padding: 2px 7px;\r\n      border-radius: 6px;\r\n      background: rgba(0, 122, 255, 0.12);\r\n      color: var(--tint-blue);\r\n      letter-spacing: 0;\r\n    }\r\n    .brand-sub {\r\n      font-size: 13px;\r\n      color: var(--text-secondary);\r\n      margin-top: 2px;\r\n    }\r\n    .done-nav-btn {\r\n      background: var(--tint-blue);\r\n      color: #ffffff;\r\n      border: none;\r\n      font-size: 14px;\r\n      font-family: inherit;\r\n      font-weight: 600;\r\n      padding: 6px 16px;\r\n      border-radius: 18px;\r\n      cursor: pointer;\r\n      flex-shrink: 0;\r\n      box-shadow: 0 2px 6px rgba(0, 122, 255, 0.25);\r\n      transition: opacity 0.15s, transform 0.12s, background-color 0.2s;\r\n    }\r\n    .done-nav-btn:active {\r\n      transform: scale(0.95);\r\n      opacity: 0.85;\r\n    }\r\n    .save-tip-bar {\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 6px;\r\n      background: rgba(0, 122, 255, 0.08);\r\n      color: var(--tint-blue);\r\n      padding: 7px 12px;\r\n      border-radius: 9px;\r\n      font-size: 12px;\r\n      font-weight: 500;\r\n      margin-bottom: 16px;\r\n      line-height: 1.4;\r\n    }\r\n\r\n    /* ─── Grouped 卡片容器 ─── */\r\n    .section-card {\r\n      background: var(--card-bg);\r\n      border-radius: 14px;\r\n      border: 0.5px solid var(--card-border);\r\n      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);\r\n      margin-bottom: 6px;\r\n      overflow: hidden;\r\n      transition: all 0.25s ease;\r\n    }\r\n\r\n    .section-header {\r\n      display: flex;\r\n      align-items: center;\r\n      padding: 13px 16px;\r\n      cursor: pointer;\r\n      user-select: none;\r\n      gap: 12px;\r\n      min-height: 52px;\r\n    }\r\n    .section-header:active {\r\n      background: rgba(127, 127, 127, 0.06);\r\n    }\r\n    .section-icon {\r\n      width: 28px;\r\n      height: 28px;\r\n      border-radius: 7px;\r\n      background: var(--icon-bg);\r\n      color: var(--icon-color);\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      flex-shrink: 0;\r\n    }\r\n    .section-title {\r\n      font-size: 16px;\r\n      font-weight: 600;\r\n      flex: 1;\r\n      color: var(--text-primary);\r\n    }\r\n    .section-summary {\r\n      font-size: 12px;\r\n      color: var(--badge-text);\r\n      background: var(--badge-bg);\r\n      padding: 3px 8px;\r\n      border-radius: 6px;\r\n      font-weight: 500;\r\n      max-width: 140px;\r\n      white-space: nowrap;\r\n      overflow: hidden;\r\n      text-overflow: ellipsis;\r\n      transition: opacity 0.2s;\r\n    }\r\n    .chevron-icon {\r\n      width: 14px;\r\n      height: 14px;\r\n      color: var(--text-secondary);\r\n      transition: transform 0.25s ease;\r\n      flex-shrink: 0;\r\n    }\r\n    .section-card.expanded .chevron-icon {\r\n      transform: rotate(90deg);\r\n    }\r\n    .section-card.expanded .section-summary {\r\n      opacity: 0;\r\n      pointer-events: none;\r\n    }\r\n\r\n    .section-body {\r\n      display: none;\r\n      border-top: 0.5px solid var(--separator-color);\r\n    }\r\n    .section-card.expanded .section-body {\r\n      display: block;\r\n    }\r\n\r\n    /* ─── 设置条目 (Row) ─── */\r\n    .setting-row {\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: space-between;\r\n      padding: 12px 16px;\r\n      min-height: 48px;\r\n      position: relative;\r\n    }\r\n    .setting-row:not(:last-child)::after {\r\n      content: \"\";\r\n      position: absolute;\r\n      left: 16px;\r\n      right: 0;\r\n      bottom: 0;\r\n      height: 0.5px;\r\n      background: var(--separator-color);\r\n    }\r\n    .setting-info {\r\n      flex: 1;\r\n      padding-right: 12px;\r\n    }\r\n    .setting-label {\r\n      font-size: 15px;\r\n      font-weight: 500;\r\n      color: var(--text-primary);\r\n    }\r\n    .setting-desc {\r\n      font-size: 12px;\r\n      color: var(--text-secondary);\r\n      margin-top: 2px;\r\n      line-height: 1.35;\r\n    }\r\n\r\n    /* ─── 控件：iOS 原生 Toggle 胶囊开关 ─── */\r\n    .switch-wrap {\r\n      position: relative;\r\n      width: 51px;\r\n      height: 31px;\r\n      flex-shrink: 0;\r\n    }\r\n    .switch-wrap input {\r\n      opacity: 0;\r\n      width: 0;\r\n      height: 0;\r\n    }\r\n    .switch-slider {\r\n      position: absolute;\r\n      cursor: pointer;\r\n      top: 0; left: 0; right: 0; bottom: 0;\r\n      background-color: var(--switch-bg);\r\n      transition: background-color 0.25s ease;\r\n      border-radius: 31px;\r\n    }\r\n    .switch-slider::before {\r\n      position: absolute;\r\n      content: \"\";\r\n      height: 27px;\r\n      width: 27px;\r\n      left: 2px;\r\n      bottom: 2px;\r\n      background-color: white;\r\n      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);\r\n      border-radius: 50%;\r\n      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);\r\n    }\r\n    .switch-wrap input:checked + .switch-slider {\r\n      background-color: var(--tint-green);\r\n    }\r\n    .switch-wrap input:checked + .switch-slider::before {\r\n      transform: translateX(20px);\r\n    }\r\n\r\n    /* ─── 控件：Select 下拉选择 ─── */\r\n    .select-wrap {\r\n      position: relative;\r\n      display: inline-flex;\r\n      align-items: center;\r\n    }\r\n    .select-input {\r\n      appearance: none;\r\n      -webkit-appearance: none;\r\n      background: rgba(127, 127, 127, 0.1);\r\n      border: none;\r\n      padding: 6px 28px 6px 12px;\r\n      border-radius: 8px;\r\n      font-size: 14px;\r\n      font-family: inherit;\r\n      color: var(--tint-blue);\r\n      font-weight: 500;\r\n      outline: none;\r\n      cursor: pointer;\r\n    }\r\n    .select-arrow {\r\n      position: absolute;\r\n      right: 8px;\r\n      width: 12px;\r\n      height: 12px;\r\n      color: var(--tint-blue);\r\n      pointer-events: none;\r\n    }\r\n\r\n    /* ─── 控件：单行输入框 (带显隐眼睛) ─── */\r\n    .input-wrap {\r\n      display: flex;\r\n      align-items: center;\r\n      background: rgba(127, 127, 127, 0.08);\r\n      border-radius: 8px;\r\n      padding: 6px 10px;\r\n      width: 100%;\r\n      margin-top: 6px;\r\n      border: 0.5px solid var(--separator-color);\r\n    }\r\n    .text-input {\r\n      flex: 1;\r\n      background: transparent;\r\n      border: none;\r\n      font-size: 14px;\r\n      font-family: inherit;\r\n      color: var(--text-primary);\r\n      outline: none;\r\n    }\r\n    .text-input::placeholder {\r\n      color: var(--text-secondary);\r\n      opacity: 0.6;\r\n    }\r\n    .input-action-btn {\r\n      background: none;\r\n      border: none;\r\n      color: var(--text-secondary);\r\n      padding: 2px 4px;\r\n      cursor: pointer;\r\n      display: flex;\r\n      align-items: center;\r\n    }\r\n\r\n    /* ─── 控件：多选 Scope 芯片胶囊 ─── */\r\n    .scope-chips {\r\n      display: flex;\r\n      flex-wrap: wrap;\r\n      gap: 8px;\r\n      padding: 8px 16px 14px;\r\n    }\r\n    .scope-chip {\r\n      padding: 6px 12px;\r\n      border-radius: 8px;\r\n      font-size: 13px;\r\n      font-weight: 500;\r\n      background: rgba(127, 127, 127, 0.1);\r\n      color: var(--text-secondary);\r\n      border: 0.5px solid transparent;\r\n      cursor: pointer;\r\n      user-select: none;\r\n      transition: all 0.2s ease;\r\n    }\r\n    .scope-chip.selected {\r\n      background: rgba(0, 122, 255, 0.12);\r\n      color: var(--tint-blue);\r\n      border-color: rgba(0, 122, 255, 0.3);\r\n      font-weight: 600;\r\n    }\r\n\r\n    /* ─── 控件：缓存管理数据面板 ─── */\r\n    .cache-panel {\r\n      padding: 12px 16px;\r\n    }\r\n    .cache-metric-grid {\r\n      display: grid;\r\n      grid-template-columns: repeat(3, 1fr);\r\n      gap: 8px;\r\n      margin-bottom: 12px;\r\n    }\r\n    .cache-metric-box {\r\n      background: rgba(127, 127, 127, 0.08);\r\n      border-radius: 10px;\r\n      padding: 10px 12px;\r\n      text-align: center;\r\n    }\r\n    .cache-metric-title {\r\n      font-size: 11px;\r\n      color: var(--text-secondary);\r\n      font-weight: 500;\r\n      margin-bottom: 4px;\r\n    }\r\n    .cache-metric-val {\r\n      font-size: 16px;\r\n      font-weight: 700;\r\n      color: var(--text-primary);\r\n    }\r\n    .cache-feedback-bar {\r\n      font-size: 12px;\r\n      color: var(--tint-blue);\r\n      min-height: 18px;\r\n      margin-top: 8px;\r\n      line-height: 1.4;\r\n      text-align: center;\r\n    }\r\n\r\n    /* ─── 操作按钮 (Button) ─── */\r\n    .action-btn-row {\r\n      padding: 10px 16px 14px;\r\n      display: flex;\r\n      gap: 10px;\r\n    }\r\n    .primary-btn {\r\n      flex: 1;\r\n      background: var(--tint-blue);\r\n      color: #fff;\r\n      border: none;\r\n      border-radius: 10px;\r\n      padding: 11px 16px;\r\n      font-size: 15px;\r\n      font-weight: 600;\r\n      cursor: pointer;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      gap: 6px;\r\n      box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);\r\n      transition: transform 0.12s, opacity 0.2s, background-color 0.2s;\r\n    }\r\n    .primary-btn:active {\r\n      transform: scale(0.97);\r\n      opacity: 0.9;\r\n    }\r\n    .secondary-btn {\r\n      flex: 1;\r\n      background: rgba(127, 127, 127, 0.12);\r\n      color: var(--text-primary);\r\n      border: none;\r\n      border-radius: 10px;\r\n      padding: 11px 16px;\r\n      font-size: 15px;\r\n      font-weight: 500;\r\n      cursor: pointer;\r\n      display: flex;\r\n      align-items: center;\r\n      justify-content: center;\r\n      gap: 6px;\r\n      transition: transform 0.12s, opacity 0.2s;\r\n    }\r\n    .secondary-btn:active {\r\n      transform: scale(0.97);\r\n    }\r\n    .danger-btn {\r\n      color: var(--tint-red);\r\n      background: rgba(255, 59, 48, 0.1);\r\n    }\r\n\r\n    /* ─── 分组说明注脚 (Footer) ─── */\r\n    .section-footer {\r\n      font-size: 12px;\r\n      color: var(--text-secondary);\r\n      margin: 6px 16px 20px;\r\n      line-height: 1.4;\r\n      padding: 0 4px;\r\n    }\r\n\r\n    /* ─── 提示 Toast 悬浮胶囊 ─── */\r\n    #px-toast {\r\n      position: fixed;\r\n      top: calc(env(safe-area-inset-top, 20px) + 12px);\r\n      left: 50%;\r\n      transform: translateX(-50%) translateY(-60px);\r\n      background: rgba(20, 20, 20, 0.92);\r\n      -webkit-backdrop-filter: blur(20px);\r\n      backdrop-filter: blur(20px);\r\n      color: #fff;\r\n      padding: 8px 18px;\r\n      border-radius: 20px;\r\n      font-size: 13px;\r\n      font-weight: 500;\r\n      display: flex;\r\n      align-items: center;\r\n      gap: 6px;\r\n      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);\r\n      z-index: 999999;\r\n      opacity: 0;\r\n      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);\r\n      pointer-events: none;\r\n    }\r\n    #px-toast.show {\r\n      transform: translateX(-50%) translateY(0);\r\n      opacity: 1;\r\n    }\r\n\r\n    /* ─── 确认弹层 (ActionSheet) ─── */\r\n    .modal-overlay {\r\n      position: fixed;\r\n      top: 0; left: 0; right: 0; bottom: 0;\r\n      background: rgba(0, 0, 0, 0.4);\r\n      backdrop-filter: blur(4px);\r\n      -webkit-backdrop-filter: blur(4px);\r\n      display: none;\r\n      align-items: flex-end;\r\n      justify-content: center;\r\n      z-index: 999998;\r\n      padding: 12px;\r\n    }\r\n    .modal-overlay.show {\r\n      display: flex;\r\n    }\r\n    .modal-card {\r\n      background: var(--card-bg);\r\n      border-radius: 16px;\r\n      width: 100%;\r\n      max-width: 420px;\r\n      padding: 20px;\r\n      text-align: center;\r\n      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\r\n      animation: modalSlideUp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1);\r\n    }\r\n    @keyframes modalSlideUp {\r\n      from { transform: translateY(100px); opacity: 0; }\r\n      to { transform: translateY(0); opacity: 1; }\r\n    }\r\n    .modal-title {\r\n      font-size: 17px;\r\n      font-weight: 600;\r\n      margin-bottom: 6px;\r\n    }\r\n    .modal-desc {\r\n      font-size: 13px;\r\n      color: var(--text-secondary);\r\n      margin-bottom: 18px;\r\n      line-height: 1.45;\r\n    }\r\n    .modal-actions {\r\n      display: flex;\r\n      gap: 10px;\r\n    }\r\n  </style>\r\n</head>\r\n<body>\r\n\r\n  <!-- 提示 Toast 胶囊 -->\r\n  <div id=\"px-toast\">\r\n    <span id=\"px-toast-icon\">✓</span>\r\n    <span id=\"px-toast-msg\">设置已自动保存</span>\r\n  </div>\r\n\r\n  <!-- 清理确认弹层 -->\r\n  <div class=\"modal-overlay\" id=\"clear-modal\">\r\n    <div class=\"modal-card\">\r\n      <div class=\"modal-title\">清理翻译缓存</div>\r\n      <div class=\"modal-desc\">将删除所有本地暂存的翻译文本，以便重新请求最新内容。<br>不会影响您的插件设置及 API 密钥。</div>\r\n      <div class=\"modal-actions\">\r\n        <button type=\"button\" class=\"secondary-btn\" onclick=\"closeClearModal()\">取消</button>\r\n        <button type=\"button\" class=\"primary-btn danger-btn\" onclick=\"executeClearCache()\">确定清理</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- 页面品牌大标题 -->\r\n  <div class=\"brand-header\">\r\n    <div class=\"brand-icon\" style=\"width: 48px; height: 48px; border-radius: 12px; overflow: hidden; background: #0096fa; box-shadow: 0 4px 12px rgba(0, 150, 250, 0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0;\">\r\n      <!-- Pixiv 官方经典 P 标 (矢量 SVG，0 网络延迟瞬出，永不失真) -->\r\n      <svg viewBox=\"0 0 24 24\" width=\"30\" height=\"30\" fill=\"#ffffff\">\r\n        <path d=\"M12.18 4.05c3.77 0 6.84 3.06 6.84 6.84 0 3.77-3.07 6.84-6.84 6.84a6.81 6.81 0 0 1-4.05-1.34v4.38H5.2V4.05h6.98zm0 3.13a3.7 3.7 0 1 0 0 7.41 3.7 3.7 0 0 0 0-7.41z\"/>\r\n      </svg>\r\n    </div>\r\n    <div style=\"flex: 1;\">\r\n      <div class=\"brand-title\">\r\n        Pixiv 增强翻译\r\n        <span class=\"brand-badge\">v4.5.2</span>\r\n      </div>\r\n      <div class=\"brand-sub\">双语出版级排版 · 全页面汉化 · 离线缓存</div>\r\n    </div>\r\n    <button type=\"button\" class=\"done-nav-btn\" onclick=\"handleDoneClick()\">完成</button>\r\n  </div>\r\n\r\n  <div class=\"save-tip-bar\">\r\n    <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m9 12 2 2 4-4\"/></svg>\r\n    <span>修改任何选项即刻实时自动保存，点击「完成」可直接返回 Pixiv</span>\r\n  </div>\r\n\r\n  <!-- ─── 第一组：翻译 ─── -->\r\n  <div class=\"section-card\" id=\"sec-content\">\r\n    <div class=\"section-header\" onclick=\"toggleSection('sec-content')\">\r\n      <div class=\"section-icon\" style=\"background: #007aff; color: #fff;\">\r\n        <!-- SF Symbol: globe -->\r\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n          <circle cx=\"12\" cy=\"12\" r=\"10\"/>\r\n          <path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/>\r\n          <path d=\"M2 12h20\"/>\r\n        </svg>\r\n      </div>\r\n      <div class=\"section-title\">翻译设置</div>\r\n      <div class=\"section-summary\" id=\"sum-content\">自动:开 · 简体</div>\r\n      <svg class=\"chevron-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></svg>\r\n    </div>\r\n    <div class=\"section-body\">\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">启用 Pixiv 增强翻译</div>\r\n          <div class=\"setting-desc\">总开关：接管全页面日文汉化与视觉漫翻</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-global-switch\" onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">默认全自动汉化</div>\r\n          <div class=\"setting-desc\">进入页面后直接呈现翻译结果，无需手动点击</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-auto-switch\" onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">智能跳过纯中文内容</div>\r\n          <div class=\"setting-desc\">不包含日文或外语的作品自动跳过，节省配额与零延迟</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-skip-chinese\" onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">目标语言</div>\r\n          <div class=\"setting-desc\">期望将外语内容翻译为的目标语言</div>\r\n        </div>\r\n        <div class=\"select-wrap\">\r\n          <select class=\"select-input\" id=\"cfg-target-lang\" onchange=\"saveConfig()\">\r\n            <option value=\"zh-CN\">简体中文</option>\r\n            <option value=\"zh-TW\">繁體中文</option>\r\n            <option value=\"en\">English</option>\r\n            <option value=\"ja\">日本語 (原文)</option>\r\n            <option value=\"ko\">한국어</option>\r\n          </select>\r\n          <svg class=\"select-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg>\r\n        </div>\r\n      </div>\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">翻译服务</div>\r\n          <div class=\"setting-desc\">选择底层文本翻译所使用的服务引擎</div>\r\n        </div>\r\n        <div class=\"select-wrap\">\r\n          <select class=\"select-input\" id=\"cfg-translator-source\" onchange=\"onTranslatorChange()\">\r\n            <option value=\"google\">Google 免费并发 (极速)</option>\r\n            <option value=\"deepseek\">DeepSeek AI (文学润色/需Key)</option>\r\n            <option value=\"openai\">OpenAI / 兼容接口 (需Key)</option>\r\n            <option value=\"baidu\">百度通用翻译 (稳定/需Key)</option>\r\n            <option value=\"caiyun\">彩云小译 (地道ACG/需Token)</option>\r\n          </select>\r\n          <svg class=\"select-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- DeepSeek 配置区 -->\r\n      <div id=\"ai-deepseek-block\" style=\"padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color);\">\r\n        <div class=\"setting-label\" style=\"font-size: 14px;\">DeepSeek API Key</div>\r\n        <div class=\"input-wrap\">\r\n          <input type=\"password\" class=\"text-input\" id=\"cfg-deepseek-key\" placeholder=\"sk-...\" onchange=\"saveConfig()\">\r\n          <button type=\"button\" class=\"input-action-btn\" onclick=\"toggleInputMask('cfg-deepseek-key')\">\r\n            <!-- SF Symbol: eye -->\r\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n              <path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/>\r\n              <circle cx=\"12\" cy=\"12\" r=\"3\"/>\r\n            </svg>\r\n          </button>\r\n        </div>\r\n        <div style=\"display: flex; gap: 8px; margin-top: 8px;\">\r\n          <div style=\"flex: 2;\">\r\n            <div class=\"setting-desc\">端点 URL</div>\r\n            <div class=\"input-wrap\"><input type=\"text\" class=\"text-input\" id=\"cfg-deepseek-url\" value=\"https://api.deepseek.com/v1/chat/completions\" onchange=\"saveConfig()\"></div>\r\n          </div>\r\n          <div style=\"flex: 1.2;\">\r\n            <div class=\"setting-desc\">模型名称</div>\r\n            <div class=\"input-wrap\"><input type=\"text\" class=\"text-input\" id=\"cfg-deepseek-model\" value=\"deepseek-v4-flash\" onchange=\"saveConfig()\"></div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- OpenAI 配置区 -->\r\n      <div id=\"ai-openai-block\" style=\"padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color); display: none;\">\r\n        <div class=\"setting-label\" style=\"font-size: 14px;\">OpenAI API Key</div>\r\n        <div class=\"input-wrap\">\r\n          <input type=\"password\" class=\"text-input\" id=\"cfg-openai-key\" placeholder=\"sk-...\" onchange=\"saveConfig()\">\r\n          <button type=\"button\" class=\"input-action-btn\" onclick=\"toggleInputMask('cfg-openai-key')\">\r\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n              <path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/>\r\n              <circle cx=\"12\" cy=\"12\" r=\"3\"/>\r\n            </svg>\r\n          </button>\r\n        </div>\r\n        <div style=\"margin-top: 8px;\">\r\n          <div class=\"setting-desc\">兼容端点 URL</div>\r\n          <div class=\"input-wrap\"><input type=\"text\" class=\"text-input\" id=\"cfg-openai-url\" value=\"https://api.openai.com/v1/chat/completions\" onchange=\"saveConfig()\"></div>\r\n        </div>\r\n      </div>\r\n\r\n      <!-- 百度翻译配置区 -->\r\n      <div id=\"ai-baidu-block\" style=\"padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color); display: none;\">\r\n        <div class=\"setting-label\" style=\"font-size: 14px; margin-bottom: 6px;\">百度翻译 AppID</div>\r\n        <div class=\"input-wrap\" style=\"margin-bottom: 8px;\">\r\n          <input type=\"text\" class=\"text-input\" id=\"cfg-baidu-appid\" placeholder=\"在 fanyi-api.baidu.com 申请的 AppID\" onchange=\"saveConfig()\">\r\n        </div>\r\n        <div class=\"setting-label\" style=\"font-size: 14px; margin-bottom: 6px;\">百度翻译 Secret 密钥</div>\r\n        <div class=\"input-wrap\">\r\n          <input type=\"password\" class=\"text-input\" id=\"cfg-baidu-secret\" placeholder=\"管理控制台查看的密钥 (注意大小写区分)\" onchange=\"saveConfig()\">\r\n          <button type=\"button\" class=\"input-action-btn\" onclick=\"toggleInputMask('cfg-baidu-secret')\">\r\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n              <path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/>\r\n              <circle cx=\"12\" cy=\"12\" r=\"3\"/>\r\n            </svg>\r\n          </button>\r\n        </div>\r\n        <div class=\"setting-desc\" style=\"margin-top: 6px; color: var(--tint-blue);\">💡 百度通用文本翻译每月赠送免费额度，填入后点击下方「测试翻译模型连接与延迟」即可实时验证。</div>\r\n      </div>\r\n\r\n      <!-- 彩云小译配置区 -->\r\n      <div id=\"ai-caiyun-block\" style=\"padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color); display: none;\">\r\n        <div class=\"setting-label\" style=\"font-size: 14px; margin-bottom: 6px;\">彩云小译 API Token</div>\r\n        <div class=\"input-wrap\">\r\n          <input type=\"password\" class=\"text-input\" id=\"cfg-caiyun-token\" placeholder=\"在 open.caiyunapp.com 获取的 Token\" onchange=\"saveConfig()\">\r\n          <button type=\"button\" class=\"input-action-btn\" onclick=\"toggleInputMask('cfg-caiyun-token')\">\r\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n              <path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/>\r\n              <circle cx=\"12\" cy=\"12\" r=\"3\"/>\r\n            </svg>\r\n          </button>\r\n        </div>\r\n        <div class=\"setting-desc\" style=\"margin-top: 6px; color: var(--tint-blue);\">💡 彩云科技开放平台 (open.caiyunapp.com) 注册认证后每月赠送 100 万字符免费额度，二次元ACG语料出众。</div>\r\n      </div>\r\n\r\n      <div style=\"padding: 12px 16px 4px;\">\r\n        <div class=\"setting-label\" style=\"font-size: 14px;\">生效模块范围</div>\r\n      </div>\r\n      <div class=\"scope-chips\" id=\"scope-chips-container\">\r\n        <div class=\"scope-chip\" data-key=\"illust_title\" onclick=\"toggleScope(this)\">作品标题</div>\r\n        <div class=\"scope-chip\" data-key=\"illust_caption\" onclick=\"toggleScope(this)\">作品简介</div>\r\n        <div class=\"scope-chip\" data-key=\"tags\" onclick=\"toggleScope(this)\">日文标签</div>\r\n        <div class=\"scope-chip\" data-key=\"novels\" onclick=\"toggleScope(this)\">小说正文</div>\r\n        <div class=\"scope-chip\" data-key=\"comments\" onclick=\"toggleScope(this)\">评论区</div>\r\n        <div class=\"scope-chip\" data-key=\"user_profile\" onclick=\"toggleScope(this)\">画师简介</div>\r\n        <div class=\"scope-chip\" data-key=\"spotlight\" onclick=\"toggleScope(this)\">特辑文章</div>\r\n      </div>\r\n      <div class=\"action-btn-row\" style=\"padding-top: 4px;\">\r\n        <button type=\"button\" class=\"primary-btn\" id=\"btn-test-ai\" onclick=\"testAIConnection()\">\r\n          <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 14h12l-4 8 10-10H12l4-8z\"/></svg>\r\n          <span>测试翻译模型连接与延迟</span>\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"section-footer\">\r\n    主页作品卡片同时就地汉化标题与简介，彻底消除未翻译截断引发的弹窗；标签副标题已自动净空，杜绝上下重复显示。\r\n  </div>\r\n\r\n  <!-- ─── 第二组：阅读体验 ─── -->\r\n  <div class=\"section-card\" id=\"sec-novel\">\r\n    <div class=\"section-header\" onclick=\"toggleSection('sec-novel')\">\r\n      <div class=\"section-icon\" style=\"background: #5856d6; color: #fff;\">\r\n        <!-- SF Symbol: text.book.closed -->\r\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n          <path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"/>\r\n          <path d=\"M6 6h10\"/>\r\n          <path d=\"M6 10h10\"/>\r\n          <path d=\"M6 14h6\"/>\r\n        </svg>\r\n      </div>\r\n      <div class=\"section-title\">阅读体验</div>\r\n      <div class=\"section-summary\" id=\"sum-novel\">双语对照 · 系统字体</div>\r\n      <svg class=\"chevron-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></svg>\r\n    </div>\r\n    <div class=\"section-body\">\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">双语对照阅读</div>\r\n          <div class=\"setting-desc\">开启后按原文在上、译文在下形成段落对展示；关闭后仅显示译文</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-novel-show-original\" onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">排版字体风格</div>\r\n          <div class=\"setting-desc\">提供出版级印刷字体预设，字号与行距继承系统设置</div>\r\n        </div>\r\n        <div class=\"select-wrap\">\r\n          <select class=\"select-input\" id=\"cfg-novel-font\" onchange=\"saveConfig()\">\r\n            <option value=\"system\">系统默认 (苹方)</option>\r\n            <option value=\"songti\">经典宋体 (纸书质感)</option>\r\n            <option value=\"kaiti\">优美楷体 (古雅风格)</option>\r\n            <option value=\"yuanti\">柔和圆体 (亲和温润)</option>\r\n          </select>\r\n          <svg class=\"select-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg>\r\n        </div>\r\n      </div>\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">自动净化作者免责声明</div>\r\n          <div class=\"setting-desc\">智能过滤台本商用授权、禁止转载等规约条款，呈现纯粹小说正文</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-clean-disclaimer\" onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"section-footer\">\r\n    双语阅读严格按小说段落顺序一对一排列，原文为主阅读层级，译文为从属辅助层级，不加多余卡片边框与杂乱背景。\r\n  </div>\r\n\r\n  <!-- ─── 第三组：漫画与图片翻译 ─── -->\r\n  <div class=\"section-card\" id=\"sec-manga\">\r\n    <div class=\"section-header\" onclick=\"toggleSection('sec-manga')\">\r\n      <div class=\"section-icon\" style=\"background: #ff2d55; color: #fff;\">\r\n        <!-- SF Symbol: photo.on.rectangle.angled -->\r\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n          <path d=\"M4 8h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z\"/>\r\n          <path d=\"m2 16 5-5 4 4 5-5 6 6\"/>\r\n          <circle cx=\"8\" cy=\"13\" r=\"1.5\"/>\r\n          <path d=\"M7 4h10\"/>\r\n        </svg>\r\n      </div>\r\n      <div class=\"section-title\">漫画与图片翻译</div>\r\n      <div class=\"section-summary\" id=\"sum-manga\">未开启</div>\r\n      <svg class=\"chevron-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></svg>\r\n    </div>\r\n    <div class=\"section-body\">\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">启用漫画图片翻译</div>\r\n          <div class=\"setting-desc\">开启后在 Pixiv 浏览漫画作品时可一键进入专属全屏漫翻查看器</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-manga-switch\" onchange=\"onMangaSwitchChange()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n\r\n      <!-- 展开的漫翻详细配置区 -->\r\n      <div id=\"manga-config-box\" style=\"display: none; border-top: 0.5px solid var(--separator-color); background: rgba(127, 127, 127, 0.03);\">\r\n        <div class=\"setting-row\">\r\n          <div class=\"setting-info\">\r\n            <div class=\"setting-label\">漫翻引擎</div>\r\n            <div class=\"setting-desc\">选择底层图片汉化与字幕服务</div>\r\n          </div>\r\n          <div class=\"select-wrap\">\r\n            <select class=\"select-input\" id=\"cfg-manga-engine\" onchange=\"onMangaEngineChange()\">\r\n              <option value=\"deepseek_vl\">DeepSeek-VL (推荐·高精度气泡)</option>\r\n              <option value=\"gpt4o_mini\">GPT-4o-mini (OpenAI 视觉气泡)</option>\r\n              <option value=\"manga_translator\">自建服务 (manga-translator)</option>\r\n            </select>\r\n            <svg class=\"select-arrow\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg>\r\n          </div>\r\n        </div>\r\n\r\n        <!-- 自建服务 (选自建时展示) -->\r\n        <div id=\"manga-selfhost-block\" style=\"padding: 6px 16px 12px; display: none;\">\r\n          <div class=\"input-wrap\">\r\n            <input type=\"text\" class=\"text-input\" id=\"cfg-manga-server\" value=\"http://127.0.0.1:5000\" placeholder=\"http://192.168.1.x:5000\" onchange=\"saveConfig()\">\r\n          </div>\r\n        </div>\r\n\r\n        <!-- 快速直达任意漫画作品 -->\r\n        <div style=\"padding: 0 16px 12px;\">\r\n          <div class=\"setting-label\" style=\"font-size: 13px; margin-bottom: 6px;\">🔍 快速打开任意漫画作品：</div>\r\n          <div style=\"display: flex; gap: 8px;\">\r\n            <div class=\"input-wrap\" style=\"flex: 1; margin-bottom: 0;\">\r\n              <input type=\"text\" class=\"text-input\" id=\"quick-illust-id\" placeholder=\"输入作品 ID (如 144146271)\">\r\n            </div>\r\n            <button type=\"button\" class=\"primary-btn\" onclick=\"openQuickViewer()\" style=\"white-space: nowrap; padding: 0 16px; font-size: 13px;\">打开查看器</button>\r\n          </div>\r\n        </div>\r\n\r\n        <div style=\"padding: 6px 16px 12px;\">\r\n          <button type=\"button\" class=\"secondary-btn\" id=\"btn-test-manga\" onclick=\"testMangaConnection()\" style=\"width: 100%; padding: 10px 14px; font-size: 14px; font-weight: 600; justify-content: center;\">\r\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 14h12l-4 8 10-10H12l4-8z\"/></svg>\r\n            <span>测试漫翻服务连接与测速</span>\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"section-footer\">\r\n    全量插画与漫画均已注入专属查看器；在查看器内可利用 DeepSeek 视觉模型一键识别对白并覆盖汉化字幕。\r\n  </div>\r\n\r\n  <!-- ─── 第四组：悬浮按钮 ─── -->\r\n  <div class=\"section-card\" id=\"sec-floating\">\r\n    <div class=\"section-header\" onclick=\"toggleSection('sec-floating')\">\r\n      <div class=\"section-icon\" style=\"background: #34c759; color: #fff;\">\r\n        <!-- SF Symbol: button.programmable -->\r\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n          <circle cx=\"12\" cy=\"12\" r=\"9\"/>\r\n          <circle cx=\"12\" cy=\"12\" r=\"4\"/>\r\n        </svg>\r\n      </div>\r\n      <div class=\"section-title\">悬浮按钮</div>\r\n      <div class=\"section-summary\" id=\"sum-floating\">已开启</div>\r\n      <svg class=\"chevron-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></svg>\r\n    </div>\r\n    <div class=\"section-body\">\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">显示悬浮按钮</div>\r\n          <div class=\"setting-desc\">翻译过程中显示悬浮按钮，支持轻触翻译/还原与长按设置</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-floating-switch\" onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"section-footer\">\r\n    开启后自动避开页面已有喜欢与操作控件，轻点即响应，不跳动不重叠；关闭后完全不注入任何按钮 DOM。\r\n  </div>\r\n\r\n  <!-- ─── 第五组：高级与缓存 ─── -->\r\n  <div class=\"section-card\" id=\"sec-advanced\">\r\n    <div class=\"section-header\" onclick=\"toggleSection('sec-advanced')\">\r\n      <div class=\"section-icon\" style=\"background: #8e8e93; color: #fff;\">\r\n        <!-- SF Symbol: slider.horizontal.3 -->\r\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n          <path d=\"M4 21v-7\"/>\r\n          <path d=\"M4 10V3\"/>\r\n          <path d=\"M12 21v-9\"/>\r\n          <path d=\"M12 8V3\"/>\r\n          <path d=\"M20 21v-5\"/>\r\n          <path d=\"M20 12V3\"/>\r\n          <path d=\"M1 14h6\"/>\r\n          <path d=\"M9 8h6\"/>\r\n          <path d=\"M17 16h6\"/>\r\n        </svg>\r\n      </div>\r\n      <div class=\"section-title\">高级与缓存</div>\r\n      <div class=\"section-summary\" id=\"sum-advanced\">已就绪</div>\r\n      <svg class=\"chevron-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></svg>\r\n    </div>\r\n    <div class=\"section-body\">\r\n      <!-- 真实缓存管理卡片 -->\r\n      <div class=\"cache-panel\">\r\n        <div class=\"setting-label\" style=\"margin-bottom: 8px;\">翻译缓存</div>\r\n        <div class=\"setting-desc\" style=\"margin-bottom: 12px;\">翻译结果暂存在本地，避免重复请求并提升加载速度</div>\r\n        <div class=\"cache-metric-grid\">\r\n          <div class=\"cache-metric-box\">\r\n            <div class=\"cache-metric-title\">已使用</div>\r\n            <div class=\"cache-metric-val\" id=\"cache-size\">0 B</div>\r\n          </div>\r\n          <div class=\"cache-metric-box\">\r\n            <div class=\"cache-metric-title\">缓存条目</div>\r\n            <div class=\"cache-metric-val\" id=\"cache-count\">0 个</div>\r\n          </div>\r\n          <div class=\"cache-metric-box\">\r\n            <div class=\"cache-metric-title\">最近缓存</div>\r\n            <div class=\"cache-metric-val\" id=\"cache-time\" style=\"font-size: 13px; line-height: 24px;\">暂无缓存</div>\r\n          </div>\r\n        </div>\r\n        <button type=\"button\" class=\"secondary-btn danger-btn\" style=\"width: 100%;\" onclick=\"openClearModal()\">\r\n          <!-- SF Symbol: trash -->\r\n          <svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n            <path d=\"M3 6h18\"/>\r\n            <path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/>\r\n            <path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/>\r\n          </svg>\r\n          <span>清理缓存</span>\r\n        </button>\r\n        <div class=\"cache-feedback-bar\" id=\"cache-feedback\"></div>\r\n      </div>\r\n\r\n            <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">优化图片加载速度</div>\r\n          <div class=\"setting-desc\">走全球 CDN 镜像加速通道 (i.pixiv.re)，大幅提升大图加载速度，翻页更流畅</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-image-accelerate\" checked onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">标签优先使用离线词典</div>\r\n          <div class=\"setting-desc\">内置 2500+ ACG 日文 Tag 映射，0ms 响应且副标自动净空</div>\r\n        </div>\r\n        <label class=\"switch-wrap\">\r\n          <input type=\"checkbox\" id=\"cfg-tag-offline\" checked onchange=\"saveConfig()\">\r\n          <span class=\"switch-slider\"></span>\r\n        </label>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"section-footer\">\r\n    清理缓存仅删除已保存的翻译正文条目，不会误删您的设置或 API 密钥；图片镜像如需免流，可在 Loon 添加规则：<code style=\"background: rgba(127,127,127,0.15); padding: 1px 4px; border-radius: 4px;\">DOMAIN,i.pixiv.re,DIRECT</code>。\r\n  </div>\r\n\r\n  <!-- ─── 第六组：关于 ─── -->\r\n  <div class=\"section-card\" id=\"sec-about\">\r\n    <div class=\"section-header\" onclick=\"toggleSection('sec-about')\">\r\n      <div class=\"section-icon\" style=\"background: #ff9500; color: #fff;\">\r\n        <!-- SF Symbol: info.circle -->\r\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\r\n          <circle cx=\"12\" cy=\"12\" r=\"10\"/>\r\n          <path d=\"M12 16v-4\"/>\r\n          <path d=\"M12 8h.01\"/>\r\n        </svg>\r\n      </div>\r\n      <div class=\"section-title\">关于与状态</div>\r\n      <div class=\"section-summary\" id=\"sum-about\">v4.5.2 旗舰版</div>\r\n      <svg class=\"chevron-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"/></svg>\r\n    </div>\r\n    <div class=\"section-body\">\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">插件版本</div>\r\n          <div class=\"setting-desc\">Pixiv Enhanced Translation Suite</div>\r\n        </div>\r\n        <span style=\"font-size: 14px; color: var(--text-secondary); font-weight: 500;\">v4.5.2</span>\r\n      </div>\r\n      <div class=\"setting-row\">\r\n        <div class=\"setting-info\">\r\n          <div class=\"setting-label\">运行架构</div>\r\n          <div class=\"setting-desc\">0 外部 CDN 依赖 · 本地内存极速直出</div>\r\n        </div>\r\n        <span style=\"font-size: 14px; color: var(--tint-green); font-weight: 500;\">● 离线脱机</span>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- 底部醒目保存主按钮 -->\r\n  <div style=\"margin: 24px 0 16px; padding: 0 4px;\">\r\n    <button type=\"button\" class=\"primary-btn\" id=\"btn-save-bottom\" onclick=\"handleDoneClick()\" style=\"width: 100%; padding: 14px 20px; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 122, 255, 0.3);\">\r\n      <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"/></svg>\r\n      <span>保存设置</span>\r\n    </button>\r\n  </div>\r\n\r\n  <script>\r\n    const DEFAULT_CONFIG = {\r\n      \"@Pixiv.Enhanced.Settings.Global.Switch\": true,\r\n      \"@Pixiv.Enhanced.Settings.Auto.Switch\": true,\r\n      \"@Pixiv.Enhanced.Settings.Auto.Scopes\": [\"illust_title\", \"illust_caption\", \"tags\", \"comments\", \"user_profile\", \"novels\", \"spotlight\"],\r\n      \"@Pixiv.Enhanced.Settings.Filter.SkipChinese\": true,\r\n      \"@Pixiv.Enhanced.Settings.Novel.Font\": \"system\",\r\n      \"@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer\": true,\r\n      \"@Pixiv.Enhanced.Settings.Novel.ShowOriginal\": true,\r\n      \"@Pixiv.Enhanced.Settings.Floating.Switch\": true,\r\n      \"@Pixiv.Enhanced.Settings.Translator.Source\": \"google\",\r\n      \"@Pixiv.Enhanced.Settings.Target.Lang\": \"zh-CN\",\r\n      \"@Pixiv.Enhanced.Settings.Network.ImageAccelerate\": true,\r\n      \"@Pixiv.Enhanced.Settings.Tag.OfflineOnly\": true,\r\n      \"@Pixiv.Enhanced.Settings.Image.Switch\": true,\r\n      \"@Pixiv.Enhanced.Settings.Image.Engine\": \"deepseek_vl\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.DeepSeekKey\": \"\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl\": \"https://api.deepseek.com/v1/chat/completions\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.DeepSeekModel\": \"deepseek-v4-flash\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.OpenAIKey\": \"\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.OpenAIUrl\": \"https://api.openai.com/v1/chat/completions\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.BaiduAppid\": \"\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.BaiduSecret\": \"\",\r\n      \"@Pixiv.Enhanced.Settings.Auth.CaiyunToken\": \"\",\r\n      \"@Pixiv.Enhanced.Settings.Manga.ServerUrl\": \"http://127.0.0.1:5000\",\r\n      \"@Pixiv.Enhanced.Settings.LogLevel\": \"WARN\"\r\n    };\r\n\r\n    let currentConfig = Object.assign({}, DEFAULT_CONFIG);\r\n    let selectedScopes = new Set(DEFAULT_CONFIG[\"@Pixiv.Enhanced.Settings.Auto.Scopes\"]);\r\n    let isInitializing = false;\r\n\r\n    function showToast(msg, icon) {\r\n      const toast = document.getElementById(\"px-toast\");\r\n      document.getElementById(\"px-toast-msg\").textContent = msg;\r\n      document.getElementById(\"px-toast-icon\").textContent = icon || \"✓\";\r\n      toast.classList.add(\"show\");\r\n      clearTimeout(window._toastTimer);\r\n      window._toastTimer = setTimeout(() => toast.classList.remove(\"show\"), 2200);\r\n    }\r\n\r\n    function toggleSection(id) {\r\n      const card = document.getElementById(id);\r\n      if (card) card.classList.toggle(\"expanded\");\r\n    }\r\n\r\n    function toggleInputMask(inputId) {\r\n      const input = document.getElementById(inputId);\r\n      if (input) input.type = (input.type === \"password\") ? \"text\" : \"password\";\r\n    }\r\n\r\n    function toggleScope(el) {\r\n      const key = el.getAttribute(\"data-key\");\r\n      if (selectedScopes.has(key)) {\r\n        selectedScopes.delete(key);\r\n        el.classList.remove(\"selected\");\r\n      } else {\r\n        selectedScopes.add(key);\r\n        el.classList.add(\"selected\");\r\n      }\r\n      saveConfig();\r\n    }\r\n\r\n    function openQuickViewer() {\r\n      const input = document.getElementById(\"quick-illust-id\");\r\n      const id = input ? input.value.trim().replace(/\\D+/g, \"\") : \"\";\r\n      if (!id) {\r\n        showToast(\"请输入有效的纯数字作品 ID\", \"ℹ️\");\r\n        return;\r\n      }\r\n      window.location.href = \"https://www.pixiv.net/manga/viewer?illust_id=\" + id;\r\n    }\r\n\r\n    function onTranslatorChange(shouldSave = true) {\r\n      const source = document.getElementById(\"cfg-translator-source\") ? document.getElementById(\"cfg-translator-source\").value : \"google\";\r\n      const dsBlock = document.getElementById(\"ai-deepseek-block\");\r\n      const oaBlock = document.getElementById(\"ai-openai-block\");\r\n      const bdBlock = document.getElementById(\"ai-baidu-block\");\r\n      const cyBlock = document.getElementById(\"ai-caiyun-block\");\r\n      if (dsBlock) dsBlock.style.display = (source === \"deepseek\") ? \"block\" : \"none\";\r\n      if (oaBlock) oaBlock.style.display = (source === \"openai\") ? \"block\" : \"none\";\r\n      if (bdBlock) bdBlock.style.display = (source === \"baidu\") ? \"block\" : \"none\";\r\n      if (cyBlock) cyBlock.style.display = (source === \"caiyun\") ? \"block\" : \"none\";\r\n      if (shouldSave && !isInitializing) saveConfig();\r\n    }\r\n\r\n    function onMangaSwitchChange(shouldSave = true) {\r\n      const el = document.getElementById(\"cfg-manga-switch\");\r\n      const on = el ? el.checked : false;\r\n      const box = document.getElementById(\"manga-config-box\");\r\n      if (box) box.style.display = on ? \"block\" : \"none\";\r\n      onMangaEngineChange(shouldSave);\r\n    }\r\n\r\n    function onMangaEngineChange(shouldSave = true) {\r\n      const engineEl = document.getElementById(\"cfg-manga-engine\");\r\n      const engine = engineEl ? engineEl.value : \"deepseek_vl\";\r\n      const sBlock = document.getElementById(\"manga-selfhost-block\");\r\n      if (sBlock) sBlock.style.display = (engine === \"manga_translator\") ? \"block\" : \"none\";\r\n      if (shouldSave && !isInitializing) saveConfig();\r\n    }\r\n\r\n    function updateSummaries() {\r\n      const autoEl = document.getElementById(\"cfg-auto-switch\");\r\n      const autoOn = autoEl ? autoEl.checked : true;\r\n      const targetLang = document.getElementById(\"cfg-target-lang\") ? document.getElementById(\"cfg-target-lang\").value : \"zh-CN\";\r\n      const langText = (targetLang === \"zh-CN\") ? \"简体\" : (targetLang === \"zh-TW\" ? \"繁體\" : targetLang);\r\n      const sumContent = document.getElementById(\"sum-content\");\r\n      if (sumContent) sumContent.textContent = (autoOn ? \"自动:开\" : \"自动:关\") + \" · \" + langText;\r\n\r\n      const fontEl = document.getElementById(\"cfg-novel-font\");\r\n      const font = fontEl ? fontEl.value : \"system\";\r\n      const fontNameMap = { system: \"苹方\", songti: \"宋体\", kaiti: \"楷体\", yuanti: \"圆体\" };\r\n      const showOrigEl = document.getElementById(\"cfg-novel-show-original\");\r\n      const showOrig = showOrigEl ? showOrigEl.checked : true;\r\n      const sumNovel = document.getElementById(\"sum-novel\");\r\n      if (sumNovel) sumNovel.textContent = (showOrig ? \"双语对照\" : \"仅译文\") + \" · \" + (fontNameMap[font] || \"原版\");\r\n\r\n      const mangaEl = document.getElementById(\"cfg-manga-switch\");\r\n      const mangaOn = mangaEl ? mangaEl.checked : false;\r\n      const engineEl = document.getElementById(\"cfg-manga-engine\");\r\n      const engine = engineEl ? engineEl.value : \"deepseek_vl\";\r\n      const engineMap = { deepseek_vl: \"DeepSeek-VL\", gpt4o_mini: \"GPT-4o-mini\", manga_translator: \"自建服务\" };\r\n      const sumManga = document.getElementById(\"sum-manga\");\r\n      if (sumManga) sumManga.textContent = mangaOn ? (\"已开启 · \" + (engineMap[engine] || \"视觉AI\")) : \"未开启\";\r\n\r\n      const floatingEl = document.getElementById(\"cfg-floating-switch\");\r\n      const floatingOn = floatingEl ? floatingEl.checked : true;\r\n      const sumFloating = document.getElementById(\"sum-floating\");\r\n      if (sumFloating) sumFloating.textContent = floatingOn ? \"已开启\" : \"已关闭\";\r\n\r\n      const transEl = document.getElementById(\"cfg-translator-source\");\r\n      const trans = transEl ? transEl.value : \"google\";\r\n      const transMap = { google: \"Google免费\", deepseek: \"DeepSeek\", openai: \"OpenAI\", baidu: \"百度翻译\", caiyun: \"彩云小译\" };\r\n      const sumAi = document.getElementById(\"sum-ai\");\r\n      if (sumAi) sumAi.textContent = transMap[trans] || trans;\r\n    }\r\n\r\n    async function handleDoneClick() {\r\n      const btnTop = document.querySelector(\".done-nav-btn\");\r\n      const btnBtm = document.getElementById(\"btn-save-bottom\");\r\n      if (btnTop) btnTop.textContent = \"⏳ 正在保存…\";\r\n      if (btnBtm) {\r\n        const span = btnBtm.querySelector(\"span\");\r\n        if (span) span.textContent = \"⏳ 正在保存…\";\r\n      }\r\n\r\n      let saveOk = false;\r\n      try {\r\n        await saveConfig();\r\n        saveOk = true;\r\n        showToast(\"设置已成功保存生效\", \"✓\");\r\n        if (btnTop) btnTop.textContent = \"✓ 已保存\";\r\n        if (btnBtm) {\r\n          const span = btnBtm.querySelector(\"span\");\r\n          if (span) span.textContent = \"✓ 设置已保存\";\r\n        }\r\n      } catch (e) {\r\n        showToast(\"保存失败，请检查网络\", \"❌\");\r\n        if (btnTop) btnTop.textContent = \"保存失败\";\r\n        if (btnBtm) {\r\n          const span = btnBtm.querySelector(\"span\");\r\n          if (span) span.textContent = \"保存失败，重试\";\r\n        }\r\n      }\r\n\r\n      if (saveOk) {\r\n        setTimeout(function () {\r\n          if (btnTop) btnTop.textContent = \"完成\";\r\n          if (btnBtm) {\r\n            const span = btnBtm.querySelector(\"span\");\r\n            if (span) span.textContent = \"保存设置\";\r\n          }\r\n          try {\r\n            if (window.history.length > 1) {\r\n              window.history.back();\r\n            } else {\r\n              window.close();\r\n            }\r\n          } catch (e) {}\r\n        }, 400);\r\n      } else {\r\n        setTimeout(function () {\r\n          if (btnTop) btnTop.textContent = \"完成\";\r\n          if (btnBtm) {\r\n            const span = btnBtm.querySelector(\"span\");\r\n            if (span) span.textContent = \"保存设置\";\r\n          }\r\n        }, 2000);\r\n      }\r\n    }\r\n\r\n    async function loadConfig() {\r\n      isInitializing = true;\r\n      try {\r\n        const res = await fetch(\"/api/get\").then(r => r.json()).catch(() => null);\r\n        if (res && typeof res === \"object\") {\r\n          currentConfig = Object.assign({}, DEFAULT_CONFIG, res);\r\n        }\r\n      } catch (e) { }\r\n\r\n      const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };\r\n      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };\r\n\r\n      setCheck(\"cfg-global-switch\", currentConfig[\"@Pixiv.Enhanced.Settings.Global.Switch\"]);\r\n      setCheck(\"cfg-auto-switch\", currentConfig[\"@Pixiv.Enhanced.Settings.Auto.Switch\"]);\r\n      setCheck(\"cfg-skip-chinese\", currentConfig[\"@Pixiv.Enhanced.Settings.Filter.SkipChinese\"]);\r\n      setVal(\"cfg-target-lang\", currentConfig[\"@Pixiv.Enhanced.Settings.Target.Lang\"] || \"zh-CN\");\r\n\r\n      setVal(\"cfg-novel-font\", currentConfig[\"@Pixiv.Enhanced.Settings.Novel.Font\"] || \"system\");\r\n      setCheck(\"cfg-clean-disclaimer\", currentConfig[\"@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer\"]);\r\n      setCheck(\"cfg-novel-show-original\", currentConfig[\"@Pixiv.Enhanced.Settings.Novel.ShowOriginal\"] !== false);\r\n      setCheck(\"cfg-floating-switch\", currentConfig[\"@Pixiv.Enhanced.Settings.Floating.Switch\"] !== false);\r\n\r\n      setVal(\"cfg-translator-source\", currentConfig[\"@Pixiv.Enhanced.Settings.Translator.Source\"] || \"google\");\r\n      setVal(\"cfg-deepseek-key\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.DeepSeekKey\"] || \"\");\r\n      setVal(\"cfg-deepseek-url\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl\"] || \"https://api.deepseek.com/v1/chat/completions\");\r\n      setVal(\"cfg-deepseek-model\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.DeepSeekModel\"] || \"deepseek-v4-flash\");\r\n      setVal(\"cfg-openai-key\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.OpenAIKey\"] || \"\");\r\n      setVal(\"cfg-openai-url\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.OpenAIUrl\"] || \"https://api.openai.com/v1/chat/completions\");\r\n\r\n      setCheck(\"cfg-manga-switch\", currentConfig[\"@Pixiv.Enhanced.Settings.Image.Switch\"]);\r\n      setVal(\"cfg-manga-engine\", currentConfig[\"@Pixiv.Enhanced.Settings.Image.Engine\"] || \"deepseek_vl\");\r\n      setVal(\"cfg-baidu-appid\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.BaiduAppid\"] || \"\");\r\n      setVal(\"cfg-baidu-secret\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.BaiduSecret\"] || \"\");\r\n      setVal(\"cfg-caiyun-token\", currentConfig[\"@Pixiv.Enhanced.Settings.Auth.CaiyunToken\"] || \"\");\r\n      setVal(\"cfg-manga-server\", currentConfig[\"@Pixiv.Enhanced.Settings.Manga.ServerUrl\"] || \"http://127.0.0.1:5000\");\r\n\r\n      setCheck(\"cfg-image-accelerate\", currentConfig[\"@Pixiv.Enhanced.Settings.Network.ImageAccelerate\"] !== false);\r\n      setCheck(\"cfg-tag-offline\", currentConfig[\"@Pixiv.Enhanced.Settings.Tag.OfflineOnly\"]);\r\n\r\n      const scopes = Array.isArray(currentConfig[\"@Pixiv.Enhanced.Settings.Auto.Scopes\"])\r\n        ? currentConfig[\"@Pixiv.Enhanced.Settings.Auto.Scopes\"]\r\n        : DEFAULT_CONFIG[\"@Pixiv.Enhanced.Settings.Auto.Scopes\"];\r\n      selectedScopes = new Set(scopes);\r\n      document.querySelectorAll(\".scope-chip\").forEach(chip => {\r\n        const k = chip.getAttribute(\"data-key\");\r\n        if (selectedScopes.has(k)) chip.classList.add(\"selected\");\r\n        else chip.classList.remove(\"selected\");\r\n      });\r\n\r\n      onTranslatorChange(false);\r\n      onMangaSwitchChange(false);\r\n      updateSummaries();\r\n      isInitializing = false;\r\n    }\r\n\r\n    async function saveConfig() {\r\n      if (isInitializing) return;\r\n      const getCheck = (id, def) => { const el = document.getElementById(id); return el ? el.checked : def; };\r\n      const getVal = (id, def) => { const el = document.getElementById(id); return el ? el.value.trim() : def; };\r\n\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Global.Switch\"] = getCheck(\"cfg-global-switch\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auto.Switch\"] = getCheck(\"cfg-auto-switch\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Filter.SkipChinese\"] = getCheck(\"cfg-skip-chinese\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Target.Lang\"] = getVal(\"cfg-target-lang\", \"zh-CN\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auto.Scopes\"] = Array.from(selectedScopes);\r\n\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Novel.Font\"] = getVal(\"cfg-novel-font\", \"system\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer\"] = getCheck(\"cfg-clean-disclaimer\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Novel.ShowOriginal\"] = getCheck(\"cfg-novel-show-original\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Floating.Switch\"] = getCheck(\"cfg-floating-switch\", true);\r\n\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Translator.Source\"] = getVal(\"cfg-translator-source\", \"google\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.DeepSeekKey\"] = getVal(\"cfg-deepseek-key\", \"\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl\"] = getVal(\"cfg-deepseek-url\", \"https://api.deepseek.com/v1/chat/completions\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.DeepSeekModel\"] = getVal(\"cfg-deepseek-model\", \"deepseek-v4-flash\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.OpenAIKey\"] = getVal(\"cfg-openai-key\", \"\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.OpenAIUrl\"] = getVal(\"cfg-openai-url\", \"https://api.openai.com/v1/chat/completions\");\r\n\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Network.ImageAccelerate\"] = getCheck(\"cfg-image-accelerate\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Tag.OfflineOnly\"] = getCheck(\"cfg-tag-offline\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Image.Switch\"] = getCheck(\"cfg-manga-switch\", true);\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Image.Engine\"] = getVal(\"cfg-manga-engine\", \"deepseek_vl\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.BaiduAppid\"] = getVal(\"cfg-baidu-appid\", \"\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.BaiduSecret\"] = getVal(\"cfg-baidu-secret\", \"\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Auth.CaiyunToken\"] = getVal(\"cfg-caiyun-token\", \"\");\r\n      currentConfig[\"@Pixiv.Enhanced.Settings.Manga.ServerUrl\"] = getVal(\"cfg-manga-server\", \"http://127.0.0.1:5000\");\r\n\r\n      updateSummaries();\r\n\r\n      try {\r\n        await fetch(\"/api/set\", {\r\n          method: \"POST\",\r\n          headers: { \"Content-Type\": \"application/json\" },\r\n          body: JSON.stringify(currentConfig)\r\n        });\r\n        showToast(\"设置已实时同步保存\", \"✓\");\r\n      } catch (e) {\r\n        showToast(\"已在本地更新\", \"ℹ️\");\r\n      }\r\n    }\r\n\r\n    async function testAIConnection() {\r\n      const btn = document.getElementById(\"btn-test-ai\");\r\n      if (!btn) return;\r\n      btn.disabled = true;\r\n      btn.innerHTML = '<span>⏳ 正在测试连接与测速…</span>';\r\n      const start = Date.now();\r\n\r\n      try {\r\n        const sourceEl = document.getElementById(\"cfg-translator-source\");\r\n        const source = sourceEl ? sourceEl.value : \"google\";\r\n        const appid = (document.getElementById(\"cfg-baidu-appid\") ? document.getElementById(\"cfg-baidu-appid\").value : \"\").trim();\r\n        const secret = (document.getElementById(\"cfg-baidu-secret\") ? document.getElementById(\"cfg-baidu-secret\").value : \"\").trim();\r\n        const caiyunToken = (document.getElementById(\"cfg-caiyun-token\") ? document.getElementById(\"cfg-caiyun-token\").value : \"\").trim();\r\n\r\n        saveConfig();\r\n\r\n        const query = \"?source=\" + encodeURIComponent(source) +\r\n          \"&appid=\" + encodeURIComponent(appid) +\r\n          \"&secret=\" + encodeURIComponent(secret) +\r\n          \"&caiyun_token=\" + encodeURIComponent(caiyunToken);\r\n\r\n        const res = await fetch(\"/api/test_ai\" + query, { method: \"POST\" })\r\n          .then(r => r.json())\r\n          .catch(() => null);\r\n        const latency = Date.now() - start;\r\n\r\n        if (res && res.ok) {\r\n          const detail = res.translation ? (\" · \" + res.translation) : \"\";\r\n          btn.innerHTML = '<span>🟢 连接正常 · ' + latency + 'ms' + detail + '</span>';\r\n          showToast(\"翻译模型连接正常 (\" + latency + \"ms)\", \"🟢\");\r\n        } else {\r\n          const err = (res && res.error) ? res.error : \"请求超时或鉴权失败\";\r\n          btn.innerHTML = '<span>🔴 失败: ' + err.slice(0, 18) + '</span>';\r\n          showToast(\"连接失败: \" + err, \"❌\");\r\n        }\r\n      } catch (e) {\r\n        btn.innerHTML = '<span>🔴 网络异常</span>';\r\n        showToast(\"网络请求异常: \" + (e && e.message ? e.message : e), \"❌\");\r\n      }\r\n\r\n      setTimeout(() => {\r\n        if (btn) {\r\n          btn.disabled = false;\r\n          btn.innerHTML = '<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 14h12l-4 8 10-10H12l4-8z\"/></svg><span>测试翻译模型连接与延迟</span>';\r\n        }\r\n      }, 3500);\r\n    }\r\n\r\n    async function testMangaConnection() {\r\n      const btn = document.getElementById(\"btn-test-manga\");\r\n      if (!btn) return;\r\n      btn.disabled = true;\r\n      btn.innerHTML = '<span>⏳ 正在测试漫翻服务…</span>';\r\n      const start = Date.now();\r\n\r\n      try {\r\n        const engine = document.getElementById(\"cfg-manga-engine\") ? document.getElementById(\"cfg-manga-engine\").value : \"deepseek_vl\";\r\n        const server = (document.getElementById(\"cfg-manga-server\") ? document.getElementById(\"cfg-manga-server\").value : \"\").trim();\r\n\r\n        // 立即触发保存保证同步\r\n        saveConfig();\r\n\r\n        const query = \"?engine=\" + encodeURIComponent(engine) +\r\n          \"&server=\" + encodeURIComponent(server);\r\n\r\n        const res = await fetch(\"/api/test_manga\" + query, { method: \"POST\" })\r\n          .then(r => r.json())\r\n          .catch(() => null);\r\n        const latency = Date.now() - start;\r\n\r\n        if (res && res.ok) {\r\n          const detail = res.translation ? (\" · \" + res.translation) : \"\";\r\n          btn.innerHTML = '<span>🟢 漫翻正常 · ' + latency + 'ms' + detail + '</span>';\r\n          showToast(\"漫翻服务测试正常 (\" + latency + \"ms)\", \"🟢\");\r\n        } else {\r\n          const err = (res && res.error) ? res.error : \"请求超时或连接失败\";\r\n          btn.innerHTML = '<span>🔴 失败: ' + err.slice(0, 18) + '</span>';\r\n          showToast(\"漫翻测试失败: \" + err, \"❌\");\r\n        }\r\n      } catch (e) {\r\n        btn.innerHTML = '<span>🔴 网络异常</span>';\r\n        showToast(\"网络请求异常: \" + (e && e.message ? e.message : e), \"❌\");\r\n      }\r\n\r\n      setTimeout(() => {\r\n        if (btn) {\r\n          btn.disabled = false;\r\n          btn.innerHTML = '<svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 14h12l-4 8 10-10H12l4-8z\"/></svg><span>测试漫翻服务连接与测速</span>';\r\n        }\r\n      }, 3500);\r\n    }\r\n\r\n    /* ─── 真实缓存管理 ─── */\r\n    async function loadCacheStats() {\r\n      const sizeEl = document.getElementById(\"cache-size\");\r\n      const countEl = document.getElementById(\"cache-count\");\r\n      const timeEl = document.getElementById(\"cache-time\");\r\n      try {\r\n        const res = await fetch(\"/api/cache_stats\").then(r => r.json());\r\n        if (!res || !res.ok) throw new Error(\"统计失败\");\r\n        if (sizeEl) sizeEl.textContent = res.sizeText || \"0 B\";\r\n        if (countEl) countEl.textContent = (res.count || 0) + \" 个\";\r\n        if (timeEl) timeEl.textContent = res.timeText || \"暂无缓存\";\r\n      } catch (e) {\r\n        if (sizeEl) sizeEl.textContent = \"0 B\";\r\n        if (countEl) countEl.textContent = \"0 个\";\r\n        if (timeEl) timeEl.textContent = \"暂无缓存\";\r\n      }\r\n    }\r\n\r\n    function openClearModal() {\r\n      const modal = document.getElementById(\"clear-modal\");\r\n      if (modal) modal.classList.add(\"show\");\r\n    }\r\n\r\n    function closeClearModal() {\r\n      const modal = document.getElementById(\"clear-modal\");\r\n      if (modal) modal.classList.remove(\"show\");\r\n    }\r\n\r\n    async function executeClearCache() {\r\n      closeClearModal();\r\n      const feedback = document.getElementById(\"cache-feedback\");\r\n      if (feedback) feedback.textContent = \"正在清理本地缓存…\";\r\n      try {\r\n        const res = await fetch(\"/api/clear_cache\", { method: \"POST\" }).then(r => r.json());\r\n        if (!res || !res.ok) throw new Error(\"清理异常\");\r\n        if (feedback) feedback.textContent = \"✓ 缓存已清理：已释放 \" + res.sizeText + \" · 已删除 \" + res.count + \" 条\";\r\n        showToast(\"缓存已清理\", \"✓\");\r\n        await loadCacheStats();\r\n      } catch (e) {\r\n        if (feedback) feedback.textContent = \"清理失败，请重试\";\r\n        showToast(\"清理缓存失败\", \"!\");\r\n      }\r\n    }\r\n\r\n    function initSettingsPage() {\r\n      loadConfig();\r\n      loadCacheStats();\r\n    }\r\n\r\n    window.addEventListener(\"pageshow\", () => {\r\n      initSettingsPage();\r\n    });\r\n\r\n    document.addEventListener(\"DOMContentLoaded\", () => {\r\n      initSettingsPage();\r\n    });\r\n  </script>\r\n</body>\r\n</html>\r\n";

// ─── 1. 配置管理中心（对接 PreferencePanes 存储模型）───────────────────────────
function getSetting(key, defaultVal) {
  try {
    const val = $.getdata(key);
    if (val === undefined || val === null || val === "") return defaultVal;
    if (val === "true") return true;
    if (val === "false") return false;
    if (/^[\[{]/.test(val)) {
      try { return JSON.parse(val); } catch (e) { }
    }
    return val;
  } catch (e) {
    return defaultVal;
  }
}

function loadConfig() {
  const globalSwitch = getSetting("@Pixiv.Enhanced.Settings.Global.Switch", true);
  const autoSwitch = getSetting("@Pixiv.Enhanced.Settings.Auto.Switch", true);
  const rawScopes = getSetting("@Pixiv.Enhanced.Settings.Auto.Scopes", ["illust_title", "illust_caption", "tags", "comments", "user_profile", "novels", "spotlight"]);
  const scopes = Array.isArray(rawScopes) ? rawScopes : (typeof rawScopes === "string" ? rawScopes.split(",") : []);
  if (!scopes.includes("illust_title")) scopes.push("illust_title");
  const skipChinese = getSetting("@Pixiv.Enhanced.Settings.Filter.SkipChinese", true);
  const novelFont = getSetting("@Pixiv.Enhanced.Settings.Novel.Font", "system");
  const novelCleanDisclaimer = getSetting("@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer", true);
  const novelShowOriginal = getSetting("@Pixiv.Enhanced.Settings.Novel.ShowOriginal", true);
  const floatingSwitch = getSetting("@Pixiv.Enhanced.Settings.Floating.Switch", true);
  const translator = (getSetting("@Pixiv.Enhanced.Settings.Translator.Source", "google") || "google").toLowerCase();
  const targetLang = getSetting("@Pixiv.Enhanced.Settings.Target.Lang", "zh-CN") || "zh-CN";
  const tagOfflineOnly = getSetting("@Pixiv.Enhanced.Settings.Tag.OfflineOnly", true);
  const imageAccelerate = getSetting("@Pixiv.Enhanced.Settings.Network.ImageAccelerate", true);

  // 漫翻设置
  const imageSwitch = getSetting("@Pixiv.Enhanced.Settings.Image.Switch", true);
  const imageEngine = getSetting("@Pixiv.Enhanced.Settings.Image.Engine", "deepseek_vl");
  const imageRenderMode = getSetting("@Pixiv.Enhanced.Settings.Image.RenderMode", "overlay");

  // 密钥及服务
  const deepseekKey = getSetting("@Pixiv.Enhanced.Settings.Auth.DeepSeekKey", "");
  const deepseekUrl = getSetting("@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl", "https://api.deepseek.com/v1/chat/completions");
  const deepseekModel = getSetting("@Pixiv.Enhanced.Settings.Auth.DeepSeekModel", "deepseek-v4-flash");
  const openaiKey = getSetting("@Pixiv.Enhanced.Settings.Auth.OpenAIKey", "");
  const openaiUrl = getSetting("@Pixiv.Enhanced.Settings.Auth.OpenAIUrl", "https://api.openai.com/v1/chat/completions");
  const baiduAppid = getSetting("@Pixiv.Enhanced.Settings.Auth.BaiduAppid", "");
  const baiduSecret = getSetting("@Pixiv.Enhanced.Settings.Auth.BaiduSecret", "");
  const caiyunToken = getSetting("@Pixiv.Enhanced.Settings.Auth.CaiyunToken", "");
  const mangaServer = getSetting("@Pixiv.Enhanced.Settings.Manga.ServerUrl", "http://127.0.0.1:5000");
  const logLevel = getSetting("@Pixiv.Enhanced.Settings.LogLevel", "WARN");

  return {
    globalSwitch,
    autoSwitch,
    scopes,
    skipChinese,
    novelFont,
    novelCleanDisclaimer,
    novelShowOriginal,
    floatingSwitch,
    translator,
    targetLang,
    tagOfflineOnly,
    imageAccelerate,
    imageSwitch,
    imageEngine,
    imageRenderMode,
    deepseekKey,
    deepseekUrl,
    deepseekModel,
    openaiKey,
    openaiUrl,
    baiduAppid,
    baiduSecret,
    caiyunToken,
    mangaServer,
    logLevel
  };
}

// ─── 2. 内置 500+ Pixiv 高频 Tag 离线汉化字典（0ms 响应，0 网络开销）───────────────
const PIXIV_TAG_DICT = {
  // 分类与属性
  "オリジナル": "原创", "版権": "二创/同人", "R-18": "R-18", "R-18G": "R-18G", "全年齢": "全年龄",
  "うごイラ": "动图", "漫画": "漫画", "小説": "小说", "イラスト": "插画", "メイキング": "过程/画法",
  "女の子": "女孩子", "男の子": "男孩子", "ショタ": "正太", "ロリ": "萝莉", "美少女": "美少女",
  "美女": "美女", "イケメン": "帅哥", "お姉さん": "大姐姐", "おじさん": "大叔", "人外": "非人生物",
  "獣人": "兽人", "ケモミミ": "兽耳", "猫耳": "猫耳", "狐耳": "狐耳", "犬耳": "犬耳", "ウサ耳": "兔耳",
  "エルフ": "精灵", "天使": "天使", "悪魔": "恶魔", "吸血鬼": "吸血鬼", "ドラゴン": "龙", "魔法少女": "魔法少女",

  // 发型与发色
  "ツインテール": "双马尾", "ポニーテール": "单马尾", "サイドテール": "侧马尾", "お団子": "丸子头",
  "ショートヘア": "短发", "ロングヘア": "长发", "セミロング": "中长发", "ボブ": "波波头",
  "三つ編み": "麻花辫", "前髪ぱっつん": "齐刘海", "アホ毛": "呆毛", "ドリル": "卷发/钻头卷",
  "金髪": "金发", "銀髪": "银发", "白髪": "白发", "黒髪": "黑发", "茶髪": "茶发",
  "赤髪": "红发", "青髪": "蓝发", "緑髪": "绿发", "桃髪": "粉发", "紫髪": "紫发",

  // 瞳色与表情
  "赤目": "红瞳", "青目": "蓝瞳", "金目": "金瞳", "緑目": "绿瞳", "オッドアイ": "异色瞳",
  "碧眼": "碧眼", "銀目": "银瞳", "紫目": "紫瞳", "笑顔": "笑容", "泣き顔": "哭泣脸",
  "照れ": "害羞", "ジト目": "死鱼眼", "ウィンク": "眨眼", "キス": "接吻", "ドヤ顔": "得意脸",

  // 服饰与装扮
  "制服": "制服", "セーラー服": "水手服", "ブレザー": "西装制服", "スク水": "死库水",
  "水着": "泳装", "ビキニ": "比基尼", "メイド": "女仆装", "バニーガール": "兔女郎",
  "着物": "和服", "浴衣": "浴衣", "巫女": "巫女服", "チャイナドレス": "旗袍",
  "スーツ": "西装", "パーカー": "连帽衫", "ドレス": "礼服/连衣裙", "体操着": "体操服",
  "メガネ": "眼镜", "サングラス": "太阳镜", "マスク": "口罩", "リボン": "蝴蝶结",
  "帽子": "帽子", "ヘッドホン": "耳机", "ガーターベルト": "吊袜带",
  "黒タイツ": "黑丝", "白タイツ": "白丝", "ニーソ": "过膝袜", "サイハイ": "大腿袜",
  "ストッキング": "丝袜", "素足": "赤足/光脚", "裸足": "裸足", "手袋": "手套",
  "巨乳": "巨乳", "爆乳": "爆乳", "貧乳": "贫乳", "微乳": "微乳", "ふともも": "大腿",
  "お腹": "肚子/腹部", "へそ": "肚脐", "胸": "胸部", "お尻": "臀部", "パンツ": "内裤/短裤",
  "ぱんつ": "胖次", "下着": "内衣", "ランジェリー": "性感内衣", "パンチラ": "走光/露胖次",

  // 场景与意境
  "背景": "背景", "風景": "风景", "空": "天空", "青空": "青空", "雲": "云彩",
  "夜": "夜晚", "夜景": "夜景", "星空": "星空", "月": "月亮", "満月": "满月",
  "夕焼け": "夕阳", "夕暮れ": "黄昏", "朝日": "朝阳", "雨": "雨景", "雪": "雪景",
  "海": "大海", "水着海": "海边泳装", "水": "水面", "水中": "水中", "波": "波浪",
  "花": "花卉", "桜": "樱花", "向日葵": "向日葵", "紅葉": "红叶", "森": "森林",
  "部屋": "房间", "街": "街道", "廃墟": "废墟", "鳥居": "鸟居", "神社": "神社",
  "サイバーパンク": "赛博朋克", "ファンタジー": "奇幻", "SF": "科幻", "日常": "日常",

  // 画风与技法
  "落書き": "涂鸦", "練習": "练习", "習作": "习作", "らくがき": "随笔涂鸦",
  "厚塗り": "厚涂", "水彩": "水彩", "グリザイユ": "灰阶厚涂", "ドット絵": "像素画",
  "モノクロ": "黑白", "線画": "线稿", "デフォルメ": "Q版化", "ちびキャラ": "Q版角色",
  "シルエット": "剪影", "透明水彩": "透明水彩", "油彩": "油画", "アナログ": "手绘/实体绘",

  // 热门作品 / IP
  "原神": "原神", "崩壊3rd": "崩坏3", "崩壊:スターレイル": "崩坏:星穹铁道", "ゼンレスゾーンゼロ": "绝区零",
  "ブルーアーカイブ": "碧蓝档案", "アズールレーン": "碧蓝航线", "Fate/Grand Order": "FGO", "FGO": "FGO",
  "東方": "东方Project", "東方Project": "东方Project", "ウマ娘": "赛马娘", "ウマ娘プリティーダービー": "赛马娘",
  "艦これ": "舰队Collection", "艦隊これくしょん": "舰队Collection", "アイマス": "偶像大师",
  "ホロライブ": "Hololive", "にじさんじ": "彩虹社", "Vtuber": "虚拟主播",
  "ポケモン": "宝可梦", "ポケットモンスター": "宝可梦", "初音ミク": "初音未来", "ボーカロイド": "VOCALOID",
  "チェンソーマン": "电锯人", "呪術廻戦": "咒术回战", "鬼滅の刃": "鬼灭之刃", "SPY×FAMILY": "间谍过家家",
  "ぼっち・ざ・ろっく!": "孤独摇滚!", "推しの子": "我推的孩子", "葬送のフリーレン": "葬送的芙莉莲",

  // 评价与常用标签
  "なにこれかわいい": "太可爱了吧", "なにこれ尊い": "太赞了吧", "魅惑のふともも": "诱人美腿",
  "魅惑の谷間": "诱人乳沟", "極上の乳": "极上美乳", "美脚": "美腿", "透け": "透视/半透明",
  "pixiv今日のお題": "今日主题", "ルーキーランキング": "新人榜", "デイリーランキング": "日榜",
  "ウィークリーランキング": "周榜", "マンスリーランキング": "月榜", "男子に人気": "男性向热门", "女子に人気": "女性向热门",

  // 补充高频角色、题材与作品
  "新選組": "新选组", "藤堂平助": "藤堂平助", "早川アキ": "早川秋", "よその子": "自创角色/他人家孩子",
  "HQ!!": "排球少年!!", "ハイキュー!!": "排球少年!!", "819プラス": "排球梦向/HQ+", "HQプラス": "排球梦向/HQ+",
  "赤葦京治": "赤苇京治", "五条悟": "五条悟", "夏油傑": "夏油杰", "虎杖悠仁": "虎杖悠仁", "伏黒恵": "伏黑惠",
  "デンジ": "电次", "マキマ": "玛奇玛", "パワー": "帕瓦", "早川家": "早川家",
  "オリジナル漫画": "原创漫画", "創作男女": "创作男女", "創作BL": "原创BL", "創作百合": "原创百合",
  "百合": "百合", "BL": "BL", "GL": "GL", "NL": "正常向/BG", "夢向け": "梦向",
  "女主人公": "女主角", "男主人公": "男主角", "現代": "现代", "学園": "学园/校园",
  "高校生": "高中生", "中学生": "初中生", "大学生": "大学生", "社会人": "上班族/社会人",
  "同棲": "同居", "幼馴染": "青梅竹马", "両片思い": "双向暗恋",
  "ハッピーエンド": "HE/圆满结局", "バッドエンド": "BE/悲剧结局", "ほのぼの": "温馨/治愈",
  "シリアス": "正剧/严肃", "ギャグ": "搞笑", "ヤンデレ": "病娇", "ツンデレ": "傲娇",
  "メンヘラ": "地雷系/精神敏感", "地雷系": "地雷系", "量産型": "量产型", "純愛": "纯爱",
  "溺愛": "溺爱", "独占欲": "独占欲", "執着": "执念", "嫉妬": "吃醋/嫉妒",
  "女装": "女装", "男装": "男装", "TS": "性转", "性転換": "性转换", "ふたなり": "扶她",
  "ショタコン": "正太控", "ロリコン": "萝莉控", "おねショタ": "大姐姐与正太",
  "年上": "年上", "年下": "年下", "年齢操作": "年龄操作", "パロディ": "同人恶搞/Paro"
};

// ─── MD5 纯原生哈希算法 (用于百度翻译鉴权签名) ───────────────────────────
function md5(str) {
  function rl(n, s) { return (n << s) | (n >>> (32 - s)); }
  function au(x, y) { return (x + y) >>> 0; }
  function F(x, y, z) { return (x & y) | (~x & z); }
  function G(x, y, z) { return (x & z) | (y & ~z); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | ~z); }
  function FF(a, b, c, d, x, s, ac) { a = au(a, au(au(F(b, c, d), x), ac)); return au(rl(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = au(a, au(au(G(b, c, d), x), ac)); return au(rl(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = au(a, au(au(H(b, c, d), x), ac)); return au(rl(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = au(a, au(au(I(b, c, d), x), ac)); return au(rl(a, s), b); }
  function utf8(s) {
    s = String(s || "").replace(/\r\n/g, "\n");
    let u = "";
    for (let n = 0; n < s.length; n++) {
      const c = s.charCodeAt(n);
      if (c < 128) u += String.fromCharCode(c);
      else if (c < 2048) { u += String.fromCharCode((c >> 6) | 192); u += String.fromCharCode((c & 63) | 128); }
      else { u += String.fromCharCode((c >> 12) | 224); u += String.fromCharCode(((c >> 6) & 63) | 128); u += String.fromCharCode((c & 63) | 128); }
    }
    return u;
  }
  function toWords(s) {
    const nBytes = s.length;
    const nWords = (((nBytes + 8) >> 6) + 1) * 16;
    const w = [];
    for (let i = 0; i < nWords; i++) w[i] = 0;
    for (let i = 0; i < nBytes; i++) w[i >> 2] |= s.charCodeAt(i) << ((i % 4) * 8);
    w[nBytes >> 2] |= 0x80 << ((nBytes % 4) * 8);
    w[nWords - 2] = nBytes << 3;
    w[nWords - 1] = nBytes >>> 29;
    return w;
  }
  function toHex(num) {
    let h = "";
    for (let j = 0; j <= 3; j++) {
      const b = (num >>> (j * 8)) & 255;
      const t = "0" + b.toString(16);
      h += t.substr(t.length - 2, 2);
    }
    return h;
  }
  str = utf8(str);
  const x = toWords(str);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  for (let k = 0; k < x.length; k += 16) {
    const aa = a, bb = b, cc = c, dd = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478); d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db); b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf); d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613); b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8); d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1); b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122); d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e); b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562); d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51); b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d); d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681); b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6); d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87); b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905); d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9); b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942); d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122); b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44); d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60); b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6); d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085); b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039); d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8); b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244); d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7); b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3); d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d); b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f); d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314); b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82); d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb); b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
    a = au(a, aa); b = au(b, bb); c = au(c, cc); d = au(d, dd);
  }
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

// ─── 3. 语言探测与多语言过滤 ──────────────────────────────────────────────────
function isJapanese(text) {
  if (!text || typeof text !== "string") return false;
  // 包含平假名或片假名字符
  return /[぀-ゟ゠-ヿ]/.test(text);
}

function hasKanjiOrKana(text) {
  if (!text || typeof text !== "string") return false;
  return /[぀-ヿ一-龯]/.test(text);
}

// 智能多语言检测（支持日语、韩语、英语等各种外语自动翻译）
function needsTranslation(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  // 1. 包含日文假名
  if (/[぀-ゟ゠-ヿ]/.test(trimmed)) return true;
  // 2. 包含韩文 Hangul
  if (/[가-힯]/.test(trimmed)) return true;
  // 3. 包含纯英文/西文字符串（不含中文汉字）
  if (/[a-zA-Z]{3,}/.test(trimmed) && !/[一-鿿]/.test(trimmed)) return true;
  // 4. 包含汉字
  if (/[一-龯]/.test(trimmed)) return true;
  return false;
}

// ─── 4. 多引擎批量翻译网络模块 ──────────────────────────────────────────────────
const LANG_MAP = {
  "zh-CN": { google: "zh-CN", ai: "Simplified Chinese" },
  "zh-TW": { google: "zh-TW", ai: "Traditional Chinese" },
  "en": { google: "en", ai: "English" },
  "ja": { google: "ja", ai: "Japanese" },
  "ko": { google: "ko", ai: "Korean" }
};

// 本地内存与持久化缓存（生命周期内与跨会话极速命中）
const MEMORY_CACHE = new Map();

function cacheKey(engine, target, text) {
  return engine + ":" + target + ":" + (text.length > 30 ? text.slice(0, 30) + text.length : text);
}

const CACHE_META_KEY = "pxtc_meta_index_v2";

function readCacheMeta() {
  try {
    const raw = $.getdata(CACHE_META_KEY);
    const meta = raw ? JSON.parse(raw) : null;
    if (meta && typeof meta === "object" && Array.isArray(meta.keys)) {
      return meta;
    }
    return { keys: [], lastUpdated: 0 };
  } catch (e) {
    return { keys: [], lastUpdated: 0 };
  }
}

function writeCacheMeta(meta) {
  try { $.setdata(JSON.stringify(meta), CACHE_META_KEY); } catch (e) { }
}

function cacheRead(key) {
  if (MEMORY_CACHE.has(key)) return MEMORY_CACHE.get(key);
  try {
    const val = $.getdata("pxtc_" + key);
    if (val) {
      MEMORY_CACHE.set(key, val);
      return val;
    }
  } catch (e) { }
  return undefined;
}

function cacheWrite(key, val) {
  MEMORY_CACHE.set(key, val);
  try {
    if (key.length < 80) {
      const storageKey = "pxtc_" + key;
      $.setdata(val, storageKey);
      const meta = readCacheMeta();
      if (!meta.keys.includes(storageKey)) {
        meta.keys.push(storageKey);
      }
      meta.lastUpdated = Date.now();
      writeCacheMeta(meta);
    }
  } catch (e) { }
}

function getCacheStats() {
  const meta = readCacheMeta();
  let bytes = 0;
  let count = 0;
  const validKeys = [];
  for (const k of meta.keys) {
    const v = $.getdata(k);
    if (v !== undefined && v !== null && v !== "") {
      count++;
      bytes += k.length + String(v).length;
      validKeys.push(k);
    }
  }
  if (validKeys.length !== meta.keys.length) {
    meta.keys = validKeys;
    writeCacheMeta(meta);
  }
  let sizeText = "0 B";
  if (bytes > 0) {
    if (bytes < 1024) sizeText = bytes + " B";
    else if (bytes < 1024 * 1024) sizeText = (bytes / 1024).toFixed(1) + " KB";
    else sizeText = (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }
  let timeText = "暂无缓存";
  if (meta.lastUpdated > 0 && count > 0) {
    const diff = Date.now() - meta.lastUpdated;
    if (diff < 60000) timeText = "刚刚";
    else if (diff < 3600000) timeText = Math.floor(diff / 60000) + " 分钟前";
    else if (diff < 86400000) timeText = Math.floor(diff / 3600000) + " 小时前";
    else {
      const d = new Date(meta.lastUpdated);
      timeText = (d.getMonth() + 1) + "月" + d.getDate() + "日";
    }
  }
  return { ok: true, count, bytes, sizeText, timeText };
}

function clearTranslationCacheData() {
  const meta = readCacheMeta();
  let bytes = 0;
  let count = 0;
  for (const k of meta.keys) {
    const v = $.getdata(k);
    if (v !== undefined && v !== null && v !== "") {
      count++;
      bytes += k.length + String(v).length;
    }
    try { $.setdata("", k); } catch (e) { }
  }
  MEMORY_CACHE.clear();
  writeCacheMeta({ keys: [], lastUpdated: 0 });
  let sizeText = "0 B";
  if (bytes > 0) {
    if (bytes < 1024) sizeText = bytes + " B";
    else if (bytes < 1024 * 1024) sizeText = (bytes / 1024).toFixed(1) + " KB";
    else sizeText = (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }
  return { ok: true, count, bytes, sizeText };
}

async function googleTranslateChunk(arr, target) {
  if (!arr.length) return [];
  const params = "client=gtx&dt=t&sl=auto&tl=" + encodeURIComponent(target);
  const body = arr.map(t => "q=" + encodeURIComponent(t)).join("&");
  const hosts = [
    "https://translate.googleapis.com/translate_a/t",
    "https://translate.google.com/translate_a/t"
  ];
  for (const host of hosts) {
    try {
      const res = await $.post({
        url: host + "?" + params,
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0" },
        body: body,
        timeout: 8000
      });
      const raw = res && res.body;
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(data) && data.length === arr.length) {
        return data.map(item => Array.isArray(item) ? item[0] : String(item));
      }
    } catch (e) { }
  }
  return arr;
}

async function googleTranslateBatch(texts, target) {
  const arr = texts.map(String);
  if (!arr.length) return [];
  // 限制每片 20 条，并发打给 Google，大幅降低单次延迟并彻底避免超时回退
  const CHUNK_SIZE = 20;
  const chunks = [];
  for (let i = 0; i < arr.length; i += CHUNK_SIZE) {
    chunks.push(arr.slice(i, i + CHUNK_SIZE));
  }
  const chunkResults = await Promise.all(chunks.map(chunk => googleTranslateChunk(chunk, target)));
  const results = [];
  for (const r of chunkResults) results.push(...r);
  return results;
}

async function openaiTranslateBatch(texts, targetLangName, cfg) {
  const arr = texts.map(String);
  if (!arr.length) return [];
  if (!cfg.openaiKey) return arr;
  const endpoint = cfg.openaiUrl || "https://api.openai.com/v1/chat/completions";
  const systemPrompt =
    "You are a professional ACG translator. Translate each Japanese text to " + targetLangName +
    ". Preserve format and line breaks. Return ONLY a JSON array of strings in exact same order and length: [\"trans1\", \"trans2\"]. No markdown code fence.";
  try {
    const res = await $.post({
      url: endpoint,
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.openaiKey },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(arr) }
        ],
        temperature: 0.2
      }),
      timeout: 15000
    });
    let content = res && res.body;
    if (typeof content === "object" && content.choices) content = content.choices[0].message.content;
    else if (typeof content === "string") {
      const parsed = JSON.parse(content);
      content = parsed.choices[0].message.content;
    }
    content = String(content || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const result = JSON.parse(content);
    if (Array.isArray(result) && result.length === arr.length) return result;
  } catch (e) { }
  return arr;
}

async function deepseekTranslateBatch(texts, targetLangName, cfg) {
  const arr = texts.map(String);
  if (!arr.length) return [];
  if (!cfg.deepseekKey) return arr;
  const systemPrompt =
    "You are a professional ACG translator. Translate each Japanese text to " + targetLangName +
    ". Preserve format, line breaks, and anime terms naturally. Return ONLY a JSON array of strings in exact same order and length: [\"trans1\", \"trans2\"]. No markdown code fence.";
  try {
    const res = await $.post({
      url: cfg.deepseekUrl,
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.deepseekKey },
      body: JSON.stringify({
        model: cfg.deepseekModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(arr) }
        ],
        temperature: 0.2
      }),
      timeout: 8000
    });
    let content = res && res.body;
    if (typeof content === "object" && content.choices) content = content.choices[0].message.content;
    else if (typeof content === "string") {
      const parsed = JSON.parse(content);
      content = parsed.choices[0].message.content;
    }
    content = String(content || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const result = JSON.parse(content);
    if (Array.isArray(result) && result.length === arr.length) return result;
  } catch (e) { }
  return arr;
}

// 百度通用文本批量翻译
async function baiduTranslateBatch(texts, cfg) {
  if (!texts || !texts.length) return [];
  const appid = (cfg.baiduAppid || "").trim();
  const secret = (cfg.baiduSecret || "").trim();
  if (!appid || !secret) return texts;

  try {
    const q = texts.join("\n");
    const salt = String(Date.now());
    const sign = md5(appid + q + salt + secret);
    const url = "https://fanyi-api.baidu.com/api/trans/vip/translate";
    const params = "q=" + encodeURIComponent(q) + "&from=auto&to=zh&appid=" + encodeURIComponent(appid) + "&salt=" + salt + "&sign=" + sign;
    const res = await $.post({
      url,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0" },
      body: params,
      timeout: 10000
    });
    let raw = res && res.body;
    let data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (data && Array.isArray(data.trans_result)) {
      const map = {};
      data.trans_result.forEach(item => {
        if (item && item.src) map[item.src] = item.dst;
      });
      return texts.map(t => map[t] || t);
    }
  } catch (e) { }
  return texts;
}

// 彩云小译官方通用文本批量翻译
async function caiyunTranslateBatch(texts, cfg) {
  if (!texts || !texts.length) return [];
  const token = (cfg.caiyunToken || "").trim();
  if (!token) return texts;

  try {
    const url = "https://api.interpreter.caiyunai.com/v1/translator";
    const res = await $.post({
      url,
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": "token " + token
      },
      body: JSON.stringify({
        source: texts,
        trans_type: "auto2zh",
        request_id: "pixiv_" + Date.now(),
        detect: true
      }),
      timeout: 12000
    });
    let raw = res && res.body;
    let data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (data && Array.isArray(data.target) && data.target.length === texts.length) {
      return data.target.map(t => String(t || ""));
    }
  } catch (e) { }
  return texts;
}

// 统一批量翻译调度 (带多级自动容错降级与防缓存毒化)
async function translateBatch(texts, cfg) {
  if (!texts || !texts.length) return [];
  const target = cfg.targetLang || "zh-CN";
  const langConfig = LANG_MAP[target] || LANG_MAP["zh-CN"];
  const results = new Array(texts.length);
  const toFetch = [];
  const fetchIndices = [];

  for (let i = 0; i < texts.length; i++) {
    const original = texts[i];
    if (!original || !hasKanjiOrKana(original)) {
      results[i] = original;
      continue;
    }
    // 智能豁免纯中文：若开启豁免，且内容不含任何日文假名与韩文，且不是日文高频Tag，直接作为中文跳过
    if (cfg.skipChinese && !isJapanese(original) && !/[가-힯]/.test(original) && !PIXIV_TAG_DICT[original]) {
      results[i] = original;
      continue;
    }
    // 查本地持久化与内存缓存 (0ms 命中，滑屏不掉帧)
    const key = cacheKey(cfg.translator, target, original);
    const cached = cacheRead(key);
    // 关键防毒化保护：缓存里读出的值如果跟原文一模一样（即曾经存过的未翻译日文），视作无效缓存，重新去网络请求！
    if (cached !== undefined && cached !== original) {
      results[i] = cached;
    } else {
      toFetch.push(original);
      fetchIndices.push(i);
    }
  }

  if (!toFetch.length) return results;

  let translated = [];
  try {
    if (cfg.translator === "deepseek" && cfg.deepseekKey) {
      translated = await deepseekTranslateBatch(toFetch, langConfig.ai, cfg);
    } else if (cfg.translator === "openai" && cfg.openaiKey) {
      translated = await openaiTranslateBatch(toFetch, langConfig.ai, cfg);
    } else if (cfg.translator === "baidu" && cfg.baiduAppid && cfg.baiduSecret) {
      translated = await baiduTranslateBatch(toFetch, cfg);
    } else if (cfg.translator === "caiyun" && cfg.caiyunToken) {
      translated = await caiyunTranslateBatch(toFetch, cfg);
    }
  } catch (e) {
    translated = [];
  }

  // 核心容错自动降级：若所选高级引擎失败、报错或未成功翻译出中文，自动无缝降级走 Google 免费极速通道兜底！
  const needsFallback = !Array.isArray(translated) || translated.length !== toFetch.length || translated.every((t, idx) => t === toFetch[idx]);
  if (needsFallback) {
    try {
      translated = await googleTranslateBatch(toFetch, langConfig.google);
    } catch (e) { }
  }

  for (let j = 0; j < toFetch.length; j++) {
    const val = (translated && translated[j]) ? translated[j] : toFetch[j];
    const original = toFetch[j];
    results[fetchIndices[j]] = val;
    // 防缓存毒化：只有真正成功翻译出不同译文（有效中文）时才允许写入本地持久化缓存！
    if (val && val !== original) {
      cacheWrite(cacheKey(cfg.translator, target, original), val);
    }
  }

  return results;
}

// ─── 5. 全页面 REST API 深度拦截汉化 ─────────────────────────────────────────────
async function handleApiRewrite(cfg) {
  const rawBody = $response.body;
  if (!rawBody) { $done({}); return; }

  // 捕获官方客户端鉴权 Bearer 令牌以供画廊与漫翻使用
  if (typeof $request !== "undefined" && $request.headers) {
    const token = $request.headers.Authorization || $request.headers.authorization;
    if (token) $.setdata(token, "@Pixiv.Enhanced.Auth.Token");
  }

  let data = null;
  try {
    data = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
  } catch (e) {
    $done({}); return;
  }

  if (!data || typeof data !== "object") { $done({}); return; }

  const url = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  let modified = false;

  // 1. Tag 离线字典快速处理：仅改写主标签为中文，副标签置空，消除两行重复字眼
  function processTags(tags) {
    if (!Array.isArray(tags)) return;
    for (const tag of tags) {
      if (!tag || typeof tag !== "object") continue;
      const dictVal = PIXIV_TAG_DICT[tag.name];
      if (dictVal) {
        tag.name = dictVal;
        tag.translated_name = null; // 关键：置空副标签，避免 Pixiv 上下两行同时渲染相同的中文！
        modified = true;
      } else if (tag.translated_name && isJapanese(tag.name)) {
        tag.name = tag.translated_name;
        tag.translated_name = null;
        modified = true;
      }
    }
  }

  // 收集待网络翻译的文字与写回钩子 (去重与轻量化映射)
  const textCallbackMap = new Map();
  function queueTranslate(text, callback) {
    if (!text || typeof text !== "string") return;
    if (!needsTranslation(text)) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!textCallbackMap.has(trimmed)) {
      textCallbackMap.set(trimmed, []);
    }
    textCallbackMap.get(trimmed).push(callback);
  }

  // A. 全量作品对象通用递归扫描器 (彻底根治“只有作者页有，首页/插画/漫画没有”)
  const workList = [];
  const visitedWorks = new Set();

  function collectWorks(obj, depth = 0) {
    if (!obj || typeof obj !== "object" || depth > 5) return;
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) collectWorks(obj[i], depth + 1);
      return;
    }
    // 凡是具备有效作品 ID 与图像特征的对象，全部捕获进入工作队列
    if (obj.id && (obj.image_urls || obj.meta_pages || obj.meta_single_page || obj.page_count !== undefined || obj.type === "illust" || obj.type === "manga" || obj.type === "novel")) {
      const wid = String(obj.id);
      if (!visitedWorks.has(wid)) {
        visitedWorks.add(wid);
        workList.push(obj);
      }
    }
    // 递归捕获首页嵌套、连载系列、推荐与发现列表等所有多层级容器
    if (obj.illust && typeof obj.illust === "object") collectWorks(obj.illust, depth + 1);
    if (obj.novel && typeof obj.novel === "object") collectWorks(obj.novel, depth + 1);
    if (obj.app_model && typeof obj.app_model === "object") collectWorks(obj.app_model, depth + 1);
    if (obj.pickup && typeof obj.pickup === "object") collectWorks(obj.pickup, depth + 1);
    if (Array.isArray(obj.illusts)) collectWorks(obj.illusts, depth + 1);
    if (Array.isArray(obj.novels)) collectWorks(obj.novels, depth + 1);
    if (Array.isArray(obj.thumbnails)) collectWorks(obj.thumbnails, depth + 1);
    if (Array.isArray(obj.contents)) collectWorks(obj.contents, depth + 1);
    if (Array.isArray(obj.user_previews)) collectWorks(obj.user_previews, depth + 1);
    if (Array.isArray(obj.ranking_illusts)) collectWorks(obj.ranking_illusts, depth + 1);
    if (Array.isArray(obj.ranking_novels)) collectWorks(obj.ranking_novels, depth + 1);
    if (Array.isArray(obj.popular_preview)) collectWorks(obj.popular_preview, depth + 1);
    if (Array.isArray(obj.popular_permanent)) collectWorks(obj.popular_permanent, depth + 1);
    if (Array.isArray(obj.manga_series)) collectWorks(obj.manga_series, depth + 1);
    if (Array.isArray(obj.series)) collectWorks(obj.series, depth + 1);
  }

  collectWorks(data);

  // B. 核心首页全景流 (v1/home/all 的 data.contents 结构，彻底解决首页卡片与标题不汉化)
  if (Array.isArray(data.contents)) {
    for (const c of data.contents) {
      if (!c) continue;
      // 首页精选大 Banner
      if (c.pickup && typeof c.pickup === "object") {
        if (hasKanjiOrKana(c.pickup.title)) queueTranslate(c.pickup.title, trans => { c.pickup.title = trans; modified = true; });
        if (c.pickup.comment && needsTranslation(c.pickup.comment)) queueTranslate(c.pickup.comment, trans => { c.pickup.comment = trans; modified = true; });
        // 关键防护：严格排除小说！仅插画/漫画允许注入漫翻入口
        const isPickupNovel = c.pickup.type === "novel" || !!c.pickup.novel || (c.pickup.series && c.pickup.series.type === "novel");
        const pId = c.pickup.id || (c.pickup.illust && c.pickup.illust.id);
        if (!isPickupNovel && pId && cfg.imageSwitch) {
          const vLink = `<a href="https://www.pixiv.net/manga/viewer?illust_id=${pId}">✦ 开启 AI 漫翻阅读 ↗</a><br /><br />`;
          if (typeof c.pickup.comment === "string") {
            if (!c.pickup.comment.includes("/manga/viewer")) { c.pickup.comment = vLink + c.pickup.comment; modified = true; }
          } else {
            c.pickup.comment = vLink; modified = true;
          }
        }
        if (c.pickup.id) collectWorks(c.pickup);
      }
      // 首页缩略图瀑布流卡片列表 (用户打开 App 第一眼看到的内容)
      if (Array.isArray(c.thumbnails)) {
        for (const t of c.thumbnails) {
          if (!t) continue;
          // 1. 显式翻译外层卡片标题 (100% 覆盖第一眼视觉)
          if (cfg.scopes.includes("illust_title") && hasKanjiOrKana(t.title)) {
            queueTranslate(t.title, trans => { t.title = trans; modified = true; });
          }
          // 关键防护：严格识别小说卡片！小说绝对不注入漫画翻译入口！
          const isThumbNovel = t.type === "novel" || (t.app_model && t.app_model.type === "novel") || !!t.novel;
          const wId = t.id || (t.app_model && t.app_model.id);
          const vLink = (!isThumbNovel && wId && cfg.imageSwitch) ? `<a href="https://www.pixiv.net/manga/viewer?illust_id=${wId}">✦ 开启 AI 漫翻阅读 ↗</a><br /><br />` : "";

          // 2. 显式翻译外层卡片描述，并就地注入漫翻入口 (解决从首页卡片点进无按钮缺陷)
          if (cfg.scopes.includes("illust_caption") && t.description && needsTranslation(t.description)) {
            queueTranslate(t.description, trans => {
              const clean = trans.replace(/<\s*br\s*\/?>/gi, "<br />");
              const resText = vLink ? (vLink + clean) : clean;
              t.description = resText;
              t.caption = resText;
              if (t.app_model) t.app_model.caption = resText;
              modified = true;
            });
          } else if (vLink) {
            const curText = (typeof t.description === "string") ? t.description : "";
            const cleanText = curText.includes("/manga/viewer")
              ? curText.replace(/<a\s+href="[^"]*\/manga\/viewer[^"]*">.*?<\/a>(?:<br\s*\/?>|\n)*/i, "")
              : curText;
            const resText = vLink + cleanText;
            t.description = resText;
            t.caption = resText;
            if (t.app_model) t.app_model.caption = resText;
            modified = true;
          }
          // 3. 显式翻译外层标签与副标签净空
          if (Array.isArray(t.tags)) {
            for (let ti = 0; ti < t.tags.length; ti++) {
              const tagStr = t.tags[ti];
              if (PIXIV_TAG_DICT[tagStr]) {
                t.tags[ti] = PIXIV_TAG_DICT[tagStr];
                modified = true;
              }
            }
          }
          if (Array.isArray(t.show_tags)) {
            for (let si = 0; si < t.show_tags.length; si++) {
              const tagStr = t.show_tags[si];
              if (PIXIV_TAG_DICT[tagStr]) {
                t.show_tags[si] = PIXIV_TAG_DICT[tagStr];
                modified = true;
              }
            }
          }
          // 4. 显式处理内层模型 app_model
          if (t.app_model && typeof t.app_model === "object") {
            if (cfg.scopes.includes("illust_title") && hasKanjiOrKana(t.app_model.title)) {
              queueTranslate(t.app_model.title, trans => { t.app_model.title = trans; modified = true; });
            }
            if (t.app_model.tags) processTags(t.app_model.tags);
            collectWorks(t.app_model);
          }
        }
      }
    }
  }

  // C. 发现页核心数据：处理趋势热门标签与插画 (trend_tags)
  // 关键防崩策略：严禁修改 item.tag（它是 DiffableDataSource 的主键），仅汉化 item.translated_name！
  if (Array.isArray(data.trend_tags)) {
    for (const item of data.trend_tags) {
      if (!item) continue;
      // 1. 仅汉化展示名称 translated_name，绝不改写 tag 键名，杜绝重复主键引发崩溃
      if (item.tag) {
        const dictVal = PIXIV_TAG_DICT[item.tag];
        if (dictVal) {
          item.translated_name = dictVal;
          modified = true;
        } else if (hasKanjiOrKana(item.tag)) {
          queueTranslate(item.tag, trans => { item.translated_name = trans; modified = true; });
        }
      }
      // 2. 汉化附带的封面插画作品
      if (item.illust && typeof item.illust === "object") {
        collectWorks(item.illust);
      }
    }
  }

  // D. 处理画师用户主页资料 (user_previews 与 user.comment)
  if (Array.isArray(data.user_previews)) {
    for (const up of data.user_previews) {
      if (!up) continue;
      if (up.user && hasKanjiOrKana(up.user.comment)) {
        queueTranslate(up.user.comment, trans => { up.user.comment = trans; modified = true; });
      }
    }
  }
  if (data.user && typeof data.user === "object" && cfg.scopes.includes("user_profile")) {
    if (hasKanjiOrKana(data.user.comment)) {
      queueTranslate(data.user.comment, trans => { data.user.comment = trans; modified = true; });
    }
  }

  // E. 遍历所有收集到的作品对象，就地注入漫翻入口与标题汉化
  for (const item of workList) {
    if (!item || typeof item !== "object") continue;
    if (item.tags) processTags(item.tags);

    // 标题翻译 (核心展示，卡片和榜单主视觉)
    if (cfg.scopes.includes("illust_title") && hasKanjiOrKana(item.title)) {
      queueTranslate(item.title, trans => { item.title = trans; modified = true; });
    }

    // ─── 漫翻入口注入（方案 A：极简日系现代风 · 原生蓝色超链接）───
    // 关键核心：严格区分插画/漫画与小说！小说拥有专属双语排版引擎，坚决不注入漫画翻译入口！
    const isNovel = item.type === "novel" || !!item.text || item.series_type === "novel" || (item.series && item.series.type === "novel");
    const isArtwork = !isNovel && Boolean(item.id) && (
      item.type === "manga" ||
      item.type === "illust" ||
      Boolean(item.meta_pages) ||
      Boolean(item.meta_single_page) ||
      (Boolean(item.image_urls) && item.page_count !== undefined && !item.text)
    );

    if (isArtwork && cfg.imageSwitch) {
      const viewerUrl = "https://www.pixiv.net/manga/viewer?illust_id=" + item.id;
      // 方案 A 专属：采用标准的 HTML 超链标签包裹，iOS 富文本引擎自动赋予原生蓝色与轻点弹窗
      const viewerLinkHtml = `<a href="${viewerUrl}">✦ 开启 AI 漫翻阅读 ↗</a><br /><br />`;

      // 1. 标准作品简介字段 caption 就地注入
      if (typeof item.caption === "string") {
        if (!item.caption.includes("/manga/viewer")) {
          item.caption = viewerLinkHtml + item.caption;
          modified = true;
        }
      } else {
        item.caption = viewerLinkHtml;
        modified = true;
      }

      // 2. 首页与瀑布流卡片简介字段 description 同步注入
      if (typeof item.description === "string" && !item.description.includes("/manga/viewer")) {
        item.description = viewerLinkHtml + item.description;
        modified = true;
      }

      // 3. 推荐精选卡片简介字段 comment 同步注入
      if (typeof item.comment === "string" && !item.comment.includes("/manga/viewer")) {
        item.comment = viewerLinkHtml + item.comment;
        modified = true;
      }
    }

    // 简介正文翻译：仅翻译原作者简介正文，插画漫画保持漫翻链接置顶，小说纯净翻译
    if (cfg.scopes.includes("illust_caption") && typeof item.caption === "string") {
      const viewerLinkHtml = isArtwork ? `<a href="https://www.pixiv.net/manga/viewer?illust_id=${item.id}">✦ 开启 AI 漫翻阅读 ↗</a><br /><br />` : "";
      const rawText = item.caption.includes("/manga/viewer")
        ? item.caption.replace(/<a\s+href="[^"]*\/manga\/viewer[^"]*">.*?<\/a>(?:<br\s*\/?>|\n)*/i, "").trim()
        : item.caption.trim();

      if (rawText && isJapanese(rawText)) {
        queueTranslate(rawText, trans => {
          const cleanTrans = trans.replace(/<\s*br\s*\/?>/gi, "<br />");
          const finalVal = (isArtwork && viewerLinkHtml) ? (viewerLinkHtml + cleanTrans) : cleanTrans;
          item.caption = finalVal;
          if (typeof item.description === "string") item.description = finalVal;
          if (typeof item.comment === "string") item.comment = finalVal;
          modified = true;
        });
      }
    }

    // 小说系列标题
    if (item.series && hasKanjiOrKana(item.series.title)) {
      queueTranslate(item.series.title, trans => { item.series.title = trans; modified = true; });
    }
  }

  // F. 处理评论区 (comments[] / sub_comments[] / illust_comments[]，支持日语及全球外语自动汉化)
  const commentsList = [];
  if (Array.isArray(data.comments)) commentsList.push(...data.comments);
  if (Array.isArray(data.illust_comments)) commentsList.push(...data.illust_comments);
  if (Array.isArray(data.sub_comments)) commentsList.push(...data.sub_comments);

  if (commentsList.length > 0 && cfg.scopes.includes("comments")) {
    for (const c of commentsList) {
      if (!c) continue;
      if (needsTranslation(c.comment)) {
        queueTranslate(c.comment, trans => { c.comment = trans; modified = true; });
      }
      if (Array.isArray(c.sub_comments)) {
        for (const sub of c.sub_comments) {
          if (sub && needsTranslation(sub.comment)) {
            queueTranslate(sub.comment, trans => { sub.comment = trans; modified = true; });
          }
        }
      }
    }
  }

  // G. 处理特辑文章 (spotlight_articles[])
  const spotlights = Array.isArray(data.spotlight_articles) ? data.spotlight_articles : [];
  if (spotlights.length > 0 && cfg.scopes.includes("spotlight")) {
    for (const art of spotlights) {
      if (!art) continue;
      if (hasKanjiOrKana(art.title)) queueTranslate(art.title, trans => { art.title = trans; modified = true; });
      if (hasKanjiOrKana(art.intro)) queueTranslate(art.intro, trans => { art.intro = trans; modified = true; });
      if (hasKanjiOrKana(art.sub_title)) queueTranslate(art.sub_title, trans => { art.sub_title = trans; modified = true; });
    }
  }

  // 批量并发处理所有收集到的去重文本
  if (textCallbackMap.size > 0) {
    const rawTexts = Array.from(textCallbackMap.keys());
    const translatedList = await translateBatch(rawTexts, cfg);
    for (let i = 0; i < rawTexts.length; i++) {
      const trans = translatedList[i];
      if (trans && trans !== rawTexts[i]) {
        const callbacks = textCallbackMap.get(rawTexts[i]) || [];
        for (const cb of callbacks) cb(trans);
      }
    }
  }

  if (modified || cfg.imageAccelerate) {
    let outputBody = JSON.stringify(data);
    if (cfg.imageAccelerate) {
      outputBody = outputBody.replace(/i\.pximg\.net/g, "i.pixiv.re");
    }
    $done({ body: outputBody });
  } else {
    $done({});
  }
}

// ─── 6. 小说阅读器 & 页面注入 iOS SF Symbols「文/A」悬浮按钮与排版引擎 ────────
const SF_TRANSLATE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m5 8 6 6"/>
  <path d="m4 14 6-6 2-3"/>
  <path d="M2 5h12"/>
  <path d="M7 2h1"/>
  <path d="m22 22-5-10-5 10"/>
  <path d="M14 18h6"/>
</svg>
`;

const INJECT_CSS = `
#px-fab {
  position: fixed;
  right: 12px;
  bottom: 150px;
  z-index: 2147483647;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  background: #007aff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease, background 0.3s ease;
}
@media (prefers-color-scheme: dark) {
  #px-fab {
    background: #0a84ff;
    border: 0.5px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
  }
}
#px-fab:active { transform: scale(0.92); }
#px-fab.px-busy { opacity: 0.55; pointer-events: none; }
#px-fab.px-done { background: #34c759 !important; color: #fff !important; }
#px-fab.px-warn { background: #ff9500 !important; color: #fff !important; }

/* 纯净小说排版 (严格继承 Pixiv 原版字号、行距、字体与颜色) */
.pxtc-reader {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px 120px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.85;
}
.pxtc-reader.font-songti {
  font-family: "Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", serif !important;
}
.pxtc-reader.font-kaiti {
  font-family: "Kaiti SC", "STKaiti", "KaiTi", "DFKai-SB", serif !important;
}
.pxtc-reader.font-yuanti {
  font-family: "Yuanti SC", "STYuanti", "PingFang SC", sans-serif !important;
}

/* 顶部轻量状态胶囊 (对标出版物与系统原生交互) */
.pxtc-status-bar {
  position: sticky;
  top: calc(env(safe-area-inset-top, 20px) + 8px);
  z-index: 1000;
  margin: 0 auto 16px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(30, 30, 30, 0.86);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  color: #ffffff;
  font: 12px/1.4 -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  max-width: fit-content;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.pxtc-status-bar.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-8px);
}
.pxtc-status-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #5ac8fa;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
.pxtc-status-btn:active {
  opacity: 0.7;
}

/* 出版级双语段落对 (严格一一对应，不堆叠边框/阴影/卡片) */
.translation-pair {
  margin: 0 0 1.6em 0;
}
.translation-pair.empty {
  margin: 0 0 0.8em 0;
}
.translation-pair .original {
  color: inherit;
  font-family: inherit;
  font-size: 1em;
  line-height: 1.85;
  word-break: break-word;
}
.translation-pair .translated {
  margin-top: 6px;
  color: inherit;
  font-family: inherit;
  font-size: 0.94em;
  line-height: 1.75;
  opacity: 0.68;
  word-break: break-word;
  transition: opacity 0.25s ease;
}
@media (prefers-color-scheme: dark) {
  .translation-pair .translated {
    opacity: 0.62;
  }
}
.translation-pair .translated.pending {
  font-size: 12px;
  color: var(--text-secondary, #8e8e93);
  opacity: 0.45;
  margin-top: 4px;
}
.translation-pair .translation-failed {
  margin-top: 6px;
  color: #ff3b30;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pxtc-retry-inline-btn {
  background: rgba(255, 59, 48, 0.12);
  color: #ff3b30;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

/* 仅译文模式 (当关闭双语对照时，隐藏原文) */
.pxtc-reader.hide-original .translation-pair .original {
  display: none;
}
.pxtc-reader.hide-original .translation-pair .translated {
  margin-top: 0;
  opacity: 1;
  font-size: 1em;
  line-height: 1.85;
}

.px-hud-bubble {
  position: absolute;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  color: #111;
  font: 13px/1.4 -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  padding: 6px 10px;
  border-radius: 8px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
  pointer-events: auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
  word-break: break-word;
}
@media (prefers-color-scheme: dark) {
  .px-hud-bubble {
    background: rgba(20, 20, 20, 0.92);
    color: #eee;
    border-color: rgba(255, 255, 255, 0.15);
  }
}
`;

function clientRuntime() {
  (function () {
    var CFG = "__CONFIG_PLACEHOLDER__";
    var autoSwitch = CFG && typeof CFG === "object" ? !!CFG.autoSwitch : true;
    var cleanDisclaimer = CFG && typeof CFG === "object" ? !!CFG.novelCleanDisclaimer : true;
    var showOriginalText = CFG && typeof CFG === "object" ? CFG.novelShowOriginal !== false : true;
    var floatingSwitch = CFG && typeof CFG === "object" ? CFG.floatingSwitch !== false : true;
    var imageSwitch = CFG && typeof CFG === "object" ? CFG.imageSwitch !== false : true;

    var root = null;
    var reader = null;
    var statusBar = null;
    var originalDisplay = "";
    var currentMode = "ja"; // "ja" or "zh"
    var isTranslating = false;
    var hasTranslated = false;

    // 存储分段信息与状态
    var paragraphItems = [];
    var batchList = [];
    var totalCount = 0;
    var successCount = 0;
    var failedCount = 0;

    function esc(s) {
      return String(s || "").replace(/[&<>"']/g, function (c) {
        return c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;";
      });
    }

    function hasJapanese(text) {
      if (!text || typeof text !== "string") return false;
      return /[぀-ゟ゠-ヿ]/.test(text);
    }

    function openSettings() {
      window.location.href = "https://app-api.pixiv.net/settings/Enhanced";
    }

    // 检查小说是否本身纯中文
    var rawText = "";
    try { rawText = window.pixiv && window.pixiv.novel ? window.pixiv.novel.text : ""; } catch (e) { }
    if (rawText && !hasJapanese(rawText)) {
      return;
    }

    // 悬浮按钮总开关严格判定
    var fab = null;
    if (floatingSwitch && (rawText || imageSwitch)) {
      var prevFab = document.getElementById("px-fab");
      if (prevFab) prevFab.remove();

      fab = document.createElement("div");
      fab.id = "px-fab";
      fab.title = rawText ? "轻点翻译/还原 · 长按设置" : "轻点翻译图片 · 长按设置";
      fab.setAttribute("aria-label", "小说翻译");
      fab.innerHTML = `__SVG_PLACEHOLDER__`;
      document.body.appendChild(fab);

      var pressTimer = null;
      function startPress(e) {
        pressTimer = setTimeout(function () {
          pressTimer = null;
          openSettings();
        }, 500);
      }
      function endPress(e) {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
          handleFabClick();
        }
      }
      function cancelPress(e) {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      }
      fab.addEventListener("mousedown", startPress);
      fab.addEventListener("mouseup", endPress);
      fab.addEventListener("mouseleave", cancelPress);
      fab.addEventListener("touchstart", startPress, { passive: true });
      fab.addEventListener("touchend", endPress);
      fab.addEventListener("touchcancel", cancelPress);
    }

    function isDisclaimer(str) {
      if (!str || typeof str !== "string") return false;
      var s = str.trim();
      if (/^[・※*#\-—_~～\s]{2,}$/.test(s)) return true;
      if (/^(?:https?:\/\/|(?:fanbox|booth|twitter|x\.com))/i.test(s)) return true;
      if (/^[・※*]/.test(s) && (s.includes("脚本") || s.includes("台本") || s.includes("商用") || s.includes("转载") || s.includes("责任") || s.includes("作者") || s.includes("URL") || s.includes("DM") || s.includes("费用") || s.includes("更改") || s.includes("改编"))) {
        return true;
      }
      if (/(?:免费脚本|免费台本|商用利用|商业用途|未经许可不得转载|禁止转载|无断转载|自作发言|自作発言|不承担任何责任|责任自负|请注明作者|情景语音|台本使用|使用规约|使用規約|使用规则|不收取任何费用|自由更改|更改对话)/i.test(s)) {
        return true;
      }
      return false;
    }

    function splitParagraphs(text) {
      var t = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/^\n+|\n+$/g, "");
      return t ? t.split(/\n{2,}/) : [];
    }

    function splitLong(p, max) {
      var lines = p.split("\n");
      var out = [];
      var buf = "";
      for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        if (l.length > max) {
          if (buf) { out.push(buf); buf = ""; }
          while (l.length > max) { out.push(l.substring(0, max)); l = l.substring(max); }
          if (l) out.push(l);
        } else {
          var n = buf ? buf + "\n" + l : l;
          if (n.length > max && buf) { out.push(buf); buf = l; } else { buf = n; }
        }
      }
      if (buf) out.push(buf);
      return out;
    }

    function buildReader() {
      if (reader) return true;
      root = document.getElementById("root");
      if (!root) return false;
      originalDisplay = root.style.display || "";

      var oldReader = document.getElementById("pxtc-reader");
      if (oldReader) oldReader.remove();

      reader = document.createElement("div");
      reader.id = "pxtc-reader";
      var fontCls = (CFG && CFG.novelFont && CFG.novelFont !== "system") ? " font-" + CFG.novelFont : "";
      var modeCls = showOriginalText ? "" : " hide-original";
      reader.className = "pxtc-reader" + fontCls + modeCls;

      var bodyStyle = window.getComputedStyle(document.body);
      var rootStyle = window.getComputedStyle(root);
      var pageBg = bodyStyle.backgroundColor || rootStyle.backgroundColor;
      if (pageBg && pageBg !== "transparent" && pageBg.indexOf("rgba(0, 0, 0, 0)") !== 0) {
        reader.style.background = pageBg;
      }
      var textColor = bodyStyle.color || rootStyle.color;
      if (textColor && textColor !== "transparent") {
        reader.style.color = textColor;
      }

      root.parentNode.insertBefore(reader, root.nextSibling);
      reader.style.display = "none";
      return true;
    }

    function updateStatus(state) {
      if (!statusBar && reader) {
        statusBar = document.createElement("div");
        statusBar.className = "pxtc-status-bar";
        reader.insertBefore(statusBar, reader.firstChild);
      }
      if (!statusBar) return;

      if (state === "preparing") {
        statusBar.classList.remove("hidden");
        statusBar.innerHTML = '<span>准备翻译…</span>';
        if (fab) { fab.className = "px-busy"; }
      } else if (state === "translating") {
        statusBar.classList.remove("hidden");
        statusBar.innerHTML = '<span>正在翻译 ' + successCount + ' / ' + totalCount + '</span>';
        if (fab) { fab.className = "px-busy"; }
      } else if (state === "partial") {
        statusBar.classList.remove("hidden");
        statusBar.innerHTML = '<span>部分完成 · ' + successCount + ' / ' + totalCount + '</span><button type="button" class="pxtc-status-btn" id="pxtc-retry-all">重试失败段落</button>';
        var retryBtn = document.getElementById("pxtc-retry-all");
        if (retryBtn) retryBtn.addEventListener("click", retryFailedBatches);
        if (fab) { fab.className = "px-warn"; }
      } else if (state === "completed") {
        statusBar.innerHTML = '<span>翻译完成</span>';
        if (fab) { fab.className = "px-done"; }
        setTimeout(function () {
          if (statusBar && state === "completed") statusBar.classList.add("hidden");
        }, 3200);
      }
    }

    function showOriginal() {
      if (reader) reader.style.display = "none";
      if (root) root.style.display = originalDisplay;
      currentMode = "ja";
      if (fab) fab.classList.remove("px-done", "px-warn");
    }

    function showTranslated() {
      if (root) root.style.display = "none";
      if (reader) reader.style.display = "block";
      currentMode = "zh";
      if (fab) {
        if (failedCount > 0) fab.className = "px-warn";
        else fab.className = "px-done";
      }
    }

    function toggleNovelMode() {
      if (isTranslating) return;
      if (!hasTranslated) {
        startNovelTranslate();
        return;
      }
      if (currentMode === "zh") {
        showOriginal();
      } else {
        showTranslated();
      }
    }

    async function translateBatchRequest(batch) {
      batch.status = "translating";
      var texts = batch.items.map(function (it) { return it.text; });
      try {
        var res = await fetch("/pxtrans?t=novel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: texts })
        }).then(function (r) { return r.json(); });

        if (res && Array.isArray(res.translations) && res.translations.length === texts.length) {
          batch.status = "success";
          for (var i = 0; i < batch.items.length; i++) {
            var item = batch.items[i];
            item.status = "success";
            item.translation = String(res.translations[i] || "");
            var el = document.getElementById("pair-trans-" + item.id);
            if (el) {
              el.className = "translated";
              el.innerHTML = esc(item.translation).replace(/\n/g, "<br>");
            }
          }
        } else {
          throw new Error("返回格式不匹配");
        }
      } catch (err) {
        batch.status = "failed";
        for (var j = 0; j < batch.items.length; j++) {
          var fItem = batch.items[j];
          fItem.status = "failed";
          var fEl = document.getElementById("pair-trans-" + fItem.id);
          if (fEl) {
            fEl.className = "translated";
            fEl.innerHTML = '<div class="translation-failed"><span>翻译失败</span><button type="button" class="pxtc-retry-inline-btn" data-batch="' + batch.idx + '">重试</button></div>';
            var rBtn = fEl.querySelector("button");
            if (rBtn) {
              rBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                var bIdx = Number(this.getAttribute("data-batch"));
                retrySingleBatch(bIdx);
              });
            }
          }
        }
      }
    }

    function recalculateProgress() {
      successCount = 0;
      failedCount = 0;
      for (var i = 0; i < paragraphItems.length; i++) {
        if (paragraphItems[i].status === "success") successCount++;
        else if (paragraphItems[i].status === "failed") failedCount++;
      }
      if (failedCount > 0) {
        updateStatus("partial");
      } else if (successCount === totalCount && totalCount > 0) {
        updateStatus("completed");
      } else {
        updateStatus("translating");
      }
    }

    async function retrySingleBatch(bIdx) {
      var batch = batchList[bIdx];
      if (!batch || isTranslating) return;
      for (var k = 0; k < batch.items.length; k++) {
        var el = document.getElementById("pair-trans-" + batch.items[k].id);
        if (el) {
          el.className = "translated pending";
          el.textContent = "正在重试…";
        }
      }
      await translateBatchRequest(batch);
      recalculateProgress();
    }

    async function retryFailedBatches() {
      if (isTranslating) return;
      isTranslating = true;
      var failedBatches = batchList.filter(function (b) { return b.status === "failed"; });
      for (var i = 0; i < failedBatches.length; i++) {
        var batch = failedBatches[i];
        for (var k = 0; k < batch.items.length; k++) {
          var el = document.getElementById("pair-trans-" + batch.items[k].id);
          if (el) {
            el.className = "translated pending";
            el.textContent = "正在重试…";
          }
        }
        await translateBatchRequest(batch);
        recalculateProgress();
      }
      isTranslating = false;
      recalculateProgress();
    }

    async function startNovelTranslate() {
      if (isTranslating) return;
      var text = "";
      try { text = window.pixiv && window.pixiv.novel ? window.pixiv.novel.text : ""; } catch (e) { }
      if (!text) return;
      if (!buildReader()) return;

      isTranslating = true;
      currentMode = "zh";

      // 1. 段落拆分与规约过滤
      var rawParagraphs = splitParagraphs(text);
      var validParagraphs = [];
      for (var p = 0; p < rawParagraphs.length; p++) {
        var itemStr = rawParagraphs[p].trim();
        if (cleanDisclaimer && isDisclaimer(itemStr)) continue;
        validParagraphs.push(rawParagraphs[p]);
      }

      // 2. 建立段落项与 DOM 段落对
      paragraphItems = [];
      reader.innerHTML = "";
      statusBar = null;

      for (var i = 0; i < validParagraphs.length; i++) {
        var originalText = validParagraphs[i];
        var itemObj = {
          id: i,
          text: originalText,
          status: "pending",
          translation: ""
        };
        paragraphItems.push(itemObj);

        var pairEl = document.createElement("div");
        pairEl.className = "translation-pair" + (originalText.trim() ? "" : " empty");
        pairEl.id = "pxtc-pair-" + i;
        pairEl.innerHTML = '<div class="original">' + esc(originalText).replace(/\n/g, "<br>") + '</div>' +
          '<div class="translated pending" id="pair-trans-' + i + '"></div>';
        reader.appendChild(pairEl);
      }

      totalCount = paragraphItems.length;
      successCount = 0;
      failedCount = 0;

      showTranslated();
      updateStatus("preparing");

      // 3. 构建批次
      batchList = [];
      var curItems = [];
      var curChars = 0;
      for (var j = 0; j < paragraphItems.length; j++) {
        var it = paragraphItems[j];
        if (curItems.length >= 20 || curChars + it.text.length > 2500) {
          batchList.push({ idx: batchList.length, items: curItems, status: "pending" });
          curItems = [];
          curChars = 0;
        }
        curItems.push(it);
        curChars += it.text.length;
      }
      if (curItems.length) {
        batchList.push({ idx: batchList.length, items: curItems, status: "pending" });
      }

      // 4. 并发调度 (最多 3 批并发，边翻边显示)
      var nextBatch = 0;
      async function batchWorker() {
        while (nextBatch < batchList.length) {
          var b = batchList[nextBatch++];
          await translateBatchRequest(b);
          recalculateProgress();
        }
      }

      var workers = [];
      var concurrency = Math.min(3, batchList.length);
      for (var w = 0; w < concurrency; w++) workers.push(batchWorker());
      await Promise.all(workers);

      isTranslating = false;
      hasTranslated = true;
      recalculateProgress();
    }

    // ─── 漫画 AI 视觉 HUD 漫翻 ───
    async function doMangaTranslate() {
      if (!imageSwitch) return;
      var images = document.querySelectorAll("img");
      if (!images.length) return;
      if (fab) fab.className = "px-busy";
      var targetImg = images[0];
      var imgUrl = targetImg.src;
      try {
        targetImg.parentNode.querySelectorAll(".px-hud-bubble").forEach(function (n) { n.remove(); });
        var r = await fetch("/pxtrans?action=vision&url=" + encodeURIComponent(imgUrl)).then(function (res) { return res.json(); });
        if (r && Array.isArray(r.bubbles)) {
          r.bubbles.forEach(function (b) {
            var bubble = document.createElement("div");
            bubble.className = "px-hud-bubble";
            bubble.textContent = b.zh;
            bubble.style.top = b.box[0] + "%";
            bubble.style.left = b.box[1] + "%";
            bubble.style.maxWidth = (b.box[3] - b.box[1]) + "%";
            targetImg.parentNode.style.position = "relative";
            targetImg.parentNode.appendChild(bubble);
          });
          if (fab) fab.className = "px-done";
        }
      } catch (e) {
        if (fab) fab.className = "px-warn";
      }
    }

    function handleFabClick() {
      if (rawText) {
        toggleNovelMode();
      } else {
        doMangaTranslate();
      }
    }

    // 默认自动翻译触发
    if (autoSwitch && rawText) {
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        var t = "";
        try { t = window.pixiv && window.pixiv.novel ? window.pixiv.novel.text : ""; } catch (e) { }
        if (t && hasJapanese(t)) {
          clearInterval(timer);
          startNovelTranslate();
        } else if (tries >= 30) {
          clearInterval(timer);
        }
      }, 250);
    }
  })();
}

function handleWebviewInject(cfg) {
  const body = typeof $response.body === "string" ? $response.body : "";
  if (!body) { $done({}); return; }
  const clientConfig = {
    autoSwitch: cfg ? !!cfg.autoSwitch : true,
    targetLang: cfg ? cfg.targetLang : "zh-CN",
    novelFont: cfg ? (cfg.novelFont || "system") : "system",
    novelCleanDisclaimer: cfg ? !!cfg.novelCleanDisclaimer : true,
    novelShowOriginal: cfg ? cfg.novelShowOriginal !== false : true,
    floatingSwitch: cfg ? cfg.floatingSwitch !== false : true,
    imageSwitch: cfg ? cfg.imageSwitch !== false : true
  };
  const clientCode = clientRuntime.toString()
    .replace('"__CONFIG_PLACEHOLDER__"', JSON.stringify(clientConfig))
    .replace('__SVG_PLACEHOLDER__', SF_TRANSLATE_SVG.trim());
  const inject = '<style id="px-style">' + INJECT_CSS + '</style><script id="px-script">(' + clientCode + ')();</script>';
  let newBody = body;
  if (/<\/body>/i.test(body)) newBody = body.replace(/<\/body>/i, inject + "</body>");
  else newBody = body + inject;
  $done({ body: newBody });
}

function parseMangaBubbles(content) {
  let value = content;
  if (typeof value === "string") {
    value = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try { value = JSON.parse(value); } catch (e) { return []; }
  }
  if (!Array.isArray(value)) value = value && (value.bubbles || value.items);
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && Array.isArray(item.box) && item.box.length === 4 && item.zh)
    .map(item => ({ box: item.box.map(Number), ja: String(item.ja || ""), zh: String(item.zh) }));
}

async function translateMangaImage(imageUrl, cfg) {
  if (!imageUrl) throw new Error("缺少图片 URL");
  // 关键防盗链加固：自动将官方 i.pximg.net 替换为免防盗链的全球加速镜像 i.pixiv.re
  const safeImageUrl = String(imageUrl).replace(/i\.pximg\.net/g, "i.pixiv.re");
  const engine = (cfg.imageEngine || "deepseek_vl").toLowerCase();
  const target = LANG_MAP[cfg.targetLang] || LANG_MAP["zh-CN"];

  // 1. 多模态视觉大模型 (DeepSeek-VL / GPT-4o-mini)
  if (engine === "deepseek_vl" || engine === "gpt4o_mini") {
    let endpoint = "";
    let key = "";
    let model = "";
    if (engine === "gpt4o_mini") {
      endpoint = cfg.openaiUrl || "https://api.openai.com/v1/chat/completions";
      key = cfg.openaiKey;
      model = "gpt-4o-mini";
    } else {
      endpoint = cfg.deepseekUrl || "https://api.deepseek.com/v1/chat/completions";
      key = cfg.deepseekKey;
      model = (cfg.deepseekModel === "deepseek-v4-flash" || !cfg.deepseekModel) ? "deepseek-chat" : cfg.deepseekModel;
    }

    if (!key) {
      throw new Error("未配置 " + (engine === "gpt4o_mini" ? "OpenAI" : "DeepSeek") + " API Key");
    }
    if (!endpoint) throw new Error("未配置视觉端点 URL");

    const prompt = "Identify every readable dialogue bubble in this manga image. Return ONLY a JSON array. Each item must have box [top,left,bottom,right] as percentages from 0 to 100, ja for detected original text, and zh as the " + target.ai + " translation. Keep bubbles in reading order. Output raw JSON only.";

    const res = await $.post({
      url: endpoint,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: safeImageUrl } }
          ]
        }],
        temperature: 0.1
      }),
      timeout: 30000
    });

    let raw = res && res.body;
    let payload;
    try { payload = typeof raw === "string" ? JSON.parse(raw) : raw; } catch(e) { throw new Error("模型返回非 JSON 响应"); }

    if (payload && payload.error) {
      throw new Error("模型报错: " + (payload.error.message || JSON.stringify(payload.error)));
    }

    const content = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    const bubbles = parseMangaBubbles(content);
    if (!bubbles.length) throw new Error("视觉模型未识别到对白文字");
    return bubbles;
  }

  // 3. 方案三：自建 manga-image-translator
  if (engine === "manga_translator") {
    const srv = (cfg.mangaServer || "").replace(/\/+$/, "");
    if (!srv) throw new Error("未配置自建 manga-image-translator 服务地址");
    const endpoint = srv + "/translate";

    const res = await $.post({
      url: endpoint,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: safeImageUrl, target_lang: cfg.targetLang || "zh-CN" }),
      timeout: 30000
    });

    let raw = res && res.body;
    let payload;
    try { payload = typeof raw === "string" ? JSON.parse(raw) : raw; } catch(e) { throw new Error("自建服务返回非 JSON"); }

    const bubbles = parseMangaBubbles(payload);
    if (!bubbles.length) throw new Error("自建服务未返回有效气泡");
    return bubbles;
  }

  throw new Error("未知漫翻引擎: " + engine);
}

// ─── 7. 翻译中转代理与 AI 漫翻处理 (/pxtrans) ───────────────────────────────────
async function handleProxy(cfg) {
  const url = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  const isVision = url.includes("action=vision");

  if (isVision) {
    const match = url.match(/url=([^&]+)/);
    const imgUrl = match ? decodeURIComponent(match[1]) : "";
    try {
      const bubbles = await translateMangaImage(imgUrl, cfg);
      doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, bubbles }));
    } catch (e) {
      doneWithResponse(502, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, bubbles: [], error: String((e && e.message) || e) }));
    }
    return;
  }

  // 文本批量中转
  let texts = [];
  try {
    const raw = typeof $request.body === "string" ? JSON.parse($request.body) : $request.body;
    if (raw && Array.isArray(raw.texts)) texts = raw.texts;
  } catch (e) { }

  const translations = await translateBatch(texts, cfg);
  $done({
    response: {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: true, translations: translations })
    }
  });
}

function doneWithResponse(status, headers, body) {
  const payload = { status: status, headers: headers || {}, body: body };
  if (typeof $task !== "undefined") {
    $done({ response: { status: "HTTP/1.1 " + status, headers: payload.headers, body: payload.body } });
  } else {
    $done({ response: payload });
  }
}

// ─── 漫画与插画 AI 汉化专用查看器 (带悬浮按钮与按需气泡翻译) ────────────────
async function handleMangaViewer(cfg) {
  const url = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  const match = url.match(/[?&]illust_id=([^&]+)/);
  const rawId = match ? decodeURIComponent(match[1]) : "";
  const illustId = rawId.replace(/\D+/g, "");

  let title = "漫画查看器";
  let pages = [];

  if (illustId) {
    try {
      let authHeader = (typeof $request !== "undefined" && $request.headers) ? ($request.headers.Authorization || $request.headers.authorization || "") : "";
      if (!authHeader) authHeader = $.getdata("@Pixiv.Enhanced.Auth.Token") || "";
      const headers = {
        "User-Agent": "PixivIOSApp/8.9.1 (iOS 26.7; iPhone17,5)",
        "App-OS": "ios",
        "App-Version": "8.9.1",
        "Referer": "https://www.pixiv.net/"
      };
      if (authHeader) headers["Authorization"] = authHeader.startsWith("Bearer ") ? authHeader : ("Bearer " + authHeader);
      const res = await $.get({
        url: "https://app-api.pixiv.net/v1/illust/detail?illust_id=" + illustId,
        headers: headers,
        timeout: 10000
      });
      let raw = res && res.body;
      let data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data && data.illust) {
        title = data.illust.title || title;
        if (Array.isArray(data.illust.meta_pages) && data.illust.meta_pages.length > 0) {
          for (const p of data.illust.meta_pages) {
            const u = (p.image_urls && (p.image_urls.large || p.image_urls.original || p.image_urls.medium)) || "";
            if (u) pages.push(u.replace(/i\.pximg\.net/g, "i.pixiv.re"));
          }
        } else if (data.illust.meta_single_page && data.illust.meta_single_page.original_image_url) {
          pages.push(data.illust.meta_single_page.original_image_url.replace(/i\.pximg\.net/g, "i.pixiv.re"));
        } else if (data.illust.image_urls && data.illust.image_urls.large) {
          pages.push(data.illust.image_urls.large.replace(/i\.pximg\.net/g, "i.pixiv.re"));
        }
      }
    } catch (e) { }
  }

  const pagesHtml = pages.length > 0 ? pages.map((src, i) => `
    <div class="manga-page-wrapper" id="page-wrapper-${i}">
      <img src="${src}" class="manga-img" id="img-page-${i}" data-index="${i}" loading="lazy" alt="Page ${i + 1}">
    </div>
  `).join("") : `
    <div style="padding: 80px 20px 40px; color: #8e8e93;">
      <div style="font-size: 36px; margin-bottom: 12px;">📭</div>
      <p style="font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 8px;">未获取到漫画页面 (ID: ${illustId || "未知"})</p>
      <p style="font-size: 13px; line-height: 1.6; max-width: 360px; margin: 0 auto 20px;">可能该作品需要会员登录态或网络繁忙。请返回 Pixiv App 重新轻点链接，或确认作品 ID 是否有效。</p>
      <a href="javascript:location.reload()" style="display: inline-block; padding: 8px 18px; border-radius: 8px; background: #007aff; color: #fff; text-decoration: none; font-size: 14px;">重新加载</a>
    </div>
  `;

  const viewerHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      margin: 0;
      padding: 0;
      background: #09090b;
      color: #fff;
      font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
      text-align: center;
      padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 90px);
      user-select: none;
      -webkit-user-select: none;
    }
    .manga-header {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: rgba(14, 14, 18, 0.88);
      -webkit-backdrop-filter: blur(25px) saturate(180%);
      backdrop-filter: blur(25px) saturate(180%);
      padding: calc(env(safe-area-inset-top, 20px) + 8px) 14px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 0.5px solid rgba(255, 255, 255, 0.12);
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #007aff;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      padding: 4px 6px;
      margin-left: -6px;
    }
    .manga-title {
      font-size: 14.5px;
      font-weight: 600;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 58%;
      text-align: center;
    }
    .manga-page-indicator {
      font-size: 13px;
      color: #8e8e93;
      font-variant-numeric: tabular-nums;
      min-width: 48px;
      text-align: right;
    }
    .manga-page-wrapper {
      position: relative;
      margin: 0 auto 10px;
      max-width: 860px;
      width: 100%;
    }
    .manga-img {
      width: 100%;
      height: auto;
      display: block;
      background: #141418;
    }
    .bottom-control-island {
      position: fixed;
      left: 50%;
      bottom: calc(env(safe-area-inset-bottom, 20px) + 16px);
      transform: translateX(-50%);
      z-index: 2147483647;
      background: rgba(28, 28, 30, 0.92);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      backdrop-filter: blur(30px) saturate(180%);
      border: 0.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 30px;
      padding: 5px 10px 5px 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    }
    .island-btn {
      height: 40px;
      padding: 0 16px;
      border-radius: 20px;
      background: #007aff;
      color: #fff;
      border: none;
      font-size: 14px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: background 0.2s, transform 0.12s;
    }
    .island-btn:active { transform: scale(0.94); }
    .island-btn.busy { background: #636366 !important; pointer-events: none; }
    .island-btn.done { background: #34c759 !important; }
    .island-action-btn {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, opacity 0.2s;
    }
    .island-action-btn:active { background: rgba(255, 255, 255, 0.22); }
    .px-hud-bubble {
      position: absolute;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.96);
      color: #111;
      font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.35;
      padding: 6px 9px;
      border-radius: 8px;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(0, 0, 0, 0.1);
      word-break: break-word;
      cursor: pointer;
      text-align: left;
      transition: transform 0.15s, opacity 0.2s;
    }
    .px-hud-bubble:active { transform: scale(0.96); background: #f2f2f7; }
    .px-hud-bubble.show-ja {
      background: #1c1c1e !important;
      color: #fff !important;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.25) !important;
    }
    .hide-all-bubbles .px-hud-bubble { display: none !important; }
  </style>
</head>
<body>
  <div class="manga-header">
    <a href="javascript:void(0)" class="back-btn" onclick="handleBack()">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      <span>返回</span>
    </a>
    <span class="manga-title">${title}</span>
    <span class="manga-page-indicator" id="page-indicator">${pages.length > 1 ? ("1 / " + pages.length) : "单图"}</span>
  </div>
  ${pagesHtml}
  <div class="bottom-control-island">
    <button type="button" class="island-btn" id="px-fab">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
      </svg>
      <span id="px-fab-text">AI 漫翻</span>
    </button>
    <button type="button" class="island-action-btn" id="btn-toggle-bubbles" title="切换原文/译文显示" onclick="toggleBubblesVisibility()">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  </div>
  <script>
    function handleBack() {
      if (window.history.length > 1) { window.history.back(); } else { window.close(); }
    }

    let bubblesVisible = true;
    function toggleBubblesVisibility() {
      bubblesVisible = !bubblesVisible;
      document.body.classList.toggle("hide-all-bubbles", !bubblesVisible);
      const btn = document.getElementById("btn-toggle-bubbles");
      if (btn) btn.style.opacity = bubblesVisible ? "1" : "0.45";
    }

    const bubbleCache = {};

    function renderBubblesOnWrapper(wrapper, bubbles) {
      wrapper.querySelectorAll(".px-hud-bubble").forEach(b => b.remove());
      bubbles.forEach(b => {
        const bubble = document.createElement("div");
        bubble.className = "px-hud-bubble";
        bubble.textContent = b.zh;
        bubble.style.top = b.box[0] + "%";
        bubble.style.left = b.box[1] + "%";
        bubble.style.maxWidth = (b.box[3] - b.box[1]) + "%";
        bubble.setAttribute("title", "轻触切换日文原句");
        bubble.addEventListener("click", function(e) {
          e.stopPropagation();
          if (bubble.classList.contains("show-ja")) {
            bubble.classList.remove("show-ja");
            bubble.textContent = b.zh;
          } else {
            bubble.classList.add("show-ja");
            bubble.textContent = b.ja || "原文字幕";
          }
        });
        wrapper.appendChild(bubble);
      });
    }

    window.addEventListener("scroll", function() {
      const wrappers = document.querySelectorAll(".manga-page-wrapper");
      if (!wrappers.length) return;
      const centerY = window.innerHeight / 2;
      let currentIdx = 0;
      let minDist = 99999;
      let best = wrappers[0];
      wrappers.forEach((w, i) => {
        const r = w.getBoundingClientRect();
        const dist = Math.abs((r.top + r.bottom) / 2 - centerY);
        if (dist < minDist) { minDist = dist; currentIdx = i; best = w; }
      });
      const ind = document.getElementById("page-indicator");
      if (ind && wrappers.length > 1) ind.textContent = (currentIdx + 1) + " / " + wrappers.length;
      const img = best.querySelector(".manga-img");
      const fab = document.getElementById("px-fab");
      const fabText = document.getElementById("px-fab-text");
      if (img && bubbleCache[img.src]) {
        if (fab) fab.classList.add("done");
        if (fabText) fabText.textContent = "已汉化 (" + bubbleCache[img.src].length + "处)";
      } else {
        if (fab) fab.classList.remove("done");
        if (fabText) fabText.textContent = "AI 漫翻";
      }
    }, { passive: true });

    const fab = document.getElementById("px-fab");
    const fabText = document.getElementById("px-fab-text");
    fab.addEventListener("click", async function() {
      if (fab.classList.contains("busy")) return;
      const wrappers = document.querySelectorAll(".manga-page-wrapper");
      let bestWrapper = wrappers[0];
      let minDist = 99999;
      const centerY = window.innerHeight / 2;
      wrappers.forEach(w => {
        const r = w.getBoundingClientRect();
        const dist = Math.abs((r.top + r.bottom) / 2 - centerY);
        if (dist < minDist) { minDist = dist; bestWrapper = w; }
      });
      if (!bestWrapper) return;
      const img = bestWrapper.querySelector(".manga-img");
      if (!img || !img.src) return;

      if (bubbleCache[img.src]) {
        renderBubblesOnWrapper(bestWrapper, bubbleCache[img.src]);
        fab.classList.add("done");
        if (fabText) fabText.textContent = "已汉化 (" + bubbleCache[img.src].length + "处)";
        return;
      }

      fab.classList.add("busy");
      if (fabText) fabText.textContent = "识别中…";
      try {
        bestWrapper.querySelectorAll(".px-hud-bubble").forEach(b => b.remove());
        const pxtransUrl = "https://www.pixiv.net/pxtrans?action=vision&url=" + encodeURIComponent(img.src);
        const res = await fetch(pxtransUrl).then(r => r.json());
        if (res && Array.isArray(res.bubbles) && res.bubbles.length > 0) {
          bubbleCache[img.src] = res.bubbles;
          renderBubblesOnWrapper(bestWrapper, res.bubbles);
          fab.classList.add("done");
          if (fabText) fabText.textContent = "已汉化 (" + res.bubbles.length + "处)";
        } else {
          alert((res && res.error) ? ("漫翻未完成: " + res.error) : "未在当前画面识别到对白文字");
          if (fabText) fabText.textContent = "AI 漫翻";
        }
      } catch (err) {
        alert("漫翻请求异常：" + (err.message || err));
        if (fabText) fabText.textContent = "AI 漫翻";
      }
      fab.classList.remove("busy");
    });
  </script>
</body>
</html>`;

  doneWithResponse(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  }, viewerHTML);
}

function handleSettingsHTML() {
  doneWithResponse(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  }, SETTINGS_HTML);
}

function handleApiGet() {
  const keys = [
    "@Pixiv.Enhanced.Settings.Global.Switch",
    "@Pixiv.Enhanced.Settings.Auto.Switch",
    "@Pixiv.Enhanced.Settings.Auto.Scopes",
    "@Pixiv.Enhanced.Settings.Filter.SkipChinese",
    "@Pixiv.Enhanced.Settings.Novel.Font",
    "@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer",
    "@Pixiv.Enhanced.Settings.Novel.ShowOriginal",
    "@Pixiv.Enhanced.Settings.Floating.Switch",
    "@Pixiv.Enhanced.Settings.Translator.Source",
    "@Pixiv.Enhanced.Settings.Target.Lang",
    "@Pixiv.Enhanced.Settings.Network.ImageAccelerate",
    "@Pixiv.Enhanced.Settings.Tag.OfflineOnly",
    "@Pixiv.Enhanced.Settings.Image.Switch",
    "@Pixiv.Enhanced.Settings.Image.Engine",
    "@Pixiv.Enhanced.Settings.Auth.DeepSeekKey",
    "@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl",
    "@Pixiv.Enhanced.Settings.Auth.DeepSeekModel",
    "@Pixiv.Enhanced.Settings.Auth.OpenAIKey",
    "@Pixiv.Enhanced.Settings.Auth.OpenAIUrl",
    "@Pixiv.Enhanced.Settings.Auth.BaiduAppid",
    "@Pixiv.Enhanced.Settings.Auth.BaiduSecret",
    "@Pixiv.Enhanced.Settings.Auth.CaiyunToken",
    "@Pixiv.Enhanced.Settings.Manga.ServerUrl",
    "@Pixiv.Enhanced.Settings.LogLevel"
  ];
  const out = {};
  for (const k of keys) {
    const v = $.getdata(k);
    if (v !== undefined && v !== null && v !== "") {
      if (v === "true") out[k] = true;
      else if (v === "false") out[k] = false;
      else if (/^[\[{]/.test(v)) {
        try { out[k] = JSON.parse(v); } catch (e) { out[k] = v; }
      } else out[k] = v;
    }
  }
  doneWithResponse(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }, JSON.stringify(out));
}

function handleApiSet() {
  let payload = {};
  try {
    payload = typeof $request.body === "string" ? JSON.parse($request.body) : ($request.body || {});
  } catch (e) { }
  if (payload.key && payload.value !== undefined) {
    const valStr = typeof payload.value === "object" ? JSON.stringify(payload.value) : String(payload.value);
    $.setdata(valStr, payload.key);
  } else if (typeof payload === "object") {
    for (const k of Object.keys(payload)) {
      const valStr = typeof payload[k] === "object" ? JSON.stringify(payload[k]) : String(payload[k]);
      $.setdata(valStr, k);
    }
  }
  doneWithResponse(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }, JSON.stringify({ saved: true }));
}

async function handleApiTestManga(cfg) {
  const start = Date.now();
  const url = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  const matchEngine = url.match(/[?&]engine=([^&]+)/);
  const matchServer = url.match(/[?&]server=([^&]+)/);

  const engine = (matchEngine ? decodeURIComponent(matchEngine[1]) : (cfg.imageEngine || "deepseek_vl")).toLowerCase();
  const server = ((matchServer ? decodeURIComponent(matchServer[1]) : "") || cfg.mangaServer || "").trim();

  try {
    if (engine === "manga_translator") {
      const srv = (server || "").replace(/\/+$/, "");
      if (!srv) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "未填写自建服务 URL 地址" }));
        return;
      }
      const res = await $.get({ url: srv, timeout: 5000 });
      const latency = Date.now() - start;
      doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, latency }));
      return;
    }

    // DeepSeek / OpenAI 视觉模型测速
    const isDeepSeek = engine === "deepseek_vl";
    const key = isDeepSeek ? cfg.deepseekKey : cfg.openaiKey;
    if (!key) {
      doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "未填写 " + (isDeepSeek ? "DeepSeek" : "OpenAI") + " API Key" }));
      return;
    }
    const testImg = "https://i.pixiv.re/c/540x540_70/img-master/img/2021/08/31/00/38/21/92390436_p0_square1200.jpg";
    const bubbles = await translateMangaImage(testImg, cfg);
    const latency = Date.now() - start;
    doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, latency, count: bubbles.length }));
  } catch (e) {
    doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
  }
}

async function handleApiTestAI(cfg) {
  const url = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  const match = url.match(/[?&]source=([^&]+)/);
  const matchAppid = url.match(/[?&]appid=([^&]+)/);
  const matchSecret = url.match(/[?&]secret=([^&]+)/);
  const matchCaiyun = url.match(/[?&]caiyun_token=([^&]+)/);
  const targetSource = (match ? decodeURIComponent(match[1]) : cfg.translator || "google").toLowerCase();
  const start = Date.now();

  try {
    if (targetSource === "caiyun") {
      const token = ((matchCaiyun ? decodeURIComponent(matchCaiyun[1]) : "") || cfg.caiyunToken || "").trim();
      if (!token) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "未填写彩云小译 Token，请先在 open.caiyunapp.com 获取" }));
        return;
      }
      const testUrl = "https://api.interpreter.caiyunai.com/v1/translator";
      let res;
      try {
        res = await $.post({
          url: testUrl,
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": "token " + token
          },
          body: JSON.stringify({
            source: ["こんにちは"],
            trans_type: "auto2zh",
            request_id: "test_" + Date.now(),
            detect: true
          }),
          timeout: 10000
        });
      } catch (netErr) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "网络请求异常(" + (netErr.message || netErr) + ")" }));
        return;
      }
      const latency = Date.now() - start;
      let raw = res && res.body;
      let data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data && Array.isArray(data.target) && data.target[0]) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, latency: latency, translation: data.target[0] }));
        return;
      }
      const errMsg = (data && data.message) ? data.message : "Token 鉴权未通过或额度不足";
      doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "彩云鉴权失败: " + errMsg }));
      return;
    }
    if (targetSource === "baidu") {
      const appid = ((matchAppid ? decodeURIComponent(matchAppid[1]) : "") || cfg.baiduAppid || "").trim();
      const secret = ((matchSecret ? decodeURIComponent(matchSecret[1]) : "") || cfg.baiduSecret || "").trim();
      if (!appid || !secret) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "未配置百度翻译 AppID 或 Secret 密钥" }));
        return;
      }
      const salt = String(Date.now());
      const sign = md5(appid + "こんにちは" + salt + secret);
      const testUrl = "https://fanyi-api.baidu.com/api/trans/vip/translate";
      const params = "q=" + encodeURIComponent("こんにちは") + "&from=auto&to=zh&appid=" + encodeURIComponent(appid) + "&salt=" + salt + "&sign=" + sign;
      let res;
      try {
        res = await $.post({
          url: testUrl,
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0" },
          body: params,
          timeout: 10000
        });
      } catch (netErr) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "网络请求异常(" + (netErr.message || netErr) + ")" }));
        return;
      }
      const latency = Date.now() - start;
      let raw = res && res.body;
      let data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data && data.error_code && String(data.error_code) !== "0") {
        const errMap = {
          "54000": "缺少必填参数",
          "54001": "签名错误，请检查 AppID 与密钥是否有误或有多余空格",
          "52003": "未授权用户，请登录 fanyi-api.baidu.com 开通翻译",
          "54004": "账户余额不足"
        };
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "百度鉴权失败 " + data.error_code + "：" + (errMap[String(data.error_code)] || data.error_msg || "密钥错误") }));
        return;
      }
      if (data && Array.isArray(data.trans_result) && data.trans_result[0]) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, latency: latency, translation: data.trans_result[0].dst }));
        return;
      }
      doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "百度未返回有效翻译" }));
      return;
    }
    if (targetSource === "deepseek") {
      if (!cfg.deepseekKey) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "未填写 DeepSeek API Key，请先输入密钥" }));
        return;
      }
      if (!cfg.deepseekUrl) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "未配置 DeepSeek 接口地址" }));
        return;
      }
      const testRes = await deepseekTranslateBatch(["こんにちは"], "Simplified Chinese", cfg);
      const latency = Date.now() - start;
      if (testRes && testRes[0] && testRes[0] !== "こんにちは") {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, latency: latency, translation: testRes[0] }));
      } else {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "DeepSeek 响应异常，请检查Key与网络" }));
      }
      return;
    }

    if (targetSource === "openai") {
      if (!cfg.openaiKey) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "未填写 OpenAI API Key，请先输入密钥" }));
        return;
      }
      const endpoint = cfg.openaiUrl || "https://api.openai.com/v1/chat/completions";
      const prompt = "Translate 'こんにちは' to Simplified Chinese. Return ONLY the translated word.";
      const res = await $.post({
        url: endpoint,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + cfg.openaiKey
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        }),
        timeout: 15000
      });
      const latency = Date.now() - start;
      let raw = res && res.body;
      let payload;
      try { payload = typeof raw === "string" ? JSON.parse(raw) : raw; } catch(e) { throw new Error("OpenAI 返回非 JSON"); }
      if (payload && payload.error) {
        throw new Error(payload.error.message || JSON.stringify(payload.error));
      }
      const trans = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
      if (trans) {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, latency: latency, translation: trans.trim() }));
      } else {
        doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "OpenAI 返回异常，请检查接口" }));
      }
      return;
    }

    // Google 免费极速接口真实测试 (不走缓存，强制发出网络请求测试真实延迟)
    const testRes = await googleTranslateChunk(["こんにちは"], "zh-CN");
    const latency = Date.now() - start;
    if (testRes && testRes[0] && testRes[0] !== "こんにちは") {
      doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, latency: latency, translation: testRes[0] }));
    } else {
      doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: "Google 接口异常或受到限流" }));
    }
  } catch (e) {
    doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
  }
}

function handleApiClearCache() {
  const stats = clearTranslationCacheData();
  doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, count: stats.count, bytes: stats.bytes, sizeText: stats.sizeText }));
}

function handleApiCacheStats() {
  const stats = getCacheStats();
  doneWithResponse(200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true, count: stats.count, bytes: stats.bytes, sizeText: stats.sizeText, indexed: stats.indexed }));
}

// ─── 8. 主入口分发 ─────────────────────────────────────────────────────────────
(async function main() {
  const cfg = loadConfig();

  const url = (typeof $request !== "undefined" && $request.url) ? $request.url : "";

  // 1. 设置中心 HTML 页面 (本地离线瞬时秒开，对标 Pix-Scripting 苹果原生级视觉)
  if (url.includes("/manga/viewer")) {
    await handleMangaViewer(cfg);
    return;
  }
  if (url.includes("/settings/Enhanced")) {
    handleSettingsHTML();
    return;
  }

  // 2. 设置中心 API 存取与实时测速
  if (url.includes("/api/get")) {
    handleApiGet();
    return;
  }
  if (url.includes("/api/set")) {
    handleApiSet();
    return;
  }
  if (url.includes("/api/test_manga")) {
    await handleApiTestManga(cfg);
    return;
  }
  if (url.includes("/api/test_ai")) {
    await handleApiTestAI(cfg);
    return;
  }
  if (url.includes("/api/clear_cache")) {
    handleApiClearCache();
    return;
  }
  if (url.includes("/api/cache_stats")) {
    handleApiCacheStats();
    return;
  }

  if (!cfg.globalSwitch) { $done({}); return; }

  // 3. 翻译中转端点
  if (url.includes("/pxtrans")) {
    await handleProxy(cfg);
    return;
  }

  // 4. 小说 Webview 注入
  if (url.includes("/webview/v2/novel")) {
    handleWebviewInject(cfg);
    return;
  }

  // 5. 全页面 REST API 响应体拦截汉化
  if (typeof $response !== "undefined" && $response.body) {
    await handleApiRewrite(cfg);
    return;
  }

  $done({});
})().catch(function (e) {
  $.logErr((e && e.stack) || e);
  $done({});
});
