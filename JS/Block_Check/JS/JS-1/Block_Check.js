/**
 * 节点连通性检测脚本
 * 作者：https://github.com/RavelloH
 *
 * 功能：
 *   检测当前节点是否可连接，并判断是否被运营商/GFW 阻断
 *
 * 配置 (Quantumult X):
 *   [task_local]
 *   event-interaction https://gist.githubusercontent.com/RavelloH/383354955aa3800e1d7e98666e11e16f/raw/block_check.js, tag=节点阻断检测, img-url=img-url=bolt.horizontal.icloud.fill.system, enabled=true
 *
 * 使用：长按节点 → 执行脚本
 */

const IP_API = "http://ip-api.com/json?lang=zh-CN";
const CHECK_HOST = "https://check-host.net";
const GP_API = "https://api.globalping.io/v1/measurements";
const TIMEOUT = 8000;

function run() {
  const tag = $environment.params;
  if (!tag) return done("未获取到节点名称");

  $configuration.sendMessage({
    action: "get_server_description",
    content: tag
  }).then(function(resolve) {
    var host = null, port = null;
    if (resolve.ret && resolve.ret[tag]) {
      var desc = resolve.ret[tag];
      var eq = desc.indexOf("=");
      if (eq !== -1) {
        var afterEq = desc.substring(eq + 1);
        var comma = afterEq.indexOf(",");
        var hp = comma === -1 ? afterEq : afterEq.substring(0, comma);
        var colon = hp.lastIndexOf(":");
        if (colon !== -1) {
          host = hp.substring(0, colon);
          port = hp.substring(colon + 1);
        }
      }
    }
    startChecks(tag, host, port);
  }, function() {
    startChecks(tag, null, null);
  });
}

function startChecks(tag, host, port) {
  var opts = { policy: $environment.params };

  var pA = $task.fetch({ url: IP_API, opts: opts, timeout: TIMEOUT })
    .then(function(r) { return { src: "node", ok: true, data: JSON.parse(r.body) }; })
    .catch(function() { return { src: "node", ok: false }; });

  var pB = $task.fetch({ url: IP_API, timeout: TIMEOUT })
    .then(function(r) { return { src: "direct", ok: true, data: JSON.parse(r.body) }; })
    .catch(function() { return { src: "direct", ok: false }; });

  var pC;
  if (host && port) {
    var target = host + ":" + port;
    var checkUrl = CHECK_HOST + "/check-tcp?host=" + encodeURIComponent(target) + "&max_nodes=10";
    pC = $task.fetch({ url: checkUrl, headers: { "Accept": "application/json" }, timeout: TIMEOUT })
      .then(function(r) {
        var d = JSON.parse(r.body);
        if (!d.ok || !d.request_id) return { src: "remote", ok: false, error: "提交失败" };
        var rid = d.request_id;
        var nodeList = d.nodes || {};
        var nodeNames = Object.keys(nodeList);
        var countryMap = {};
        nodeNames.forEach(function(n) {
          var info = nodeList[n];
          if (info && info.length >= 1) countryMap[n] = info[0];
        });
        return new Promise(function(resolve) {
          setTimeout(function() {
            $task.fetch({ url: CHECK_HOST + "/check-result/" + rid, headers: { "Accept": "application/json" }, timeout: TIMEOUT })
              .then(function(r2) {
                var res = JSON.parse(r2.body);
                var reachable = false;
                var items = [];
                nodeNames.forEach(function(n) {
                  var cc = countryMap[n] || "";
                  var flag = cc ? getFlag(cc) : "🌍";
                  var nr = res[n];
                  var ms = '<code style="font-family: Menlo, Monaco, monospace; font-size: 12px">--.--ms</code>';
                  if (nr && Array.isArray(nr) && nr.length > 0 && nr[0].time !== undefined) {
                    reachable = true;
                    ms = '<code style="font-family: Menlo, Monaco, monospace; font-size: 12px">' + formatMs(nr[0].time * 1000) + '</code>';
                  }
                  items.push({ flag: flag, ms: ms });
                });
                resolve({ src: "remote", ok: reachable, data: items });
              }, function() {
                resolve({ src: "remote", ok: false, error: "查询失败" });
              });
          }, 3500);
        });
      })
      .catch(function() { return { src: "remote", ok: false, error: "请求失败" }; });
  } else {
    pC = Promise.resolve({ src: "remote", ok: false, error: "无地址信息" });
  }

  Promise.allSettled([pA, pB, pC]).then(function(results) {
    var node = results[0].value;
    var direct = results[1].value;
    var checkHost = results[2].value;

    var nOk = node && node.ok;
    var dOk = direct && direct.ok;
    var cOk = checkHost && checkHost.ok;

    // check-host 通 + 节点不通 → 触发国内定位
    if (dOk && cOk && !nOk && host && port) {
      runGlobalping(tag, host, port, node, direct, checkHost);
    } else {
      render(tag, node, direct, checkHost, null);
    }
  });
}

