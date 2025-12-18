/** 2025-05-19 17:33:37

[重点] 需要从 Surge 统计里导出到此 捷径 https://www.icloud.com/shortcuts/271eaa8b65f14a1cb401fde8e1e4653d

[首次使用需要设置以下参数]

必须配置:
   ├ [KEY_DIRECT] 默认: DIRECT
   ├ [KEY_PROXY]  默认: 🇭🇰|🇸🇬|🇯🇵|🇺🇸
   ├ 正则关键字 需要最终走向的节点名 策略组名不行 
   └ Surge 内规则配置参考下面示例

可选配置:
   ├ [COUNT] 过滤 请求次数 > COUNT 的域名 默认 5
   ├ [ON_DIRECT_IP] 生成直连 IP 规则 需要查询 Whois
   ├ [ON_DIRECT_HOST] 生成 域名规则
   ├ [ON_PROXY_IP] 生成代理 IP 规则 需要查询 Whois
   ├ [ON_PROXY_HOST] 生成 域名规则
   ├ 1：启用
   └ 0：关闭

捷径配置:
   ├ 默认在 Surge 的 Rule / 下
   ├ direct_file 为 直连规则集 文件名
   └ proxy_file 为 代理规则集 文件名

生成的规则说明
   ├ 需要从Surge 统计里导出到捷径
   ├ 否则直接运行捷径就是去重等操作
   ├ 手动规则优先级最高
   ├ 接下来是直连规则
   ├ [直连 List] 里有的规则，[代理 List] 里不会有
   ├ [KEYWORD] 命中的规则会排除掉
   ├ [WILDCARD] 命中的规则会排除掉
   ├ [IP-CIDR] 重复包含的会去除
   ├ [DOMAIN-SUFFIX,x.cn] 类似的会提取顶级域名[cn]
   └ 首次请求需要一定的时间 有缓存后速度就快了

[Proxy]
CNN = direct // 为了区别正常的 DIRECT 策略 [可选]
// 加了此规则 会收集 走 GEOIP,CN 里的域名 / 如果不加 使用默认关键词 DIRECT 会收集统计里面所有走了直连的规则 

[Rule]
RULE-SET, Rule/P.txt, Proxy, no-resolve  // [可选 可以捷径里设置对应对文件名]
RULE-SET, Rule/D.txt, DIRECT, no-resolve //  
GEOIP, CN, CNN // [可选] 对应 Proxy 的 CNN = direct
FINAL, FINALUS, dns-failed // 需要节点名 包含 关键字 可以用 substore 加前缀 / 匹配国家国旗 [默认匹配: 🇭🇰|🇸🇬|🇯🇵|🇺🇸]

*/

