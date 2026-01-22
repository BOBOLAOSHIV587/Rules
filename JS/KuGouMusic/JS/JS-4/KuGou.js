/***********************************
#!name= 酷狗音乐
#!desc= 解锁会员及歌曲(支持MAC+IPAD+IOS端)
#!date= 2025-12-25

[Rule]
# > (广告/弹窗)
URL-REGEX,"^https:\/\/vipssr\.kugou\.com\/static\/js\/async\/flexPayPopup",REJECT
URL-REGEX,"^https:\/\/.*\.kugou\.com\/vipssr\/prepay_ios\.html",REJECT
URL-REGEX,"^https:\/\/staticssl\.kugou\.com\/common\/js-lib\/vip\/dlg_ctrler_v2\.js$",REJECT
URL-REGEX,"^https:\/\/h5\.kugou\.com\/apps\/vipcenter\/_next\/static\/css",REJECT
URL-REGEX,"^https:\/\/vipssr\.kugou\.com\/static\/js\/vip\/newUi\/vipPageUnionIosContent-",REJECT
URL-REGEX,"^https:\/\/fx\.service\.kugou\.com\/fx\/activity\/register\/center\/sidebar\/configV2$",REJECT
URL-REGEX,"^https:\/\/service1\.fanxing\.kugou\.com\/video\/mo\/live\/pull\/mutiline\/cfg",REJECT
URL-REGEX,"^http:\/\/log\.web\.kugou\.com\/postEvent\.php$",REJECT
# > (广告域名)
DOMAIN,webvoobssdl.kugou.com,REJECT
DOMAIN,ad.tencentmusic.com,REJECT
DOMAIN,ads.service.kugou.com,REJECT
DOMAIN,adsfile.kugou.com,REJECT
DOMAIN,mdpfilebssdlbig.kugou.com,REJECT
DOMAIN,adserviceretry.kugou.com,REJECT
# > (开屏广告)
IP-CIDR,157.255.11.247/32,REJECT,no-resolve
IP-CIDR,111.206.99.202/32,REJECT,no-resolve

[Script]
http-response ^https?:\/\/.*\.kugou\.com\/(v1|v2|v3|v5|mobile|media.store\/v1|adp\/ad\/v1|ads.gateway/v2|fxsing\/vip\/user|sing7\/homepage\/json\/v3\/vip)\/(login_by_token|get_my_info|get_login_extend_info|vipinfoV2|get_res_privilege\/lite|mine_top_banner|task_center_entrance|info|tip) script-path=https://raw.githubusercontent.com/chmg2025/script/refs/heads/main/kugouvip.js, requires-body=true, timeout=60, tag=酷狗
http-response ^https?:\/\/.*\.kugou\.com\/(v5|tracker\/v5)\/url script-path=https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/kugouv5.js, requires-body=true, timeout=60, tag=酷狗V5

[MITM]
hostname = *.kugou.com
***********************************/


let $ = new Env('酷狗音乐')
let url = $request.url

