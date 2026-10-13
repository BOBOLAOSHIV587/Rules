<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
  <title>Pixiv 增强设置</title>
  <style>
    :root {
      --bg-color: #f2f2f7;
      --card-bg: #ffffff;
      --card-border: rgba(60, 60, 67, 0.12);
      --separator-color: rgba(60, 60, 67, 0.12);
      --text-primary: #000000;
      --text-secondary: #8e8e93;
      --tint-blue: #007aff;
      --tint-green: #34c759;
      --tint-red: #ff3b30;
      --switch-bg: #e9e9ea;
      --badge-bg: rgba(142, 142, 147, 0.12);
      --badge-text: #8e8e93;
      --icon-bg: rgba(142, 142, 147, 0.12);
      --icon-color: #1c1c1e;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #000000;
        --card-bg: #1c1c1e;
        --card-border: rgba(255, 255, 255, 0.12);
        --separator-color: rgba(84, 84, 88, 0.35);
        --text-primary: #ffffff;
        --text-secondary: #8e8e93;
        --switch-bg: #39393d;
        --badge-bg: rgba(255, 255, 255, 0.12);
        --badge-text: #aeaeb2;
        --icon-bg: rgba(255, 255, 255, 0.12);
        --icon-color: #ffffff;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", sans-serif;
      padding: calc(env(safe-area-inset-top, 20px) + 16px) 16px calc(env(safe-area-inset-bottom, 20px) + 32px);
      max-width: 680px;
      margin: 0 auto;
      line-height: 1.5;
      font-size: 16px;
      overflow-x: hidden;
    }

    /* ─── 页面品牌大标题与导航按钮 ─── */
    .brand-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
      padding: 4px 6px;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--icon-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--tint-blue);
      flex-shrink: 0;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.4px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(0, 122, 255, 0.12);
      color: var(--tint-blue);
      letter-spacing: 0;
    }
    .brand-sub {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .done-nav-btn {
      background: var(--tint-blue);
      color: #ffffff;
      border: none;
      font-size: 14px;
      font-family: inherit;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 18px;
      cursor: pointer;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0, 122, 255, 0.25);
      transition: opacity 0.15s, transform 0.12s, background-color 0.2s;
    }
    .done-nav-btn:active {
      transform: scale(0.95);
      opacity: 0.85;
    }
    .save-tip-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 122, 255, 0.08);
      color: var(--tint-blue);
      padding: 7px 12px;
      border-radius: 9px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    /* ─── Grouped 卡片容器 ─── */
    .section-card {
      background: var(--card-bg);
      border-radius: 14px;
      border: 0.5px solid var(--card-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      margin-bottom: 6px;
      overflow: hidden;
      transition: all 0.25s ease;
    }

    .section-header {
      display: flex;
      align-items: center;
      padding: 13px 16px;
      cursor: pointer;
      user-select: none;
      gap: 12px;
      min-height: 52px;
    }
    .section-header:active {
      background: rgba(127, 127, 127, 0.06);
    }
    .section-icon {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: var(--icon-bg);
      color: var(--icon-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      flex: 1;
      color: var(--text-primary);
    }
    .section-summary {
      font-size: 12px;
      color: var(--badge-text);
      background: var(--badge-bg);
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 500;
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.2s;
    }
    .chevron-icon {
      width: 14px;
      height: 14px;
      color: var(--text-secondary);
      transition: transform 0.25s ease;
      flex-shrink: 0;
    }
    .section-card.expanded .chevron-icon {
      transform: rotate(90deg);
    }
    .section-card.expanded .section-summary {
      opacity: 0;
      pointer-events: none;
    }

    .section-body {
      display: none;
      border-top: 0.5px solid var(--separator-color);
    }
    .section-card.expanded .section-body {
      display: block;
    }

    /* ─── 设置条目 (Row) ─── */
    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      min-height: 48px;
      position: relative;
    }
    .setting-row:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 16px;
      right: 0;
      bottom: 0;
      height: 0.5px;
      background: var(--separator-color);
    }
    .setting-info {
      flex: 1;
      padding-right: 12px;
    }
    .setting-label {
      font-size: 15px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .setting-desc {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
      line-height: 1.35;
    }

    /* ─── 控件：iOS 原生 Toggle 胶囊开关 ─── */
    .switch-wrap {
      position: relative;
      width: 51px;
      height: 31px;
      flex-shrink: 0;
    }
    .switch-wrap input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--switch-bg);
      transition: background-color 0.25s ease;
      border-radius: 31px;
    }
    .switch-slider::before {
      position: absolute;
      content: "";
      height: 27px;
      width: 27px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    .switch-wrap input:checked + .switch-slider {
      background-color: var(--tint-green);
    }
    .switch-wrap input:checked + .switch-slider::before {
      transform: translateX(20px);
    }

    /* ─── 控件：Select 下拉选择 ─── */
    .select-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .select-input {
      appearance: none;
      -webkit-appearance: none;
      background: rgba(127, 127, 127, 0.1);
      border: none;
      padding: 6px 28px 6px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: var(--tint-blue);
      font-weight: 500;
      outline: none;
      cursor: pointer;
    }
    .select-arrow {
      position: absolute;
      right: 8px;
      width: 12px;
      height: 12px;
      color: var(--tint-blue);
      pointer-events: none;
    }

    /* ─── 控件：单行输入框 (带显隐眼睛) ─── */
    .input-wrap {
      display: flex;
      align-items: center;
      background: rgba(127, 127, 127, 0.08);
      border-radius: 8px;
      padding: 6px 10px;
      width: 100%;
      margin-top: 6px;
      border: 0.5px solid var(--separator-color);
    }
    .text-input {
      flex: 1;
      background: transparent;
      border: none;
      font-size: 14px;
      font-family: inherit;
      color: var(--text-primary);
      outline: none;
    }
    .text-input::placeholder {
      color: var(--text-secondary);
      opacity: 0.6;
    }
    .input-action-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      padding: 2px 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    /* ─── 控件：多选 Scope 芯片胶囊 ─── */
    .scope-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 16px 14px;
    }
    .scope-chip {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      background: rgba(127, 127, 127, 0.1);
      color: var(--text-secondary);
      border: 0.5px solid transparent;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
    }
    .scope-chip.selected {
      background: rgba(0, 122, 255, 0.12);
      color: var(--tint-blue);
      border-color: rgba(0, 122, 255, 0.3);
      font-weight: 600;
    }

    /* ─── 控件：缓存管理数据面板 ─── */
    .cache-panel {
      padding: 12px 16px;
    }
    .cache-metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .cache-metric-box {
      background: rgba(127, 127, 127, 0.08);
      border-radius: 10px;
      padding: 10px 12px;
      text-align: center;
    }
    .cache-metric-title {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 500;
      margin-bottom: 4px;
    }
    .cache-metric-val {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .cache-feedback-bar {
      font-size: 12px;
      color: var(--tint-blue);
      min-height: 18px;
      margin-top: 8px;
      line-height: 1.4;
      text-align: center;
    }

    /* ─── 操作按钮 (Button) ─── */
    .action-btn-row {
      padding: 10px 16px 14px;
      display: flex;
      gap: 10px;
    }
    .primary-btn {
      flex: 1;
      background: var(--tint-blue);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 11px 16px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
      transition: transform 0.12s, opacity 0.2s, background-color 0.2s;
    }
    .primary-btn:active {
      transform: scale(0.97);
      opacity: 0.9;
    }
    .secondary-btn {
      flex: 1;
      background: rgba(127, 127, 127, 0.12);
      color: var(--text-primary);
      border: none;
      border-radius: 10px;
      padding: 11px 16px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: transform 0.12s, opacity 0.2s;
    }
    .secondary-btn:active {
      transform: scale(0.97);
    }
    .danger-btn {
      color: var(--tint-red);
      background: rgba(255, 59, 48, 0.1);
    }

    /* ─── 分组说明注脚 (Footer) ─── */
    .section-footer {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 6px 16px 20px;
      line-height: 1.4;
      padding: 0 4px;
    }

    /* ─── 提示 Toast 悬浮胶囊 ─── */
    #px-toast {
      position: fixed;
      top: calc(env(safe-area-inset-top, 20px) + 12px);
      left: 50%;
      transform: translateX(-50%) translateY(-60px);
      background: rgba(20, 20, 20, 0.92);
      -webkit-backdrop-filter: blur(20px);
      backdrop-filter: blur(20px);
      color: #fff;
      padding: 8px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      z-index: 999999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: none;
    }
    #px-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* ─── 确认弹层 (ActionSheet) ─── */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: none;
      align-items: flex-end;
      justify-content: center;
      z-index: 999998;
      padding: 12px;
    }
    .modal-overlay.show {
      display: flex;
    }
    .modal-card {
      background: var(--card-bg);
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: modalSlideUp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1);
    }
    @keyframes modalSlideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-title {
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .modal-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 18px;
      line-height: 1.45;
    }
    .modal-actions {
      display: flex;
      gap: 10px;
    }
  </style>
