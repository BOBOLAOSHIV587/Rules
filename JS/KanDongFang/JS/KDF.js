/* 
 * 看东方 
 * 提取会员视频 跳转浏览器HTML页面
 * 2025-04-25
 * 2025-11-15
 *
[rewrite_local]
# NBA视频和电视剧
https:\/\/bp-api\.bestv\.com\.cn\/cms\/api\/(live\/studio\/id\/v8|c\/player\/common) url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/KDF/video-parser.js
# HTML页面
^https?:\/\/360\.com\/(?:video|nba\.m3u|dianshi\.m3u)$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/KDF/video-parser.js

[mitm]
hostname = 360.com, bp-api.bestv.com.cn
*/
/****************************************************************
 * 看东方 NBA & 电视剧 → HTML + M3U (v2025-11-15)
 ****************************************************************/

const $origDone = $done;
$done = (obj = {}) => {
  this.$prefs || (obj.status &&= +String(obj.status).match(/\b\d{3}\b/)[0]);
  $origDone(obj);
};
const store = {
  get: this.$prefs?.valueForKey ?? $persistentStore.read,
  set: (k, v) => (this.$prefs?.setValueForKey ?? $persistentStore.write)(v, k)
};
const UTILS_URL = 'https://raw.githubusercontent.com/xzxxn777/Surge/main/Utils/Utils.js';
const CACHE_KEY_CODE = 'Utils_Code';
const CACHE_KEY_TIME = 'Utils_Codetime';
const KDF_AES_KEY = 'UITN25LMUQC436IM'; 
function kvGet(key) {
  try {
    if (typeof $prefs !== 'undefined' && $prefs.valueForKey)
      return $prefs.valueForKey(key) || '';
    if (typeof $persistentStore !== 'undefined' && $persistentStore.read)
      return $persistentStore.read(key) || '';
  } catch {}
  return '';
}
function kvSet(key, val) {
  try {
    if (typeof $prefs !== 'undefined' && $prefs.setValueForKey)
      return $prefs.setValueForKey(val, key);
    if (typeof $persistentStore !== 'undefined' && $persistentStore.write)
      return $persistentStore.write(val, key);
  } catch {}
  return false;
}
function fetchRemote(options) {
  return new Promise((resolve, reject) => {
    const method = (options.method || 'GET').toUpperCase();
    if (typeof $httpClient !== 'undefined') {
      const fn = method === 'POST' ? $httpClient.post : $httpClient.get;
      fn(options, (error, response, body) => {
        if (error) return reject(error);
        resolve({ response, body });
      });
    } else if (typeof $task !== 'undefined') {
      if (method === 'POST') options.method = 'POST';
      $task.fetch(options).then(
        resp => resolve({ response: resp, body: resp.body }),
        err  => reject((err && err.error) || err)
      );
    } else {
      reject('Unsupported environment');
    }
  });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return null; }
}
async function loadUtilsCached() {
  const cached = kvGet(CACHE_KEY_CODE);
  if (cached) {
    try {
      eval(cached);
      if (typeof creatUtils === 'function') return creatUtils();
      if (typeof createUtils === 'function') return createUtils();
      // 缓存内容异常，清掉，之前404导致报错，，
      kvSet(CACHE_KEY_CODE, '');
    } catch {
      kvSet(CACHE_KEY_CODE, '');
    }
  }

  try {
    const { body } = await fetchRemote({ url: UTILS_URL, method: 'GET', timeout: 15000 });
    if (!body) return null;
    try {
      eval(body);
      if (typeof creatUtils === 'function' || typeof createUtils === 'function') {
        kvSet(CACHE_KEY_CODE, body);
        kvSet(CACHE_KEY_TIME, String(Date.now()));
        return typeof creatUtils === 'function' ? creatUtils() : createUtils();
      }
      return null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

async function getCryptoJS() {
  if (this.__GLOBAL_CryptoJS) return this.__GLOBAL_CryptoJS;
  const utils = await loadUtilsCached();
  if (!utils || typeof utils.createCryptoJS !== 'function') return null;
  const CryptoJS = utils.createCryptoJS();
  this.__GLOBAL_CryptoJS = CryptoJS;
  return CryptoJS;
}

async function decryptKDFBody(cipherText) {
  const CryptoJS = await getCryptoJS();
  if (!CryptoJS) return '';

  let txt = String(cipherText || '').trim();
  // 换行或空格
  txt = txt.replace(/\s+/g, '');
  // 引号
  txt = txt.replace(/^"|"$/g, '');
  if (!txt) return '';
  const key = CryptoJS.enc.Utf8.parse(KDF_AES_KEY);
  try {
    const ct = CryptoJS.enc.Base64.parse(txt);
    const bytes = CryptoJS.AES.decrypt(
      { ciphertext: ct },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const result = bytes.toString(CryptoJS.enc.Utf8);
    if (result && (result[0] === '{' || result[0] === '[')) {
      return result;
    }
  } catch (e) {
  }
  try {
    const ctHex = CryptoJS.enc.Hex.parse(txt);
    const bytes = CryptoJS.AES.decrypt(
      { ciphertext: ctHex },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const result = bytes.toString(CryptoJS.enc.Utf8);
    if (result && (result[0] === '{' || result[0] === '[')) {
      return result;
    }
  } catch (e) {}

  return '';
}
const M3U_HEADER =
  '#EXTM3U x-tvg-url="https://t.me/GithubYu9191"';

const extraLines = t => [
  `#EXTINF:-1 tvg-id="频道说明" tvg-name="频道说明" tvg-logo="https://epg.iill.top/logo/温馨提示.png" group-title="•${t}",欢迎订阅频道：https://t.me/GithubYu9191`,
  'https://t.me/GithubYu9191'
];

const url = $request.url || '';
if (
  url.includes('/api/v1/nba/game/') ||
    // 11月最新版是v8路径 之前的不兼容
  url.includes('/cms/api/live/studio/id/v8') ||
  url.includes('/cms/api/c/player/common')
) {
  // 老版本是明文，新版本是加密
  parseVideoApi();
} else if (url.includes('360.com/nba.m3u')) {
  renderM3U('nba');
} else if (url.includes('360.com/dianshi.m3u')) {
  renderM3U('tv');
} else if (url.includes('360.com/video')) {
  renderHtml();
} else {
  $done({});
}

async function parseVideoApi() {
  try {
    let raw = $response.body;
    if (typeof raw !== 'string') raw = String(raw || '');
    let parsed = safeJson(raw);
    if (!parsed) {
      const decrypted = await decryptKDFBody(raw);
      if (!decrypted) {
        console.log('KDF: 解密失败或结果为空');
        return $done({});
      }
      parsed = safeJson(decrypted);
      if (!parsed) {
        console.log('KDF: 解密后 JSON 解析失败');
        return $done({});
      }
    }

    const body = parsed;

    if (body.dt?.liveStudioStreamRelVoList) return handleNBA(body.dt);
    if (body.dt?.medias)                       return handleTV(body.dt);

    console.log('KDF: 未识别的内容结构');
    $done({});
  } catch (e) {
    console.log('KDF: parseVideoApi 异常: ' + e);
    $done({});
  }
}

/* ---------------- NBA ---------------- */
function handleNBA(dt) {
  store.set('content_type', 'nba');
  store.set('nba_game_title', dt.title);
  store.set('nba_game_description', dt.description || '');
  store.set('nba_game_cover', dt.sourceCover);
  store.set('nba_game_background', dt.backgroundCover || dt.sourceCover);

  const streams = (dt.liveStudioStreamRelVoList || []).map(s => {
    const best =
      s.qualitys?.find(q => /1080/.test(q.qualityShortName || '')) ??
      s.qualitys?.[0] ?? {};
    return {
      title    : s.title,
      cover    : s.cover,
      canSee   : s.canSee,
      qualitys : s.qualitys || [],
      playUrl  : best.qualityUrl || ''
    };
  });
  store.set('nba_streams', JSON.stringify(streams));
  if (dt.studioTabVoList) store.set('nba_tabs', JSON.stringify(dt.studioTabVoList));

  notify(dt.title, 'NBA比赛');
  $done({});
}

/* ---------------- 电视剧 ---------------- */
function handleTV(dt) {
  const cur = dt.currentMedias || {};
  /* 基本信息 */
  store.set('content_type', 'tv');
  store.set('tv_title', cur.contentName || '');
  store.set('tv_cover', cur.mediaCover || '');
  store.set('tv_description', cur.shareDesc || '');
  store.set('tv_current_ep', cur.episodeNumber || 1);
  store.set('tv_current_media', JSON.stringify(cur));

  /* ========= 处理两种结构 (数组 / data[]) ========= */
  const rawEps = Array.isArray(dt.medias) ? dt.medias : (dt.medias?.data || []);

  /* 选择最佳清晰度播放地址 */
  const pickBest = (qArr = [], fallback = '') => {
    if (!Array.isArray(qArr) || qArr.length === 0) return fallback;
    return qArr
      .map(q => ({
        url   : q.qualityUrl || q.originalUrl || '',
        score :
          /1080|FHD/i.test(q.qualityShortName || q.bitrateType) ? 3 :
          /720|HD/i.test(q.qualityShortName || q.bitrateType)  ? 2 : 1,
        bw    : +(q.bandWidth || 0)
      }))
      .filter(o => o.url)
      .sort((a, b) => b.score - a.score || b.bw - a.bw)[0].url;
  };

  const episodes = rawEps.map(ep => ({
    episodeNumber : ep.episodeNumber,
    title         : ep.mediaName,
    subTitle      : ep.mediaSubTitle,
    cover         : ep.mediaCover,
    duration      : ep.duration,
    qualitys      : ep.qualitys || [],
    playUrl       : pickBest(ep.qualitys, ep.mediaUrl || '')
  }));
  store.set('tv_episodes', JSON.stringify(episodes));

  notify(cur.contentName || '电视剧', '电视剧');
  $done({});
}

/* ---------- 系统通知 ---------- */
function notify(title, type) {
  const link = 'https://360.com/video';
  (this.$notify ?? $notification.post)(
    title || '看东方',
    '',
    type === 'NBA比赛' ? '点击查看比赛直播和集锦' : '点击查看剧集',
    { 'open-url': link, openUrl: link, url: link }
  );
}
function buildM3U(kind) {
  const lines = [M3U_HEADER];

  if (kind === 'nba') {
    const title = store.get('nba_game_title') || 'NBA';
    lines.push(...extraLines(title));
    JSON.parse(store.get('nba_streams') || '[]').forEach(s => {
      if (!s.playUrl) return;
      lines.push(`#EXTINF:-1 tvg-id="${s.title}" tvg-name="${s.title}" tvg-logo="${s.cover}" group-title="${s.title}「1080」",${s.title}`);
      lines.push(s.playUrl);
    });
  } else {  /* tv */
    const title = store.get('tv_title') || '电视剧';
    lines.push(...extraLines(title));
    JSON.parse(store.get('tv_episodes') || '[]').forEach(ep => {
      const url = ep.playUrl ||
                  (ep.qualitys?.find(q => q.qualityUrl)?.qualityUrl) ||
                  ep.mediaUrl || '';
      if (!url) return;
      const name = `${title} - 第${ep.episodeNumber}集`;
      lines.push(`#EXTINF:-1 tvg-id="${name}" tvg-name="${name}" tvg-logo="${ep.cover}" group-title="${title}",${name}`);
      lines.push(url);
    });
  }
  return lines.join('\n');
}

function renderM3U(kind) {
  $done({
    status: 'HTTP/1.1 200 OK',
    headers: { 'Content-Type': 'audio/x-mpegurl; charset=utf-8' },
    body: buildM3U(kind)
  });
}

function renderHtml() {
  try {
    const type = store.get('content_type') || 'nba';
    type === 'nba' ? htmlNBA() : htmlTV();
  } catch (e) {
    $done({
      status: 'HTTP/1.1 500',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `<h1>Error</h1><p>${e}</p>`
    });
  }
}

/* ---- NBA 页面 ---- */
function htmlNBA() {
  const title   = store.get('nba_game_title')        || 'NBA';
  const desc    = store.get('nba_game_description')  || '';
  const cover   = store.get('nba_game_cover')        || '';
  const bg      = store.get('nba_game_background')   || cover;
  const streams = JSON.parse(store.get('nba_streams') || '[]');
  const tabs    = JSON.parse(store.get('nba_tabs')    || '[]');

  const streamsHTML = streams.map(s => {
    const badge = !s.canSee ? '<span class="vip-badge">会员</span>' : '';
    const qBtns = (s.qualitys || []).map(q =>
      `<a href="${q.qualityUrl}" class="quality-btn" target="_blank">${q.qualityShortName}</a>`
    ).join('');
    return `<div class="video-item ${!s.canSee ? 'vip-content' : ''}">
      <div class="video-thumbnail"><img src="${s.cover}" alt="${s.title}" onerror="this.src=''">${badge}</div>
      <h3>${s.title}</h3><div class="quality-options">${qBtns}</div></div>`;
  }).join('');

  const tabsHTML = tabs
    .filter(t => t.address)
    .map(t => `<a href="${t.address}" class="tab-btn" target="_blank">${t.name}</a>`)
    .join('');

  $done({
    status: 'HTTP/1.1 200 OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>${title}</title><style>${css()}
    .videos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:15px;margin-top:10px}
    .m3u-btn{margin-left:10px;padding:4px 12px;border:0;border-radius:4px;background:var(--primary-color);color:#fff;font-size:12px;cursor:pointer}
    .m3u-btn:active{opacity:.8}</style></head><body>
    <div class="header"><div class="header-bg"style="background-image:url('${bg}')"></div><div class="header-overlay"></div>
    <div class="header-content"><h1>${title}</h1>${desc ? `<p class="description">${desc}</p>` : ''}</div></div>
    ${tabsHTML ? `<div class="tabs">${tabsHTML}</div>` : ''}
    <div class="container"><h2 class="section-title">比赛视频 <button class="m3u-btn"onclick="copyM3U('nba')">复制 M3U 源</button></h2>
      <div class="videos-grid">${streamsHTML}</div></div>
    <script>function copyM3U(k){navigator.clipboard.writeText(k==='nba'?'https://360.com/nba.m3u':'https://360.com/dianshi.m3u').then(()=>alert('已复制 M3U 源'));}</script></body></html>`
  });
}

/* ---- 电视剧 页面 ---- */
function htmlTV() {
  const title    = store.get('tv_title')           || '电视剧';
  const desc     = store.get('tv_description')     || '';
  const cover    = store.get('tv_cover')           || '';
  const curEp    = +store.get('tv_current_ep')     || 1;
  const episodes = JSON.parse(store.get('tv_episodes')     || '[]');
  const curMedia = JSON.parse(store.get('tv_current_media') || '{}');

  const epsHTML = episodes.map(ep => `
    <div class="episode-item ${ep.episodeNumber === curEp ? 'active' : ''}">
      <div class="episode-thumbnail"><img src="${ep.cover}" alt="${ep.title}" onerror="this.src=''"></div>
      <h3>${ep.title}</h3><p class="subtitle">${ep.subTitle}</p></div>`).join('');

  const qBtns = (curMedia.qualitys || []).map(q =>
    `<a href="${q.qualityUrl}" class="quality-btn" target="_blank">${q.qualityShortName}</a>`
  ).join('');

  $done({
    status: 'HTTP/1.1 200 OK',
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport"content="width=device-width,initial-scale=1"><title>${title}</title><style>${css()}
    .episodes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:15px;margin-top:20px}
    .episode-item{position:relative;background:var(--card);border-radius:8px;overflow:hidden;transition:.2s;padding-bottom:10px;cursor:pointer}
    .episode-item.active{border:2px solid var(--primary-color)}.episode-item:hover{transform:translateY(-5px)}
    .episode-thumbnail{position:relative;width:100%;padding-top:56.25%}.episode-thumbnail img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .subtitle{color:#aaa;font-size:12px;margin:0 10px 8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;height:32px}
    .current-episode{padding:20px;background:rgba(26,26,26,.6);border-radius:10px;margin-bottom:30px}
    .m3u-btn{margin-left:10px;padding:4px 12px;border:0;border-radius:4px;background:var(--primary-color);color:#fff;font-size:12px;cursor:pointer}
    .m3u-btn:active{opacity:.8}</style></head><body>
    <div class="header"><div class="header-bg"style="background-image:url('${cover}')"></div><div class="header-overlay"></div>
      <div class="header-content"><h1>${title}</h1>${desc ? `<p class="description">${desc}</p>` : ''}</div></div>
    <div class="container">
      <div class="current-episode"><h2>${curMedia.mediaName || ''} - ${curMedia.mediaSubTitle || ''}</h2>
        <p>选择清晰度:</p><div class="quality-options">${qBtns}</div></div>
      <h2 class="section-title">全部剧集 <button class="m3u-btn"onclick="copyM3U('tv')">复制 M3U 源</button></h2>
      <div class="episodes-grid">${epsHTML}</div></div>
    <script>function copyM3U(k){navigator.clipboard.writeText(k==='nba'?'https://360.com/nba.m3u':'https://360.com/dianshi.m3u').then(()=>alert('已复制 M3U 源'));}</script></body></html>`
  });
}

/* ---------- 通用 CSS ---------- */
function css() {
  return `
:root{--primary-color:#f39c12;--bg:#0c0c0c;--card:#1a1a1a;--text:#fff;--sec:#333;--hover:#555}
*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.5}
.header{position:relative;height:200px;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px}
.header-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(2px);z-index:1}
.header-overlay{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.8));z-index:2}
.header-content{position:relative;z-index:3;width:100%;max-width:800px}h1{margin:0 0 10px;font-size:24px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,.5)}
.description{margin:0;font-size:16px;opacity:.8;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.tabs{display:flex;overflow-x:auto;padding:15px;background:rgba(26,26,26,.8);-webkit-overflow-scrolling:touch;scrollbar-width:none;position:sticky;top:0;z-index:10}
.tabs::-webkit-scrollbar{display:none}.tab-btn{flex:0 0 auto;padding:10px 20px;margin-right:10px;background:var(--sec);color:var(--text);text-decoration:none;border-radius:5px;font-size:14px;transition:.2s}
.tab-btn:hover{background:var(--hover)}.container{padding:15px;max-width:1200px;margin:0 auto}
.section-title{margin:0 0 20px;font-size:18px;font-weight:600;color:var(--primary-color);text-align:center}
.video-item{position:relative;background:var(--card);border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);transition:.2s}
.video-item:hover{transform:translateY(-5px);box-shadow:0 7px 10px rgba(0,0,0,.2)}
.video-thumbnail{position:relative;width:100%;padding-top:56.25%}.video-thumbnail img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vip-badge{position:absolute;top:5px;right:5px;background:var(--primary-color);color:#fff;font-size:12px;padding:3px 6px;border-radius:3px;font-weight:bold;z-index:2}
.vip-content::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:1;pointer-events:none}
.video-item h3{margin:10px;font-size:14px;height:40px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.quality-options{display:flex;justify-content:space-around;padding:0 10px 10px;gap:5px}
.quality-btn{flex:1;padding:6px 0;background:var(--sec);color:var(--text);text-align:center;text-decoration:none;border-radius:4px;font-size:12px;transition:.2s}
.quality-btn:hover{background:var(--hover)}
@media(max-width:600px){.header{height:150px}h1{font-size:20px}}
`;
}
