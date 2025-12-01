/*************************************************
 KuGou H5 签到（多账户版） @Mr_Alex提供签到地址
 - 签到地址/cookie获取：https://activity.kugou.com/getvips/v-4163b2d0/index.html?should_append_gdt_ua=1
 - 多账号：按 userid 去重保存在持久化
 - 换账号登录后，打开活动页触发重写
[rewrite_local]
 ^https:\/\/gateway\.kugou\.com\/youth\/v1\/activity\/get_listen_song_task\?.* url script-request-header https://gist.githubusercontent.com/Yu9191/f679b48faf12794f794e7f95fc823fe1/raw/kugou_signin.js
[task_local]
# 定时签到（每天 09:10 执行一次）
10 9 * * * https://gist.githubusercontent.com/Yu9191/f679b48faf12794f794e7f95fc823fe1/raw/kugou_signin.js, tag=酷狗音乐概念版签到, enabled=true

[mitm]
hostname = gateway.kugou.com

**************************************************/

const STORE_KEY = 'kugou_h5_accounts'; // 多账号存储 
const LOG_PREFIX = 'KuGou 签到';
const H5_SECRET = 'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt'; 

// Utils
const UTILS_URL = 'https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Task/KuGou_CV/JS/JS-1/Utils.js';
const CACHE_KEY_CODE = 'Utils_Code';
const CACHE_KEY_TIME = 'Utils_Codetime';

const isReq   = typeof $request !== 'undefined';
const isQX    = typeof $task !== 'undefined';
const isSurge = typeof $httpClient !== 'undefined';

/* KV & 通知 */
function kvGet(k){
  try{
    if (isQX && $prefs.valueForKey) return $prefs.valueForKey(k) || '';
    if (isSurge && $persistentStore.read) return $persistentStore.read(k) || '';
  }catch{}
  return '';
}
function kvSet(k,v){
  try{
    if (isQX && $prefs.setValueForKey) return $prefs.setValueForKey(v,k);
    if (isSurge && $persistentStore.write) return $persistentStore.write(v,k);
  }catch{}
  return false;
}
function notify(title, sub, msg){ (isQX ? $notify : $notification.post)(title, sub||'', msg||''); }
function done(v){ if (typeof $done==='function') $done(v); }
function log(...a){ console.log(...a); }

function readStore(){
  try{ const j = kvGet(STORE_KEY); const a = JSON.parse(j||'[]'); return Array.isArray(a)?a:[]; }catch{ return []; }
}
function writeStore(arr){ kvSet(STORE_KEY, JSON.stringify(arr||[])); }

function fetchRemote(options){
  return new Promise((resolve,reject)=>{
    const method=(options.method||'GET').toUpperCase();
    if (isSurge){
      const fn = method==='POST' ? $httpClient.post : $httpClient.get;
      fn(options,(err,resp,body)=> err ? reject(err) : resolve({response:resp, body}));
    } else if (isQX){
      if (method==='POST') options.method='POST';
      $task.fetch(options).then(
        resp=>resolve({response:resp, body:resp.body}),
        err=>reject(err&&err.error||err)
      );
    } else { reject('Unsupported environment'); }
  });
}
// 加载 Utils
async function loadUtilsCached(){
  const cached = kvGet(CACHE_KEY_CODE);
  if (cached){
    try{
      eval(cached);
      if (typeof creatUtils==='function') return creatUtils();
      if (typeof createUtils==='function') return createUtils();
      kvSet(CACHE_KEY_CODE,'');
    }catch{ kvSet(CACHE_KEY_CODE,''); }
  }
  try{
    const { body } = await fetchRemote({ url: UTILS_URL, method:'GET', timeout:15000 });
    if (!body) return null;
    try{
      eval(body);
      if (typeof creatUtils==='function' || typeof createUtils==='function'){
        kvSet(CACHE_KEY_CODE, body);
        kvSet(CACHE_KEY_TIME, String(Date.now()));
        return typeof creatUtils==='function' ? creatUtils() : createUtils();
      }
      return null;
    }catch{ return null; }
  }catch{ return null; }
}
async function getCryptoJS(){
  try{
    const utils = await loadUtilsCached();
    if (utils && typeof utils.createCryptoJS==='function'){
      const cj = utils.createCryptoJS();
      if (cj && typeof cj.MD5==='function') return cj;
    }
  }catch{}
  return null;
}

function parseQueryFromUrl(url){
  try{
    const u = new URL(url);
    const obj = {};
    u.searchParams.forEach((v,k)=>{ obj[k]=v; });
    return obj;
  }catch{ return {}; }
}
function buildQS(obj){
  const sp = new URLSearchParams();
  Object.keys(obj||{}).forEach(k=> sp.append(k, obj[k]));
  return sp.toString();
}
function cloneHeaders(src){
  const h = {};
  Object.keys(src||{}).forEach(k=>{
    h[k] = src[k];
  });
  return h;
}
function sanitizeHeadersForScript(headers){
  const drop = new Set([':method', ':authority', ':path', ':scheme', 'content-length', 'Content-Length', 'connection', 'Connection']);
  const out = {};
  Object.keys(headers||{}).forEach(k=>{
    if (!drop.has(k)) out[k]=headers[k];
  });
  return out;
}

