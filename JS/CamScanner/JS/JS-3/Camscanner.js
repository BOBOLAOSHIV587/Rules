/**************************
 *  * @Author: XiaoMao
 * @LastMod: 2023-01-18
 *
 * 
\扫\描\全\能\王\v\i\p \至\尊\用\户

仅供学习参考，请于下载后24小时内删除

********************************
# 小版本更新请查看更新日志 ｜ 或加入xiaomao组织⬇️
# 微信公众号 【小帽集团】
# XiaoMao · TG通知频道：https://t.me/xiaomaoJT
# XiaoMao · Tg脚本频道：https://t.me/XiaoMaoScript
# XiaoMao · GitHub仓库：https://github.com/xiaomaoJT/QxScript


使用方法：
1、使用BoxJS增加以下脚本订阅。https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/XiaoMao.json

2、通过boxjs设置vip到期时间及等级
【一二此步骤可省略，会员到期时间永远定格明天，失效请重开app】

3、QX > 右下角风车 > 重写 > 规则资源 > 引用以下脚本 > 打开资源解析器
https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/XiaoMaoScanningAlmighty.js

********************************

[mitm]
hostname = api-cs.intsig.net

[rewrite_local]
https:\/\/api-cs\.intsig\.net\/purchase\/cs\/query_property url script-response-body https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/source/sa.js

 ***************/

function Env(name) {
  // 判断当前环境是否为 Loon
  const isLoon = typeof $loon !== "undefined";
  // 判断当前环境是否为 Surge
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  // 判断当前环境是否为 QuantumultX
  const isQX = typeof $task !== "undefined";

  // 定义 read 方法，用于读取数据
  const read = (key) => {
    if (isLoon || isSurge) return $persistentStore.read(key);
    if (isQX) return $prefs.valueForKey(key);
  };

  // 定义 write 方法，用于写入数据
  const write = (key, value) => {
    if (isLoon || isSurge) return $persistentStore.write(key, value);
    if (isQX) return $prefs.setValueForKey(key, value);
  };

  // 定义 notify 方法，用于发送通知
  const notify = (title = "XiaoMao", subtitle = "", message = "", url = "",url2 = url) => {
    if (isLoon) $notification.post(title, subtitle, message, url);
    if (isSurge) $notification.post(title, subtitle, message, { url });
    if (isQX) $notify(title, subtitle, message, { "open-url": url, "media-url": url2 });
  };

  // 定义 get 方法，用于发送 GET 请求
  const get = (url, callback) => {
    if (isLoon || isSurge) $httpClient.get(url, callback);
    if (isQX) {
      url.method = `GET`;
      $task.fetch(url).then((resp) => callback(null, {}, resp.body));
    }
  };

  // 定义 post 方法，用于发送 POST 请求
  const post = (url, callback) => {
    if (isLoon || isSurge) $httpClient.post(url, callback);
    if (isQX) {
      url.method = `POST`;
      $task.fetch(url).then((resp) => callback(null, {}, resp.body));
    }
  };

  // 定义 put 方法，用于发送 PUT 请求
  const put = (url, callback) => {
    if (isLoon || isSurge) $httpClient.put(url, callback);
    if (isQX) {
      url.method = "PUT";
      $task.fetch(url).then((resp) => callback(null, {}, resp.body));
    }
  };

  // 定义 toObj 方法，用于将字符串转为对象
  const toObj = (str) => JSON.parse(str);

  // 定义 toStr 方法，用于将对象转为字符串
  const toStr = (obj) => JSON.stringify(obj);

  // 定义 queryStr 方法，用于将对象转为可以请求的字符串
  const queryStr = (obj) => {
    return Object.keys(obj)
      .map((key) => `${key}=${obj[key]}`)
      .join("&");
  };

  // 定义 log 方法，用于输出日志
  const log = (message) => console.log(message);

  // 定义 done 方法，用于结束任务
  const done = (value = {}) => $done(value);

  // 返回包含所有方法的对象
  return {
    name,
    read,
    write,
    notify,
    get,
    post,
    put,
    toObj,
    toStr,
    queryStr,
    log,
    done,
  };
}
function getGoneDay(n = 0, yearFlag = true) {
  let myDate = new Date();
  myDate.setDate(myDate.getDate() - n);
  let month = myDate.getMonth() + 1;
  let day = myDate.getDate();
  let result =
    "" +
    (yearFlag ? myDate.getFullYear() : "") +
    "/" +
    (month < 10 ? "0" + month : month) +
    "/" +
    (day < 10 ? "0" + day : day);
  return result;
}
let obj = JSON.parse($response.body);
let $XiaoMaoSvip = new Env("ScanningAlmighty");
let appName = `XiaoMao-ScanningAlmightyVip`;
let XiaoMaoSvip = "";
let XiaoMaoEndTime = null;
let XiaoMaoStartTime = null;
let XiaoMaoSuper = 1000;
let SvipDate = null;
!(async () => {
  await XiaoMaoFunction();
})()
  .catch((err) => {
    $XiaoMaoSvip.log(err);
    setTimeout(() => {
      $XiaoMaoSvip.done();
    }, 3000);
  })
  .finally(() => {
    console.log(appName + "设置成功");
    setTimeout(() => {
      $XiaoMaoSvip.done();
    }, 5000);
  });