if (url.indexOf('v5/login_by_token') !== -1 || url.indexOf('v3/get_my_info') !== -1 || url.indexOf('mobile/vipinfoV2') !== -1 || url.indexOf('get_login_extend_info') !== -1) {
    let json = JSON.parse($response.body)
    json.data.is_vip = 1
    json.data.vip_type = 6
    json.data.vip_begin_time = '2025-12-01 00:00:00'
    json.data.vip_end_time = '2099-12-01 00:00:00'
    json.data.listen_begin_time = '2025-12-01 00:00:00'
    json.data.listen_end_time = '2099-12-01 00:00:00'
    json.data.su_vip_begin_time = '2025-12-01 00:00:00'
    json.data.su_vip_end_time = '2099-12-01 00:00:00'
    json.data.su_vip_y_endtime = '2099-12-01 00:00:00'
    json.data.user_type = 29
    json.data.bookvip_valid = 1
    json.data.bookvip_end_time = '2099-12-01 00:00:00'
    json.data.roam_type = 1
    json.data.roam_begin_time = '2025-12-01 00:00:00'
    json.data.vip_token = '1234567890abcdef'
    json.data.auth_token = '1234567890abcdef'
    json.data.y_type = 1
    json.data.m_type = 1
    json.data.user_y_type = 1
    json.data.m_begin_time = '2025-12-01 00:00:00'
    json.data.m_end_time = '2099-12-01 00:00:00'
    json.data.exp = 4099737600
    json.data.t_expire_time = 4099737600
    json.data.m_is_old = 1
    json.data.svip_level = 9
    json.data.svip_score = 9999
    json.data.singvip_valid = 1
    if (json.data.tone_info) {
       json.data.tone_info.user_right_list.forEach((item) => (item.valid = true))
       }
    $.done({body: JSON.stringify(json)})
} else if (url.indexOf('v1/get_res_privilege/lite') !== -1) {
    let json = JSON.parse($response.body)
    json.data[0].trans_param.musicpack_advance = 0
    json.data[0].trans_param.display = 0
    json.data[0].trans_param.display_rate = 0
    json.data[0].trans_param.pay_block_tpl = 0
    json.data[0].trans_param.free_limited = 0
    json.data[0].trans_param.all_quality_free = 1
    json.data[0].trans_param.download_privilege = 8
    json.data[0].level = 0
    json.data[0].status = 1
    json.data[0].price = 0
    json.data[0].buy_count = 1
    json.data[0].pay_type = 0
    json.data[0].buy_count_audios = 1
    json.data[0].relate_goods.forEach((item) => (item.status = 1))
    json.data[0].relate_goods.forEach((item) => (item.price = 0))
    json.data[0].relate_goods.forEach((item) => (item.pay_type = 0))
    json.data[0].relate_goods.forEach((item) => (item.popup = null))
    if (json.userinfo){
      json.userinfo.m_type = 1
      json.userinfo.vip_type = 6
      json.userinfo.vip_user_type = 3
      json.userinfo.quota_remain = 999
    }
    json.vip_user_type = 3
    json.appid_group = 0
    $.done({body: JSON.stringify(json)})
} else if (url.indexOf('v1/mine_top_banner') !== -1 || url.indexOf('v2/task_center_entrance') !== -1) {
   let json = JSON.parse($response.body)
   delete json.data.ads
   $.done({body: JSON.stringify(json)})
} else if (url.indexOf('vip/user/info') !== -1  || url.indexOf('json/v3/vip/tip') !== -1) {
   let json = JSON.parse($response.body)
   json.data.status = 1
   json.data.vipLevel = 9
   json.data.svip = 1
   json.data.expireTime = 4099737600000
   if (json.data.vipTips) {
       json.data.vipTips[0].btnText = "SVIP已激活" 
       json.data.vipTips[0].btnText = "尊贵SVIP 畅享所有特权"
   }
   $.done({body: JSON.stringify(json)})
}  else {
    $.log('未匹配')
    $.done()
}