function runGlobalping(tag, host, port, node, direct, checkHost) {
  var body = {
    type: "ping",
    target: host,
    measurementOptions: { port: parseInt(port), protocol: "TCP" },
    locations: [{ country: "CN", tags: ["eyeball-network"] }],
    limit: 12
  };

  $task.fetch({
    url: GP_API,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    timeout: TIMEOUT
  }).then(function(r) {
    var d = JSON.parse(r.body);
    if (!d.id) { render(tag, node, direct, checkHost, null); return; }

    setTimeout(function() {
      $task.fetch({
        url: GP_API + "/" + d.id,
        headers: { "Accept": "application/json" },
        timeout: TIMEOUT
      }).then(function(r2) {
        render(tag, node, direct, checkHost, JSON.parse(r2.body));
      }, function() {
        render(tag, node, direct, checkHost, null);
      });
    }, 6000);
  }).catch(function() {
    render(tag, node, direct, checkHost, null);
  });
}

function classifyISP(network) {
  var n = network.toLowerCase();
  if (n.indexOf("unicom") !== -1 || n.indexOf("china unicom") !== -1) return "中国联通";
  if (n.indexOf("chinanet") !== -1 || n.indexOf("telecom") !== -1 || n.indexOf("china telecom") !== -1) return "中国电信";
  if (n.indexOf("mobile") !== -1 || n.indexOf("china mobile") !== -1) return "中国移动";
  return null;
}

function analyzeBlockSource(gpData) {
  var results = gpData.results;
  if (!results) return null;

  var ispGroups = {};
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var isp = classifyISP(r.probe.network);
    if (!isp) continue;

    if (!ispGroups[isp]) ispGroups[isp] = { probes: [], reachable: false };

    var res = r.result;
    var ok = false;
    var ms = "--.--ms";
    var stats = res.stats;
    if (res.status === "finished" && stats) {
      ok = stats.rcv > 0;
      ms = ok ? formatMs(stats.avg || 0) : "--.--ms";
    }
    if (ok) ispGroups[isp].reachable = true;

    ispGroups[isp].probes.push({
      city: cnCity(r.probe.city),
      ok: ok,
      ms: ms
    });
  }

  var reachableIsps = [], blockedIsps = [];
  var keys = Object.keys(ispGroups);
  for (var k = 0; k < keys.length; k++) {
    var g = ispGroups[keys[k]];
    if (g.probes.length === 0) continue;
    if (g.reachable) reachableIsps.push(keys[k]); else blockedIsps.push(keys[k]);
  }

  var conclusion;
  if (reachableIsps.length === 0) {
    conclusion = "🚫 GFW 全局阻断 — 国内三大运营商均无法访问";
  } else if (blockedIsps.length > 0) {
    conclusion = "🚫 运营商级拦截 — " + blockedIsps.join("、") + " 不可达，" + reachableIsps.join("、") + " 正常";
  } else {
    conclusion = "✅ 国内三大运营商全部可达，非 GFW 或运营商拦截，请检查客户端配置";
  }

  return { ispGroups: ispGroups, conclusion: conclusion };
}

function cnCity(en) {
  var map = {
    "Beijing": "北京", "Shanghai": "上海", "Guangzhou": "广州",
    "Shenzhen": "深圳", "Chengdu": "成都", "Hangzhou": "杭州",
    "Wuhan": "武汉", "Nanjing": "南京", "Tianjin": "天津",
    "Xi'an": "西安", "Changsha": "长沙", "Zhengzhou": "郑州",
    "Jinan": "济南", "Qingdao": "青岛", "Dalian": "大连",
    "Xiamen": "厦门", "Fuzhou": "福州", "Kunming": "昆明",
    "Hefei": "合肥", "Ningbo": "宁波", "Suzhou": "苏州",
    "Wuxi": "无锡", "Changzhou": "常州", "Guilin": "桂林",
    "Nanning": "南宁", "Haikou": "海口", "Sanya": "三亚",
    "Guiyang": "贵阳", "Lanzhou": "兰州", "Urumqi": "乌市",
    "Hohhot": "呼市", "Harbin": "哈市", "Changchun": "长春",
    "Shenyang": "沈阳", "Shijiazhuang": "石市", "Taiyuan": "太原",
    "Xuzhou": "徐州", "Yancheng": "盐城", "Taishan": "台山",
    "Nanchang": "南昌", "Foshan": "佛山", "Dongguan": "东莞",
    "Zhuhai": "珠海", "Zhongshan": "中山", "Huizhou": "惠州"
  };
  return map[en] || en;
}

function formatMs(ms) {
  if (ms >= 10000) {
    return Math.floor(ms) + "ms";
  } else if (ms >= 1000) {
    return Math.floor(ms).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "ms";
  } else if (ms >= 100) {
    return ms.toFixed(1) + "ms";
  } else if (ms >= 10) {
    return ms.toFixed(2) + "ms";
  } else if (ms <= 0) {
    return "0.00ms";
  } else {
    return ms.toFixed(3) + "ms";
  }
}

