/****************************

#!name = 酷我音乐 & 酷我畅听
#!desc = 〔 酷我音乐&酷我畅听 〕全功能破解
#!author = 影子[https://www.napi.ltd]
#!openUrl = https://napi.ltd/script/Worker/KuWo.js
#!loon_version = 3.2.3(762)
#!icon = https://static.napi.ltd/Image/KuWo.png
#!date = 2025-01-09


[Script]
http-response ^(?!.*img).*?kuwo\.cn(/vip|/openapi)?(/enc|/(v\d/)?(user/vip\?(vers|apiVersion|platform|op\=ui|_t)|theme\?op=gd|sysinfo\?op=getRePayAndDoPayBoxNew|api(/v\d)?(/pay)?/(app/getConfigInfo|user/info|payInfo/kwplayer/payMiniBar|advert/(myPage|iListen|album))|--album/(adBar|myRec/vipMusic)--|app/(newMenuList/menuListInfo|pasterAdvert/config)|tingshu/index/radio|operate/homePage)|/kuwopay/vip-tab/setting|/(audioApi/)?a\.p($|\?newver\=\d$|.*?op\=(getvip|policy_shortvideo)|.*?ptype\=vip)|/mobi\.s\?f\=kwxs|/music\.pay\?newver\=\d$|/(EcomResource|(Mobile)?Ad)Serv(er|ice)) script-path=https://raw.githubusercontent.com/Mikephie/Script/main/qx/kuwomod-2.js, requires-body=true, timeout=60, tag=酷我音乐, img-url=https://static.napi.ltd/Image/KuWo.png

[Mitm]
hostname = *.kuwo.cn

****************************/

const $ = new Env("酷我音乐");
const LocVer = "5.1.9";
let url = "undefined" !== typeof $request ? $request.url : "";
let body = "undefined" !== typeof $response ? $response.body : null;
let obj = $.toObj(body);
const urlHandlers = {
  playInfo: /mobi\.s\?f\=kwxs/,
  userInfo: /vip\/enc/,
  vipTabInfo: /vip\/v\d\/user\/vip/,
  bookVip: /(a\.p|v\d\/api\/(pay\/)?user\/info)/,
  musicInfo: /music\.pay\?newver\=\d$/,
  vipTheme: /vip\/v\d\/theme\?op\=gd/,
  kwBookHome: /v\d\/api\/advert\/myPage/,
  indexTopAd: /openapi\/v\d\/operate\/homePage/,
  bookPageAd: /openapi\/v\d\/tingshu\/index\/radio/,
  vipTabAd: /kuwopay\/vip-tab\/setting/,
  baseAd: /((EcomResource|(Mobile)?Ad)Serv(er|ice)|(vip|openapi|api)?\/v\d\/(sysinfo\?op\=getRePayAndDoPayBoxNew|api\/pay\/payInfo\/kwplayer\/payMiniBar|app\/(newMenuList\/menuListInfo|pasterAdvert\/config)|pay\/app\/getConfigInfo|api\/advert\/(iListen|album)))/,
  _kwBookAd: /openapi\/v\d\/album\/adBar/,
  _myPageAd: /openapi\/v\d\/album\/myRec\/vipMusic/
};
const functions = {
  playInfo: playInfo,
  userInfo: userInfo,
  vipTabInfo: vipTabInfo,
  bookVip: bookVip,
  musicInfo: musicInfo,
  vipTheme: vipTheme,
  kwBookHome: kwBookHome,
  indexTopAd: indexTopAd,
  bookPageAd: bookPageAd,
  vipTabAd: vipTabAd,
  baseAd: baseAd,
  _kwBookAd: _kwBookAd,
  _myPageAd: _myPageAd
};
for (const [handler, regex] of Object.entries(urlHandlers)) {
  if (regex.test(url)) {
    functions[handler]();
    break;
  }
}

async function userInfo() {
  let fixedUid = "373245224";  // 固定UID
  body = await $.http.get(url.replace(/uid=\d+/g, `uid=${fixedUid}`)).then(g => g.body);
  const f = {
    body: body
  };
  $.done(f);
}