function Env(a, b) {
  var c = Math.floor;
  return new class {
    constructor(a, b) {
      this.name = a, this.version = "1.7.4", this.data = null, this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "", this.encoding = "utf-8", this.startTime = new Date().getTime(), Object.assign(this, b), this.log("", "🔔" + this.name + ", 开始!")
    }

    platform() {
      return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" == typeof module || !module.exports ? "undefined" == typeof $task ? "undefined" == typeof $loon ? "undefined" == typeof $rocket ? "undefined" == typeof Egern ? void 0 : "Egern" : "Shadowrocket" : "Loon" : "Quantumult X" : "Node.js"
    }

    isQuanX() {
      return "Quantumult X" === this.platform()
    }

    isSurge() {
      return "Surge" === this.platform()
    }

    isLoon() {
      return "Loon" === this.platform()
    }

    isShadowrocket() {
      return "Shadowrocket" === this.platform()
    }

    isStash() {
      return "Stash" === this.platform()
    }

    isEgern() {
      return "Egern" === this.platform()
    }

    toObj(a, b = null) {
      try {
        return JSON.parse(a)
      } catch {
        return b
      }
    }

    toStr(a, b = null) {
      try {
        return JSON.stringify(a)
      } catch {
        return b
      }
    }

    lodash_get(a = {}, b = "", c = void 0) {
      Array.isArray(b) || (b = this.toPath(b));
      const d = b.reduce((a, b) => Object(a)[b], a);
      return d === void 0 ? c : d
    }

    lodash_set(a = {}, b = "", c) {
      return Array.isArray(b) || (b = this.toPath(b)), b.slice(0, -1).reduce((a, c, d) => Object(a[c]) === a[c] ? a[c] : a[c] = /^d+$/.test(b[d + 1]) ? [] : {}, a)[b[b.length - 1]] = c, a
    }

    toPath(a) {
      return a.replace(/[(d+)]/g, ".$1").split(".").filter(Boolean)
    }

    getItem(a = new String, b = null) {
      let c = b;
      switch (a.startsWith("@")) {
        case !0:
          const { key: b, path: d } = a.match(/^@(?<key>[^.]+)(?:.(?<path>.*))?$/)?.groups;
          a = b;
          let e = this.getItem(a, {});
          "object" != typeof e && (e = {}), c = this.lodash_get(e, d);
          try {
            c = JSON.parse(c)
          } catch (a) {
          }
          break;
        default:
          switch (this.platform()) {
            case "Surge":
            case "Loon":
            case "Stash":
            case "Egern":
            case "Shadowrocket":
              c = $persistentStore.read(a);
              break;
            case "Quantumult X":
              c = $prefs.valueForKey(a);
              break;
            default:
              c = this.data?.[a] || null
          }
          try {
            c = JSON.parse(c)
          } catch (a) {
          }
      }
      return c ?? b
    }

    setItem(a = new String, b = new String) {
      let c = !1;
      switch (typeof b) {
        case "object":
          b = JSON.stringify(b);
          break;
        default:
          b = b + ""
      }
      switch (a.startsWith("@")) {
        case !0:
          const { key: d, path: e } = a.match(/^@(?<key>[^.]+)(?:.(?<path>.*))?$/)?.groups;
          a = d;
          let f = this.getItem(a, {});
          "object" != typeof f && (f = {}), this.lodash_set(f, e, b), c = this.setItem(a, f);
          break;
        default:
          switch (this.platform()) {
            case "Surge":
            case "Loon":
            case "Stash":
            case "Egern":
            case "Shadowrocket":
              c = $persistentStore.write(b, a);
              break;
            case "Quantumult X":
              c = $prefs.setValueForKey(b, a);
              break;
            default:
              c = this.data?.[a] || null
          }
      }
      return c
    }

    async fetch(a = {}, b = {}) {
      switch (a.constructor) {
        case Object:
          a = { ...a, ...b };
          break;
        case String:
          a = { url: a, ...b }
      }
      a.method || (a.method = a.body ?? a.bodyBytes ? "POST" : "GET"), delete a.headers?.Host, delete a.headers?.[":authority"], delete a.headers?.["Content-Length"], delete a.headers?.["content-length"];
      const c = a.method.toLocaleLowerCase();
      switch (this.platform()) {
        case "Loon":
        case "Surge":
        case "Stash":
        case "Egern":
        case "Shadowrocket":
        default:
          return a.policy && (this.isLoon() && (a.node = a.policy), this.isStash() && this.lodash_set(a, "headers.X-Stash-Selected-Proxy", encodeURI(a.policy))), a.followRedirect && ((this.isSurge() || this.isLoon()) && (a["auto-redirect"] = !1), this.isQuanX() && (a.opts ? a.opts.redirection = !1 : a.opts = { redirection: !1 })), a.bodyBytes && !a.body && (a.body = a.bodyBytes, delete a.bodyBytes), await new Promise((b, d) => {
            $httpClient[c](a, (c, e, f) => {
              c ? d(c) : (e.ok = /^2dd$/.test(e.status), e.statusCode = e.status, f && (e.body = f, !0 == a["binary-mode"] && (e.bodyBytes = f)), b(e))
            })
          });
        case "Quantumult X":
          return a.policy && this.lodash_set(a, "opts.policy", a.policy), "boolean" == typeof a["auto-redirect"] && this.lodash_set(a, "opts.redirection", a["auto-redirect"]), a.body instanceof ArrayBuffer ? (a.bodyBytes = a.body, delete a.body) : ArrayBuffer.isView(a.body) ? (a.bodyBytes = a.body.buffer.slice(a.body.byteOffset, a.body.byteLength + a.body.byteOffset), delete object.body) : a.body && delete a.bodyBytes, await $task.fetch(a).then(a => (a.ok = /^2dd$/.test(a.statusCode), a.status = a.statusCode, a), a => Promise.reject(a.error))
      }
    }

    time(a, b = null) {
      const d = b ? new Date(b) : new Date;
      let e = {
        "M+": d.getMonth() + 1,
        "d+": d.getDate(),
        "H+": d.getHours(),
        "m+": d.getMinutes(),
        "s+": d.getSeconds(),
        "q+": c((d.getMonth() + 3) / 3),
        S: d.getMilliseconds()
      };
      for (let c in /(y+)/.test(a) && (a = a.replace(RegExp.$1, (d.getFullYear() + "").slice(4 - RegExp.$1.length))), e) new RegExp("(" + c + ")").test(a) && (a = a.replace(RegExp.$1, 1 == RegExp.$1.length ? e[c] : ("00" + e[c]).slice(("" + e[c]).length)));
      return a
    }

    getBaseURL(a) {
      return a.replace(/[?#].*$/, "")
    }

    isAbsoluteURL(a) {
      return /^[a-z][a-z0-9+.-]*:/.test(a)
    }

    getURLParameters(a) {
      return (a.match(/([^?=&]+)(=([^&]*))/g) || []).reduce((b, a) => (b[a.slice(0, a.indexOf("="))] = a.slice(a.indexOf("=") + 1), b), {})
    }

    getTimestamp(a = new Date) {
      return c(a.getTime() / 1e3)
    }

    queryStr(a) {
      let b = [];
      for (let c in a) a.hasOwnProperty(c) && b.push(c + '=' + a[c]);
      let c = b.join("&");
      return c
    }

    queryObj(a) {
      let b = {}, c = a.split("&");
      for (let d of c) {
        let a = d.split("="), c = a[0], e = a[1] || "";
        c && (b[c] = e)
      }
      return b
    }

    msg(a = this.name, b = "", c = "", d) {
      const e = a => {
        switch (typeof a) {
          case void 0:
            return a;
          case "string":
            switch (this.platform()) {
              case "Surge":
              case "Stash":
              case "Egern":
              default:
                return { url: a };
              case "Loon":
              case "Shadowrocket":
                return a;
              case "Quantumult X":
                return { "open-url": a }
            }
          case "object":
            switch (this.platform()) {
              case "Surge":
              case "Stash":
              case "Egern":
              case "Shadowrocket":
              default: {
                let b = a.url || a.openUrl || a["open-url"];
                return { url: b }
              }
              case "Loon": {
                let b = a.openUrl || a.url || a["open-url"], c = a.mediaUrl || a["media-url"];
                return { openUrl: b, mediaUrl: c }
              }
              case "Quantumult X": {
                let b = a["open-url"] || a.url || a.openUrl, c = a["media-url"] || a.mediaUrl,
                  d = a["update-pasteboard"] || a.updatePasteboard;
                return { "open-url": b, "media-url": c, "update-pasteboard": d }
              }
            }
          default:
        }
      };
      if (!this.isMute) switch (this.platform()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          $notification.post(a, b, c, e(d));
          break;
        case "Quantumult X":
          $notify(a, b, c, e(d))
      }
    }

    log(...a) {
      0 < a.length && (this.logs = [...this.logs, ...a]), console.log(a.join(this.logSeparator))
    }

    logErr(a, b) {
      switch (this.platform()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Egern":
        case "Shadowrocket":
        case "Quantumult X":
        default:
          this.log("", "❗️" + this.name + ", 错误!", a, b)
      }
    }

    wait(a) {
      return new Promise(b => setTimeout(b, a))
    }

    done(a = {}) {
      const b = new Date().getTime(), c = (b - this.startTime) / 1e3;
      switch (this.log("", "🔔" + this.name + ", 结束! 🕛" + c + "秒"), this.platform()) {
        case "Surge":
          a.policy && this.lodash_set(a, "headers.X-Surge-Policy", a.policy), $done(a);
          break;
        case "Loon":
          a.policy && (a.node = a.policy), $done(a);
          break;
        case "Stash":
          a.policy && this.lodash_set(a, "headers.X-Stash-Selected-Proxy", encodeURI(a.policy)), $done(a);
          break;
        case "Egern":
          $done(a);
          break;
        case "Shadowrocket":
        default:
          $done(a);
          break;
        case "Quantumult X":
          a.policy && this.lodash_set(a, "opts.policy", a.policy), delete a["auto-redirect"], delete a["auto-cookie"], delete a["binary-mode"], delete a.charset, delete a.host, delete a.insecure, delete a.method, delete a.opt, delete a.path, delete a.policy, delete a["policy-descriptor"], delete a.scheme, delete a.sessionIndex, delete a.statusCode, delete a.timeout, a.body instanceof ArrayBuffer ? (a.bodyBytes = a.body, delete a.body) : ArrayBuffer.isView(a.body) ? (a.bodyBytes = a.body.buffer.slice(a.body.byteOffset, a.body.byteLength + a.body.byteOffset), delete a.body) : a.body && delete a.bodyBytes, $done(a)
      }
    }
  }(a, b)
}
