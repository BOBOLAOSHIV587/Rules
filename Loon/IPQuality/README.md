<div align="center">
  <img src="https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Loon/IPQuality/JS/IMG/IPQuality-1.jpg" alt="" width="300px" style="margin-right: 6px;" />
  <img src="https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Loon/IPQuality/JS/IMG/IPQuality-2.jpg" alt="" width="300px" />
</div>


# 节点 IP 质量检测

在 Loon 的节点或策略组页面查看所选节点的出口 IP、IP 类型与风险信息，并检测常见流媒体和 AI 服务可用性。结果按 VPS `IP.Check.Place` / `xykt/IPQuality` 的多源展示口径呈现，不生成自定义综合评分。

## 插件参数

| 参数 | 默认值 | 说明 |
|---|---:|---|
| `MaskIP` | 关闭 | 隐藏报告中 IP 的后半段，适合截图分享 |
| `MediaTest` | 开启 | 检测 TikTok、Disney+、Netflix、YouTube、Prime Video、Reddit、ChatGPT |
| `MapNotification` | 关闭 | 完成后发送通知；点按通知可在 Apple 地图查看 IP 数据库估算的位置 |

## 报告内容

- **基础信息**：出口 IP、ASN、组织、国家/地区、城市、时区、坐标及 IP 类型。
- **多源风险**：分别展示各数据库返回的类型、风险评分和代理/VPN/Tor/机房等标记；数据冲突时保留原始结果。
- **服务可用性**：展示各服务本次请求的可用状态与地区。
- **数据状态**：显示本次成功来源、未返回来源和出口是否存在差异。

## 数据说明

- 脚本只展示本次实际返回的数据：没有返回不等于低风险、家宽或已解锁。
- 若不同检测服务看到的公网 IP 不同，会标注“分流出口”。这通常由节点服务商的不同上游、负载均衡或按域名分流造成；该结果只作为补充，不会用于评价主出口 IP。
- 地理位置来自 IP 数据库，代表运营商登记或城市级估算位置，不是设备 GPS。
- 检测会将节点出口 IP 提交给报告内列出的第三方查询服务；介意时请勿使用。

## 已知限制

- 第三方数据库更新频率、口径、限流和风控各不相同，部分来源未返回属于正常情况。
- 流媒体结果只反映检测当时的网络响应，不代替登录账号后的实际播放。
- 当前优先检测 IPv4，IPv6 尚未单独出报告。
- Loon `generic` 没有原始 TCP 与节点 DNS 查询能力，因此无法等价提供 VPS 脚本中的 SMTP 25、DNSBL、DNS 泄漏、traceroute、MTU 或 NAT 类型检测。
