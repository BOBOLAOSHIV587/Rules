/*
 *baby
 * IPPure 节点 IP 纯净度
 */

const url = "https://my.ippure.com/v1/info";
const WAIT_TIME = 1000;

(async () => {
  try {
    let data = await httpGet(url);
    
    await sleep(WAIT_TIME);
    
    let policyName = await getPolicyNameAuto();

    const json = JSON.parse(data);
    const ip = json.ip || "未知IP";
    const country = json.countryCode || "UN";
    const city = json.city || json.region || "";
    const isp = json.asOrganization || json.isp || "";
    const score = json.fraudScore;
    const flag = getFlagEmoji(country);

    let color = "#8E8E93"; 
    let icon = "shield";
    let scoreText = "N/A";
    let riskLevel = "无数据";
    
    if (typeof score === 'number') {
        scoreText = score;
        if (score >= 70) {
            color = "#FF3B30";
            icon = "xmark.shield.fill";
            riskLevel = "高危";
        } else if (score >= 40) {
            color = "#FF9500";
            icon = "exclamationmark.shield.fill";
            riskLevel = "中险";
        } else {
            color = "#34C759";
            icon = "checkmark.shield.fill";
            riskLevel = "安全";
        }
    } else {
        color = "#007AFF"; 
        icon = "info.circle";
    }

    const title = policyName ? `${policyName}` : `IPPure检测`;
    const content = `分数: ${scoreText} (${riskLevel})\n` + 
                    `${flag} ${city}, ${country}\n` + 
                    `${isp}\n` + 
                    `IP: ${ip}`;

    $done({
        title: title,
        content: content,
        icon: icon,
        "icon-color": color
    });

  } catch (e) {
    $done({
        title: "检测失败",
        content: "请查看脚本日志",
        icon: "exclamationmark.triangle",
        "icon-color": "#FF0000"
    });
  }
})();

function httpGet(url) {
    return new Promise((resolve, reject) => {
        $httpClient.get(url, (err, resp, body) => {
            if (err) reject(err);
            else resolve(body);
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getPolicyNameAuto() {
    return new Promise((resolve) => {
        $httpAPI("GET", "/v1/requests/recent", null, (data) => {
            if (!data || !data.requests) {
                resolve(null); 
                return;
            }
            const target = data.requests.find(r => r.URL.includes("ippure.com") && r.policyName);
            if (target) {
                resolve(target.policyName);
            } else {
                resolve(getPolicyFromArgs());
            }
        });
    });
}

function getPolicyFromArgs() {
    return new Promise((resolve) => {
        let targetGroup = null;
        if (typeof $argument === "string") {
            const args = {};
            $argument.split("&").forEach(part => {
                const [key, val] = part.split("=");
                if(key && val) args[key] = decodeURIComponent(val);
            });
            if (args.group) targetGroup = args.group;
        }

        if (!targetGroup) {
            resolve(null);
            return;
        }

        $httpAPI("GET", `/v1/policy_groups/select?group_name=${encodeURIComponent(targetGroup)}`, null, (data) => {
            if (data && data.select) {
                resolve(data.select);
            } else {
                resolve(null);
            }
        });
    });
}

function getFlagEmoji(code) {
    if (!code || code.length !== 2) return "🌐";
    return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt()));
}
