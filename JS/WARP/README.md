```
⚠️兼容性说明
WARP已在香港美国等地启用RoutingId (Reserved)验证
缺乏此字段会导致这些地区的WARP节点无法连接
Surge支持自定义此字段（需要 5.20.0 (2627) 及以上版本）
Stash支持自定义此字段
Loon支持自定义此字段
Shadowrocket支持自定义此字段
Clash兼容性未知
```
## 简介
## 功能列表
  * 可查询`1.1.1.1`APP的配置信息,其他增删改功能请在BoxJs订阅或`1.1.1.1`APP/客户端中操作
    * 安装模块后，重新打开一次`1.1.1.1`APP，即可在通知中看到配置信息，在Surge的日志中也会输出完整配置文件内容
  * 配合BoxJs或Argument参数可重写并锁定密钥为`自定义密钥`
    * 安装模块后，打开`1.1.1.1`APP，执行`重置加密密钥`操作(iOS客户端位于:选项-`高级`-`连接选项`-`重置加密密钥`)，即可在通知中看到密钥重置信息
  * 提供一个`面板`，显示当前线路的WARP状态及对应的打开`1.1.1.1`APP中，所用账户的等级与流量信息
    * 账户的等级与流量信息需要首先打开`1.1.1.1`APP，读取一次配置信息
## 使用说明
  * 安装`BoxJs`插件:
    * 安装方法及下载链接详见: [🧰 BoxJs](./🧰-BoxJs)
  * 在`应用`-`☁ Cloudflare`-[`☁ Cloudflare 1.1.1.1`](http://boxjs.com/#/app/Cloudflare.1dot1dot1dot1)-中填写您的`☁ 1.1.1.1 by Cloudflare with WARP`信息
#### 更换密钥对(用自定义密钥对)(注册ID & 令牌)
  * 操作方法(使用BoxJs+Surge模块)：
      1. 在WireGuard客户端中`新建隧道`-`生成密钥对`
      2. 将`WireGuard生成的私钥和公钥`或`你要换绑的私钥和公钥`填写到`WireGuard: 私钥`和`WireGuard: 公钥`
      3. 填写你要绑定到此密钥对的`WARP: 注册ID(设备ID/客户端ID/配置文件ID)`(可通过模块读取，或查看iOS`1.1.1.1`APP选项-高级-诊断-客户端配置-ID)
      4. 点击页面下方的`保存`
      5. 打开`1.1.1.1`APP
      6. 执行`重置加密密钥`操作(iOS客户端位于:选项-`高级`-`连接选项`-`重置加密密钥`)
      7. 查看执行结果(`通知`或`日志`) 
      * 注：保持模块开启情况下，可正常打开`1.1.1.1`APP并使用APP的其他功能如账户信息，流量查看，邀请等功能，单`1.1.1.1`APP因密钥对不符，自身的VPN功能将无法使用。
## 安装链接
### 🆕V3版
  * Loon:
    * 🆕点击一键安装: [Cloudflare.1.1.1.1.plugin](https://api.boxjs.app/loon/import?plugin=https://raw.githubusercontent.com/VirgilClyne/Cloudflare/main/modules/Cloudflare.1.1.1.1.plugin "☁️ Cloudflare: 1️⃣ 1.1.1.1") 
    * `插件`链接: [Cloudflare.1.1.1.1.plugin](../raw/main/modules/Cloudflare.1.1.1.1.plugin "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
  * Quantumult X:
    * 🆕点击一键安装: [Cloudflare.1.1.1.1.snippet](https://api.boxjs.app/quanx/add-resource?remote-resource=%7B%22rewrite_remote%22%3A%5B%22https%3A%2F%2Fgithub.com%2FVirgilClyne%2FCloudflare%2Fraw%2Fmain%2Fmodules%2FCloudflare.1.1.1.1.snippet%2Ctag%3D%E2%98%81%EF%B8%8F%20Cloudflare%3A%201%EF%B8%8F%E2%83%A3%201.1.1.1%20%20with%20WARP%20%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%85%8D%E7%BD%AE%E7%AE%A1%E7%90%86%22%5D%7D "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
    * 🆕点击一键安装: [Cloudflare.Gallery.json](https://api.boxjs.app/quanx/ui?module=gallery&type=task&action=add&content=%5B%0A%20%20%20%20%22https%3A%2F%2Fraw.githubusercontent.com%2FVirgilClyne%2FCloudflare%2Fmain%2Fdatabase%2FCloudflare.Gallery.json%22%0A%5D "☁️ Cloudflare: 自定义节点测试选项 ")
    * `重写`链接: [Cloudflare.1.1.1.1.snippet](../raw/modules/snippet/Cloudflare.1.1.1.1.snippet "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
    * `任务`仓库（Task Gallery）订阅链接: [Cloudflare.Gallery.json](../raw/main/database/Cloudflare.Gallery.json "☁️ Cloudflare")
      * 包含"自定义节点测试选项"
  * Surge:
    * 🆕点击一键安装: [Cloudflare.1.1.1.1.sgmodule](https://api.boxjs.app/surge/install-module?url=https://raw.githubusercontent.com/VirgilClyne/Cloudflare/main/modules/Cloudflare.1.1.1.1.sgmodule "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
    * `模块`链接: [Cloudflare.1.1.1.1.sgmodule](../raw/main/modules/Cloudflare.1.1.1.1.sgmodule "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
  * Stash:
    * 🆕点击一键安装: [Cloudflare.1.1.1.1.stoverride](https://link.stash.ws/install-override/github.com/VirgilClyne/Cloudflare/raw/main/modules/Cloudflare.1.1.1.1.stoverride "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
    * `覆写`链接: [Cloudflare.1.1.1.1.stoverride](../raw/main/modules/Cloudflare.1.1.1.1.stoverride "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
  * Shadowrocket:
    * 🆕点击一键安装: [Cloudflare.1.1.1.1.srmodule](https://api.boxjs.app/shadowrocket/install?module=https://raw.githubusercontent.com/VirgilClyne/Cloudflare/main/modules/Cloudflare.1.1.1.1.srmodule "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")
    * `模块`链接: [Cloudflare.1.1.1.1.srmodule](../raw/main/modules/Cloudflare.1.1.1.1.srmodule "☁️ Cloudflare: 1️⃣ 1.1.1.1 with WARP")

### 🧪测试版
  * BoxJs:
    * [Cloudflare.beta.boxjs.json](../raw/beta/BoxJs/Cloudflare.beta.boxjs.json "☁️ Cloudflare β")
  * Surge:
    * [Cloudflare.1.1.1.1.beta.sgmodule](../raw/beta/modules/Cloudflare.1.1.1.1.beta.sgmodule "☁️ 1.1.1.1 by Cloudflare with WARP β")
    * 此模块功能:
      * 可查询1.1.1.1 APP的配置信息,其他增删改功能请用上方BoxJs订阅或APP客户端
        * 安装模块后，重新打开一次1.1.1.1的APP，即可在通知中看到配置信息，在Surge的日志中也会输出完整配置文件内容
      * 配合BoxJs或Surge Argument参数可重写并锁定密钥为`自定义密钥`
        * 安装模块后，打开`1.1.1.1`APP，执行`重置加密密钥`操作(iOS客户端位于:选项-`高级`-`连接选项`-`重置加密密钥`)，即可在通知中看到密钥重置信息
## 更新日志
### 🆕V3版
  * v3.0.0
### 🆕V2版
  * v2.0.0