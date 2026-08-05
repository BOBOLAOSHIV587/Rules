/*
 * Loon IPCheck — IP 身份 / 纯净度检测
 *
 * 判定当前出口(或指定 IP)是 机房 / 住宅 / 移动网络,并给出风险标记与纯净度评分。
 * 多源交叉验证: ipapi.is + ip-api.com + ipinfo.io,全部免 API Key。
 * 移植自 ip-identity-check skill 的 ipcheck.py(Python 版),投票判定逻辑保持一致。
 *
 * 脚本类型: generic(手动运行) / network-changed(网络切换自动运行,默认关闭)
 * 输出: 系统通知;可选把完整报告复制到剪贴板。
 *
 * https://github.com/nuanyangccto/loon-ipcheck
 */

var TIMEOUT_MS = 10000;
var UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) loon-ipcheck/1.0";

// ---------------------------- 参数解析 ----------------------------
// 插件用 argument=[{QueryIP},{IPInfoToken},{CopyReport}] 传参,新版 Loon 里
// $argument 是对象;兼容旧版字符串形式("a=1&b=2")与缺省情况。
function parseArgs(raw) {
  var out = {};
  if (typeof raw === "undefined" || raw === null) return out;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    raw.split("&").forEach(function (kv) {
      var i = kv.indexOf("=");
      if (i > 0) out[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
    });
  }
  return out;
}

function asBool(v, dft) {
  if (typeof v === "undefined" || v === null || v === "") return dft;
  if (v === true || v === false) return v;
  return String(v).toLowerCase() === "true" || String(v) === "1";
}

var ARGS = parseArgs(typeof $argument !== "undefined" ? $argument : undefined);
var QUERY_IP = String(ARGS.QueryIP || "").trim();
var IPINFO_TOKEN = String(ARGS.IPInfoToken || "").trim();
var COPY_REPORT = asBool(ARGS.CopyReport, true);

// generic 脚本从节点上下文运行时,能拿到节点名 → 让探测请求走该节点
var NODE =
  (typeof $environment !== "undefined" &&
    $environment.params &&
    $environment.params.node) ||
  null;

// ---------------------------- HTTP 封装 ----------------------------
function httpGet(url, opts) {
  opts = opts || {};
  return new Promise(function (resolve) {
    var params = {
      url: url,
      timeout: TIMEOUT_MS,
      headers: { "User-Agent": UA },
    };
    if (opts.node) params.node = opts.node;
    var settled = false;
    // 双保险:个别情况下回调不触发,自兜底超时,保证 $done 一定会被调用
    var guard = setTimeout(function () {
      if (!settled) {
        settled = true;
        resolve({ error: "timeout(guard)" });
      }
    }, TIMEOUT_MS + 3000);
    $httpClient.get(params, function (err, resp, data) {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      if (err) return resolve({ error: String(err) });
      if (!resp || resp.status < 200 || resp.status >= 400)
        return resolve({ error: "HTTP " + (resp ? resp.status : "?") });
      try {
        resolve({ json: JSON.parse(data) });
      } catch (e) {
        resolve({ error: "非 JSON 响应" });
      }
    });
  });
}

// ---------------------------- 数据源 ----------------------------
// ipapi.is — 机房识别最强;不带 q 参数时返回请求方出口 IP 的档案,
// 因此第一跳既拿到出口 IP,又拿到主力数据源结果。
function queryIpapiIs(ip, viaNode) {
  var url = ip ? "https://api.ipapi.is/?q=" + ip : "https://api.ipapi.is/";
  return httpGet(url, viaNode ? { node: viaNode } : {}).then(function (r) {
    if (r.error) return { source: "ipapi.is", error: r.error };
    var d = r.json || {};
    var company = d.company || {};
    var asn = d.asn || {};
    var dc = d.datacenter || {};
    var loc = d.location || {};
    return {
      source: "ipapi.is",
      ip: d.ip,
      is_datacenter: d.is_datacenter,
      is_mobile: d.is_mobile,
      is_proxy: d.is_proxy,
      is_vpn: d.is_vpn,
      is_tor: d.is_tor,
      is_abuser: d.is_abuser,
      is_crawler: d.is_crawler,
      company_name: company.name,
      company_type: company.type, // hosting / isp / business / education
      abuser_score: company.abuser_score,
      datacenter_name: dc.datacenter,
      asn: asn.asn,
      asn_org: asn.org,
      asn_type: asn.type,
      country: loc.country,
      state: loc.state,
      city: loc.city,
    };
  });
}

