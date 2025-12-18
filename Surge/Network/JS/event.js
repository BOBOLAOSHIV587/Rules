const $ = new Env('network-info-event')

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
}

const compareThreeParts = $.getdata('网络信息通知设置') === 'IP 前三段相同时不通知'

function compareIPAddresses(ip1 = '', ip2 = '') {
  if (compareThreeParts) {
    const parts1 = ip1.split('.')
    const parts2 = ip2.split('.')

    for (let i = 0; i < 3; i++) {
      if (parts1[i] !== parts2[i]) {
        return false
      }
    }

    return true
  } else {
    return ip1 === ip2
  }
}

!(async () => {
  let primaryAddress
  let primaryAddressIPv6
  let ssid
  if (typeof $network !== 'undefined') {
    await $.wait(2000)
    $.log($network)
    primaryAddress = $.lodash_get($network, 'v4.primaryAddress')
    primaryAddressIPv6 = $.lodash_get($network, 'v6.primaryAddress')
    ssid = $.lodash_get($network, 'wifi.ssid')
  } else if (typeof $config !== 'undefined') {
    await $.wait(3000)
    try {
      let conf = $config.getConfig()
      $.log(conf)
      conf = JSON.parse(conf)
      ssid = $.lodash_get(conf, 'ssid')
    } catch (e) {}
  }

  let [{ CN_IP = '-', CN_ADDR = '-' }, { CN_IPv6 = '' }, { PROXY_IP = '-', PROXY_ADDR = '-' }, { PROXY_IPv6 = '' }] =
    await Promise.all([getDirectInfo(), getDirectInfoIPv6(), getProxyInfo(), getProxyInfoIPv6()])

  $.log(CN_IP, CN_ADDR, CN_IPv6, PROXY_IP, PROXY_ADDR, PROXY_IPv6)
  const lastNetworkInfoEvent = $.getjson('lastNetworkInfoEvent')
  if (
    !compareIPAddresses(CN_IP, $.lodash_get(lastNetworkInfoEvent, 'CN_IP')) ||
    CN_IPv6 !== $.lodash_get(lastNetworkInfoEvent, 'CN_IPv6') ||
    !compareIPAddresses(PROXY_IP, $.lodash_get(lastNetworkInfoEvent, 'PROXY_IP')) ||
    PROXY_IPv6 !== $.lodash_get(lastNetworkInfoEvent, 'PROXY_IPv6')
  ) {
    $.setjson({ CN_IP, PROXY_IP, CN_IPv6, PROXY_IPv6 }, 'lastNetworkInfoEvent')
    let line = [ssid, primaryAddress, primaryAddressIPv6].filter(i => i)
    if (line.length > 0) {
      line = `\n${line.join(' ')}`
    } else {
      line = ''
    }
    if (/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(CN_IPv6)) {
      CN_IPv6 = ''
    }
    if (CN_IPv6) {
      CN_IPv6 = `\n🄳 ${CN_IPv6}`
    }
    if (PROXY_IPv6) {
      PROXY_IPv6 = `\n🅿 ${PROXY_IPv6}`
    }
    await notify(`${CN_IP} | ${PROXY_IP}`, `${CN_ADDR}`, `${PROXY_ADDR}${line}${CN_IPv6}${PROXY_IPv6}`)
  }
})()
  .catch(async e => {
    $.logErr(e)
    $.logErr($.toStr(e))

    await notify('网络信息', `❌`, `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`)
  })
  .finally(async () => {
    $.done()
  })