// 保留原有的其他功能函数
async function playInfo() {
  let d = KuWo.keys;
  let e = d[Math.floor(Math.random() * d.length)];
  let f = KuWo.user;
  let g = KuWo.PlayID;
  let h = decrypt(e);
  let i = KuWo.Song;
  let j = KuWo.ver;
  let k = body.replace(/.*?\"rid\":(\d+).*/, "$1");
  !(async () => {
    await getInfo(f, "kuwo");
    await getVer();
    if (KuWo.isVip && new Date().getTime() < KuWo.endTime && LocVer == j && k != g) {
      {
        const p = {
          br: 4000,
          url: "4000kflac"
        };
        const q = {
          br: 2000,
          url: "2000kflac"
        };
        const r = {
          br: 320,
          url: "320kmp3"
        };
        let s = [p, q, r];
        let t = 0;
        if ("book" == i) {
          t = 2;
        }
        while (s[t]) {
          {
            const v = {
              url: "http://mobi.kuwo.cn/mobi.s?f=web&source=" + h + "&type=convert_url_with_sign&br=" + s[t].url + "&rid=" + g
            };
            await $.http.get(v).then(w => {
              {
                body = w.body;
                obj = $.toObj(body);
              }
            });
            if (obj.data.bitrate == s[t].br) {
              break;
            }
            t++;
          }
        }
      }
    }
    KuWo.PlayID = "";
    $.setval($.toStr(KuWo), "KuWo");
    const n = {
      body: body
    };
    $.done(n);
  })();
}

async function vipTabInfo() {
  obj.data.vipIcon = "https://image.kuwo.cn/fe/13e4f930-f8bc-4b86-8def-43cbc3c7d86c7.png";
  delete obj.data.iconJumpUrl;
  delete obj.data.adActUrl;
  obj.data.growthValue = "9999";
  obj.data.vipTag = "VIP7";
  obj.data.vipmIcon = "https://image.kuwo.cn/fe/34ad47f8-da7f-43e4-abdc-e6c995666368yyb.png";
  obj.data.svipIcon = "https://image.kuwo.cn/fe/13e4f930-f8bc-4b86-8def-43cbc3c7d86c7.png";
  obj.data.openBtnText = "永久会员";
  obj.data.vipExpire = "4077187200315";
  obj.data.vipExpires = 4077187200315;
  obj.data.luxuryIcon = "https://image.kuwo.cn/fe/2fae68ff-de2d-4473-bf28-8efc29e44968vip.png";
  obj.data.vipmExpire = "4077187200315";
  obj.data.vipLuxuryExpire = "4077187200315";
  obj.data.svipExpire = "4077187200315";
  obj.data.isYearUser = "2";
  obj.data.biedSong = "1";
  obj.data.svipAutoPayUser = "1";
  body = $.toStr(obj);
  const g = {
    body: body
  };
  $.done(g);
}

// 其他解锁逻辑保持不变...
async function bookVip() {
  if (obj.hasOwnProperty("songs")) {
    {
      for (let f in obj.songs) {
        {
          id = obj.songs[f].id;
          if ("number" !== typeof id) {
            id = body.replace(/.*?\"id\":(\d+).*/, "$1");
          }
          if ("number" == typeof id) {
            {
              KuWo.PlayID = id;
              KuWo.Song = "book";
              $.setval($.toStr(KuWo), "KuWo");
              break;
            }
          }
        }
      }
    }
  }
  body = body.replace(/(policy|policytype)\":\d/g, "$1\":0").replace(/(playright|downright|type|bought|bought_vip|limitfree|vipType)\":\d/g, "$1\":1").replace(/(end|endtime|vipExpires|bought_vip_end)\":\d+/g, "$1\":4077187200");
  const e = {
    body: body
  };
  $.done(e);
}
async function musicInfo() {
  if (obj.hasOwnProperty("songs")) {
    {
      id = obj.songs[0].id;
      if ("number" !== typeof id) {
        id = body.replace(/.*?\"id\":(\d+).*/, "$1");
      }
      KuWo.PlayID = id;
      KuWo.Song = "music";
      $.setval($.toStr(KuWo), "KuWo");
      obj.songs[0].audio.forEach(i => i.st = 0);
    }
  }
  let e = obj.songs[0].audio[0].policy;
  obj.user[0] = {
    pid: obj.songs[0].audio[0].pid,
    type: e,
    name: e + "_1",
    categray: e + "_1",
    id: obj.songs[0].id,
    order: 375787919,
    final: [],
    buy: 1657425321,
    begin: 1657425321,
    end: 4077187200,
    CurEnd: 0,
    playCnt: 0,
    playUpper: 300,
    downCnt: 0,
    downUpper: 300,
    playVideoCnt: 0,
    playVideoUpper: 3000,
    downVideoCnt: 0,
    downVideoUpper: 3000,
    price: obj.songs[0].audio[0].price,
    period: 1000,
    feetype: 0,
    info: obj.songs[0]
  };
  body = $.toStr(obj);
  const f = {
    body: body
  };
  $.done(f);
}
async function vipTheme() {
  obj.data.vipTheme.type = "free";
  delete obj.data.needBieds;
  body = $.toStr(obj);
  const e = {
    body: body
  };
  $.done(e);
}
async function kwBookHome() {
  obj.data.scheme = null;
  obj.data.title = "酷我畅听";
  obj.data.url = null;
  obj.data.subTitle = "畅听服务由影子提供";
  body = $.toStr(obj);
  const e = {
    body: body
  };
  $.done(e);
}
async function indexTopAd() {
  let e = ["发现", "推荐", "听书", "看短剧"];
  let f = 0;
  while (obj.data.homeTop[f]) {
    {
      if (!e.includes(obj.data.homeTop[f].title)) {
        {
          delete obj.data.homeTop[f];
        }
      }
      f++;
    }
  }
  body = $.toStr(obj);
  const g = {
    body: body
  };
  $.done(g);
}
async function bookPageAd() {
  let e = ["小焦点", "免费模式", "看广告"];
  let f = 0;
  while (obj.data.child[f]) {
    {
      if (e.some(h => obj.data.child[f].label.includes(h))) {
        delete obj.data.child[f].child;
      }
      f++;
    }
  }
  body = $.toStr(obj);
  const g = {
    body: body
  };
  $.done(g);
}
async function vipTabAd() {
  if ("undefined" !== typeof obj.data.tab.vipTypes[0]) {
    {
      let g = 1;
      while (obj.data.tab.vipTypes[0].topics[g]) {
        {
          delete obj.data.tab.vipTypes[0].topics[g];
          g++;
        }
      }
    }
  }
  body = $.toStr(obj);
  const e = {
    body: body
  };
  $.done(e);
}
async function baseAd() {
  const b = {
    body: ""
  };
  $.done(b);
}
async function _kwBookAd() {
  body = "YingZi";
  const b = {
    body: body
  };
  $.done(b);
}
async function _myPageAd() {
  delete obj.data.listenSomething;
  body = $.toStr(obj);
  const e = {
    body: body
  };
  $.done(e);
}
function Napi(e) {
  e = e || "YingZi";
  const k = p => {
    {
      let q = new TextEncoder().encode(p);
      let r = new TextEncoder().encode(e);
      let s = new Uint8Array(q.length);
      for (let t = 0; t < q.length; t++) {
        {
          let v = q[t] ^ r[t % r.length];
          while (v >= 256) {
            {
              v %= 256;
            }
          }
          s[t] = v;
        }
      }
      return btoa(String.fromCharCode(...s));
    }
  };
  const l = p => {
    {
      let s = new TextEncoder().encode(e);
      let t = new Uint8Array(atob(p).split("").map(v => v.charCodeAt(0)));
      let u = new Uint8Array(t.length);
      for (let v = 0; v < t.length; v++) {
        {
          let w = t[v] ^ s[v % s.length];
          while (w >= 256) {
            {
              w %= 256;
            }
          }
          u[v] = w;
        }
      }
      return new TextDecoder().decode(u);
    }
  };
  const m = async () => {
    {
      url = "https://sharechain.qq.com/cfa48d8b4551a20d5e6c016bdf3823ff";
      info = await $.http.get(url).then(r => r.body);
      info = info.match(/<article class=\"note-body\">([\s\S]*?)<\/article>/);
      res = info[1].replace(/(\s|<.*?>)/g, "");
      obj = $.toObj(res);
      if (LocVer != obj.kuwo) {
        $.msg("需要更新 -> 请更新你的脚本！");
      }
      KuWo.ver = obj.kuwo;
      $.setval($.toStr(KuWo), "KuWo");
    }
  };
  const n = async (p, q) => {
    {
      let s = "type=" + q + "&user=" + p;
      if (!KuWo.user || p != KuWo.user || !KuWo.endTime || new Date().getTime() > KuWo.endTime || !KuWo.keys || KuWo.ver !== LocVer) {
        $.log("正在获取 " + p + " 的授权信息…");
        const t = {
          url: "https://napi.ltd/getInfo",
          body: s
        };
        let u = $.toObj(await $.http.post(t).then(v => v.body));
        for (let v in u) {
          {
            if (u.hasOwnProperty(v)) {
              {
                KuWo[v] = u[v];
              }
            }
          }
        }
        $.setval($.toStr(KuWo), "KuWo");
        $.log("数据获取完成...");
        if (u.isVip) {
          {
            let z = new Date(KuWo.endTime);
            let A = z.getFullYear() + "-" + (z.getMonth() < 10 ? "0" + (z.getMonth() + 1) : z.getMonth() + 1) + "-" + (z.getDate() < 10 ? "0" + z.getDate() : z.getDate());
            if (LocVer != KuWo.ver) {
              {
                A += "\n需要更新 -> 请更新你的脚本！";
              }
            }
            $.log("当前账户 " + p + " 已授权\n授权有效期至：" + A);
            $.msg("当前账户 " + p + " 已授权", "", "授权有效期至：" + A);
          }
        } else {
          $.log("未能获取到当前账户 " + p + " 的授权信息\n即将再次获取你的授权信息");
          $.msg("未获取到授权信息", "", "请重启应用或点击本条通知获取授权码", {
            "open-url": "https://napi.ltd/authPay?action=kuwo&user=" + p,
            "media-url": "https://file.napi.ltd/Static/Image/KuWo.png"
          });
        }
      } else {
        {
          $.log("当前账户 " + p + " 已授权\n祝使用愉快！");
        }
      }
    }
  };
  const o = {
    encrypt: k,
    decrypt: l,
    getVer: m,
    getInfo: n
  };
  return o;
}
function Env(t, e) {
  class s {
    constructor(t) {
      this.env = t;
    }
    send(t, e = "GET") {
      t = "string" == typeof t ? {
        url: t
      } : t;
      let s = this.get;
      "POST" === e && (s = this.post);
      const i = new Promise((e, i) => {
        s.call(this, t, (t, s, o) => {
          t ? i(t) : e(s);
        });
      });
      return t.timeout ? ((t, e = 1000) => Promise.race([t, new Promise((t, s) => {
        setTimeout(() => {
          s(new Error("请求超时"));
        }, e);
      })]))(i, t.timeout) : i;
    }
    get(t) {
      return this.send.call(this.env, t);
    }
    post(t) {
      return this.send.call(this.env, t, "POST");
    }
  }
  return new class {
    constructor(t, e) {
      this.logLevels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
      };
      this.logLevelPrefixs = {
        debug: "[DEBUG] ",
        info: "[INFO] ",
        warn: "[WARN] ",
        error: "[ERROR] "
      };
      this.logLevel = "info";
      this.name = t;
      this.http = new s(this);
      this.data = null;
      this.dataFile = "box.dat";
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = "\n";
      this.encoding = "utf-8";
      this.startTime = new Date().getTime();
      Object.assign(this, e);
      this.log("", `🔔${this.name}, 开始!`);
    }
    getEnv() {
      return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : undefined;
    }
    isNode() {
      return "Node.js" === this.getEnv();
    }
    isQuanX() {
      return "Quantumult X" === this.getEnv();
    }
    isSurge() {
      return "Surge" === this.getEnv();
    }
    isLoon() {
      return "Loon" === this.getEnv();
    }
    isShadowrocket() {
      return "Shadowrocket" === this.getEnv();
    }
    isStash() {
      return "Stash" === this.getEnv();
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t);
      } catch {
        return e;
      }
    }
    toStr(t, e = null, ...s) {
      try {
        return JSON.stringify(t, ...s);
      } catch {
        return e;
      }
    }
    getjson(t, e) {
      let s = e;
      if (this.getdata(t)) {
        try {
          s = JSON.parse(this.getdata(t));
        } catch {}
      }
      return s;
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e);
      } catch {
        return false;
      }
    }
    getScript(t) {
      return new Promise(e => {
        this.get({
          url: t
        }, (t, s, i) => e(i));
      });
    }
    runScript(t, e) {
      return new Promise(s => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        o = o ? 1 * o : 20;
        o = e && e.timeout ? e.timeout : o;
        const [r, a] = i.split("@");
        const n = {
          url: `http://${a}/v1/scripting/evaluate`,
          body: {
            script_text: t,
            mock_type: "cron",
            timeout: o
          },
          headers: {
            "X-Key": r,
            Accept: "*/*"
          },
          policy: "DIRECT",
          timeout: o
        };
        this.post(n, (t, e, i) => s(i));
      }).catch(t => this.logErr(t));
    }
    loaddata() {
      if (!this.isNode()) {
        return {};
      }
      {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile);
        const e = this.path.resolve(process.cwd(), this.dataFile);
        const s = this.fs.existsSync(t);
        const i = !s && this.fs.existsSync(e);
        if (!s && !i) {
          return {};
        }
        {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i));
          } catch (t) {
            return {};
          }
        }
      }
    }
    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile);
        const e = this.path.resolve(process.cwd(), this.dataFile);
        const s = this.fs.existsSync(t);
        const i = !s && this.fs.existsSync(e);
        const o = JSON.stringify(this.data);
        s ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(e, o) : this.fs.writeFileSync(t, o);
      }
    }
    lodash_get(t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let o = t;
      for (const t of i) if (o = Object(o)[t], undefined === o) {
        return s;
      }
      return o;
    }
    lodash_set(t, e, s) {
      Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s);
      return t;
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t);
        const o = s ? this.getval(s) : "";
        if (o) {
          try {
            const t = JSON.parse(o);
            e = t ? this.lodash_get(t, i, "") : e;
          } catch (t) {
            e = "";
          }
        }
      }
      return e;
    }
    setdata(t, e) {
      let s = false;
      if (/^@/.test(e)) {
        const [, i, o] = /^@(.*?)\.(.*?)$/.exec(e);
        const r = this.getval(i);
        const a = i ? "null" === r ? null : r || "{}" : "{}";
        try {
          const e = JSON.parse(a);
          this.lodash_set(e, o, t);
          s = this.setval(JSON.stringify(e), i);
        } catch (e) {
          const r = {};
          this.lodash_set(r, o, t);
          s = this.setval(JSON.stringify(r), i);
        }
      } else {
        s = this.setval(t, e);
      }
      return s;
    }
    getval(t) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
          return $persistentStore.read(t);
        case "Quantumult X":
          return $prefs.valueForKey(t);
        case "Node.js":
          this.data = this.loaddata();
          return this.data[t];
        default:
          return this.data && this.data[t] || null;
      }
    }
    setval(t, e) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
          return $persistentStore.write(t, e);
        case "Quantumult X":
          return $prefs.setValueForKey(t, e);
        case "Node.js":
          this.data = this.loaddata();
          this.data[e] = t;
          this.writedata();
          return true;
        default:
          return this.data && this.data[e] || null;
      }
    }
    initGotEnv(t) {
      this.got = this.got ? this.got : require("got");
      this.cktough = this.cktough ? this.cktough : require("tough-cookie");
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
      t && (t.headers = t.headers ? t.headers : {}, t && (t.headers = t.headers ? t.headers : {}, undefined === t.headers.cookie && undefined === t.headers.Cookie && undefined === t.cookieJar && (t.cookieJar = this.ckjar)));
    }
    get(t, e = () => {}) {
      switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), undefined === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = false), this.isQuanX() && (t.opts ? t.opts.redirection = false : t.opts = {
        redirection: false
      })), this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
            "X-Surge-Skip-Scripting": false
          }));
          $httpClient.get(t, (t, s, i) => {
            !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode);
            e(t, s, i);
          });
          break;
        case "Quantumult X":
          this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
            hints: false
          }));
          $task.fetch(t).then(t => {
            const {
              statusCode: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            } = t;
            e(null, {
              status: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            }, r, a);
          }, t => e(t && t.error || "UndefinedError"));
          break;
        case "Node.js":
          let s = require("iconv-lite");
          this.initGotEnv(t);
          this.got(t).on("redirect", (t, e) => {
            try {
              if (t.headers["set-cookie"]) {
                const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                s && this.ckjar.setCookieSync(s, null);
                e.cookieJar = this.ckjar;
              }
            } catch (t) {
              this.logErr(t);
            }
          }).then(t => {
            const {
              statusCode: i,
              statusCode: o,
              headers: r,
              rawBody: a
            } = t;
            const n = s.decode(a, this.encoding);
            e(null, {
              status: i,
              statusCode: o,
              headers: r,
              rawBody: a,
              body: n
            }, n);
          }, t => {
            const {
              message: i,
              response: o
            } = t;
            e(i, o, o && s.decode(o.rawBody, this.encoding));
          });
          break;
      }
    }
    post(t, e = () => {}) {
      const s = t.method ? t.method.toLocaleLowerCase() : "post";
      switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), undefined === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = false), this.isQuanX() && (t.opts ? t.opts.redirection = false : t.opts = {
        redirection: false
      })), this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
            "X-Surge-Skip-Scripting": false
          }));
          $httpClient[s](t, (t, s, i) => {
            !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode);
            e(t, s, i);
          });
          break;
        case "Quantumult X":
          t.method = s;
          this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
            hints: false
          }));
          $task.fetch(t).then(t => {
            const {
              statusCode: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            } = t;
            e(null, {
              status: s,
              statusCode: i,
              headers: o,
              body: r,
              bodyBytes: a
            }, r, a);
          }, t => e(t && t.error || "UndefinedError"));
          break;
        case "Node.js":
          let i = require("iconv-lite");
          this.initGotEnv(t);
          const {
            url: o,
            ...r
          } = t;
          this.got[s](o, r).then(t => {
            const {
              statusCode: s,
              statusCode: o,
              headers: r,
              rawBody: a
            } = t;
            const n = i.decode(a, this.encoding);
            e(null, {
              status: s,
              statusCode: o,
              headers: r,
              rawBody: a,
              body: n
            }, n);
          }, t => {
            const {
              message: s,
              response: o
            } = t;
            e(s, o, o && i.decode(o.rawBody, this.encoding));
          });
          break;
      }
    }
    time(t, e = null) {
      const s = e ? new Date(e) : new Date();
      let i = {
        "M+": s.getMonth() + 1,
        "d+": s.getDate(),
        "H+": s.getHours(),
        "m+": s.getMinutes(),
        "s+": s.getSeconds(),
        "q+": Math.floor((s.getMonth() + 3) / 3),
        S: s.getMilliseconds()
      };
      /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
      return t;
    }
    queryStr(t) {
      let e = "";
      for (const s in t) {
        let i = t[s];
        null != i && "" !== i && ("object" == typeof i && (i = JSON.stringify(i)), e += `${s}=${i}&`);
      }
      e = e.substring(0, e.length - 1);
      return e;
    }
    msg(e = t, s = "", i = "", o = {}) {
      const r = t => {
        const {
          $open: e,
          $copy: s,
          $media: i,
          $mediaMime: o
        } = t;
        switch (typeof t) {
          case undefined:
            return t;
          case "string":
            switch (this.getEnv()) {
              case "Surge":
              case "Stash":
              default:
                return {
                  url: t
                };
              case "Loon":
              case "Shadowrocket":
                return t;
              case "Quantumult X":
                return {
                  "open-url": t
                };
              case "Node.js":
                return;
            }
          case "object":
            switch (this.getEnv()) {
              case "Surge":
              case "Stash":
              case "Shadowrocket":
              default:
                {
                  const r = {};
                  let a = t.openUrl || t.url || t["open-url"] || e;
                  a && Object.assign(r, {
                    action: "open-url",
                    url: a
                  });
                  let n = t["update-pasteboard"] || t.updatePasteboard || s;
                  if (n && Object.assign(r, {
                    action: "clipboard",
                    text: n
                  }), i) {
                    let t;
                    let e;
                    let s;
                    if (i.startsWith("http")) {
                      t = i;
                    } else {
                      if (i.startsWith("data:")) {
                        const [t] = i.split(";");
                        const [, o] = i.split(",");
                        e = o;
                        s = t.replace("data:", "");
                      } else {
                        e = i;
                        s = (t => {
                          const e = {
                            JVBERi0: "application/pdf",
                            R0lGODdh: "image/gif",
                            R0lGODlh: "image/gif",
                            iVBORw0KGgo: "image/png",
                            "/9j/": "image/jpg"
                          };
                          for (var s in e) if (0 === t.indexOf(s)) {
                            return e[s];
                          }
                          return null;
                        })(i);
                      }
                    }
                    Object.assign(r, {
                      "media-url": t,
                      "media-base64": e,
                      "media-base64-mime": o ?? s
                    });
                  }
                  Object.assign(r, {
                    "auto-dismiss": t["auto-dismiss"],
                    sound: t.sound
                  });
                  return r;
                }
              case "Loon":
                {
                  const s = {};
                  let o = t.openUrl || t.url || t["open-url"] || e;
                  o && Object.assign(s, {
                    openUrl: o
                  });
                  let r = t.mediaUrl || t["media-url"];
                  i?.startsWith("http") && (r = i);
                  r && Object.assign(s, {
                    mediaUrl: r
                  });
                  console.log(JSON.stringify(s));
                  return s;
                }
              case "Quantumult X":
                {
                  const o = {};
                  let r = t["open-url"] || t.url || t.openUrl || e;
                  r && Object.assign(o, {
                    "open-url": r
                  });
                  let a = t["media-url"] || t.mediaUrl;
                  i?.startsWith("http") && (a = i);
                  a && Object.assign(o, {
                    "media-url": a
                  });
                  let n = t["update-pasteboard"] || t.updatePasteboard || s;
                  n && Object.assign(o, {
                    "update-pasteboard": n
                  });
                  console.log(JSON.stringify(o));
                  return o;
                }
              case "Node.js":
                return;
            }
          default:
            return;
        }
      };
      if (!this.isMute) {
        switch (this.getEnv()) {
          case "Surge":
          case "Loon":
          case "Stash":
          case "Shadowrocket":
          default:
            $notification.post(e, s, i, r(o));
            break;
          case "Quantumult X":
            $notify(e, s, i, r(o));
            break;
          case "Node.js":
            break;
        }
      }
      if (!this.isMuteLog) {
        let t = ["", "==============📣系统通知📣=============="];
        t.push(e);
        s && t.push(s);
        i && t.push(i);
        console.log(t.join("\n"));
        this.logs = this.logs.concat(t);
      }
    }
    debug(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.debug && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.debug}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    info(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.info && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.info}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    warn(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.warn && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.warn}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    error(...t) {
      this.logLevels[this.logLevel] <= this.logLevels.error && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.error}${t.map(t => t ?? String(t)).join(this.logSeparator)}`));
    }
    log(...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]);
      console.log(t.map(t => t ?? String(t)).join(this.logSeparator));
    }
    logErr(t, e) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        case "Quantumult X":
        default:
          this.log("", `❗️${this.name}, 错误!`, e, t);
          break;
        case "Node.js":
          this.log("", `❗️${this.name}, 错误!`, e, undefined !== t.message ? t.message : t, t.stack);
          break;
      }
    }
    wait(t) {
      return new Promise(e => setTimeout(e, t));
    }
    done(t = {}) {
      const e = (new Date().getTime() - this.startTime) / 1000;
      switch (this.log("", `🔔${this.name}, 结束! 🕛 ${e} 秒`), this.log(), this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        case "Quantumult X":
        default:
          $done(t);
          break;
        case "Node.js":
          process.exit(1);
      }
    }
  }(t, e);
}