// ip-api.com — 有 hosting/mobile/proxy 标记,免费 45 次/分钟(仅 http)
function queryIpApiCom(ip) {
  var fields =
    "status,message,country,regionName,city,isp,org,as,asname,mobile,proxy,hosting,query";
  var url =
    "http://ip-api.com/json/" + ip + "?fields=" + fields + "&lang=zh-CN";
  return httpGet(url).then(function (r) {
    if (r.error) return { source: "ip-api.com", error: r.error };
    var d = r.json || {};
    if (d.status !== "success")
      return { source: "ip-api.com", error: d.message || "failed" };
    return {
      source: "ip-api.com",
      is_hosting: d.hosting,
      is_mobile: d.mobile,
      is_proxy: d.proxy,
      isp: d.isp,
      org: d.org,
      asn: d.as,
      country: d.country,
      region: d.regionName,
      city: d.city,
    };
  });
}

// ipinfo.io — 公司/ASN 信息;免 Token 可用,带 Token 数据更全
function queryIpinfo(ip) {
  var url =
    "https://ipinfo.io/" +
    ip +
    "/json" +
    (IPINFO_TOKEN ? "?token=" + IPINFO_TOKEN : "");
  return httpGet(url).then(function (r) {
    if (r.error) return { source: "ipinfo.io", error: r.error };
    var d = r.json || {};
    return {
      source: "ipinfo.io",
      org: d.org, // 形如 "AS979 NetLab Global"
      hostname: d.hostname,
      city: d.city,
      region: d.region,
      country: d.country,
    };
  });
}

// ---------------------------- 综合判定 ----------------------------
// ASN 经验库(与 cli/ipcheck.py v1.3.0 同步):
// 命中已知机房/云厂商是强信号;民用 ISP 只保守 +1(部分运营商也有企业/云业务)。
var HOSTING_ASN_HINTS = [
  "colocrossing", "quadranet", "psychz", "hivelocity", "carinet",
  "choopa", "vultr", "digitalocean", "linode", "ovh", "hetzner",
  "contabo", "racknerd", "buyvm", "frantech", "m247", "datacamp",
  "leaseweb", "dedipath", "hostpapa", "gcore", "zenlayer", "kaopu",
  "stark industries", "aeza", "pq hosting", "amazon", "aws",
  "google cloud", "microsoft azure", "oracle cloud", "alibaba", "aliyun",
  "tencent cloud", "ucloud", "akamai", "cloudflare",
];
var RESIDENTIAL_ISP_HINTS = [
  "comcast", "spectrum", "charter communications", "cox communications",
  "centurylink", "frontier communications", "deutsche telekom", "vodafone",
  "virgin media", "sky broadband", "telstra", "rogers", "shaw communications",
  "kddi", "softbank", "chinanet", "china unicom", "china mobile",
];

function asnHintVotes(votes, evidence, texts) {
  var blob = texts
    .filter(function (t) {
      return t;
    })
    .join(" ")
    .toLowerCase();
  if (!blob) return;
  for (var i = 0; i < HOSTING_ASN_HINTS.length; i++) {
    if (blob.indexOf(HOSTING_ASN_HINTS[i]) >= 0) {
      votes.datacenter += 2;
      evidence.push("ASN 经验库: 命中已知机房/云厂商 '" + HOSTING_ASN_HINTS[i] + "'");
      return;
    }
  }
  for (var j = 0; j < RESIDENTIAL_ISP_HINTS.length; j++) {
    if (blob.indexOf(RESIDENTIAL_ISP_HINTS[j]) >= 0) {
      votes.residential += 1;
      evidence.push(
        "ASN 经验库: 命中民用 ISP '" + RESIDENTIAL_ISP_HINTS[j] + "' (仍需确认是家宽段)"
      );
      return;
    }
  }
}

