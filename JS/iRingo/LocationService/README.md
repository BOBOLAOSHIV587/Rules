#  iRingo: 📍 定位服务 LocationService

ℹ️ 用前须知
- iOS 26.0起，地区检测方法已被  强化
- 地区检测结果为多因素综合结果
- GPS 定位 > 移动设备国家代码 > Wi-Fi 国家/地区代码 > 互联网 > 其他
- 仅靠此模块无法完全修改所有地区检测结果

ℹ️ 用前须知
- 仅  的 app 及 framework 使用此方式获取用户位置信息
- 第三方 app 不使用此方式获取用户位置信息

# 简介
- 自定义「定位服务」通过基于互联网的地区检测结果始终为用户设置的地区
- 融合高德与苹果调度器(Dispatcher)结果

# 解锁步骤

## 第 1 步
启用📍 定位服务模块

- 📍 定位服务的地区不应该设置为🇨🇳CN
- 浏览器访问 https://gspe1-ssl.ls.apple.com/pep/gcc ，页面显示的两个字母即为当前修改的地区代码

## 第 2 步
打开✈️飞行模式，同时保持Wi-Fi或有线网络连接

- 未装有 SIM 卡的 iOS/iPadOS/macOS 设备，可省略✈️飞行模式相关步骤。
- 当存在移动蜂窝网络时，不触发此检测方式，将直接采用基于SIM卡的移动设备网络代码「MCC / MNC」进行检测
- 基于 SIM 卡的移动设备网络代码「MCC / MNC」检测不在此模块解决范围

## 第 3 步
重新冷启动一次地图 app

- 指后台无地图应用时，重开地图app
- - 在 Loon 的仪表-最近请求中应观察到:
- - 在 Surge 的工具-最近请求中应观察到:
- - 在 Quantumult X 的网络活动中应观察到:
<br>- 基于网络的地区检测的 https://gspe1-ssl.ls.apple.com/pep/gcc 链接，且流量抓取结果为当前修改的地区代码

## 第 4 步
关闭✈️飞行模式

# 功能列表
- 修改PEP 地区代码(GCC, Geo Country Code)检测结果
- - 终结点(Endpoint): https://gspe1-ssl.ls.apple.com/pep/gcc
- - 已知影响的功能
<br>-  强制更改基于网络的地区检测结果至模块指定地区
<br>-  协助激活Apple News
<br>-  协助激活「来自APPLE的内容\来自APPLE的建议\Siri建议」(激活后不需要保持定位服务模块一直启用)
<br>-  指南针的海拔经纬度功能
<br>-  询问Siri切换为国际版(维基百科)
<br>-  SIM卡设备会因「MCC / MNC」检测回退至国内版(百度百科)
- - 已知附带影响
<br>-   天气的数据源
<br>-   Siri建议的服务器分配
<br>-   iTunes Store的CDN分配
<br>-   Apple Music的版权问题
<br>-   Apple Maps的地区版本
<br>-   Apple News的可用性判断(可通过其他模块单独修改)
<br>-   待发现
- 修改高德调度器(Dispatcher)内容
- - 终结点(Endpoint): https://dispatcher.is.autonavi.com/dispatcher
- - 已知影响的功能
- - - 融合地图内 POI 信息页面
<br>-    四处看看(Look Around)预览小窗。
<br>-    评分与照片(RAP) 功能，可对 POI 进行照片上传与评分。
<br>-    信息(Message)按钮，可直接跳转 iMessage 并使用 Messages for Business 与商户联系。
<br>-    打开 App(Open in App) 按钮，可直接跳转或下载至商户 App 进行操作。
- - - 融合位置搜索结果
<br>-    在天气、地图等 Apple App 中搜索地点时，总是展示国内外全部结果。
