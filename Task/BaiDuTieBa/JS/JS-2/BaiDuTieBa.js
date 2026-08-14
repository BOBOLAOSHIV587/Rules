/*
贴吧签到脚本

更新时间: 2023-04-16
脚本兼容: QuantumultX, Surge, Loon
脚本作者: MartinsKing
软件功能: 自动签到贴吧
使用声明: ⚠️此脚本仅供学习与交流，请勿贩卖！⚠️
脚本参考: Nobyda、chavyleung

获取Cookie说明：
打开百度贴吧App后, 如通知成功获取cookie, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9:00执行, 您可以修改执行时间。

************************
QuantumultX 远程脚本配置:
************************

[task_local]
# 贴吧签到
0 9 * * * https://raw.githubusercontent.com/ClydeTime/Quantumult/main/Script/Task/TieBa.js, tag=贴吧签到, img-url=https://raw.githubusercontent.com/HuiDoY/Icon/main/mini/Color/tieba.png, enabled=true

[rewrite_local]
# 贴吧获取Cookie 「成功获取Cookie后请去除勾选」
https://raw.githubusercontent.com/ClydeTime/Quantumult/main/Task/Remote_Cookie.conf, tag=MartinsKing签到Cookie, update-interval=172800, opt-parser=false, enabled=true

************************
Surge 远程脚本配置:
************************

[Script]
贴吧签到 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/ClydeTime/Surge/main/Script/Task/TieBa.js,wake-system=1,timeout=15,script-update-interval=0

# 贴吧获取Cookie 「请在模块中添加,成功获取Cookie后模块应去除勾选」
https://raw.githubusercontent.com/ClydeTime/Surge/main/Task/GetCookie.sgmodule

************************
Loon 远程脚本配置:
************************
[Script]
# 贴吧签到
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/ClydeTime/Quantumult/main/Script/Task/TieBa.js, tag=贴吧签到
[Plugin]
# 贴吧获取Cookie 「成功获取Cookie后请禁用插件」
https://raw.githubusercontent.com/ClydeTime/Quantumult/main/Task/GetCookie.plugin, tag=MartinsKing签到Cookie, enabled=true

*/

const $ = new Env("tieba");
const name = "tieba";
const zh_name = "百度贴吧";
const config = {
  cookie: {}
};

config.cookie = $.getdata(name + "_cookie");

var useParallel = 0; //0自动切换,1串行,2并行(当贴吧数量大于30个以后,并行可能会导致QX崩溃,所以您可以自动切换)
var singleNotifyCount = 20; //想签到几个汇总到一个通知里,这里就填几个(比如我有13个要签到的,这里填了5,就会分三次消息通知过去)
var process = {
  total: 0,
  result: [
    // {
    //     bar:'',
    //     level:0,
    //     exp:0,
    //     errorCode:0,
    //     errorMsg:''
    // }
  ]
};
var url_fetch_sign = {
  url: "https://tieba.baidu.com/mo/q/newmoindex",
  headers: {
    "Content-Type": "application/octet-stream",
    Referer: "https://tieba.baidu.com/index/tbwise/forum",
    Cookie: config.cookie,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366"
  }
};
var url_fetch_add = {
  url: "https://tieba.baidu.com/sign/add",
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: config.cookie,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X; zh-CN) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366 UCBrowser/10.7.5.650 Mobile"
  },
  body: ""
};

!(async () => {
  if (typeof $request != "undefined") {
    console.log("- 正在获取cookie，请稍后");
    GetCookie();
  } else {
    console.log("- 任务正在进行，请耐心等待");
    signTieBa();
  }
})()

function signTieBa() {

  if (!config.cookie) {
    $.msg(zh_name, "签到失败", "未获取到cookie");
    return $.done()
  }
  return $.http.get(url_fetch_sign).then(
        (response) => {
          const body = JSON.parse(response.body);
          var isSuccessResponse = body && body.no == 0 && body.error == "success" && body.data.tbs;
          if (!isSuccessResponse) {
            $.msg(zh_name, "签到失败", (body && body.error) ? body.error : "接口数据获取失败");
            return $.done()
          }
          process.total = body.data.like_forum.length;
          if (body.data.like_forum && body.data.like_forum.length > 0) {
            if (useParallel == 1 || (useParallel == 0 && body.data.like_forum.length >= 30)) {
              signBars(body.data.like_forum, body.data.tbs, 0);
            } else {
              for (const bar of body.data.like_forum) {
                if (!signBar(bar, body.data.tbs)) {
                  signBar(bar, body.data.tbs);
                }
              }
            }
          } else {
            $.msg(zh_name, "签到失败", "请确认您有关注的贴吧");
            return $.done()
          }
      	}, (reason) =>  {
          console.log("- 未获取到签到列表");
          console.log(`- headers ${JSON.stringify(response.headers)}`);
          return false;
        }
    );
}