// 与 ipcheck.py 的 synthesize() 投票逻辑一致:ipapi.is 权重最高。
function synthesize(ip, apis, ipc, ipi) {
  var votes = { datacenter: 0, residential: 0, mobile: 0 };
  var evidence = [];

  if (apis && !apis.error) {
    if (apis.is_datacenter === true) {
      votes.datacenter += 3;
      evidence.push("ipapi.is: is_datacenter=true");
    }
    if (apis.is_mobile === true) {
      votes.mobile += 3;
      evidence.push("ipapi.is: is_mobile=true");
    }
    var ct = String(apis.company_type || "").toLowerCase();
    if (ct === "hosting") {
      votes.datacenter += 2;
      evidence.push("ipapi.is: company_type=hosting");
    } else if (ct === "isp") {
      votes.residential += 2;
      evidence.push("ipapi.is: company_type=isp");
    } else if (ct === "business") {
      votes.datacenter += 1;
      evidence.push("ipapi.is: company_type=business (倾向商用/机房)");
    } else if (ct === "education") {
      votes.residential += 1;
      evidence.push("ipapi.is: company_type=education");
    }
    var at = String(apis.asn_type || "").toLowerCase();
    if (at === "hosting") {
      votes.datacenter += 2;
      evidence.push("ipapi.is: asn_type=hosting");
    } else if (at === "isp") {
      votes.residential += 1;
      evidence.push("ipapi.is: asn_type=isp");
    }
  }

  if (ipc && !ipc.error) {
    if (ipc.is_hosting === true) {
      votes.datacenter += 2;
      evidence.push("ip-api.com: hosting=true");
    }
    if (ipc.is_mobile === true) {
      votes.mobile += 2;
      evidence.push("ip-api.com: mobile=true");
    }
    if (
      ipc.is_hosting === false &&
      ipc.is_mobile === false &&
      ipc.is_proxy === false
    ) {
      votes.residential += 1;
      evidence.push("ip-api.com: 所有标志均为 false (可能住宅)");
    }
  }

  // ASN 经验库投票
  asnHintVotes(votes, evidence, [
    apis.asn_org,
    apis.company_name,
    apis.datacenter_name,
    ipc && ipc.isp,
    ipc && ipc.org,
    ipc && ipc.asn,
    ipi && ipi.org,
  ]);

  // 风险标记
  var risks = [];
  if (apis.is_abuser === true) risks.push("滥用黑名单");
  if (apis.is_proxy === true || (ipc && ipc.is_proxy === true))
    risks.push("代理");
  if (apis.is_vpn === true) risks.push("VPN");
  if (apis.is_tor === true) risks.push("Tor 出口");
  if (apis.is_crawler === true) risks.push("爬虫");
  var abuserScore = String(apis.abuser_score || "");
  if (abuserScore.indexOf("High") >= 0 || abuserScore.indexOf("Elevated") >= 0)
    risks.push("Abuser " + abuserScore);

  // 判定结论
  var verdict, verdictZh, confidence;
  var maxVotes = Math.max(votes.datacenter, votes.residential, votes.mobile);
  if (maxVotes === 0) {
    verdict = "unknown";
    verdictZh = "❓ 数据不足,无法判定";
    confidence = "low";
  } else {
    var winner =
      votes.datacenter === maxVotes
        ? "datacenter"
        : votes.residential === maxVotes
          ? "residential"
          : "mobile";
    var total = votes.datacenter + votes.residential + votes.mobile;
    var ratio = total > 0 ? maxVotes / total : 0;
    confidence = ratio >= 0.7 ? "high" : ratio >= 0.5 ? "medium" : "low";
    verdict = winner;
    verdictZh =
      winner === "datacenter"
        ? "🏢 机房 (Hosting/Datacenter)"
        : winner === "residential"
          ? "🏠 住宅 (Residential)"
          : "📱 移动网络 (Mobile)";
  }

  // 风险分 0-100(越高越脏),打分项全部透明
  var risk = 0;
  if (verdict === "datacenter") risk += 25;
  if (apis.is_proxy === true || (ipc && ipc.is_proxy === true)) risk += 20;
  if (apis.is_vpn === true) risk += 15;
  if (apis.is_tor === true) risk += 30;
  if (apis.is_abuser === true) risk += 25;
  if (abuserScore.indexOf("High") >= 0) risk += 15;
  else if (abuserScore.indexOf("Elevated") >= 0) risk += 8;
  if (apis.is_crawler === true) risk += 5;
  if (risk > 100) risk = 100;

  var stars =
    risk <= 10 ? 5 : risk <= 25 ? 4 : risk <= 45 ? 3 : risk <= 70 ? 2 : 1;

  return {
    ip: ip,
    verdict: verdict,
    verdictZh: verdictZh,
    confidence: confidence,
    risks: risks,
    risk: risk,
    stars: stars,
    evidence: evidence,
  };
}

// ---------------------------- 输出 ----------------------------
function starBar(n) {
  var s = "";
  for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆";
  return s;
}

function buildLocation(apis, ipc, ipi) {
  var parts = [];
  var country = (ipc && ipc.country) || apis.country || (ipi && ipi.country);
  var region = (ipc && ipc.region) || apis.state;
  var city = (ipc && ipc.city) || apis.city || (ipi && ipi.city);
  if (country) parts.push(country);
  if (region && region !== city) parts.push(region);
  if (city) parts.push(city);
  return parts.join(" · ") || "未知";
}

function buildAsn(apis, ipc, ipi) {
  if (apis.asn) return "AS" + apis.asn + " · " + (apis.asn_org || "");
  if (ipc && ipc.asn) return ipc.asn;
  if (ipi && ipi.org) return ipi.org;
  return "未知";
}

// 风险条:10 个色块,红块数量随风险分增加(仿 IPPure 风格)
function riskBar(risk) {
  var red = Math.round(risk / 10);
  var bar = "";
  for (var i = 0; i < 10; i++) bar += i < red ? "🟥" : "🟩";
  return bar;
}

