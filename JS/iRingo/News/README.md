# 📰 News

# 简介 https://nsringo.github.io/

解锁Newsapp 使用，并自定义部分设置与功能

# 解锁步骤

#第 1 步

启用📍 定位 + 📰 News两个模块

    iOS 与 iPadOS 设备，还需额外在设置-通用-语言与地区中，将地区设置改为 News 可用地区
    
    macOS 设备，可以通过为 News app 创建替身的方式，来绕过 News app 隐藏的问题

    目前，仅有美国、英国、加拿大、澳大利亚四国支持 News 服务

#第 2 步

根据您所使用的代理APP不同，指定相关分流策略为🇺🇸美国(或其他 News 可用地区)代理策略或节点

    部分代理软件所使用的模块或插件中已内置了规则集或代理规则，无需额外添加相关规则或分流，其他代理软件需要手动添加相关规则或分流并指定相关策略，具体差异请参看 安装链接 段落中的使用说明。
    
    无分流配置的情况下，也可使用全局代理模式。

#第 3 步

打开✈️飞行模式，同时保持Wi-Fi或有线网络连接

    未装有 SIM 卡的 iOS/iPadOS/macOS 设备，可省略✈️飞行模式相关步骤。
    
    当存在移动蜂窝网络时，不触发此检测方式，将直接采用基于SIM卡的移动设备网络代码「MCC / MNC」进行检测
    
    装有 SIM 卡的 iOS/iPadOS 设备，也可通过卡贴或海外 SIM 卡的方式，绕过基于 SIM 卡的 MCC/MNC (移动设备网络代码)检测。
    
    基于以上原因，推荐 Mac 或无 SIM 卡的 iPad 使用 📰 News

#第 4 步

重新冷启动一次地图 app

    指后台无地图应用时，重开地图app
    
    在 Loon 的仪表-最近请求中应观察到:
    
    在 Surge 的工具-最近请求中应观察到:
    
    在 Quantumult X 的网络活动中应观察到:
    
    基于网络的地区检测的 https://gspe1-ssl.ls.apple.com/pep/gcc 链接，且流量抓取结果不是CN
    
    检测设备信息的 https://configuration.ls.apple.com/config/defaults 链接

#第 5 步

打开News，此时应是解锁状态说明中的解锁成功状态

    首次加载 News 需保证 gateway.icloud.com 为海外线路
    
    使用 News 过程中 gateway.icloud.com 无策略或线路要求

#第 6 步

关闭✈️飞行模式，正常使用 News

    关闭✈️飞行模式后，如再次触发基于 SIM 卡的 MCC/MNC (移动设备网络代码)检测，则 News 会回到解锁状态说明中的解锁失效状态，此时需从第 3 步再次操作。

# 配置方法

1、基础: 直接使用

2、采用默认配置

3、进阶: 配合Loon设置面板或Surge参数设置功能进行个性化设置

4、提供一定的自定义设置，如内置规则的分流策略选择、国家或地区代码选择等

5、高级: 配合BoxJs及订阅使用

# 解锁状态说明

1、锁定状态：未通过地区检测

请在✈️飞行模式下通过Wi-Fi或有线网络再次执行解锁步骤

Apple News isn't supported in your current region.

2、解锁成功：已成功通过地区检测

gateway.icloud.com需走代理才能完整加载内容

Feed Unavailable：There may be a problem with the sever or network. Plase try again later.

3、解锁失效：通过检测后，再次触发检测时未通过检测

请在✈️飞行模式下通过Wi-Fi或有线网络再次执行解锁步骤

Feed Unavailable：Apple News isn't supported in your current region.


# 关于新闻小组件

1、新闻小组件parsecd/1.0 ({Device}; {Version} {Build}) News/1没有地区限制，可以任意区域环境下使用

2、新闻小组件内容由Siri建议服务api*.smoot.apple.com提供，而不是新闻服务news-*.apple.com，已在🆕新版Siri_Suggestions.*中修复

# 关于体育比分与赛事关注

关注的球队与赛事内容由体育服务WatchListKit.framework提供，而不是新闻服务news-*.apple.com，已在🆕V3版中修复

# 默认设置

1、Proxy: 策略组

    仅Surge与Egern有此设置
    
    默认策略组名为🇺🇸美国
    
    使用前请先修改为自己指定的美国/英国/加拿大/澳大利亚策略组或节点

2、CountryCode: 国家或地区代码

    默认国家或地区代码为US

3、NewsPlusUser: [搜索] 显示 News+ 内容

    默认 true (开启)

