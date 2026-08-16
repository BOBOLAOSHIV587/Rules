<div align="center">
  <img src="https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Loon/IPQuality-Web/JS/IMG/IPQuality-Web-1.jpg" alt="" width="300px" style="margin-right: 6px;" />
  <img src="https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Loon/IPQuality-Web/JS/IMG/IPQuality-Web-2.jpg" alt="" width="300px" />
</div>


# 节点 IP 质量检测 · 混合模式

> ✅ 维护中 · Loon 3.5.1(980)+

“常用单项原生快捷结果 + 多项自选网页报告”的独立混合模式版本。它与现有 `loon/ipquality` 同时存在，不覆盖、不替换原版。

## 使用

节点或策略组页面提供四个入口：基础信息、风险、流媒体与 AI 三项快捷检测直接显示 Loon 原生结果；“IP 自选检测 · 网页”通过通知进入 Safari，可选择一项或多项。

## 实现

- 三个快捷入口固定传入模块名，直接复用 r32 生成原生报告。
- 自选入口保存本次检测 ID、目标节点与时间并发送通知；Loon 强制显示 generic 结果弹窗，因此返回简短的“检测页面已准备”提示，避免 `empty content`。
- 报告外壳使用 Rewrite v2 内联 `response.body.mock("html", ...)`，响应 Header 使用 3.5.1(980) 批量数组参数；不连接真实报告服务器。
- 15 个检测项目对应 15 个本地 GET 接口；常规模块固定 `argument="模块名"`，不依赖插件参数插值。
- 每个接口恢复节点页保存的目标节点，并由 `$httpClient` 显式绑定该节点。
- “节点 HTTPS 轻量测速”通过目标节点访问 Cloudflare 官方 HTTPS/443 测速端点；下载按实际接收字节计算，上传仅在服务端成功响应后显示，整体最多约 14 秒。
- “三网探针延迟”由 Globalping 分别选择电信 AS4134、联通 AS4837、移动 AS9808 的中国探针，测量探针到节点出口 IP 的 ICMP 往返延迟、丢包与抖动；它不经过手机到节点的代理隧道。
- 网页最多并发两个模块，关闭的项目完全不请求；检测过程保留独立状态，完成内容合并在一张连续报告中。
- 报告设置提供本地持久化“隐藏 IP”；基础信息有坐标时提供 Apple 地图链接，并明确坐标来自 IP 数据库估算。
- 外层网页与各模块 iframe 都跟随 iOS 深色模式，报告背景和文字颜色保持一致。
- 选中状态只保存在 Safari 本地，30 分钟后检测会话失效。

## 当前边界

除 HTTPS 轻量测速外，其余模块暂时独立执行一次 r32，因此同时开启很多项目会重复请求基础来源；后续会继续拆分共享基础数据和模块专用探测，减少重复请求与 API 限流。

HTTPS 轻量测速是目标节点到 Cloudflare Edge 的端到端小样本估算；三网探针延迟是外部探针到出口 IP 的入站往返测量，出口不响应 ICMP 时可能失败。两者都不等同于 xykt NetQuality 在 VPS 本机调用 Ookla CLI 的多服务器测速；xykt IPQuality 本身不包含三网带宽测试。