// 通知
async function notify(title, subt, desc, opts) {
  $.msg(title, subt, desc, opts)
}
async function getDirectInfo() {
  let CN_IP
  let CN_ADDR
  // try {
  //   const res = await $.http.get({
  //     url: `http://mip.chinaz.com`,
  //     headers: {
  //       Accept:
  //         'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  //       'Accept-Language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5',
  //       'User-Agent':
  //         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
  //     },
  //   })
  //   let body = String($.lodash_get(res, 'body'))
  //   // try {
  //   //   body = JSON.parse(body)
  //   // } catch (e) {}
  //   CN_IP = body.match(/您的IP.*?>(.*?)<\//)[1]
  //   CN_ADDR = body
  //     .match(/地址.*?>(.*?)<\//)[1]
  //     .replace('中国', '')
  //     .replace('上海上海', '上海')
  //     .replace('北京北京', '北京')
  // } catch (e) {
  //   $.logErr(e)
  //   $.logErr($.toStr(e))
  // }
  if (!CN_IP || !CN_ADDR) {
    try {
      const res = await $.http.get({
        url: 'https://forge.speedtest.cn/api/location/info',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}
      CN_IP = body.ip
      CN_ADDR = [
        body.city || body.province,
        body.distinct ? `${body.distinct}` : body.distinct,
        body.isp || body.operator,
      ].join('')
    } catch (e) {
      // console.error(e)
    }
  }
  if (!CN_IP || !CN_ADDR) {
    try {
      const res = await $.http.get({
        url: 'http://cip.cc',
        headers: { 'User-Agent': 'curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3' },
      })
      let body = String($.lodash_get(res, 'body'))
      // try {
      //   body = JSON.parse(body)
      // } catch (e) {}
      CN_IP = body.match(/IP\s*(:|：)\s*(.*?)\s/)[2]
      CN_ADDR = `${body.match(/地址\s*(:|：)\s*(.*)/)[2].replace(/中国\s*/, '') || ''} ${
        body.match(/运营商\s*(:|：)\s*(.*)/)[2].replace(/中国\s*/, '') || ''
      }`
    } catch (e) {
      $.logErr(e)
      $.logErr($.toStr(e))
    }
  }
  return { CN_IP, CN_ADDR }
}
async function getDirectInfoIPv6() {
  let CN_IPv6
  try {
    const res = await $.http.get({
      url: `https://ipv6.ddnspod.com`,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
      },
    })
    let body = String($.lodash_get(res, 'body'))
    CN_IPv6 = body.trim()
  } catch (e) {
    $.logErr(e)
    $.logErr($.toStr(e))
  }
  if (!CN_IPv6) {
    try {
      const res = await $.http.get({
        url: `https://speed.neu6.edu.cn/getIP.php`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      CN_IPv6 = body.trim()
    } catch (e) {
      $.logErr(e)
      $.logErr($.toStr(e))
    }
  }
  return { CN_IPv6 }
}
async function getProxyInfo() {
  let PROXY_IP
  let PROXY_ADDR

  try {
    const res = await $.http.get({
      url: `http://ip-api.com/json?lang=zh-CN`,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/109.0.0.0',
      },
    })
    let body = String($.lodash_get(res, 'body'))
    try {
      body = JSON.parse(body)
    } catch (e) {}
    PROXY_IP = $.lodash_get(body, 'query')
    PROXY_ADDR = [$.lodash_get(body, 'city'), $.lodash_get(body, 'isp')].join(' ')
  } catch (e) {
    $.logErr(e)
    $.logErr($.toStr(e))
  }

  if (!PROXY_IP || !PROXY_ADDR) {
    try {
      const res = await $.http.get({
        url: `https://wtfismyip.com/json`,
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/109.0.0.0',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      try {
        body = JSON.parse(body)
      } catch (e) {}
      PROXY_IP = $.lodash_get(body, 'YourFuckingIPAddress')
      PROXY_ADDR = [$.lodash_get(body, 'YourFuckingLocation'), $.lodash_get(body, 'YourFuckingISP')].join('\n')
    } catch (e) {
      $.logErr(e)
      $.logErr($.toStr(e))
    }
  }
  return { PROXY_IP, PROXY_ADDR }
}
async function getProxyInfoIPv6() {
  let PROXY_IPv6
  try {
    const res = await $.http.get({
      url: `https://api-ipv6.ip.sb/ip`,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
      },
    })
    let body = String($.lodash_get(res, 'body'))
    PROXY_IPv6 = body.trim()
  } catch (e) {
    $.logErr(e)
    $.logErr($.toStr(e))
  }
  if (!PROXY_IPv6) {
    try {
      const res = await $.http.get({
        url: `https://v6.ident.me`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
      })
      let body = String($.lodash_get(res, 'body'))
      PROXY_IPv6 = body.trim()
    } catch (e) {
      $.logErr(e)
      $.logErr($.toStr(e))
    }
  }
  return { PROXY_IPv6 }
}
// prettier-ignore
function Env(t,s){class e{constructor(t){this.env=t}send(t,s="GET"){t="string"==typeof t?{url:t}:t;let e=this.get;return"POST"===s&&(e=this.post),new Promise((s,i)=>{e.call(this,t,(t,e,r)=>{t?i(t):s(e)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,s){this.name=t,this.http=new e(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $environment&&$environment["surge-version"]}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,s=null){try{return JSON.parse(t)}catch{return s}}toStr(t,s=null){try{return JSON.stringify(t)}catch{return s}}getjson(t,s){let e=s;const i=this.getdata(t);if(i)try{e=JSON.parse(this.getdata(t))}catch{}return e}setjson(t,s){try{return this.setdata(JSON.stringify(t),s)}catch{return!1}}getScript(t){return new Promise(s=>{this.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=s&&s.timeout?s.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),r=JSON.stringify(this.data);e?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(s,r):this.fs.writeFileSync(t,r)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return e;return r}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),r=e?this.getval(e):"";if(r)try{const t=JSON.parse(r);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(s),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const s=JSON.parse(h);this.lodash_set(s,r,t),e=this.setval(JSON.stringify(s),i)}catch(s){const o={};this.lodash_set(o,r,t),e=this.setval(JSON.stringify(o),i)}}else e=this.setval(t,s);return e}getval(t){return this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status?e.status:e.statusCode,e.status=e.statusCode),s(t,e,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:r,body:o}=t;s(null,{status:e,statusCode:i,headers:r,body:o},o)},t=>s(t&&t.error||"UndefinedError"));else if(this.isNode()){let e=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{if(t.headers["set-cookie"]){const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();e&&this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t,a=e.decode(h,this.encoding);s(null,{status:i,statusCode:r,headers:o,rawBody:h,body:a},a)},t=>{const{message:i,response:r}=t;s(i,r,r&&e.decode(r.rawBody,this.encoding))})}}post(t,s=(()=>{})){const e=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[e](t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status?e.status:e.statusCode,e.status=e.statusCode),s(t,e,i)});else if(this.isQuanX())t.method=e,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:r,body:o}=t;s(null,{status:e,statusCode:i,headers:r,body:o},o)},t=>s(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[e](r,o).then(t=>{const{statusCode:e,statusCode:r,headers:o,rawBody:h}=t,a=i.decode(h,this.encoding);s(null,{status:e,statusCode:r,headers:o,rawBody:h,body:a},a)},t=>{const{message:e,response:r}=t;s(e,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,s=null){const e=s?new Date(s):new Date;let i={"M+":e.getMonth()+1,"d+":e.getDate(),"H+":e.getHours(),"m+":e.getMinutes(),"s+":e.getSeconds(),"q+":Math.floor((e.getMonth()+3)/3),S:e.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(e.getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in i)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[s]:("00"+i[s]).substr((""+i[s]).length)));return t}queryStr(t){let s="";for(const e in t){let i=t[e];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),s+=`${e}=${i}&`)}return s=s.substring(0,s.length-1),s}msg(s=t,e="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()||this.isShadowrocket()||this.isStash()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let s=t.openUrl||t.url||t["open-url"],e=t.mediaUrl||t["media-url"];return{openUrl:s,mediaUrl:e}}if(this.isQuanX()){let s=t["open-url"]||t.url||t.openUrl,e=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":s,"media-url":e,"update-pasteboard":i}}if(this.isSurge()||this.isShadowrocket()||this.isStash()){let s=t.url||t.openUrl||t["open-url"];return{url:s}}}};if(this.isMute||(this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$notification.post(s,e,i,o(r)):this.isQuanX()&&$notify(s,e,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(s),e&&t.push(e),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()||this.isShadowrocket()&&!this.isQuanX()&&!this.isLoon()&&!this.isStash();e?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),this.isSurge()||this.isShadowrocket()||this.isQuanX()||this.isLoon()||this.isStash()?$done(t):this.isNode()&&process.exit(1)}}(t,s)}