function notifyAndDone(ip, apis, ipc, ipi) {
  var v = synthesize(ip, apis, ipc, ipi);

  var okSources = [apis, ipc, ipi]
    .filter(function (s) {
      return s && !s.error;
    })
    .map(function (s) {
      return s.source;
    });

  var lines = [];
  lines.push(["属性", v.verdictZh + " (可信度 " + v.confidence + ")"]);
  lines.push(["位置", buildLocation(apis, ipc, ipi)]);
  lines.push(["自治", buildAsn(apis, ipc, ipi)]);
  if (apis.company_name)
    lines.push([
      "服务",
      apis.company_name +
        (apis.company_type ? " (" + apis.company_type + ")" : ""),
    ]);
  else if (ipc && ipc.isp) lines.push(["服务", ipc.isp]);
  if (apis.datacenter_name) lines.push(["机房", apis.datacenter_name]);
  lines.push(["纯净", starBar(v.stars) + "  风险 " + v.risk + "/100"]);
  if (v.risks.length) lines.push(["标记", v.risks.join(" / ")]);
  lines.push(["来源", okSources.join(", ") || "全部失败"]);

  var title = QUERY_IP
    ? "IP 检测 | 指定 IP"
    : NODE
      ? "IP 检测 | " + NODE
      : "IP 检测 | 当前出口";

  if (NODE) {
    // 长按节点运行 → 结果显示在 Loon 弹窗,内容用 $done({title, htmlMessage}) 返回
    var html =
      '<p style="text-align: left; font-family: -apple-system; font-size: medium;">' +
      "<b>IP " +
      ip +
      "</b></br></br>" +
      riskBar(v.risk) +
      "</br>风险 " +
      v.risk +
      "/100 · " +
      starBar(v.stars) +
      "</br></br>" +
      lines
        .filter(function (l) {
          return l[0] !== "纯净"; // 头部风险条已展示,弹窗里不重复
        })
        .map(function (l) {
          return "<b>" + l[0] + "</b>: " + l[1];
        })
        .join("</br>") +
      "</p>" +
      '<p style="text-align: left; font-family: -apple-system; font-size: small; color: gray;">' +
      "判定依据:</br>" +
      (v.evidence.length ? v.evidence.join("</br>") : "无") +
      "</p>";
    return $done({ title: title, htmlMessage: html });
  }

  // 手动/网络切换运行 → 系统通知
  var textLines = lines.map(function (l) {
    return l[0] + ": " + l[1];
  });
  var subtitle = ip + "  " + v.verdictZh.split(" ")[0];
  var attach = {};
  if (COPY_REPORT) {
    var full = textLines.concat(
      ["", "判定依据:"],
      v.evidence.map(function (e) {
        return "- " + e;
      })
    );
    attach.clipboard = title + "\n" + subtitle + "\n" + full.join("\n");
  }
  $notification.post(title, subtitle, textLines.join("\n"), attach);
  $done();
}

function fail(msg) {
  if (NODE) {
    return $done({
      title: "IP 检测失败",
      htmlMessage:
        '<p style="text-align: center; font-family: -apple-system; font-size: medium;">🛑 ' +
        msg +
        "</br>请检查网络后重试。</p>",
    });
  }
  $notification.post("IP 检测失败", "", msg + "\n请检查网络后重试。");
  $done();
}

// ---------------------------- 主流程 ----------------------------
// 第一跳: ipapi.is(指定了 QueryIP 就直接查该 IP;否则不带参数,
// 并在有节点上下文时走该节点,拿到"该节点出口 IP"的档案)
queryIpapiIs(QUERY_IP || null, QUERY_IP ? null : NODE)
  .then(function (apis) {
    var ip = QUERY_IP || (apis && apis.ip);
    if (!ip) {
      // 主源失败且没有指定 IP → 用 ip-api.com 兜底探测出口
      return httpGet("http://ip-api.com/json/?fields=query", {
        node: NODE || undefined,
      }).then(function (r) {
        if (r.error || !r.json || !r.json.query)
          return fail("无法获取出口 IP (" + (apis.error || r.error) + ")");
        var ip2 = r.json.query;
        return Promise.all([queryIpApiCom(ip2), queryIpinfo(ip2)]).then(
          function (rs) {
            notifyAndDone(ip2, apis, rs[0], rs[1]);
          }
        );
      });
    }
    return Promise.all([queryIpApiCom(ip), queryIpinfo(ip)]).then(function (
      rs
    ) {
      notifyAndDone(ip, apis, rs[0], rs[1]);
    });
  })
  .catch(function (e) {
    fail("脚本异常: " + String(e));
  });