function render(tag, node, direct, remote, gpData) {
  var nOk = node && node.ok;
  var dOk = direct && direct.ok;
  var rOk = remote && remote.ok;

  var parts = [];

  // 节点代理
  var nodeStr = '<span style="font-weight: bold">节点代理</span>: ' + (nOk ? "✅ 正常" : "❌ 不可达");
  if (nOk && node.data) {
    var d = node.data;
    nodeStr += '<br/>' + '<span style="font-weight: bold">IP</span>: ' + d.query;
    nodeStr += '<br/>' + '<span style="font-weight: bold">位置</span>: ' + [d.country, d.regionName, d.city].filter(Boolean).join(" - ");
    nodeStr += '<br/>' + '<span style="font-weight: bold">ISP</span>: ' + (d.isp || "未知");
  }
  parts.push(nodeStr);

  // 本机网络
  parts.push('<span style="font-weight: bold">本机网络</span>: ' + (dOk ? "✅ 正常" : "❌ 异常"));

  // 远端探测
  var remoteStr = '<span style="font-weight: bold">远端探测</span>: ' + (rOk ? "✅ 可达" : "❌ 不可达");
  if (remote && remote.data && remote.data.length > 0) {
    var items = remote.data;
    for (var i = 0; i < items.length; i += 2) {
      var left = items[i];
      var right = i + 1 < items.length ? items[i + 1] : null;
      remoteStr += '<br/>' + left.flag + " " + left.ms;
      if (right) {
        remoteStr += "&emsp;&emsp;" + right.flag + " " + right.ms;
      }
    }
  } else if (remote && remote.error) {
    remoteStr += '<br/>' + remote.error;
  }
  parts.push(remoteStr);

  // 国内定位（仅在阻断嫌疑时有数据）
  if (gpData && gpData.results) {
    var analysis = analyzeBlockSource(gpData);
    if (analysis) {
      // 收集所有探针，按运营商排序：电信 → 联通 → 移动
      var ispOrder = ["中国电信", "中国联通", "中国移动"];
      var ispAbbr = { "中国电信": "电信", "中国联通": "联通", "中国移动": "移动" };
      var allProbes = [];
      for (var j = 0; j < ispOrder.length; j++) {
        var key = ispOrder[j];
        var group = analysis.ispGroups[key];
        if (!group) continue;
        for (var p = 0; p < group.probes.length; p++) {
          allProbes.push({
            label: ispAbbr[key] + "·" + group.probes[p].city,
            ms: group.probes[p].ms,
            ok: group.probes[p].ok
          });
        }
      }

      var domesticReachable = allProbes.some(function(p) { return p.ok; });
      var gpStr = '<span style="font-weight: bold">国内探测</span>: ' + (domesticReachable ? "✅ 可达" : "❌ 不可达");
      if (allProbes.length > 0) {
        for (var i2 = 0; i2 < allProbes.length; i2 += 2) {
          var left = allProbes[i2];
          var right = i2 + 1 < allProbes.length ? allProbes[i2 + 1] : null;
          var lc = left.ok ? "#4CAF50" : "#f44336";
          gpStr += '<br/>' + left.label + ' ';
          gpStr += '<code style="font-family: Menlo, Monaco, monospace; font-size: 12px; color: ' + lc + '">' + left.ms + '</code>';
          if (right) {
            var rc = right.ok ? "#4CAF50" : "#f44336";
            gpStr += "&emsp;&emsp;" + right.label + ' ';
            gpStr += '<code style="font-family: Menlo, Monaco, monospace; font-size: 12px; color: ' + rc + '">' + right.ms + '</code>';
          }
        }
      }
      parts.push(gpStr);
    }
  }

  // 分隔
  parts.push('<span style="font-weight: bold">📋 诊断结论</span>');

  if (!dOk) {
    parts.push('⚠️ 本机网络异常');
  } else if (nOk && rOk) {
    parts.push('✅ 节点正常');
  } else if (!nOk && rOk && dOk) {
    if (gpData && gpData.results) {
      var a2 = analyzeBlockSource(gpData);
      if (a2 && a2.conclusion) {
        parts.push(a2.conclusion);
      } else {
        parts.push('🚫 疑似被运营商/GFW 阻断');
      }
    } else {
      parts.push('🚫 疑似被运营商/GFW 阻断');
    }
  } else if (!nOk && !rOk && dOk) {
    parts.push('💤 节点离线');
  } else {
    parts.push('❓ 数据不完整');
  }

  // 节点名称
  parts.push('<span style="font-weight: bold">节点</span>: <span style="color: #467fcf">' + (tag || "当前节点") + '</span>');

  var html = parts.join('<br/><br/>');

  $done({
    "title": "   🌐 节点阻断检测",
    htmlMessage: '<div style="font-family: -apple-system; font-size: large">' + html + '</div>'
  });
}

function getFlag(cc) {
  if (!cc || cc.length !== 2) return "🌍";
  var cp = cc.toUpperCase().split('').map(function(c) { return 127397 + c.charCodeAt(); });
  return String.fromCodePoint.apply(null, cp);
}

function done(msg) {
  $done({
    "title": "   🌐 节点阻断检测",
    htmlMessage: '<div style="font-family: -apple-system; font-size: large"><span style="font-weight: bold">🛑 ' + msg + '</span></div>'
  });
}

run();
