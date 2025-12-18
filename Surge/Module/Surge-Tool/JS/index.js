// @BOBOLAOSHIV587
const UPDATA = "2024-03-16 14:14:49";
const isPanel = typeof $input != "undefined",
  stname = "SurgeTool_Rule_NUM",
  STversion = "5.10.03",
  nowt = Date.now(),
  cacheVersion = 2;
let url = (typeof $request !== "undefined" && $request.url) || 0,
  isFetch = /(trouble\.shoot|surge\.tool|st\.com)\/getkey/.test(url);

let result = {},
  ptitle = "Surge Rule",
  icons = "heart.text.square",
  icolor = "#6699FF",
  type = false,
  list = false,
  push = true,
  LogTF = false,
  file_a = "",
  file_b = "";
if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  icons = ins.icon || icons;
  icolor = ins.icolor || icolor;
  ptitle = ins.title || ptitle;
  type = ins.type != 0;
  list = ins.list != 0;
  LogTF = ins.LogTF != 0;
  push = ins.push != 0;
}

!(async () => {
  try {
    const [
      { enabled: mitm },
      { enabled: rewrite },
      { enabled: scripting },
      { profile },
      { scripts },
    ] = await Promise.all([
      httpAPI("/v1/features/mitm", "GET"),
      httpAPI("/v1/features/rewrite", "GET"),
      httpAPI("/v1/features/scripting", "GET"),
      httpAPI("/v1/profiles/current?sensitive=0", "GET"),
      httpAPI("v1/scripting", "GET"),
    ]);

    if (cacheVersion < 2) clearCacheAB();
    [file_a, file_b] = await HttpGetFile();
    let hostname =
      profile.match(/\nhostname\s*=\s*(.*?)\n/)?.[1].split(/\s*,\s*/) || [];
    const hostname_disabled =
      profile
        .match(/\nhostname-disabled\s*=\s*(.*?)\n/)?.[1]
        .split(/\s*,\s*/) || [];
    hostname = hostname.filter((item) => !hostname_disabled.includes(item));

    // prettier-ignore
    let DOMAIN_SET_NUM=0,RULE_SET_NUM=0,ALL_NUM=0,ScriptNUM=0,URL_RewriteNUM=0,Map_LocalNUM=0,Header_RewriteNUM=0,Body_RewriteNUM=0,RewriteNUM=0,hostnameNUM=0,AllRule=[],SurgeTool={},RULELISTALL={};
    ScriptNUM = scripts.filter((i) => i.enabled).length;
    if (isFetch || isPanel) {
      const scRuleRaw =
        profile.match(/^\[Rule\]([\s\S]+?)^\[/gm)?.[0].split("\n") || [];
      const scRule = scRuleRaw.filter((i) => /^\s?(?![#;\s[//])./.test(i));
      scRuleRaw.forEach((e) => {
        if (/^(OR|AND|NOT),/.test(e)) {
          const LG = e
            .split(/\s?\(|\)/)
            .filter((i) => /^\s?(?![,#;\s[//])./.test(i));
          if (LG?.length > 0) {
            const FLG = LG.filter((i) => !/^(AND|OR|NOT)/.test(i));
            if (FLG?.length > 0) {
              const leng = LG.length - FLG.length;
              AllRule = AllRule.concat(FLG);
              let tf = false;
              FLG.forEach((k) => {
                if (/^(DOMAIN|RULE)-SET,/.test(k)) {
                  const key = k.split(",")[1];
                  if (/http/.test(key)) {
                    // Url 作为键
                    RULELISTALL[key] = {
                      n: "",
                      o: e.split(",")[0] + ": ",
                      c: leng,
                      l: "",
                    };
                    tf = true;
                  }
                }
              });
              if (!tf) {
                ALL_NUM +=
                  leng * (FLG.length - 1) > 2 ? leng * (FLG.length - 1) : 0;
              }
            }
          }
        }
      });
      AllRule = AllRule.concat(scRule);
      for (const e of AllRule) {
        if (/^RULE-SET,/.test(e)) {
          RULE_SET_NUM++;
          const rsUrl = e.split(",")[1];
          if (/^https?:\/\/script\.hub\/file\/_start_\//.test(rsUrl)) {
            LogTF && console.log("[RULE-SET_GET_Script-Hub]: " + rsUrl);
            try {
              // ScriptHub 规则缓存
              SurgeTool = JSON.parse($persistentStore.read(stname));
              if (!SurgeTool && SurgeTool?.length > 10000) {
                clearcr();
              } else {
                const cacheNum = SurgeTool[rsUrl];
                if (typeof cacheNum == "number" && cacheNum > 0) {
                  LogTF && console.log("读取ScriptHub 缓存" + cacheNum);
                  let fname = ""; // 逻辑规则类型 前缀
                  if (RULELISTALL[rsUrl]?.o) {
                    fname = RULELISTALL[rsUrl].o || "";
                    if (RULELISTALL[rsUrl]?.c - 1 > 0) {
                      ALL_NUM += (RULELISTALL[rsUrl].c - 1) * cacheNum;
                    }
                  } else {
                    RULELISTALL[rsUrl] = {
                      n: "", // 名字
                      o: "", // 逻辑规则类型
                      c: "", // 逻辑规则次数
                      l: "", // 长度
                    };
                  }
                  const uname =
                    fname + rsUrl.split("/").pop().replace(/\?.+/, "");
                  RULELISTALL[rsUrl].n = uname;
                  RULELISTALL[rsUrl].l = cacheNum;
                }
              }
            } catch (error) {
              clearcr();
            }
            function clearcr() {
              $persistentStore.write(JSON.stringify({}), stname);
            }
          } else if (/http/.test(rsUrl)) {
            LogTF && console.log("[RULE-SET_GET]: " + rsUrl);
            try {
              const ruleSetRaw = (await tKey(rsUrl))
                .split("\n")
                .filter((i) => /^\s?(?![#;\s[//])./.test(i));
              const ruleSetRawleng = ruleSetRaw.length;
              let fname = "";
              if (RULELISTALL[rsUrl]?.o) {
                fname = RULELISTALL[rsUrl].o || "";
                if (RULELISTALL[rsUrl]?.c - 1 > 0) {
                  ALL_NUM += (RULELISTALL[rsUrl].c - 1) * ruleSetRawleng;
                }
              } else {
                RULELISTALL[rsUrl] = {
                  n: "",
                  o: "",
                  c: "",
                  l: "",
                };
              }
              const uname = fname + rsUrl.split("/").pop().replace(/\?.+/, "");
              RULELISTALL[rsUrl].n = uname;
              RULELISTALL[rsUrl].l = ruleSetRawleng;
              AllRule = AllRule.concat(ruleSetRaw);
            } catch (e) {
              console.log(e.message);
            }
          }
        }
        if (/^DOMAIN-SET,/.test(e)) {
          DOMAIN_SET_NUM++;
          const rdurl = e.split(",")[1];
          if (/^https?:\/\/script\.hub\/file\/_start_\//.test(rdurl)) {
            LogTF && console.log("[DOMAIN-SET_GET_Script-Hub]: " + rdurl);
            try {
              SurgeTool = JSON.parse($persistentStore.read(stname));
              if (!SurgeTool && SurgeTool?.length > 10000) {
                clearcr();
              } else {
                const cacheNum = SurgeTool[rdurl];
                if (typeof cacheNum == "number" && cacheNum > 0) {
                  LogTF && console.log("读取ScriptHub 缓存" + cacheNum);
                  let fname = "";
                  if (RULELISTALL[rdurl]?.o) {
                    fname = RULELISTALL[rdurl].o || "";
                    if (RULELISTALL[rdurl]?.c - 1 > 0) {
                      ALL_NUM += (RULELISTALL[rdurl].c - 1) * cacheNum;
                    }
                  } else {
                    ALL_NUM += cacheNum;
                    RULELISTALL[rdurl] = {
                      n: "",
                      o: "",
                      c: "",
                      l: "",
                    };
                  }
                  const uname =
                    fname + rdurl.split("/").pop().replace(/\?.+/, "");
                  RULELISTALL[rdurl].n = uname;
                  RULELISTALL[rdurl].l = cacheNum;
                }
              }
            } catch (error) {
              clearcr();
            }
            function clearcr() {
              $persistentStore.write(JSON.stringify({}), stname);
            }
          } else if (/http/.test(rdurl)) {
            LogTF && console.log("[DOMAIN-SET_GET]: " + rdurl);
            try {
              const DOMAIN_SET_RAW_BODY = (await tKey(rdurl))
                .split("\n")
                .filter((i) => /^\s?(?![#;\s[//])./.test(i));
              const dleng = DOMAIN_SET_RAW_BODY.length;
              let fname = "";
              if (RULELISTALL[rdurl]?.o) {
                fname = RULELISTALL[rdurl].o || "";
                if (RULELISTALL[rdurl]?.c - 1 > 0) {
                  ALL_NUM += (RULELISTALL[rdurl].c - 1) * dleng;
                }
              } else {
                ALL_NUM += dleng;
                RULELISTALL[rdurl] = {
                  n: "",
                  o: "",
                  c: "",
                  l: "",
                };
              }
              const uname = fname + rdurl.split("/").pop().replace(/\?.+/, "");
              RULELISTALL[rdurl].n = uname;
              RULELISTALL[rdurl].l = dleng;
            } catch (e) {
              console.log(e.message);
            }
          }
        }
      }
    } // get

    Header_RewriteNUM = countREN(profile, "Header Rewrite");
    Body_RewriteNUM = countREN(profile, "Body Rewrite");
    Map_LocalNUM = countREN(profile, "Map Local");
    URL_RewriteNUM = countREN(profile, "URL Rewrite");

    RewriteNUM =
      Header_RewriteNUM + Body_RewriteNUM + Map_LocalNUM + URL_RewriteNUM;
    RewriteNUM = RewriteNUM > 0 ? `:${RewriteNUM}` : "";
    ScriptNUM = ScriptNUM > 0 ? `:${ScriptNUM}` : "";
    hostnameNUM = hostname.length > 0 ? `:${hostname.length}` : "";

    // prettier-ignore
    const AROBJ={OR:0,AND:0,NOT:0,DOMAIN:0,SUBNET:0,PROTOCOL:0,"SRC-IP":0,"IP-ASN":0,"IN-PORT":0,"IP-CIDR":0,"RULE-SET":0,"IP-CIDR6":0,"DEST-PORT":0,"URL-REGEX":0,"DOMAIN-SET":0,"USER-AGENT":0,"DEVICE-NAME":0,"PROCESS-NAME":0,"DOMAIN-SUFFIX":0,"DOMAIN-KEYWORD":0,};

    AllRule.forEach((e) => {
      ALL_NUM++;
      const type = e.split(",")[0];
      if (AROBJ.hasOwnProperty(type)) {
        AROBJ[type]++;
      }
    });

    if (LogTF) {
      Object.entries(AROBJ).forEach(
        ([k, v]) => v != 0 && console.log(`${k}: ${v}`)
      );
      Object.entries(RULELISTALL).forEach(
        ([k, v]) => v != 0 && console.log(`${v.n}: ${v.l}`)
      );
    }
    if (file_a.length < 13000 || file_b.length < 55000) {
      clearCacheAB();
      [file_a, file_b] = await HttpGetFile();
    }
    if (isFetch) {
      $done({
        response: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(
            {
              VERSION: STversion,
              ALL_NUM: ALL_NUM,
              HOSTNAMENUM: hostnameNUM,
              SCRIPTNUM: ScriptNUM,
              REWRITENUM: RewriteNUM,
              RE: rewrite,
              MI: mitm,
              SC: scripting,
              UPDATA: UPDATA,
              TIMESTAMP: nowt,
              ETIMESTAMP: Date.now(),
              AROBJ: AROBJ,
              HOSTNAME: hostname,
              RULELISTALL: RULELISTALL,
            },
            null,
            4
          ),
        },
      });
    } else if (isPanel) {
      let text = "ALL:" + ALL_NUM + "\n";
      if (type) {
        Object.entries(AROBJ).forEach(([k, v]) => {
          v != 0 && (text += `${k}: \x20\x20${v}\n`);
        });
      }
      if (list) {
        const e = Object.entries(RULELISTALL);
        e.forEach(([, v], index) => {
          v !== 0 &&
            (text += `${v.n}: \x20\x20${v.l}${
              index === e.length - 1 ? "" : "\n"
            }`);
        });
      }
      push &&
        $notification.post("", text, "点击跳转浏览器打开", {
          url: "http://surge.tool",
        });
      result = {
        title: ptitle + " " + ALL_NUM,
        content: `MitM${mitm ? "☑" : "☒"}${hostnameNUM} JS${
          scripting ? "☑" : "☒"
        }${ScriptNUM} Rewrite${rewrite ? "☑" : "☒"}${RewriteNUM}`,
        icon: icons,
        "icon-color": icolor,
      };
    } else {
      result = {
        response: {
          status: 200,
          headers: {
            "Content-Type": "text/html",
          },
          body: `${file_a}
<div class="action"><a class="ebutton mdi alt">MitM ${hostnameNUM} ${
            mitm ? "&#10003;" : "&#10007;"
          }</a></div>
<div class="action"><a class="ebutton mdi alt">Script ${ScriptNUM} ${
            scripting ? "&#10003;" : "&#10007;"
          }</a></div>
<div class="action"><a class="ebutton mdi alt">Rewrite ${RewriteNUM} ${
            rewrite ? "&#10003;" : "&#10007;"
          }</a></div></div></div>
<div class="lists">
        <div class="image-bgs"></div>
        <div class="pretit">Rule<span id="ALL_NUM"> Request ing ...</span></div>
        <pre id="AROBJ"></pre><div id="RULELISTPRE" class="pretit">Rule List</div><pre id="RULELIST"></pre>
        <div class="pretit">Hostname</div>
        <pre><code>${
          hostname.length > 0
            ? hostname
                .map((i) =>
                  i
                    .split("")
                    .map((j) =>
                      j === "*" ? '<i style="color: red">' + j + "</i>" : j
                    )
                    .join("")
                )
                .map((i) =>
                  !i.startsWith("-") &&
                  /(\.|^)(twitter|tiktokv|snssdk|icloud|apple|itunes)\./.test(i)
                    ? '<i style="color: red">' + i + "</i>"
                    : i
                )
                .join("\n")
            : "&#10007; empty"
        }</code></pre></div></div></div><footer class="tƒooters">V${STversion} Made With &hearts; By <a href="https://t.me/zhetengsha">@xream @key</a></footer> ${file_b}
        `,
        },
      };
    }
  } catch (e) {
    console.log(e.message);
    throw new Error("无法获取当前配置信息");
  }
})()
  .catch((e) => {
    console.log(e.message);
    // prettier-ignore
    if (isPanel) {result = {title: "Surge Tool",content: "Err" + e.message,icon: icons,"icon-color": icolor,};} else {result = {response: {status: 500,headers: { "Content-Type": "text/html" },body: `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>pre { overflow: unset } pre code { white-space: pre-line }</style></head><body><section><h1>错误</h1><pre><code>${e.message ?? e}</pre></code></section></body></html>`,},};}
  })
  .finally(() => $done(result));

function countREN(profile, sectionName) {
  return (
    profile
      .match(new RegExp(`^\\[${sectionName}\\]([\\s\\S]+?)^\\[`, "gm"))?.[0]
      .split("\n")
      .filter((i) => /^\s?(?![#;\s[//])./.test(i)).length || 0
  );
}
async function GetCache(url, sck) {
  return (
    $persistentStore.read(sck) ||
    new Promise((resolve, reject) => {
      $httpClient.get(url, async (error, response, data) => {
        console.log("请求资源..." + sck);
        if (error) {
          console.log(STversion + "\n" + cacheVersion);
          console.log("请求资源失败: " + sck);
          reject(error);
          return;
        }
        $persistentStore.write(data, sck);
        resolve(data);
      });
    })
  );
}
async function HttpGetFile() {
  const file_a = await GetCache(
    "https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Surge/Surge-Tool/JS/file_a.txt",
    "SurgeTool_Cache_A"
  );
  const file_b = await GetCache(
    "https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Surge/Surge-Tool/JS/file_b.txt",
    "SurgeTool_Cache_B"
  );
  return [file_a, file_b];
}
function clearCacheAB() {
  $persistentStore.write("", "SurgeTool_Cache_A");
  $persistentStore.write("", "SurgeTool_Cache_B");
}
// prettier-ignore
function httpAPI(path = "", method = "POST", body = null) {return new Promise((resolve) => {$httpAPI(method, path, body, (result) => {resolve(result);});});}
// prettier-ignore
function getin() {return Object.fromEntries($argument.split("&").map((i) => i.split("=")).map(([k, v]) => [k, decodeURIComponent(v)]));}
// prettier-ignore
async function tKey(e,t="3000"){let o=1,r=1;const s=new Promise(((s,i)=>{const c=async l=>{try{const o=await Promise.race([new Promise(((t,o)=>{$httpClient.get({url:e},((e,n,r)=>{if(e){o(e)}else{t(r)}}))})),new Promise(((e,o)=>{setTimeout((()=>o(new Error("timeout"))),t)}))]);if(o){s(o)}else{i(new Error(n.message))}}catch(e){if(l<o){r++;c(l+1)}else{console.log("reget"+r);s("reget"+r)}}};c(0)}));return s}
