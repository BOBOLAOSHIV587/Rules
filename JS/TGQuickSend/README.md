<p align="center">
<img src="https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/TGQuickSend/JS/IMG/TG.jpg" width="400" /> </div>
</p>


TG QuickSend（草稿直达）


配置如上 :


参数表怎么填（每个参数是什么用途）


下面以给 @lovebabyforeverbot 发送 /start 为例。

1）BOT（机器人用户名）

填：lovebabyforeverbot

注意：不带 @

2）TEXT（预填文本也就是你发送的指令）

填：/start

注意：如果文本里必须出现 &，请写 %26（否则会被当成参数分隔符）

LIST（Panel 预设列表）

LIST 不是“一次发送多条”，而是“多条预设可选项”，在 Panel 下拉刷新会轮换显示下一条。

格式：机器人::文本|机器人::文本

示例（两条预设）：lovebabyforeverbot::/start|lovebabyforeverbot::/checkin

你只要一条就写：lovebabyforeverbot::/start

4）CRONEXP（定时表达式）

每天 01:14：14 1 * * *

5）TITLE / SUBTITLE（通知标题/副标题）

TITLE：TG Start

SUBTITLE：@lovebabyforeverbot

6）OPEN（是否点击通知跳 Telegram）

1：点击通知自动打开 Telegram 并预填草稿

0：只弹通知，不跳转

7）VER（缓存刷新号）

用于强制刷新 gist 防止我更新了你没及时拉代码..



Panel 怎么用
进入 Surge 的 Panel（策略页/面板页）找到 “TG QuickSend”：

会显示当前预设（bot + text）

m没啥用看看就行
