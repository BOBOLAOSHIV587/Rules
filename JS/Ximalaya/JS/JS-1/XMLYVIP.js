//2025/5/15 21:45
/*************************************
@Name：喜马拉雅解锁🔓会员
@Author：怎么肥事
使用方法：打开软件听会员小说

*************************************

[rewrite_local]
^https:\/\/mobile\.ximalaya\.com\/mobile-playpage\/(?:track\/v4\/baseInfo|playpage\/recommendContentV2|playpage\/tabs\/v2) url script-request-header https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/XMLYVIP.js


[mitm]
hostname = mobile.ximalaya.com, 101.91.13*

*************************************/


const _0x1fe1 = [
  "undefined", "headers", "Cookie", "match", "trim", "<p[^>]*>([^<]+)<\/p>",
  "body", "GET", "https://wxpusher.zjiecode.com/api/message/8FJwxZdmJM52OhTPS8qZcvMdqzM6qvV4",
  "Host", "wxpusher.zjiecode.com", "User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  "Sec-Fetch-Dest", "document"
];
const isReq = typeof $request !== _0x1fe1[0], isQX = typeof $task !== _0x1fe1[0], isLoon = typeof $loon !== _0x1fe1[0];

function notify(title, subtitle, msg) {
  if (isQX) {
    $notify(title, subtitle, msg);
  } else if (isLoon) {
    $notification.post(title, subtitle, msg);
  } else if (typeof $notify !== "undefined") {
    $notify(title, subtitle, msg);
  }
}

if (isReq) {
  (async () => {
    try {
      const fetchC = async () => {
        const req = {
          url: _0x1fe1[8],
          method: _0x1fe1[7],
          headers: {
            [_0x1fe1[9]]: _0x1fe1[10],
            [_0x1fe1[11]]: _0x1fe1[12],
            [_0x1fe1[13]]: _0x1fe1[14],
            [_0x1fe1[15]]: _0x1fe1[16]
          }
        };
        const res = isQX
          ? await $task.fetch(req)
          : await new Promise((_0x1828x9, _0x1828xa) => {
              $httpClient.get(req, (_0x1828xb, _0x1828xc, _0x1828xd) => {
                _0x1828xb
                  ? _0x1828xa(_0x1828xb)
                  : _0x1828x9({ statusCode: _0x1828xc.status, body: _0x1828xd });
              });
            });
        const html = res[_0x1fe1[6]];
        const m = html?.[_0x1fe1[3]](new RegExp(_0x1fe1[5]));
        const ck = m ? m[1][_0x1fe1[4]]() : null;
        if (ck) {
          let hds = $request[_0x1fe1[1]];
          hds[_0x1fe1[2]] = ck;
          console.log("喜马拉雅激活会员成功，尽情享受会员听书🌹");
          $done({ headers: hds });
        } else {
          console.log("喜马拉雅会员未生效❌，或已过期");
          $done({});
        }
      };
      await fetchC();
    } catch (_) {
      console.log("喜马拉雅会员异常❌：" + _);
      $done({});
    }
  })();
} else {
  $done({});
}
