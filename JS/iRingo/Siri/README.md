# ⭕ Siri

# ✅ Siri 请求 https://nsringo.github.io/

1、iOS 18、macOS 15、watchOS 11 及以上版本此功能名为Siri 请求

2、Siri 请求使用的连接为guzzoni.smoot.apple.com

3、可以通过 MitM 改写

# ❌ 询问 Siri

1、iOS 17、macOS 14、watchOS 10 及以下版本此功能名为询问 Siri

2、询问 Siri使用的连接为guzzoni.apple.com

3、不可以通过 MitM 改写

# 简介

1、将「Siri 知识」卡片改为国际版

百度百科改为维基百科

2、将「Siri 请求」的国家与地区改为🇸🇬 新加坡

国家与地区代码改为SG

获取更多的「Siri 请求」功能

3、将「Siri 请求」响应语言改为简体中文

Siri 使用始终简体中文回答您

# 配置方法

1、基础: 直接使用

2、采用默认配置

3、进阶: 配合Loon设置面板或Surge参数设置功能进行个性化设置

4、提供一定的自定义设置，如国家与地区代码选择、区域选择等

5、高级: 配合BoxJs及订阅使用



# 🔍 聚焦搜索

# ‼️ 已失效

1、 已通过推送安全响应更新

2、禁止 MitM iOS 14 及以上版本Siri 建议

3、Siri 建议配置下发所使用的api.smoot.apple.com的网络请求

4、不再可以通过 MitM 改写

# 简介

激活「Siri建议/来自APPLE的内容/来自APPLE的建议」并开启全部已知可用功能。

# 解锁步骤

#第 1 步

启用📍 定位 + 🔍 聚焦搜索两个模块

    📍 定位的地区不可以设置为🇨🇳CN
    
    🔍 聚焦搜索的地区不可以设置为🇨🇳CN
    
    可辅以全局代理确保稳定

#第 2 步

打开✈️飞行模式，同时保持Wi-Fi或有线网络连接

    未装有 SIM 卡的 iOS/iPadOS/macOS 设备，可省略✈️飞行模式相关步骤。
    
    装有 SIM 卡的 iOS/iPadOS 设备，也可通过卡贴或海外 SIM 卡的方式，绕过基于 SIM 卡的 MCC/MNC (移动设备网络代码)检测。

#第 3 步

重新冷启动一次地图 app：指后台无地图应用时，重开地图app

    在 Loon 的仪表-最近请求中应观察到:
    
    在 Surge 的工具-最近请求中应观察到:
    
    在 Quantumult X 的网络活动中应观察到:
    
    检测设备信息的 https://configuration.ls.apple.com/config/defaults 链接
    
    基于网络的地区检测的 https://gspe1-ssl.ls.apple.com/pep/gcc 链接，且流量抓取结果不是CN
    
    获取Siri建议配置下发的https://api.smoot.apple.com/bag或https://api.smoot.apple.cn/bag链接

#第 4 步

执行一次Spotlight搜索，测试「来自APPLE的内容\来自APPLE的建议\Siri建议」是否正常工作

    如未生效，可尝试以下方法进行激活操作:
    
    重启设备 (必定触发一次Siri配置文件下发检测)
    
    注意开启VPN的开机自启等相关功能，以便第一时间截取到下发的配置文件链接
    
    macOS上关闭再开启系统偏好设置-聚焦-Siri建议
    
    iOS上关闭再开启设置-Siri与搜索-来自APPLE的内容和来自APPLE的建议
    
    更改设置-通用-语言与地区-地区
    
    等待半小时，「Siri建议」会根据基于网络的地区检测结果向服务器*.smoot.apple.com/bag请求刷新区域设置与功能可用状态

#第 5 步

1、关闭✈️飞行模式，关闭📍 定位模块

2、正常使用「来自APPLE的内容\来自APPLE的建议\Siri建议」

    关闭📍 定位模块为非必需步骤
    
    取决于是否还需要激活 📰 News 等功能

# 配置方法

1、基础: 直接使用

2、采用默认配置

3、进阶: 配合Loon设置面板或Surge参数设置功能进行个性化设置

4、提供一定的自定义设置，如国家与地区代码选择、功能选择等

5、高级: 配合BoxJs及订阅使用

# 功能列表

在以下位置及功能中可用:
 
 1、聚焦搜索(Spotlight)
 
 2、查询(Look Up)
 
 3、Safari浏览器(Safari)
 
    视觉搜索(Visual Look Up)
    
    智能历史记录
    
 4、地图(Apple Maps)
 
 5、新闻(Apple News)
 
 6、询问Siri(Ask Siri)
 
    无SIM卡设备可被📍定位模块修改切换至海外版(维基百科)
    
    SIM卡设备会因「MCC / MNC」检测回退至国内版(百度百科)
    
 7、照片
 
    视觉搜索(Visual Look Up)
    
 8、电话
 
 9、家庭
 
 10、日历
 
 11、提醒事项
 
 12、通讯录
 
 13、信息
 
 14、邮件
 
启用的功能:

    来自APPLE的内容(CONTENT FROM APPLE)
    
    来自APPLE的建议(SUGGESTIONS FROM APPLE)
    
    Siri建议(Siri Suggestions)

已知可用的信息卡片:

    天气 (搜索关键词城市名 天气或天气 城市名，例如天气 上海，不是所有城市都有天气搜索结果)
    
    Siri资料(Siri Knowledge) 截图:macOS
    
    Siri建议的网站(Siri Suggested Websites)
    
    维基百科 (macOS端需要Surge启用“增强模式”)
    
    地图 (当地图为中国区时不显示内容，有知道解决方法或成因的请联系我)
    
    体育 截图:macOS / iOS
    
    股票 截图:macOS
    
    航班 截图:macOS
    
    App Store\Mac App Store 截图:macOS / iOS
    
    电影 & 电视节目
    
    tv 截图:macOS
    
    iTunes
    
    音乐
    
    Apple Music 截图:macOS / iOS
    
    新闻
    
    Twitter集成 (官方功能列表中有此功能，有知道解决方法或成因的请联系我)

 
