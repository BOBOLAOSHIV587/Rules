const NAME = `GTR`

const $ = new Env(NAME)

$.isRequest = () => typeof $request !== 'undefined'
$.isResponse = () => typeof $response !== 'undefined'

let result = {}
let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
}
!(async () => {
  if (!$.isRequest()) throw new Error('不是 request')

  $.log('$request.url', $request.url)
  const queryObject = parseQueryString($request.url)

  $.log('参数', $.toStr(queryObject))

  const { sl, tl = 'zh-Hans-CN', text } = queryObject

  if (!text) throw new Error('需要翻译的内容 text 为空')

  const input = sl ? `将以下文本从 ${sl} 翻译为 ${tl}:\n${text}` : `将以下文本翻译为 ${tl}:\n${text}`

  let translated = ''

  let TYPE = $.lodash_get(arg, 'GTR_TYPE') || $.getval('GTR_TYPE') || 'ChatGPT'
  let MODEL = $.lodash_get(arg, 'GTR_MODEL') || $.getval('GTR_MODEL') || 'gpt-4o-mini'

  if (TYPE === 'Gemini' && MODEL === 'gpt-4o-mini') {
    MODEL = 'gemini-1.5-flash'
  }

  let KEY = $.lodash_get(arg, 'GTR_KEY') || $.getval('GTR_KEY') || ''
  let PROMPT = $.lodash_get(arg, 'GTR_PROMPT') || $.getval('GTR_PROMPT') || '尽可能简单且快速地回答'
  let TEMPERATURE = parseFloat(
    $.lodash_get(arg, 'GTR_TEMPERATURE') ||
      $.getval('GTR_TEMPERATURE') ||
      (TYPE === 'ChatGPT' && /^o1-/.test(MODEL) ? 1 : 0.5)
  )
  let MAX_TOKENS = parseInt($.lodash_get(arg, 'GTR_MAX_TOKENS') || $.getval('GTR_MAX_TOKENS') || 888)
  let TIMEOUT = parseInt($.lodash_get(arg, 'GTR_TIMEOUT') || $.getval('GTR_TIMEOUT') || 30 * 1000)

  let API = $.lodash_get(arg, 'GTR_API') || $.getval('GTR_API')
  if (!API || API === 'https://api.openai.com/v1/chat/completions') {
    if (TYPE === 'Gemini') {
      API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
    } else {
      API = 'https://api.openai.com/v1/chat/completions'
    }
  }

  $.log(
    `TYPE: ${TYPE}, API: ${API}, KEY: ${KEY}, MODEL: ${MODEL}, PROMPT: ${PROMPT}, TEMPERATURE: ${TEMPERATURE}, MAX_TOKENS: ${MAX_TOKENS}, TIMEOUT: ${TIMEOUT}`
  )

  const headers = {
    'Content-Type': 'application/json',
  }
  // 不知道为啥 QX 上有问题
  // const params = {}
  if (TYPE === 'Gemini') {
    // params.key = KEY
    API = `${API}?key=${encodeURIComponent(KEY)}`
  } else {
    headers.Authorization = `Bearer ${KEY}`
  }
  const opts = {
    timeout: TIMEOUT,
    url: API,
    headers,
    // params,
    body: JSON.stringify(
      TYPE === 'Gemini'
        ? {
            contents: [{ role: 'user', parts: [{ text: `${PROMPT}\n${input}` }] }],
          }
        : {
            model: MODEL,
            messages: [
              {
                role: 'system',
                content: `${PROMPT}`,
              },
              {
                role: 'user',
                content: `${input}`,
              },
            ],
            max_tokens: MAX_TOKENS,
            temperature: TEMPERATURE,
          }
    ),
  }

  $.log('请求', $.toStr(opts))

  const res = await Promise.race([
    $.http.post(opts),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT)),
  ])
  $.log('ℹ️ res', $.toStr(res))
  const status = $.lodash_get(res, 'status') || $.lodash_get(res, 'statusCode') || 200
  $.log('ℹ️ res status', status)
  let body = String($.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody'))
  $.log('ℹ️ res body', body)
  try {
    body = JSON.parse(body)
  } catch (e) {}
  translated =
    TYPE === 'Gemini'
      ? $.lodash_get(body, 'candidates.0.content.parts.0.text')
      : $.lodash_get(body, 'choices.0.message.content')
  $.log('ℹ️ translated', translated)

  result = {
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/simpledotcss/simple.min.css">
</head>

<body>
  <pre id="translated-md" style="display: none"><code>${translated}</pre></code>
  <pre id="text-md" style="display: none"><code>${text}</pre></code>
  <section id="translated"></section>
  <section id="text"></section>
  <script src="https://unpkg.com/marked/lib/marked.umd.js"></script>
  <script>
    document.getElementById('translated').innerHTML = marked.parse(document.getElementById('translated-md').textContent);
    document.getElementById('text').innerHTML = marked.parse(document.getElementById('text-md').textContent);
  </script>
</body>

</html>`,
    },
  }
})()
  .catch(async e => {
    $.logErr(e)
    const msg = `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`
    result = {
      response: {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
        body: `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/simpledotcss/simple.min.css"><style>pre { overflow: unset } pre code { white-space: pre-wrap; }</style></head><body><section><h1>错误</h1><pre><code>${msg}</pre></code></section></body></html>`,
      },
    }
    // if ($.isShadowrocket() && msg.includes(`未能完成操作`)) {
    //   $.log(`Google Translate Redirect `, `⚠️`, msg)
    // } else {
    // await notify(`Google Translate Redirect `, `❌`, msg)
    // }
    result = {}
  })
  .finally(async () => {
    $.log($.toStr(result))
    $.done(result)
  })

// 参数 与其他脚本逻辑一致
function parseQueryString(url) {
  const queryString = url.split('?')[1] // 获取查询字符串部分
  const regex = /([^=&]+)=([^&]*)/g // 匹配键值对的正则表达式
  const params = {}
  let match

  while ((match = regex.exec(queryString))) {
    const key = decodeURIComponent(match[1]) // 解码键
    const value = decodeURIComponent(match[2]) // 解码值
    params[key] = value // 将键值对添加到对象中
  }

  return params
}

// 通知
async function notify(title, subt, desc, opts) {
  $.msg(title, subt, desc, opts)
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