</head>
<body>

  <!-- 提示 Toast 胶囊 -->
  <div id="px-toast">
    <span id="px-toast-icon">✓</span>
    <span id="px-toast-msg">设置已自动保存</span>
  </div>

  <!-- 清理确认弹层 -->
  <div class="modal-overlay" id="clear-modal">
    <div class="modal-card">
      <div class="modal-title">清理翻译缓存</div>
      <div class="modal-desc">将删除所有本地暂存的翻译文本，以便重新请求最新内容。<br>不会影响您的插件设置及 API 密钥。</div>
      <div class="modal-actions">
        <button type="button" class="secondary-btn" onclick="closeClearModal()">取消</button>
        <button type="button" class="primary-btn danger-btn" onclick="executeClearCache()">确定清理</button>
      </div>
    </div>
  </div>

  <!-- 页面品牌大标题 -->
  <div class="brand-header">
    <div class="brand-icon" style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; background: #0096fa; box-shadow: 0 4px 12px rgba(0, 150, 250, 0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      <!-- Pixiv 官方经典 P 标 (矢量 SVG，0 网络延迟瞬出，永不失真) -->
      <svg viewBox="0 0 24 24" width="30" height="30" fill="#ffffff">
        <path d="M12.18 4.05c3.77 0 6.84 3.06 6.84 6.84 0 3.77-3.07 6.84-6.84 6.84a6.81 6.81 0 0 1-4.05-1.34v4.38H5.2V4.05h6.98zm0 3.13a3.7 3.7 0 1 0 0 7.41 3.7 3.7 0 0 0 0-7.41z"/>
      </svg>
    </div>
    <div style="flex: 1;">
      <div class="brand-title">
        Pixiv 增强翻译
        <span class="brand-badge">v4.5.2</span>
      </div>
      <div class="brand-sub">双语出版级排版 · 全页面汉化 · 离线缓存</div>
    </div>
    <button type="button" class="done-nav-btn" onclick="handleDoneClick()">完成</button>
  </div>

  <div class="save-tip-bar">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    <span>修改任何选项即刻实时自动保存，点击「完成」可直接返回 Pixiv</span>
  </div>

  <!-- ─── 第一组：翻译 ─── -->
  <div class="section-card" id="sec-content">
    <div class="section-header" onclick="toggleSection('sec-content')">
      <div class="section-icon" style="background: #007aff; color: #fff;">
        <!-- SF Symbol: globe -->
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
      </div>
      <div class="section-title">翻译设置</div>
      <div class="section-summary" id="sum-content">自动:开 · 简体</div>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>
    <div class="section-body">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">启用 Pixiv 增强翻译</div>
          <div class="setting-desc">总开关：接管全页面日文汉化与视觉漫翻</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-global-switch" onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">默认全自动汉化</div>
          <div class="setting-desc">进入页面后直接呈现翻译结果，无需手动点击</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-auto-switch" onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">智能跳过纯中文内容</div>
          <div class="setting-desc">不包含日文或外语的作品自动跳过，节省配额与零延迟</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-skip-chinese" onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">目标语言</div>
          <div class="setting-desc">期望将外语内容翻译为的目标语言</div>
        </div>
        <div class="select-wrap">
          <select class="select-input" id="cfg-target-lang" onchange="saveConfig()">
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="en">English</option>
            <option value="ja">日本語 (原文)</option>
            <option value="ko">한국어</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">翻译服务</div>
          <div class="setting-desc">选择底层文本翻译所使用的服务引擎</div>
        </div>
        <div class="select-wrap">
          <select class="select-input" id="cfg-translator-source" onchange="onTranslatorChange()">
            <option value="google">Google 免费并发 (极速)</option>
            <option value="deepseek">DeepSeek AI (文学润色/需Key)</option>
            <option value="openai">OpenAI / 兼容接口 (需Key)</option>
            <option value="baidu">百度通用翻译 (稳定/需Key)</option>
            <option value="caiyun">彩云小译 (地道ACG/需Token)</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      <!-- DeepSeek 配置区 -->
      <div id="ai-deepseek-block" style="padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color);">
        <div class="setting-label" style="font-size: 14px;">DeepSeek API Key</div>
        <div class="input-wrap">
          <input type="password" class="text-input" id="cfg-deepseek-key" placeholder="sk-..." onchange="saveConfig()">
          <button type="button" class="input-action-btn" onclick="toggleInputMask('cfg-deepseek-key')">
            <!-- SF Symbol: eye -->
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <div style="flex: 2;">
            <div class="setting-desc">端点 URL</div>
            <div class="input-wrap"><input type="text" class="text-input" id="cfg-deepseek-url" value="https://api.deepseek.com/v1/chat/completions" onchange="saveConfig()"></div>
          </div>
          <div style="flex: 1.2;">
            <div class="setting-desc">模型名称</div>
            <div class="input-wrap"><input type="text" class="text-input" id="cfg-deepseek-model" value="deepseek-v4-flash" onchange="saveConfig()"></div>
          </div>
        </div>
      </div>

      <!-- OpenAI 配置区 -->
      <div id="ai-openai-block" style="padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color); display: none;">
        <div class="setting-label" style="font-size: 14px;">OpenAI API Key</div>
        <div class="input-wrap">
          <input type="password" class="text-input" id="cfg-openai-key" placeholder="sk-..." onchange="saveConfig()">
          <button type="button" class="input-action-btn" onclick="toggleInputMask('cfg-openai-key')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div style="margin-top: 8px;">
          <div class="setting-desc">兼容端点 URL</div>
          <div class="input-wrap"><input type="text" class="text-input" id="cfg-openai-url" value="https://api.openai.com/v1/chat/completions" onchange="saveConfig()"></div>
        </div>
      </div>

      <!-- 百度翻译配置区 -->
      <div id="ai-baidu-block" style="padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color); display: none;">
        <div class="setting-label" style="font-size: 14px; margin-bottom: 6px;">百度翻译 AppID</div>
        <div class="input-wrap" style="margin-bottom: 8px;">
          <input type="text" class="text-input" id="cfg-baidu-appid" placeholder="在 fanyi-api.baidu.com 申请的 AppID" onchange="saveConfig()">
        </div>
        <div class="setting-label" style="font-size: 14px; margin-bottom: 6px;">百度翻译 Secret 密钥</div>
        <div class="input-wrap">
          <input type="password" class="text-input" id="cfg-baidu-secret" placeholder="管理控制台查看的密钥 (注意大小写区分)" onchange="saveConfig()">
          <button type="button" class="input-action-btn" onclick="toggleInputMask('cfg-baidu-secret')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div class="setting-desc" style="margin-top: 6px; color: var(--tint-blue);">💡 百度通用文本翻译每月赠送免费额度，填入后点击下方「测试翻译模型连接与延迟」即可实时验证。</div>
      </div>

      <!-- 彩云小译配置区 -->
      <div id="ai-caiyun-block" style="padding: 10px 16px 14px; border-bottom: 0.5px solid var(--separator-color); display: none;">
        <div class="setting-label" style="font-size: 14px; margin-bottom: 6px;">彩云小译 API Token</div>
        <div class="input-wrap">
          <input type="password" class="text-input" id="cfg-caiyun-token" placeholder="在 open.caiyunapp.com 获取的 Token" onchange="saveConfig()">
          <button type="button" class="input-action-btn" onclick="toggleInputMask('cfg-caiyun-token')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div class="setting-desc" style="margin-top: 6px; color: var(--tint-blue);">💡 彩云科技开放平台 (open.caiyunapp.com) 注册认证后每月赠送 100 万字符免费额度，二次元ACG语料出众。</div>
      </div>

      <div style="padding: 12px 16px 4px;">
        <div class="setting-label" style="font-size: 14px;">生效模块范围</div>
      </div>
      <div class="scope-chips" id="scope-chips-container">
        <div class="scope-chip" data-key="illust_title" onclick="toggleScope(this)">作品标题</div>
        <div class="scope-chip" data-key="illust_caption" onclick="toggleScope(this)">作品简介</div>
        <div class="scope-chip" data-key="tags" onclick="toggleScope(this)">日文标签</div>
        <div class="scope-chip" data-key="novels" onclick="toggleScope(this)">小说正文</div>
        <div class="scope-chip" data-key="comments" onclick="toggleScope(this)">评论区</div>
        <div class="scope-chip" data-key="user_profile" onclick="toggleScope(this)">画师简介</div>
        <div class="scope-chip" data-key="spotlight" onclick="toggleScope(this)">特辑文章</div>
      </div>
      <div class="action-btn-row" style="padding-top: 4px;">
        <button type="button" class="primary-btn" id="btn-test-ai" onclick="testAIConnection()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h12l-4 8 10-10H12l4-8z"/></svg>
          <span>测试翻译模型连接与延迟</span>
        </button>
      </div>
    </div>
  </div>
  <div class="section-footer">
    主页作品卡片同时就地汉化标题与简介，彻底消除未翻译截断引发的弹窗；标签副标题已自动净空，杜绝上下重复显示。
  </div>

  <!-- ─── 第二组：阅读体验 ─── -->
  <div class="section-card" id="sec-novel">
    <div class="section-header" onclick="toggleSection('sec-novel')">
      <div class="section-icon" style="background: #5856d6; color: #fff;">
        <!-- SF Symbol: text.book.closed -->
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          <path d="M6 6h10"/>
          <path d="M6 10h10"/>
          <path d="M6 14h6"/>
        </svg>
      </div>
      <div class="section-title">阅读体验</div>
      <div class="section-summary" id="sum-novel">双语对照 · 系统字体</div>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>
    <div class="section-body">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">双语对照阅读</div>
          <div class="setting-desc">开启后按原文在上、译文在下形成段落对展示；关闭后仅显示译文</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-novel-show-original" onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">排版字体风格</div>
          <div class="setting-desc">提供出版级印刷字体预设，字号与行距继承系统设置</div>
        </div>
        <div class="select-wrap">
          <select class="select-input" id="cfg-novel-font" onchange="saveConfig()">
            <option value="system">系统默认 (苹方)</option>
            <option value="songti">经典宋体 (纸书质感)</option>
            <option value="kaiti">优美楷体 (古雅风格)</option>
            <option value="yuanti">柔和圆体 (亲和温润)</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">自动净化作者免责声明</div>
          <div class="setting-desc">智能过滤台本商用授权、禁止转载等规约条款，呈现纯粹小说正文</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-clean-disclaimer" onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>
  </div>
  <div class="section-footer">
    双语阅读严格按小说段落顺序一对一排列，原文为主阅读层级，译文为从属辅助层级，不加多余卡片边框与杂乱背景。
  </div>

  <!-- ─── 第三组：漫画与图片翻译 ─── -->
  <div class="section-card" id="sec-manga">
    <div class="section-header" onclick="toggleSection('sec-manga')">
      <div class="section-icon" style="background: #ff2d55; color: #fff;">
        <!-- SF Symbol: photo.on.rectangle.angled -->
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 8h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"/>
          <path d="m2 16 5-5 4 4 5-5 6 6"/>
          <circle cx="8" cy="13" r="1.5"/>
          <path d="M7 4h10"/>
        </svg>
      </div>
      <div class="section-title">漫画与图片翻译</div>
      <div class="section-summary" id="sum-manga">未开启</div>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>
    <div class="section-body">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">启用漫画图片翻译</div>
          <div class="setting-desc">开启后在 Pixiv 浏览漫画作品时可一键进入专属全屏漫翻查看器</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-manga-switch" onchange="onMangaSwitchChange()">
          <span class="switch-slider"></span>
        </label>
      </div>

      <!-- 展开的漫翻详细配置区 -->
      <div id="manga-config-box" style="display: none; border-top: 0.5px solid var(--separator-color); background: rgba(127, 127, 127, 0.03);">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">漫翻引擎</div>
            <div class="setting-desc">选择底层图片汉化与字幕服务</div>
          </div>
          <div class="select-wrap">
            <select class="select-input" id="cfg-manga-engine" onchange="onMangaEngineChange()">
              <option value="deepseek_vl">DeepSeek-VL (推荐·高精度气泡)</option>
              <option value="gpt4o_mini">GPT-4o-mini (OpenAI 视觉气泡)</option>
              <option value="manga_translator">自建服务 (manga-translator)</option>
            </select>
            <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        <!-- 自建服务 (选自建时展示) -->
        <div id="manga-selfhost-block" style="padding: 6px 16px 12px; display: none;">
          <div class="input-wrap">
            <input type="text" class="text-input" id="cfg-manga-server" value="http://127.0.0.1:5000" placeholder="http://192.168.1.x:5000" onchange="saveConfig()">
          </div>
        </div>

        <!-- 快速直达任意漫画作品 -->
        <div style="padding: 0 16px 12px;">
          <div class="setting-label" style="font-size: 13px; margin-bottom: 6px;">🔍 快速打开任意漫画作品：</div>
          <div style="display: flex; gap: 8px;">
            <div class="input-wrap" style="flex: 1; margin-bottom: 0;">
              <input type="text" class="text-input" id="quick-illust-id" placeholder="输入作品 ID (如 144146271)">
            </div>
            <button type="button" class="primary-btn" onclick="openQuickViewer()" style="white-space: nowrap; padding: 0 16px; font-size: 13px;">打开查看器</button>
          </div>
        </div>

        <div style="padding: 6px 16px 12px;">
          <button type="button" class="secondary-btn" id="btn-test-manga" onclick="testMangaConnection()" style="width: 100%; padding: 10px 14px; font-size: 14px; font-weight: 600; justify-content: center;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h12l-4 8 10-10H12l4-8z"/></svg>
            <span>测试漫翻服务连接与测速</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="section-footer">
    全量插画与漫画均已注入专属查看器；在查看器内可利用 DeepSeek 视觉模型一键识别对白并覆盖汉化字幕。
  </div>

  <!-- ─── 第四组：悬浮按钮 ─── -->
  <div class="section-card" id="sec-floating">
    <div class="section-header" onclick="toggleSection('sec-floating')">
      <div class="section-icon" style="background: #34c759; color: #fff;">
        <!-- SF Symbol: button.programmable -->
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>
      <div class="section-title">悬浮按钮</div>
      <div class="section-summary" id="sum-floating">已开启</div>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>
    <div class="section-body">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">显示悬浮按钮</div>
          <div class="setting-desc">翻译过程中显示悬浮按钮，支持轻触翻译/还原与长按设置</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-floating-switch" onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>
  </div>
  <div class="section-footer">
    开启后自动避开页面已有喜欢与操作控件，轻点即响应，不跳动不重叠；关闭后完全不注入任何按钮 DOM。
  </div>

  <!-- ─── 第五组：高级与缓存 ─── -->
  <div class="section-card" id="sec-advanced">
    <div class="section-header" onclick="toggleSection('sec-advanced')">
      <div class="section-icon" style="background: #8e8e93; color: #fff;">
        <!-- SF Symbol: slider.horizontal.3 -->
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 21v-7"/>
          <path d="M4 10V3"/>
          <path d="M12 21v-9"/>
          <path d="M12 8V3"/>
          <path d="M20 21v-5"/>
          <path d="M20 12V3"/>
          <path d="M1 14h6"/>
          <path d="M9 8h6"/>
          <path d="M17 16h6"/>
        </svg>
      </div>
      <div class="section-title">高级与缓存</div>
      <div class="section-summary" id="sum-advanced">已就绪</div>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>
    <div class="section-body">
      <!-- 真实缓存管理卡片 -->
      <div class="cache-panel">
        <div class="setting-label" style="margin-bottom: 8px;">翻译缓存</div>
        <div class="setting-desc" style="margin-bottom: 12px;">翻译结果暂存在本地，避免重复请求并提升加载速度</div>
        <div class="cache-metric-grid">
          <div class="cache-metric-box">
            <div class="cache-metric-title">已使用</div>
            <div class="cache-metric-val" id="cache-size">0 B</div>
          </div>
          <div class="cache-metric-box">
            <div class="cache-metric-title">缓存条目</div>
            <div class="cache-metric-val" id="cache-count">0 个</div>
          </div>
          <div class="cache-metric-box">
            <div class="cache-metric-title">最近缓存</div>
            <div class="cache-metric-val" id="cache-time" style="font-size: 13px; line-height: 24px;">暂无缓存</div>
          </div>
        </div>
        <button type="button" class="secondary-btn danger-btn" style="width: 100%;" onclick="openClearModal()">
          <!-- SF Symbol: trash -->
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
          <span>清理缓存</span>
        </button>
        <div class="cache-feedback-bar" id="cache-feedback"></div>
      </div>

            <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">优化图片加载速度</div>
          <div class="setting-desc">走全球 CDN 镜像加速通道 (i.pixiv.re)，大幅提升大图加载速度，翻页更流畅</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-image-accelerate" checked onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">标签优先使用离线词典</div>
          <div class="setting-desc">内置 2500+ ACG 日文 Tag 映射，0ms 响应且副标自动净空</div>
        </div>
        <label class="switch-wrap">
          <input type="checkbox" id="cfg-tag-offline" checked onchange="saveConfig()">
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>
  </div>
  <div class="section-footer">
    清理缓存仅删除已保存的翻译正文条目，不会误删您的设置或 API 密钥；图片镜像如需免流，可在 Loon 添加规则：<code style="background: rgba(127,127,127,0.15); padding: 1px 4px; border-radius: 4px;">DOMAIN,i.pixiv.re,DIRECT</code>。
  </div>

  <!-- ─── 第六组：关于 ─── -->
  <div class="section-card" id="sec-about">
    <div class="section-header" onclick="toggleSection('sec-about')">
      <div class="section-icon" style="background: #ff9500; color: #fff;">
        <!-- SF Symbol: info.circle -->
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
      </div>
      <div class="section-title">关于与状态</div>
      <div class="section-summary" id="sum-about">v4.5.2 旗舰版</div>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>
    <div class="section-body">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">插件版本</div>
          <div class="setting-desc">Pixiv Enhanced Translation Suite</div>
        </div>
        <span style="font-size: 14px; color: var(--text-secondary); font-weight: 500;">v4.5.2</span>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">运行架构</div>
          <div class="setting-desc">0 外部 CDN 依赖 · 本地内存极速直出</div>
        </div>
        <span style="font-size: 14px; color: var(--tint-green); font-weight: 500;">● 离线脱机</span>
      </div>
    </div>
  </div>

  <!-- 底部醒目保存主按钮 -->
  <div style="margin: 24px 0 16px; padding: 0 4px;">
    <button type="button" class="primary-btn" id="btn-save-bottom" onclick="handleDoneClick()" style="width: 100%; padding: 14px 20px; font-size: 16px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 122, 255, 0.3);">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      <span>保存设置</span>
    </button>
  </div>

  <script>
    const DEFAULT_CONFIG = {
      "@Pixiv.Enhanced.Settings.Global.Switch": true,
      "@Pixiv.Enhanced.Settings.Auto.Switch": true,
      "@Pixiv.Enhanced.Settings.Auto.Scopes": ["illust_title", "illust_caption", "tags", "comments", "user_profile", "novels", "spotlight"],
      "@Pixiv.Enhanced.Settings.Filter.SkipChinese": true,
      "@Pixiv.Enhanced.Settings.Novel.Font": "system",
      "@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer": true,
      "@Pixiv.Enhanced.Settings.Novel.ShowOriginal": true,
      "@Pixiv.Enhanced.Settings.Floating.Switch": true,
      "@Pixiv.Enhanced.Settings.Translator.Source": "google",
      "@Pixiv.Enhanced.Settings.Target.Lang": "zh-CN",
      "@Pixiv.Enhanced.Settings.Network.ImageAccelerate": true,
      "@Pixiv.Enhanced.Settings.Tag.OfflineOnly": true,
      "@Pixiv.Enhanced.Settings.Image.Switch": true,
      "@Pixiv.Enhanced.Settings.Image.Engine": "deepseek_vl",
      "@Pixiv.Enhanced.Settings.Auth.DeepSeekKey": "",
      "@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl": "https://api.deepseek.com/v1/chat/completions",
      "@Pixiv.Enhanced.Settings.Auth.DeepSeekModel": "deepseek-v4-flash",
      "@Pixiv.Enhanced.Settings.Auth.OpenAIKey": "",
      "@Pixiv.Enhanced.Settings.Auth.OpenAIUrl": "https://api.openai.com/v1/chat/completions",
      "@Pixiv.Enhanced.Settings.Auth.BaiduAppid": "",
      "@Pixiv.Enhanced.Settings.Auth.BaiduSecret": "",
      "@Pixiv.Enhanced.Settings.Auth.CaiyunToken": "",
      "@Pixiv.Enhanced.Settings.Manga.ServerUrl": "http://127.0.0.1:5000",
      "@Pixiv.Enhanced.Settings.LogLevel": "WARN"
    };

    let currentConfig = Object.assign({}, DEFAULT_CONFIG);
    let selectedScopes = new Set(DEFAULT_CONFIG["@Pixiv.Enhanced.Settings.Auto.Scopes"]);
    let isInitializing = false;

    function showToast(msg, icon) {
      const toast = document.getElementById("px-toast");
      document.getElementById("px-toast-msg").textContent = msg;
      document.getElementById("px-toast-icon").textContent = icon || "✓";
      toast.classList.add("show");
      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    function toggleSection(id) {
      const card = document.getElementById(id);
      if (card) card.classList.toggle("expanded");
    }

    function toggleInputMask(inputId) {
      const input = document.getElementById(inputId);
      if (input) input.type = (input.type === "password") ? "text" : "password";
    }

    function toggleScope(el) {
      const key = el.getAttribute("data-key");
      if (selectedScopes.has(key)) {
        selectedScopes.delete(key);
        el.classList.remove("selected");
      } else {
        selectedScopes.add(key);
        el.classList.add("selected");
      }
      saveConfig();
    }

    function openQuickViewer() {
      const input = document.getElementById("quick-illust-id");
      const id = input ? input.value.trim().replace(/\D+/g, "") : "";
      if (!id) {
        showToast("请输入有效的纯数字作品 ID", "ℹ️");
        return;
      }
      window.location.href = "https://www.pixiv.net/manga/viewer?illust_id=" + id;
    }

    function onTranslatorChange(shouldSave = true) {
      const source = document.getElementById("cfg-translator-source") ? document.getElementById("cfg-translator-source").value : "google";
      const dsBlock = document.getElementById("ai-deepseek-block");
      const oaBlock = document.getElementById("ai-openai-block");
      const bdBlock = document.getElementById("ai-baidu-block");
      const cyBlock = document.getElementById("ai-caiyun-block");
      if (dsBlock) dsBlock.style.display = (source === "deepseek") ? "block" : "none";
      if (oaBlock) oaBlock.style.display = (source === "openai") ? "block" : "none";
      if (bdBlock) bdBlock.style.display = (source === "baidu") ? "block" : "none";
      if (cyBlock) cyBlock.style.display = (source === "caiyun") ? "block" : "none";
      if (shouldSave && !isInitializing) saveConfig();
    }

    function onMangaSwitchChange(shouldSave = true) {
      const el = document.getElementById("cfg-manga-switch");
      const on = el ? el.checked : false;
      const box = document.getElementById("manga-config-box");
      if (box) box.style.display = on ? "block" : "none";
      onMangaEngineChange(shouldSave);
    }

    function onMangaEngineChange(shouldSave = true) {
      const engineEl = document.getElementById("cfg-manga-engine");
      const engine = engineEl ? engineEl.value : "deepseek_vl";
      const sBlock = document.getElementById("manga-selfhost-block");
      if (sBlock) sBlock.style.display = (engine === "manga_translator") ? "block" : "none";
      if (shouldSave && !isInitializing) saveConfig();
    }

    function updateSummaries() {
      const autoEl = document.getElementById("cfg-auto-switch");
      const autoOn = autoEl ? autoEl.checked : true;
      const targetLang = document.getElementById("cfg-target-lang") ? document.getElementById("cfg-target-lang").value : "zh-CN";
      const langText = (targetLang === "zh-CN") ? "简体" : (targetLang === "zh-TW" ? "繁體" : targetLang);
      const sumContent = document.getElementById("sum-content");
      if (sumContent) sumContent.textContent = (autoOn ? "自动:开" : "自动:关") + " · " + langText;

      const fontEl = document.getElementById("cfg-novel-font");
      const font = fontEl ? fontEl.value : "system";
      const fontNameMap = { system: "苹方", songti: "宋体", kaiti: "楷体", yuanti: "圆体" };
      const showOrigEl = document.getElementById("cfg-novel-show-original");
      const showOrig = showOrigEl ? showOrigEl.checked : true;
      const sumNovel = document.getElementById("sum-novel");
      if (sumNovel) sumNovel.textContent = (showOrig ? "双语对照" : "仅译文") + " · " + (fontNameMap[font] || "原版");

      const mangaEl = document.getElementById("cfg-manga-switch");
      const mangaOn = mangaEl ? mangaEl.checked : false;
      const engineEl = document.getElementById("cfg-manga-engine");
      const engine = engineEl ? engineEl.value : "deepseek_vl";
      const engineMap = { deepseek_vl: "DeepSeek-VL", gpt4o_mini: "GPT-4o-mini", manga_translator: "自建服务" };
      const sumManga = document.getElementById("sum-manga");
      if (sumManga) sumManga.textContent = mangaOn ? ("已开启 · " + (engineMap[engine] || "视觉AI")) : "未开启";

      const floatingEl = document.getElementById("cfg-floating-switch");
      const floatingOn = floatingEl ? floatingEl.checked : true;
      const sumFloating = document.getElementById("sum-floating");
      if (sumFloating) sumFloating.textContent = floatingOn ? "已开启" : "已关闭";

      const transEl = document.getElementById("cfg-translator-source");
      const trans = transEl ? transEl.value : "google";
      const transMap = { google: "Google免费", deepseek: "DeepSeek", openai: "OpenAI", baidu: "百度翻译", caiyun: "彩云小译" };
      const sumAi = document.getElementById("sum-ai");
      if (sumAi) sumAi.textContent = transMap[trans] || trans;
    }

    async function handleDoneClick() {
      const btnTop = document.querySelector(".done-nav-btn");
      const btnBtm = document.getElementById("btn-save-bottom");
      if (btnTop) btnTop.textContent = "⏳ 正在保存…";
      if (btnBtm) {
        const span = btnBtm.querySelector("span");
        if (span) span.textContent = "⏳ 正在保存…";
      }

      let saveOk = false;
      try {
        await saveConfig();
        saveOk = true;
        showToast("设置已成功保存生效", "✓");
        if (btnTop) btnTop.textContent = "✓ 已保存";
        if (btnBtm) {
          const span = btnBtm.querySelector("span");
          if (span) span.textContent = "✓ 设置已保存";
        }
      } catch (e) {
        showToast("保存失败，请检查网络", "❌");
        if (btnTop) btnTop.textContent = "保存失败";
        if (btnBtm) {
          const span = btnBtm.querySelector("span");
          if (span) span.textContent = "保存失败，重试";
        }
      }

      if (saveOk) {
        setTimeout(function () {
          if (btnTop) btnTop.textContent = "完成";
          if (btnBtm) {
            const span = btnBtm.querySelector("span");
            if (span) span.textContent = "保存设置";
          }
          try {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
            }
          } catch (e) {}
        }, 400);
      } else {
        setTimeout(function () {
          if (btnTop) btnTop.textContent = "完成";
          if (btnBtm) {
            const span = btnBtm.querySelector("span");
            if (span) span.textContent = "保存设置";
          }
        }, 2000);
      }
    }

    async function loadConfig() {
      isInitializing = true;
      try {
        const res = await fetch("/api/get").then(r => r.json()).catch(() => null);
        if (res && typeof res === "object") {
          currentConfig = Object.assign({}, DEFAULT_CONFIG, res);
        }
      } catch (e) { }

      const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

      setCheck("cfg-global-switch", currentConfig["@Pixiv.Enhanced.Settings.Global.Switch"]);
      setCheck("cfg-auto-switch", currentConfig["@Pixiv.Enhanced.Settings.Auto.Switch"]);
      setCheck("cfg-skip-chinese", currentConfig["@Pixiv.Enhanced.Settings.Filter.SkipChinese"]);
      setVal("cfg-target-lang", currentConfig["@Pixiv.Enhanced.Settings.Target.Lang"] || "zh-CN");

      setVal("cfg-novel-font", currentConfig["@Pixiv.Enhanced.Settings.Novel.Font"] || "system");
      setCheck("cfg-clean-disclaimer", currentConfig["@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer"]);
      setCheck("cfg-novel-show-original", currentConfig["@Pixiv.Enhanced.Settings.Novel.ShowOriginal"] !== false);
      setCheck("cfg-floating-switch", currentConfig["@Pixiv.Enhanced.Settings.Floating.Switch"] !== false);

      setVal("cfg-translator-source", currentConfig["@Pixiv.Enhanced.Settings.Translator.Source"] || "google");
      setVal("cfg-deepseek-key", currentConfig["@Pixiv.Enhanced.Settings.Auth.DeepSeekKey"] || "");
      setVal("cfg-deepseek-url", currentConfig["@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl"] || "https://api.deepseek.com/v1/chat/completions");
      setVal("cfg-deepseek-model", currentConfig["@Pixiv.Enhanced.Settings.Auth.DeepSeekModel"] || "deepseek-v4-flash");
      setVal("cfg-openai-key", currentConfig["@Pixiv.Enhanced.Settings.Auth.OpenAIKey"] || "");
      setVal("cfg-openai-url", currentConfig["@Pixiv.Enhanced.Settings.Auth.OpenAIUrl"] || "https://api.openai.com/v1/chat/completions");

      setCheck("cfg-manga-switch", currentConfig["@Pixiv.Enhanced.Settings.Image.Switch"]);
      setVal("cfg-manga-engine", currentConfig["@Pixiv.Enhanced.Settings.Image.Engine"] || "deepseek_vl");
      setVal("cfg-baidu-appid", currentConfig["@Pixiv.Enhanced.Settings.Auth.BaiduAppid"] || "");
      setVal("cfg-baidu-secret", currentConfig["@Pixiv.Enhanced.Settings.Auth.BaiduSecret"] || "");
      setVal("cfg-caiyun-token", currentConfig["@Pixiv.Enhanced.Settings.Auth.CaiyunToken"] || "");
      setVal("cfg-manga-server", currentConfig["@Pixiv.Enhanced.Settings.Manga.ServerUrl"] || "http://127.0.0.1:5000");

      setCheck("cfg-image-accelerate", currentConfig["@Pixiv.Enhanced.Settings.Network.ImageAccelerate"] !== false);
      setCheck("cfg-tag-offline", currentConfig["@Pixiv.Enhanced.Settings.Tag.OfflineOnly"]);

      const scopes = Array.isArray(currentConfig["@Pixiv.Enhanced.Settings.Auto.Scopes"])
        ? currentConfig["@Pixiv.Enhanced.Settings.Auto.Scopes"]
        : DEFAULT_CONFIG["@Pixiv.Enhanced.Settings.Auto.Scopes"];
      selectedScopes = new Set(scopes);
      document.querySelectorAll(".scope-chip").forEach(chip => {
        const k = chip.getAttribute("data-key");
        if (selectedScopes.has(k)) chip.classList.add("selected");
        else chip.classList.remove("selected");
      });

      onTranslatorChange(false);
      onMangaSwitchChange(false);
      updateSummaries();
      isInitializing = false;
    }

    async function saveConfig() {
      if (isInitializing) return;
      const getCheck = (id, def) => { const el = document.getElementById(id); return el ? el.checked : def; };
      const getVal = (id, def) => { const el = document.getElementById(id); return el ? el.value.trim() : def; };

      currentConfig["@Pixiv.Enhanced.Settings.Global.Switch"] = getCheck("cfg-global-switch", true);
      currentConfig["@Pixiv.Enhanced.Settings.Auto.Switch"] = getCheck("cfg-auto-switch", true);
      currentConfig["@Pixiv.Enhanced.Settings.Filter.SkipChinese"] = getCheck("cfg-skip-chinese", true);
      currentConfig["@Pixiv.Enhanced.Settings.Target.Lang"] = getVal("cfg-target-lang", "zh-CN");
      currentConfig["@Pixiv.Enhanced.Settings.Auto.Scopes"] = Array.from(selectedScopes);

      currentConfig["@Pixiv.Enhanced.Settings.Novel.Font"] = getVal("cfg-novel-font", "system");
      currentConfig["@Pixiv.Enhanced.Settings.Novel.CleanDisclaimer"] = getCheck("cfg-clean-disclaimer", true);
      currentConfig["@Pixiv.Enhanced.Settings.Novel.ShowOriginal"] = getCheck("cfg-novel-show-original", true);
      currentConfig["@Pixiv.Enhanced.Settings.Floating.Switch"] = getCheck("cfg-floating-switch", true);

      currentConfig["@Pixiv.Enhanced.Settings.Translator.Source"] = getVal("cfg-translator-source", "google");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.DeepSeekKey"] = getVal("cfg-deepseek-key", "");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.DeepSeekUrl"] = getVal("cfg-deepseek-url", "https://api.deepseek.com/v1/chat/completions");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.DeepSeekModel"] = getVal("cfg-deepseek-model", "deepseek-v4-flash");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.OpenAIKey"] = getVal("cfg-openai-key", "");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.OpenAIUrl"] = getVal("cfg-openai-url", "https://api.openai.com/v1/chat/completions");

      currentConfig["@Pixiv.Enhanced.Settings.Network.ImageAccelerate"] = getCheck("cfg-image-accelerate", true);
      currentConfig["@Pixiv.Enhanced.Settings.Tag.OfflineOnly"] = getCheck("cfg-tag-offline", true);
      currentConfig["@Pixiv.Enhanced.Settings.Image.Switch"] = getCheck("cfg-manga-switch", true);
      currentConfig["@Pixiv.Enhanced.Settings.Image.Engine"] = getVal("cfg-manga-engine", "deepseek_vl");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.BaiduAppid"] = getVal("cfg-baidu-appid", "");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.BaiduSecret"] = getVal("cfg-baidu-secret", "");
      currentConfig["@Pixiv.Enhanced.Settings.Auth.CaiyunToken"] = getVal("cfg-caiyun-token", "");
      currentConfig["@Pixiv.Enhanced.Settings.Manga.ServerUrl"] = getVal("cfg-manga-server", "http://127.0.0.1:5000");

      updateSummaries();

      try {
        await fetch("/api/set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentConfig)
        });
        showToast("设置已实时同步保存", "✓");
      } catch (e) {
        showToast("已在本地更新", "ℹ️");
      }
    }

    async function testAIConnection() {
      const btn = document.getElementById("btn-test-ai");
      if (!btn) return;
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ 正在测试连接与测速…</span>';
      const start = Date.now();

      try {
        const sourceEl = document.getElementById("cfg-translator-source");
        const source = sourceEl ? sourceEl.value : "google";
        const appid = (document.getElementById("cfg-baidu-appid") ? document.getElementById("cfg-baidu-appid").value : "").trim();
        const secret = (document.getElementById("cfg-baidu-secret") ? document.getElementById("cfg-baidu-secret").value : "").trim();
        const caiyunToken = (document.getElementById("cfg-caiyun-token") ? document.getElementById("cfg-caiyun-token").value : "").trim();

        saveConfig();

        const query = "?source=" + encodeURIComponent(source) +
          "&appid=" + encodeURIComponent(appid) +
          "&secret=" + encodeURIComponent(secret) +
          "&caiyun_token=" + encodeURIComponent(caiyunToken);

        const res = await fetch("/api/test_ai" + query, { method: "POST" })
          .then(r => r.json())
          .catch(() => null);
        const latency = Date.now() - start;

        if (res && res.ok) {
          const detail = res.translation ? (" · " + res.translation) : "";
          btn.innerHTML = '<span>🟢 连接正常 · ' + latency + 'ms' + detail + '</span>';
          showToast("翻译模型连接正常 (" + latency + "ms)", "🟢");
        } else {
          const err = (res && res.error) ? res.error : "请求超时或鉴权失败";
          btn.innerHTML = '<span>🔴 失败: ' + err.slice(0, 18) + '</span>';
          showToast("连接失败: " + err, "❌");
        }
      } catch (e) {
        btn.innerHTML = '<span>🔴 网络异常</span>';
        showToast("网络请求异常: " + (e && e.message ? e.message : e), "❌");
      }

      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h12l-4 8 10-10H12l4-8z"/></svg><span>测试翻译模型连接与延迟</span>';
        }
      }, 3500);
    }

    async function testMangaConnection() {
      const btn = document.getElementById("btn-test-manga");
      if (!btn) return;
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ 正在测试漫翻服务…</span>';
      const start = Date.now();

      try {
        const engine = document.getElementById("cfg-manga-engine") ? document.getElementById("cfg-manga-engine").value : "deepseek_vl";
        const server = (document.getElementById("cfg-manga-server") ? document.getElementById("cfg-manga-server").value : "").trim();

        // 立即触发保存保证同步
        saveConfig();

        const query = "?engine=" + encodeURIComponent(engine) +
          "&server=" + encodeURIComponent(server);

        const res = await fetch("/api/test_manga" + query, { method: "POST" })
          .then(r => r.json())
          .catch(() => null);
        const latency = Date.now() - start;

        if (res && res.ok) {
          const detail = res.translation ? (" · " + res.translation) : "";
          btn.innerHTML = '<span>🟢 漫翻正常 · ' + latency + 'ms' + detail + '</span>';
          showToast("漫翻服务测试正常 (" + latency + "ms)", "🟢");
        } else {
          const err = (res && res.error) ? res.error : "请求超时或连接失败";
          btn.innerHTML = '<span>🔴 失败: ' + err.slice(0, 18) + '</span>';
          showToast("漫翻测试失败: " + err, "❌");
        }
      } catch (e) {
        btn.innerHTML = '<span>🔴 网络异常</span>';
        showToast("网络请求异常: " + (e && e.message ? e.message : e), "❌");
      }

      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h12l-4 8 10-10H12l4-8z"/></svg><span>测试漫翻服务连接与测速</span>';
        }
      }, 3500);
    }

    /* ─── 真实缓存管理 ─── */
    async function loadCacheStats() {
      const sizeEl = document.getElementById("cache-size");
      const countEl = document.getElementById("cache-count");
      const timeEl = document.getElementById("cache-time");
      try {
        const res = await fetch("/api/cache_stats").then(r => r.json());
        if (!res || !res.ok) throw new Error("统计失败");
        if (sizeEl) sizeEl.textContent = res.sizeText || "0 B";
        if (countEl) countEl.textContent = (res.count || 0) + " 个";
        if (timeEl) timeEl.textContent = res.timeText || "暂无缓存";
      } catch (e) {
        if (sizeEl) sizeEl.textContent = "0 B";
        if (countEl) countEl.textContent = "0 个";
        if (timeEl) timeEl.textContent = "暂无缓存";
      }
    }

    function openClearModal() {
      const modal = document.getElementById("clear-modal");
      if (modal) modal.classList.add("show");
    }

    function closeClearModal() {
      const modal = document.getElementById("clear-modal");
      if (modal) modal.classList.remove("show");
    }

    async function executeClearCache() {
      closeClearModal();
      const feedback = document.getElementById("cache-feedback");
      if (feedback) feedback.textContent = "正在清理本地缓存…";
      try {
        const res = await fetch("/api/clear_cache", { method: "POST" }).then(r => r.json());
        if (!res || !res.ok) throw new Error("清理异常");
        if (feedback) feedback.textContent = "✓ 缓存已清理：已释放 " + res.sizeText + " · 已删除 " + res.count + " 条";
        showToast("缓存已清理", "✓");
        await loadCacheStats();
      } catch (e) {
        if (feedback) feedback.textContent = "清理失败，请重试";
        showToast("清理缓存失败", "!");
      }
    }

    function initSettingsPage() {
      loadConfig();
      loadCacheStats();
    }

    window.addEventListener("pageshow", () => {
      initSettingsPage();
    });

    document.addEventListener("DOMContentLoaded", () => {
      initSettingsPage();
    });
  </script>
</body>
</html>
