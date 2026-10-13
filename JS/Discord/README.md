# LoonFakeNitro

Discord iOS 增强插件套件 — 两个独立插件,Loon / Shadowrocket 双支持:

| 插件 | 功能 | Loon | Shadowrocket |
|---|---|---|---|
| **Discord Translate** | Discord 翻译 | [点击安装](https://duncan588.github.io/LoonFakeNitro/redirect.html?t=loon%3A%2F%2Fimport%3Fplugin%3Dhttps%253A%252F%252Fgithub.com%252FDuncan588%252FLoonFakeNitro%252Freleases%252Fdownload%252Fv1.21%252FDiscord.Translate.plugin) | [点击安装](https://duncan588.github.io/LoonFakeNitro/redirect.html?t=shadowrocket%3A%2F%2Finstall%3Fmodule%3Dhttps%253A%252F%252Fgithub.com%252FDuncan588%252FLoonFakeNitro%252Freleases%252Fdownload%252Fv1.21%252FDiscord.Translate.module) |
| **Fake Nitro** | 表情解锁 | [点击安装](https://duncan588.github.io/LoonFakeNitro/redirect.html?t=loon%3A%2F%2Fimport%3Fplugin%3Dhttps%253A%252F%252Fgithub.com%252FDuncan588%252FLoonFakeNitro%252Freleases%252Fdownload%252Fv1.21%252Ffake-nitro.plugin) | [点击安装](https://duncan588.github.io/LoonFakeNitro/redirect.html?t=shadowrocket%3A%2F%2Finstall%3Fmodule%3Dhttps%253A%252F%252Fgithub.com%252FDuncan588%252FLoonFakeNitro%252Freleases%252Fdownload%252Fv1.21%252Ffake-nitro.module) |

> 点击安装 → 进入中转跳转,自动拉起对应 App 完成安装。

---

## 📁 仓库结构

```
.
├── loon/                             Loon 侧插件与脚本
│   ├── Discord.Translate.plugin       翻译插件
│   ├── fake-nitro.plugin              假会员插件
│   ├── translate-response.js          翻译响应脚本
│   ├── fake-nitro-display.js          资料页 Nitro 显示脚本
│   ├── fakenitro-send.js              :emoji: 发送侧转换脚本
│   ├── fakenitro-catalog.js            表情目录采集脚本
│   └── blocklist-record.js             拉黑记录脚本
├── Shadowrocket/                     Shadowrocket 侧模块与脚本
│   ├── Discord.Translate.module       翻译模块
│   ├── fake-nitro.module              假会员模块
│   ├── translate-response.sr.js       翻译响应脚本
│   ├── fake-nitro-display.sr.js       资料页 Nitro 显示脚本
│   ├── fakenitro-send.sr.js           :emoji: 发送侧转换脚本
│   ├── fakenitro-catalog.sr.js         表情目录采集脚本
│   └── blocklist-record.sr.js          拉黑记录脚本
├── tools/                            离线验证与部署工具
│   ├── verify.js                      插件/模块/脚本总验证
│   ├── regression-blocklist.js        拉黑过滤回归
│   ├── deploy_nitro_mitm.sh           mitmproxy READY 注入部署
│   └── fixtures/
│       └── translate-response.prepatch.js  旧脚本负对照
├── assets/                           插件图标
│   ├── discord-translate.jpg
│   └── fake-nitro.jpg
├── README.md
├── LICENSE
├── redirect.html                     GitHub Pages 安装跳转
├── .gitattributes
├── .gitignore
└── .nojekyll
```

> 安装时**按平台选对应文件**:Loon 用 `.plugin`,Shadowrocket 用 `.module`,两者不能混用。
---

## 📖 翻译插件使用方法(Discord Translate)

### 安装
1. 确认 Loon 已安装并启用 MitM:Loon → 配置 → MitM → 开启,并安装/信任 Loon CA (iOS 设置 → 通用 → 关于 → 证书信任设置 → Loon CA 全开)
2. 点击上方 Loon「插件 1」链接,Loon 自动拉起并导入
3. 在 Loon → 配置 → 插件 找到 Discord Translate,启用
4. 在 Discord App 中打开任意文字频道,消息会自动替换为中文

### Shadowrocket 安装(模块)
1. **配置 → HTTPS 解密** → 生成 CA → 安装 → 系统设置里信任该证书(不信任的话含 MITM 的模块不生效)
2. **配置 → 模块** → 右上角 **➕** → 填模块链接(表格里 Shadowrocket 那格的链接,或直接填 `releases/download/v1.21/Discord.Translate.module`)→ 下载
3. **全局路由设为「配置」** —— 含规则/脚本的模块只在「配置」模式下生效
4. 改参数:**配置 → 模块 → 点击本模块 → 「编辑参数」**,按需填写后保存(自定义值存本地 `.meta`,模块更新不丢)
   也可手动改规则 `argument=` 里的 **`k=v`,多项用 `&` 连接**;⚠️ **不要写成 JSON**(`{...}`)——逗号会把这一行的属性切碎,整条规则失效
5. 杀掉 Discord 重开

> **看日志**:Shadowrocket → **数据 → 代理 → 启用日志记录**,产生流量后回到 **数据 → 代理** 看日志;
> Loon 与 Shadowrocket 不能混装:Loon 装 `.plugin`,Shadowrocket 装 `.module`。两者共用同一套脚本逻辑。

### 主要参数(插件面板)
| 参数 | 默认 | 说明 |
|---|---|---|
| 目标语言 | zh-CN | 翻译成什么语言 |
| 引擎 | auto | 有 AI Key 用 AI,没有用谷歌 |
| AI 提供商 | 自定义端点 | 也可选 openai / openrouter |
| **同步翻译条数** | 30 | 进入频道时同步翻译的条数,默认 30 = 整页(一页 25 条) |
| **每响应调用上限** | 30 | 单次加载最多多少条翻译请求,防打爆 Loon |
| **单次最大翻译条数** | 30 | 一次响应最多翻几条消息 |
| **并发数** | 自动 | 同时进行的翻译请求数(留空:AI 4 / 谷歌 8);卡顿可调小 |
| 双语模式 | 关 | 显示原文+换行+译文。原文+译文超 1900 字时只给译文(Discord 单条上限 2000) |
| 翻译缓存 | 开 | 相同内容命中缓存直接出中文,不重复调接口。关闭后不再读写缓存(已有缓存保留) |
| 链路探针日志 / 调试 | 关 | 排查问题才开 |

> **漏翻就把参数调大**:把「同步翻译条数」「单次最大翻译条数」「每响应调用上限」三项**一起**调大(例如 50 / 50 / 50),
> 面板里改即可,不用重装插件。反过来卡顿就把「每响应调用上限」调小。

### 版本历史
- **v1.21**: 翻译脚本保持精简并移除异常通知；FakeNitro catalog 不再注册 `/messages`，两个插件不再互相抢占同一条响应 URL；Shadowrocket 模块修复无查询串脚本地址与空占位符导致的误判 AI 问题
- **v1.20**: 双语模式真正生效(此前开关是空壳);修复「`@url:`/URL 之后的原文不翻译」——URL 保护正则字符类写坏导致 URL 从未被保护 + 多可译段时译文索引错位;修复自由段两端空格被 trim 造成文字与 @提及/URL 粘连;修复「翻译缓存=关」不生效且会清空已有缓存
- **v1.5**: 同步翻译条数默认 8→30(整页同步,不再只翻第一屏);漏翻时三项一起调大
- **v1.4**: 默认值调大 —— 单次最大翻译条数 10→30、每响应调用上限 16→30(一页 25 条一次翻完);漏翻时把这两项一起调大
- **v1.3**: 翻译请求改为有界并发(留空 AI 4 / 谷歌 8,可调),缓存自动裁剪(上限 800 条),谷歌端点超时 10s→6s
- **v1.1**: 谷歌+AI 双引擎,双语,自定义端点(AI),论坛标题+首楼翻译,carry-over 预算截断优先补翻,同步前 8 条秒开,`maxcalls` 硬闸防打爆

---

## 🎭 Fake Nitro 插件使用方法

### 功能范围
- ✅ **你的 iPhone** 上,Discord App 里你的个人资料页显示「Nitro 订阅中」+ NITRO 徽章 + premium_type=2 + entitlements 注入
- ✅ 可以配合 mitmproxy(下方部署)进一步解锁**表情选择器**(跨服务器 emoji 点击发送)
- ❌ **好友列表不会认为你真是 Nitro** — 服务端权限照旧,上传限制/动态 emoji 引用不会通过 Discord 服务器
- ❌ 不修改其它用户资料,仅对插件面板填入「伪装用户 ID」的本人生效

### 安装
1. 同上,先确认 Loon MitM 开启、CA 已信任
2. 点击上方 Loon「插件 2」链接,Loon 拉起导入
3. 插件面板中「伪装用户 ID」填**你自己的 Discord 用户 ID**(开发者模式 → 复制 ID)。留空会对所有资料页生效,不推荐
4. 重启 Discord App → 进入自己资料页,应显示 Nitro 徽章

### 表情选择器解锁(可选,需 PC/服务器 mitmproxy)
见下方「自部署 mitmproxy」章节,链路打通后:
- Loon 规则 `DOMAIN,gateway.discord.gg,<NITRO-MITM 节点>`
- 表情选择器带你个人 premium_type=2 → 全表情解锁

---

## 🚀 自部署 mitmproxy(Nitro 表情解锁层)

为绕开 GFW 对 mitmproxy 端口的扫描,标准拓扑:

```
iPhone Loon ── TLS-443 ──▶ nginx stream(自签证书) ──▶ mitmproxy 8888 回环 ──▶ gateway.discord.gg
                                            └ addon: READY 注入(premium_type=2 等) + Basic 认证
```

### 一键部署
在你自己的 root Linux VPS 上:

```
scp tools/deploy_nitro_mitm.sh root@SERVER:/root/
ssh root@SERVER bash /root/deploy_nitro_mitm.sh root@SERVER
```

脚本自动:
- 建 venv + 装好 mitmproxy + zstandard
- 上传 addon(READY 注入 + CONNECT Basic 认证)到 `/root/mitm/nitro_addon.py`
- 生成随机用户名/密码,写到 `/root/mitm/AUTH.txt`(600 权限,只 root 可读)
- 自签 TLS 证书 + 配 nginx stream 流量转发 443 → mitmproxy
- systemd `nitromitm.service` 常驻(自动重启),日志在 `/root/mitm/stdout.log`
- 最后打印 Loon 客户端配置块 + CA sha256 + 自测:`no-auth 407 / with-auth 200`

### 客户端接入(Loon)
```
[Proxy]
NitroMitm = https,<SERVER_IP>,443,<user-from-AUTH.txt>,<password>,skip-cert-verify=true,always-use-connect=true

[Rule]
DOMAIN,gateway.discord.gg,NitroMitm
```

### iPhone CA
1. `scp root@SERVER:/root/mitm/proxy-ca.pem .` → AirDrop 到 iPhone
2. iOS 设置 → 通用 → VPN 与设备管理 → 安装该描述文件
3. iOS 设置 → 通用 → 关于本机 → 证书信任设置 → 完全信任
4. 杀掉 Discord 重开,SLG(Loon 脚本日志)应看到 `[NitroAuth] ok` + `[NitroReady] injected READY`.

---

## License / Credits

**CC BY-NC-SA 4.0** — 允许分发与修改,衍生作品必须以相同协议开源(ShareAlike),禁止商用(NonCommercial)。

完整许可文本与声明见仓库根目录 [LICENSE](LICENSE)。CC BY-NC-SA 4.0 是 Creative Commons 的作品许可，不是 OSI 标准软件许可证；如果后续需要改为标准软件许可证，应单独做授权决策。

Loon 平台与 Discord 商标归其原权利人。

### 改完必跑(离线验证)
```
node tools/verify.js
```
覆盖:两个平台脚本字节一致性、每个 `script-path` 名字在仓库里真实存在、`.plugin`/`.module` 里每条 pattern 正则对样例 URL 的命中与不命中、脚本 harness(参数 4 种形态 × 正常/异常输入)。必须 `ALL CHECKS PASSED` 才发版。

### 隐私与安全
- 所有插件**零遥测、零外部上报**(除翻译请求到谷歌/AI 之外)
- 仓库不含用户 ID / 服务器地址 / 密钥;同步服务器地址由用户在插件面板 block_server 参数填入,仓库内不硬编码