// 签名
async function calcSignature(queryObj){
  const CryptoJS = await getCryptoJS();
  if (!CryptoJS) throw new Error('CryptoJS 加载失败');
  const p = { ...(queryObj||{}) };
  if (!('source_id' in p)) p.source_id = '';
  if ('signature' in p) delete p.signature;
  const useAppKey = !!p.appkey;
  const secret = useAppKey ? String(p.appkey) : H5_SECRET;
  if (useAppKey) delete p.srcappid; 
  const keys = Object.keys(p).sort();
  const joined = keys.map(k => `${k}=${p[k] == null ? '' : String(p[k])}`).join('');
  const raw = secret + joined + secret;

  return CryptoJS.MD5(raw).toString();
}

async function handleCapture(){
  try{
    const url = $request.url || '';
    if (!/gateway\.kugou\.com\/youth\/v1\/activity\/get_listen_song_task\?/i.test(url)) return done({});

    const queryObj = parseQueryFromUrl(url);
    if (!queryObj.userid && queryObj.kugouid) queryObj.userid = queryObj.kugouid;

    const headersRaw = ($request.headers || {});
    const headers = cloneHeaders(headersRaw);
    // 必须字段以防万一
    const must = ['appid','clientver','mid','uuid','dfid','token','userid'];
    const miss = must.filter(k => !queryObj[k]);
    if (miss.length){
      notify(LOG_PREFIX, '抓参失败', '缺字段：' + miss.join(', '));
      return done({});
    }

    // 存储
    const list = readStore();
    const idx = list.findIndex(x => String(x.userid) === String(queryObj.userid));
    const record = { userid: String(queryObj.userid), query: queryObj, headers };
    if (idx >= 0) list[idx] = record; else list.push(record);
    writeStore(list);

    notify(LOG_PREFIX, '参数已更新', `用户：${queryObj.userid}${queryObj.appkey ? '（含appkey）' : ''}`);
    done({});
  } catch (e){
    notify(LOG_PREFIX, '抓参异常', String(e));
    done({});
  }
}
async function signOne(rec){
  const base = 'https://gateway.kugou.com';
  const path = '/youth/v1/recharge/receive_vip_listen_song';
  const q = { ...(rec.query||{}) };
  q.clienttime = String(Date.now());
  if (!('source_id' in q)) q.source_id = '';
  // appkey ？
  const useAppKey = !!q.appkey;
  if (useAppKey) delete q.srcappid;

  // 生成签名
  const signature = await calcSignature(q);
  q.signature = signature;
  const url = `${base}${path}?${buildQS(q)}`;
  const headers = sanitizeHeadersForScript(rec.headers || {});
  const options = { url, method: 'POST', headers };
  const { body } = await fetchRemote(options);
  let ret = {};
  try{ ret = JSON.parse(body || '{}'); }catch{}

  // 响应
  if (ret && Number(ret.status) === 1 && Number(ret.error_code) === 0) {
    return { ok: true, code: 0, msg: '签到成功' };
  }
  if (ret && Number(ret.status) === 0 && Number(ret.error_code) === 131001) {
    return { ok: true, code: 131001, msg: '已签到（今日）' };
  }
  if (ret && Number(ret.error_code) === 20006) {
    return { ok: false, code: 20006, msg: '签名错误(err signature)' , raw: ret };
  }
  return { ok: false, code: ret && ret.error_code, msg: ret && ret.error_msg || '未知返回', raw: ret };
}

async function runSignin(){
  const list = readStore();
  if (!list.length){
    notify(LOG_PREFIX, '未找到账号', '请先打开活动页触发抓参');
    return;
  }
  const cj = await getCryptoJS();
  if (!cj){ notify(LOG_PREFIX, '初始化失败', 'CryptoJS 加载失败（检查 Utils 链接）'); return; }

  const lines = [];
  let ok = 0, fail = 0;

  for (const rec of list){
    try{
      const r = await signOne(rec);
      if (r.ok){ ok++; lines.push(`✅ ${rec.userid}: ${r.msg}`); }
      else { fail++; lines.push(`❌ ${rec.userid}: ${r.msg}`); }
    }catch(e){
      fail++; lines.push(`❌ ${rec.userid}: ${String(e)}`);
    }
  }

  notify(LOG_PREFIX, `成功 ${ok}，失败 ${fail}`, lines.join('\n'));
}

(async () => {
  try{
    if (isReq) await handleCapture();
    else       await runSignin();
  }catch(e){
    notify(LOG_PREFIX, '执行异常', String(e));
  }finally{
    done({});
  }
})();