(async () => {
  let response = { body: JSON.stringify({}) };
  try {
    let ARGV = JSON.parse($argument);
    if (!$request?.body) throw new Error("未传入数据");
    let reqbody = JSON.parse($request?.body);
    let { CN = "CNN", FINAL = "FINAL", COUNT = 5, CNIP = 1, CNHOST = 1, FINALIP = 1, FINALHOST = 1 } = ARGV;
    // prettier-ignore
    const TLDSet = new Set(["cn", "us", "uk", "jp", "de", "fr", "au", "ca", "ru", "kr", "sg", "in", "tw", "hk","mo", "nl", "es", "ch", "se", "no", "fi", "dk", "be", "br", "mx", "ar", "za", "nz", "il",]);
    const state = { cidr_cache: 0, cidr_get: 0, cidr_size: 0, nt_a: [], nt_b: [], nt_c: [], nt_d: [], nt_w: [] };
    const regexIPv4 = /^\d+\.\d+\.\d+\.\d+$/;
    const regexIPv6 = /^([0-9a-fA-F]{1,4}:){2,7}/;
    const isIPv4 = (s) => regexIPv4.test(s);
    const isIPv6 = (s) => regexIPv6.test(s);
    var nowDate = Date.now(),
      cidrCache = [],
      more_set = new Set([]),
      re_set = new Set([]),
      key_set = new Set([]),
      wildcard_set = new Set([]),
      addrule = "";
    const today = new Date().toLocaleString("zh-CN", { hour12: false }),
      lines = reqbody.input_csv ? reqbody.input_csv.trim()?.split("\n") : [],
      toBool = (v) => v === true || v == 1,
      proxyRegex = new RegExp(FINAL),
      directRegex = new RegExp(CN),
      DOBJ = { hosts: new Set([]), ips: new Set([]) },
      POBJ = { hosts: new Set([]), ips: new Set([]) },
      CACHE_KEY = "Rule-Cidr-Cache",
      CACHE_TTL = 90 * 24 * 60 * 60 * 1000;

    [CNIP, CNHOST, FINALIP, FINALHOST] = [CNIP, CNHOST, FINALIP, FINALHOST].map(toBool);
    COUNT = Number(COUNT);
    for (let i = 0; i < lines.length; i += 5000) {
      const chunk = lines.slice(i, i + 5000);
      for (const line of chunk) {
        const c1 = line.indexOf(",");
        const c2 = line.indexOf(",", c1 + 1);
        const c3 = line.indexOf(",", c2 + 1);
        const c4 = line.indexOf(",", c3 + 1);
        const H = line.slice(0, c1);
        const P = line.slice(c1 + 1, c2);
        const C = line.slice(c3 + 1, c4);
        if (+C <= COUNT) continue;
        processLine(H, P);
      }
    }

    const { prRule: f_d_o, otherRules: f_d, fileLength: f_d_l } = parseRulesAll(reqbody.file_direcr);
    const { prRule: f_p_o, otherRules: f_p, fileLength: f_p_l } = parseRulesAll(reqbody.file_proxy);

    let rule_direct_cidr = [];
    let rule_proxy_cidr = [];
    let notif = "";
    let t = "";

    if (FINALIP || CNIP) cidrCache = ReadValidCache();

    CNIP && (rule_direct_cidr = await CidrRules([...DOBJ.ips]));
    FINALIP && (rule_proxy_cidr = await CidrRules([...POBJ.ips]));

    let { rules: rules_direct, count: count_direct } = processRules(new Set([...f_d, ...rule_direct_cidr, ...DOBJ.hosts]), true);
    let { rules: rules_proxy, count: count_proxy } = processRules(new Set([...f_p, ...rule_proxy_cidr, ...POBJ.hosts]));

    rules_direct = `# 手动规则: 以下规则优先级最高 不参与规则数量统计\n${f_d_o.join("\n")}\n\n# 更新时间: ${today}\n# 规则数量：当前共 ${count_direct || 0} 条规则\n\n` + rules_direct;
    rules_proxy = `# 手动规则: 以下规则优先级最高 不参与规则数量统计\n${f_p_o.join("\n")}\n\n# 更新时间: ${today}\n# 规则数量：当前共 ${count_proxy || 0} 条规则\n\n` + rules_proxy;

    const nt_x = count_direct != f_d_l ? `${f_d_l} -> ${count_direct}` : `${count_direct}`;
    const nt_p = f_p_l != count_proxy ? `${f_p_l} -> ${count_proxy}` : `${count_proxy}`;

    nt_x != "0" && (notif += `${CN}: ${nt_x}  `);
    nt_p != "0" && (notif += `${FINAL}: ${nt_p}  `);
    (state.cidr_get > 0 || state.cidr_cache > 0) && (notif += `\nIP-CIDR: 请求查询:${state.cidr_get}, 缓存${state.cidr_cache}, 最终规则:${state.cidr_size}`);

    t = state.nt_a.length > 0 ? `\n\n去掉 [${CN}] 里有的规则:\n${state.nt_a.join("\n")}\n` : "";
    t += state.nt_b.length > 0 ? `\n\n去掉命中 [KEYWORD] 的规则: \n${state.nt_b.join("\n")}\n` : "";
    t += state.nt_c.length > 0 ? `\n\n去掉命中 [顶级域名] 的规则: \n${state.nt_c.join("\n")}\n` : "";
    t += state.nt_d.length > 0 ? `\n\n去掉命中 [手动规则] 的: \n${state.nt_d.join("\n")}\n` : "";
    t += state.nt_w.length > 0 ? `\n\n去掉命中 [WILDCARD] 的: \n${state.nt_w.join("\n")}\n` : "";

    $notification.post("FindRule", "", notif);

    console.log("INCSV: \t" + lines?.length);
    console.log("PROXY: \t" + f_p_l);
    console.log("DIRECT: \t" + f_d_l);
    console.log(t + "\n\n" + notif + "\n");
    addrule.length > 0 && console.log("\n" + addrule + "\n");

    function processLine(H, P) {
      if (proxyRegex.test(P)) {
        if (isIPv4(H)) {
          if (FINALIP) POBJ.ips.add(H);
        } else if (FINALHOST && !isIPv6(H)) {
          POBJ.hosts.add(`DOMAIN-SUFFIX,${H}`);
        }
      } else if (directRegex.test(P)) {
        if (isIPv4(H)) {
          if (CNIP) DOBJ.ips.add(H);
        } else if (CNHOST && !isIPv6(H)) {
          DOBJ.hosts.add(`DOMAIN-SUFFIX,${H}`);
        }
      }
    }

    function parseRulesAll(text) {
      const lines = text?.trim()?.split("\n") || [];
      let prRule = [];
      const otherRules = [];
      let fileLength = 0;

      let inExcludeSection = false;
      let passedUpdate = false;

      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("# 手动规则")) {
          inExcludeSection = true;
          continue;
        }

        if (trimmed.startsWith("# 规则数量")) {
          fileLength = trimmed.match(/\d+/)?.[0] || 0;
          inExcludeSection = false;
          passedUpdate = true;
          continue;
        }

        if (!trimmed || trimmed.startsWith("# 更新时间")) continue;

        if (inExcludeSection) {
          prRule.push(trimmed);
          const [type, ...domainParts] = trimmed.split(",");
          if (domainParts.length === 0) continue;
          const domain = domainParts.join(",").trim().replace(/\s+/g, "");
          add_tld_set(domain);
          switch (type) {
            case "DOMAIN-KEYWORD":
              key_set.add(domain);
              break;
            case "DOMAIN-SUFFIX":
              more_set.add(domain);
              break;
            case "DOMAIN-WILDCARD":
              wildcard_add(domain);
              break;
          }
        } else if (passedUpdate) {
          otherRules.push(trimmed);
        }
      }
      prRule.sort();
      return { prRule, otherRules, fileLength };
    }

    function wildcard_add(domain) {
      const regexStr = "^" + domain.replace(/\*/g, ".*").replace(/\?/g, ".{1}") + "$";
      wildcard_set.add(new RegExp(regexStr));
    }

    function processRules(ruleSet, is_cn = false) {
      let isdp = is_cn ? CN : FINAL;
      const other_set = new Set([]);
      const ipcidr_set = new Set([]);
      const direct_set = new Set([]);

      let rule_split = [];
      for (const item of ruleSet) {
        const [type, domain] = item.split(",");
        add_tld_set(domain, is_cn);
        rule_split.push([type, domain]);
        if (type === "DOMAIN-KEYWORD") {
          key_set.add(domain);
        } else if (type === "DOMAIN-WILDCARD") wildcard_add(domain);
      }

      rule_split.forEach(([type, domain]) => {
        if (checkMatch(domain)) return;
        if (matchWildcardSet(domain)) return;
        if (type === "DOMAIN-SUFFIX") {
          handleDomainSuffix(domain, is_cn);
        } else if (type === "IP-CIDR") {
          ipcidr_set.add(type + "," + domain);
        } else other_set.add(type + "," + domain);
      });

      function handleDomainSuffix(domain, is_cn) {
        const parts = domain.split(".");
        const part_len = parts.length;

        if (more_set.has(domain)) {
          state.nt_d.push(`${isdp}: ${domain}`);
          return;
        }

        if (!is_cn && re_set.has(domain)) {
          state.nt_a.push(`${isdp}: ${domain}`);
          return;
        }
        if (part_len === 0) return;

        const tld = parts[part_len - 1];
        if (TLDSet.has(tld)) part_one(tld, domain);
        else part_other(parts, part_len, domain, is_cn);
      }

      function part_one(tld, domain) {
        const mt = more_set.has(tld);
        if (is_cn && !mt) add_d_s(tld);
        if (re_set.has(tld)) {
          tld != domain && state.nt_a.push(`${isdp}: ${domain}`);
          return;
        } else {
          if (mt) {
            tld_log(tld, domain);
            return;
          }
          add_d_s(tld);
        }
      }

      function part_other(parts, part_len, domain, is_cn) {
        if (part_len > 2) {
          let mat = false;
          const doma = parts.slice(-2).join(".");
          if (is_cn) {
            re_set.add(doma);
            mat = true;
          } else if (!re_set.has(doma)) mat = true;
          mat && add_d_s(doma);
        } else add_d_s(domain);
      }

      function tld_log(tld, domain) {
        tld != domain && state.nt_c.push(`${isdp}: ${tld} -> ${domain}`);
      }

      function checkMatch(target) {
        const str = String(target).toLowerCase();
        for (const keyword of key_set) {
          const key = String(keyword).toLowerCase();
          if (str.includes(key)) {
            state.nt_b.push(`${isdp}: ${key} -> ${str}`);
            return true;
          }
        }
        return false;
      }

      function matchWildcardSet(domain) {
        for (const regex of wildcard_set) {
          if (regex.test(domain)) {
            const w = regex.source
              .replace(/^\^|\$$/g, "")
              .replace(/\.\{1\}/g, "?")
              .replace(/\.\*/g, "*");
            state.nt_w.push(`${isdp}: ${w} -> ${domain}`);
            return true;
          }
        }
        return false;
      }

      function add_d_s(i) {
        direct_set.add("DOMAIN-SUFFIX," + i);
      }

      const rules_direct = [...direct_set, ...other_set, ...dedupeCIDRs([...ipcidr_set])].sort();
      const logadd = diffSet(rules_direct, is_cn ? f_d : f_p);
      logadd.length > 0 && (addrule += `\n${isdp}++\n${logadd.join("\n")}\n`);
      return { rules: rules_direct.join("\n"), count: rules_direct.length };
    }

    function add_tld_set(domain, is_cn) {
      if (is_cn) re_set.add(domain);
      // 如果有自定义 顶级域名去重
      if (domain?.split(".").length === 1) {
        TLDSet.add(domain);
      }
    }

    function diffSet(arr1, arr2) {
      const set2 = new Set(arr2);
      return arr1.filter((item) => !set2.has(item));
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function CidrRules(ipList) {
      if (!ipList || ipList.length === 0) return [];
      let timets = ipList.length > 1000 ? 200 : 30;
      const cidrRuleSet = new Set([]);
      const maxConcurrency = 6;
      let activePromises = 0;
      const queue = [...ipList];

      async function processNext() {
        if (queue.length === 0) return;
        const ip = queue.shift();
        activePromises++;
        try {
          let matched = false;
          if (cidrCache.length > 0) {
            for (const _cidr of cidrCache) {
              if (ipInCidr(ip, _cidr)) {
                matched = true;
                cidrRuleSet.add("IP-CIDR," + _cidr);
                state.cidr_cache++;
                // console.log("缓存命中: " + state.cidr_cache);
                break;
              }
            }
          }
          if (!matched) {
            console.log("查询请求: " + ip);
            await sleep(Math.floor(Math.random() * timets) + 10);
            const cidr = await WhoisCidr(ip);
            if (cidr.length > 0) {
              state.cidr_get++;
              console.log("收到: " + state.cidr_get + ": " + cidr.join("  "));
              for (const i of cidr) {
                cidrRuleSet.add("IP-CIDR," + i);
                SaveCache(i);
              }
            } else {
              console.log("查询结果为空：" + ip);
            }
          }
        } catch (error) {
          console.log("查询失败: " + ip + " 错误: " + error.message);
        } finally {
          activePromises--;
          await processNext();
        }
      }

      const tasks = Array.from({ length: Math.min(maxConcurrency, queue.length) }, processNext);
      await Promise.all(tasks);

      state.cidr_size += cidrRuleSet.size;
      return [...cidrRuleSet];
    }

    function SaveCache(cidr) {
      let cacheStore = ReadCache();
      const alreadyExists = cacheStore.some((item) => item.cidr === cidr);
      if (!alreadyExists) {
        cacheStore.push({ cidr, time: nowDate });
        $persistentStore.write(JSON.stringify(cacheStore), CACHE_KEY);
      }
    }

    function ReadValidCache() {
      let cacheStore = ReadCache(nowDate);
      $persistentStore.write(JSON.stringify(cacheStore), CACHE_KEY);
      return cacheStore.map((item) => item.cidr);
    }

    function ReadCache() {
      let cacheStore = [];
      try {
        cacheStore = JSON.parse($persistentStore.read(CACHE_KEY)) || [];
        // 清除过期
        cacheStore = cacheStore.filter((item) => nowDate - item.time < CACHE_TTL);
      } catch (error) {
        cacheStore = [];
        $persistentStore.write(null, CACHE_KEY);
        console.log(CACHE_KEY + " err1" + error.message);
      }
      return cacheStore;
    }

    function fetchWithTimeout(url) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("请求超时"));
        }, 1300);
        $httpClient.get(url, (error, response, data) => {
          clearTimeout(timer);
          if (error) {
            reject(error);
          } else resolve(data);
        });
      });
    }

    async function fetchAndParse(url) {
      let lastError = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        // 最多重试次数 2
        try {
          const data = await fetchWithTimeout(url);
          return JSON.parse(data);
        } catch (err) {
          lastError = err;
          console.log(`第 ${attempt} 次失败：`, err.message);
          if (attempt < 2) {
            console.log("准备重试...\n");
            await new Promise((res) => setTimeout(res, 1300));
          }
        }
      }
      console.log("全部尝试失败，最后错误：" + lastError?.message || lastError);
      return [];
    }

    async function WhoisCidr(ip) {
      const datas = await fetchAndParse(`https://stat.ripe.net/data/prefix-overview/data.json?resource=${ip}`);
      let cidr = datas?.data?.resource ? datas.data.resource : "";
      const cidrArray = cidr.match(/\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}/g) || [];
      if (cidrArray) return cidrArray;

      const data = await fetchAndParse(`https://wq.apnic.net/query?searchtext=${ip}`);
      let cidrs;
      try {
        cidrs = Array.from(
          new Set(
            data
              .filter((item) => item.objectType === "route" || item.objectType === "NetRange")
              .map((item) => {
                const attr = item.attributes.find((a) => a.name === "route" || a.name === "CIDR");
                return attr ? attr?.values[0] : null;
              })
              .filter(Boolean)
          )
        );
      } catch (error) {
        console.log("APIA err " + error.message);
        cidrs = [];
      }
      if (cidrs.length > 0) {
        console.log("备用 API A");
        return cidrs;
      } else {
        try {
          const inetnumObj = data.find((item) => (item.type === "object" && item.attributes.some((attr) => attr.name === "inetnum")) || attr.name === "NetRange");
          if (inetnumObj) {
            const inetnumValue = inetnumObj.attributes.find((attr) => attr.name === "inetnum" || attr.name === "NetRange").values[0];
            const [ipStart, ipEnd] = inetnumValue.split(" - ");
            const cidr = calculateCidr(ipStart, ipEnd);
            console.log("备用 API AB");
            return cidr;
          } else return [];
        } catch (error) {
          console.log("APIA err " + error.message);
          return [];
        }
      }
    }

    function ipInCidr(ip, cidr) {
      const [cidrIp, maskBits] = cidr.split("/");
      const mask = (~0 << (32 - maskBits)) >>> 0;
      const ipInt = ipToInt(ip);
      const cidrIpInt = ipToInt(cidrIp);
      return (ipInt & mask) === (cidrIpInt & mask);
    }

    function parseCIDR(cidrStr) {
      const match = cidrStr.match(/IP-CIDR,([0-9.]+)\/(\d+)/);
      if (!match) return null;
      const [_, ip, prefixLength] = match;
      const ipInt = ipToInt(ip);
      const prefix = parseInt(prefixLength);
      const mask = ~(2 ** (32 - prefix) - 1) >>> 0;
      const start = ipInt & mask;
      const end = start + 2 ** (32 - prefix) - 1;
      return { raw: cidrStr, start, end, prefix };
    }

    function isSubset(a, b) {
      return a.start >= b.start && a.end <= b.end;
    }

    function dedupeCIDRs(rawList) {
      const cidrs = rawList.map(parseCIDR).filter(Boolean);
      const excluded = new Set([]);
      for (let i = 0; i < cidrs.length; i++) {
        for (let j = 0; j < cidrs.length; j++) {
          if (i !== j && isSubset(cidrs[i], cidrs[j])) {
            excluded.add(cidrs[i].raw);
            break;
          }
        }
      }

      const result = rawList.filter((item) => !excluded.has(item));
      excluded.size > 0 && console.log("\n去除的 CIDR: \n" + [...excluded].join("\n") + "\n");
      return result;
    }

    function ipToInt(ip) {
      return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    }

    function intToIp(ipInt) {
      return [(ipInt >>> 24) & 0xff, (ipInt >>> 16) & 0xff, (ipInt >>> 8) & 0xff, ipInt & 0xff].join(".");
    }

    function calculateCidr(startIp, endIp) {
      let start = ipToInt(startIp);
      let end = ipToInt(endIp);
      let cidrs = [];
      while (start <= end) {
        let maxSize = 32 - Math.floor(Math.log2(start & -start));
        let maxDiff = 32 - Math.floor(Math.log2(end - start + 1));
        let mask = Math.max(maxSize, maxDiff);
        cidrs.push(`${intToIp(start)}/${mask}`);
        start += Math.pow(2, 32 - mask);
      }
      return cidrs;
    }

    // console.log("\nrules_direct\n");
    // console.log(rules_direct);

    // console.log("\nrules_proxy\n");
    // console.log(rules_proxy);

    response.body = JSON.stringify({ d: rules_direct, p: rules_proxy });
  } catch (error) {
    console.log(error.message);
  } finally {
    $done({
      response: response,
    });
  }
})();