function XiaoMaoFunction() {
  if (
    $XiaoMaoSvip.read("ScanningAlmightyVipYear") &&
    $XiaoMaoSvip.read("ScanningAlmightyVipMonth") &&
    $XiaoMaoSvip.read("ScanningAlmightyVipDay")
  ) {
    SvipDate = new Date(
      $XiaoMaoSvip.read("ScanningAlmightyVipYear") +
        "/" +
        $XiaoMaoSvip.read("ScanningAlmightyVipMonth") +
        "/" +
        $XiaoMaoSvip.read("ScanningAlmightyVipDay")
    ).getTime();
    if (!SvipDate) {
      $XiaoMaoSvip.notify(
        appName,
        "",
        "会员日期设置错误，请输入正确的日期范围!"
      );
      XiaoMaoSvip = getGoneDay(-1);
    } else {
      XiaoMaoSvip =
        $XiaoMaoSvip.read("ScanningAlmightyVipYear") +
        "/" +
        $XiaoMaoSvip.read("ScanningAlmightyVipMonth") +
        "/" +
        $XiaoMaoSvip.read("ScanningAlmightyVipDay");
    }
  } else {
    XiaoMaoSvip = getGoneDay(-1);
  }
  if ($XiaoMaoSvip.read("ScanningAlmightySuper")) {
    $XiaoMaoSvip.read("ScanningAlmightySuper") == "0" ? "" : (XiaoMaoSuper = 1);
  }
  XiaoMaoStartTime = new Date(getGoneDay(-360)).getTime() / XiaoMaoSuper;
  XiaoMaoEndTime = new Date(XiaoMaoSvip).getTime() / XiaoMaoSuper;
}
if ($response.body) {
  let requestUrl = $request.url;
  if (
    /^https:\/\/api-cs\.intsig\.net\/purchase\/cs\/query_property?/.test(
      requestUrl
    )
  ) {
    let psnl_vip_property = {
      product_id: "com.intsig.camscanner.premiums.oneyear.autorenewable.plus",
      initial_tm: XiaoMaoStartTime,
      svip: 1,
      auto_renewal: true,
      ms_first_pay: 0,
      pending: 0,
      group2_paid: 0,
      inherited_flag: 0,
      nxt_renew_tm: XiaoMaoEndTime - 24 * 60 * 60 * 1000,
      level_info: { level: 9, days: 1, end_days: 30 },
      group1_paid: 1,
      ys_first_pay: 0,
      renew_type: "year",
      expiry: XiaoMaoEndTime,
      grade: 2,
      renew_method: "appstore",
      last_payment_method: "appstore",
    };
    obj.hasOwnProperty("data")
      ? (obj.data.psnl_vip_property = psnl_vip_property)
      : "";
  }
  $done({ body: JSON.stringify(obj) });
} else {
  $done({});
}