function signBar(bar, tbs) {
  if (bar.is_sign == 1) { //已签到的,直接不请求接口了
    process.result.push({
      bar: `${bar.forum_name}`,
      level: bar.user_level,
      exp: bar.user_exp,
      errorCode: 9999,
      errorMsg: "已签到"
    });
    checkIsAllProcessed();
    return true;
  } else {
    url_fetch_add.body = `tbs=${tbs}&kw=${bar.forum_name}&ie=utf-8`;
    $.http.post(url_fetch_add).then(
      (response) => {
          try {
            var addResult = JSON.parse(response.body);
            if (addResult.no == 0) {
              process.result.push({
                bar: bar.forum_name,
                errorCode: 0,
                errorMsg: `获得${addResult.data.uinfo.cont_sign_num}积分,第${addResult.data.uinfo.user_sign_rank}个签到`
              });
              checkIsAllProcessed();
              return true;
            } else {
              process.result.push({
                bar: bar.forum_name,
                errorCode: addResult.no,
                errorMsg: addResult.error
              });
              checkIsAllProcessed();
              return false;
            }
          } catch (e) {
            $.msg("贴吧签到", "贴吧签到数据处理异常", JSON.stringify(e));
            $.done()
          }  
      },(reason) => {
          process.result.push({
            bar: bar.forum_name,
            errorCode: 999,
            errorMsg: '接口错误'
          });
          checkIsAllProcessed();
          return false;
        }
    );
  }
}

function signBars(bars, tbs, index) {
  //$nobyda.notify("贴吧签到", `进度${index}/${bars.length}`, "");
  if (index >= bars.length) {
    //$nobyda.notify("贴吧签到", "签到已满", `${process.result.length}`);
    checkIsAllProcessed();
  } else {
    var bar = bars[index];
    if (bar.is_sign == 1) { //已签到的,直接不请求接口了
      process.result.push({
        bar: `${bar.forum_name}`,
        level: bar.user_level,
        exp: bar.user_exp,
        errorCode: 9999,
        errorMsg: "已签到"
      });
      signBars(bars, tbs, ++index);
    } else {
      url_fetch_add.body = `tbs=${tbs}&kw=${bar.forum_name}&ie=utf-8`;
      $.http.post(url_fetch_add).then(
      	(response) => {
          try {
            var addResult = JSON.parse(response.body);
            if (addResult.no == 0) {
              process.result.push({
                bar: bar.forum_name,
                errorCode: 0,
                errorMsg: `获得${addResult.data.uinfo.cont_sign_num}积分,第${addResult.data.uinfo.user_sign_rank}个签到`
              });
            } else {
              process.result.push({
                bar: bar.forum_name,
                errorCode: addResult.no,
                errorMsg: addResult.error
              });
              signBar(bar, tbs);
            }
          } catch (e) {
            $.msg("贴吧签到", "贴吧签到数据处理异常", JSON.stringify(e));
            $.done()
          }
          checkIsAllProcessed();
      	},(reason) => {
          process.result.push({
            bar: bar.forum_name,
            errorCode: 999,
            errorMsg: '接口错误'
          });
          signBar(bar, tbs);
        }
      );
      signBars(bars, tbs, ++index);
    }
  }
}

function checkIsAllProcessed() {
  //$nobyda.notify("贴吧签到", `最终进度${process.result.length}/${process.total}`, "");
  if (process.result.length != process.total) return;
  for (var i = 0; i < Math.ceil(process.total / singleNotifyCount); i++) {//todo 验证消息为什么不分几次通知
    var notify = "";
    var spliceArr = process.result.splice(0, singleNotifyCount);
    var notifySuccessCount = 0;
    for (const res of spliceArr) {
      if (res.errorCode == 0 || res.errorCode == 9999) {
        notifySuccessCount++;
      }
      if (res.errorCode == 9999) {
        notify += `【${res.bar}】已经签到，当前等级${res.level},经验${res.exp}` + `\n`;
      } else {
        notify += `【${res.bar}】${res.errorCode==0?'签到成功':'签到失败'}，${res.errorCode==0?res.errorMsg:('原因：'+res.errorMsg)}` + `\n`;
      }
    }
    $.msg("贴吧签到", `签到${spliceArr.length}个,成功${notifySuccessCount}个`, notify);   
  }
  $.done();
}

function GetCookie() {
  if (typeof $request.headers.cookie != 'undefined') {
      config.cookie = $request.headers.cookie;
    } else if (typeof $request.headers.Cookie != 'undefined') {
      config.cookie = $request.headers.Cookie;
    }
  if (config.cookie) {
    if ($.getdata(name + "_cookie") != 'undefined') {
      if ($.getdata(name + "_cookie") != config.cookie) {
        if (config.cookie.indexOf("BDUSS") != -1) {
          $.setdata(config.cookie, name + "_cookie")? $.msg(zh_name, "cookie catch success", "获得 cookie 成功") : $.msg(zh_name, "cookie catch failed", "获得 cookie 失败")
        }
      }else{
       $.msg(zh_name, "cookie未过期", "")
      }
    } else {
      if (config.cookie.indexOf("BDUSS") != -1) {
        $.setdata(config.cookie, name + "_cookie")? $.msg(zh_name, "首次写入Cookie成功 🎉", "") : $.msg(zh_name, "首次写入Cookie失败‼️", "")
      }
    }
  }
  $.done();
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,n]=i.split("@"),a={url:`http://${n}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),n=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(n);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:n}=t,a=s.decode(n,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:n,body:a},a)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:n}=t,a=i.decode(n,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:n,body:a},a)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(!this.isMute){if(this.isSurge()||this.isLoon()){$notification.post(e,s,i,o(r))}else if(this.isQuanX()){$notify(e,s,i,o(r))}}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}
