# 📍 定位

# ℹ️ 用前须知 https://nsringo.github.io/

1、仅  的 app 及 framework 使用此方式获取用户位置信息

2、第三方 app 不使用此方式获取用户位置信息

# 简介

自定义「定位服务」通过基于网络的地区检测结果始终为用户设置的地区

# 解锁步骤

#第 1 步

启用📍 定位模块

    📍 定位的地区不应该设置为🇨🇳CN
   
    浏览器访问 https://gspe1-ssl.ls.apple.com/pep/gcc ，页面显示的两个字母即为当前修改的地区代码

#第 2 步

打开✈️飞行模式，同时保持Wi-Fi或有线网络连接

    未装有 SIM 卡的 iOS/iPadOS/macOS 设备，可省略✈️飞行模式相关步骤。
    
    当存在移动蜂窝网络时，不触发此检测方式，将直接采用基于SIM卡的移动设备网络代码「MCC / MNC」进行检测
    
    基于 SIM 卡的移动设备网络代码「MCC / MNC」检测不在此模块解决范围

#第 3 步

重新冷启动一次地图 app：指后台无地图应用时，重开地图app

    在 Loon 的仪表-最近请求中应观察到:
    
    在 Surge 的工具-最近请求中应观察到:
    
    在 Quantumult X 的网络活动中应观察到:
    
    基于网络的地区检测的 https://gspe1-ssl.ls.apple.com/pep/gcc 链接，且流量抓取结果为当前修改的地区代码

#第 4 步

关闭✈️飞行模式

# 配置方法

1、基础: 直接使用

2、采用默认配置

3、进阶: 配合Loon设置面板或Surge参数设置功能进行个性化设置

4、提供一定的自定义设置，如数据源选择、需要替换的供应商选择等

5、高级: 配合BoxJs及订阅使用

# 功能列表

1、修改PEP 地区代码(GCC, Geo Country Code)检测结果

2、终结点(Endpoint): https://gspe1-ssl.ls.apple.com/pep/gcc

 已知影响的功能
 
    强制更改基于网络的地区检测结果至模块指定地区
    
    协助激活Apple News
    
    协助激活「来自APPLE的内容\来自APPLE的建议\Siri建议」(激活后不需要保持定位服务模块一直启用)
    
    指南针的海拔经纬度功能
    
    询问Siri切换为国际版(维基百科)
    
    SIM卡设备会因「MCC / MNC」检测回退至国内版(百度百科)

已知附带影响

    天气的数据源
    
    Siri建议的服务器分配
    
    iTunes Store的CDN分配
    
    Apple Music的版权问题
    
    Apple Maps的地区版本
    
    Apple News的可用性判断(可通过其他模块单独修改)
    
    待发现



# 🗺 地图

# ℹ️ 用前须知

iOS 15.1起，指南针的海拔与经纬度受动态(Dynamic)配置文件控制

# ℹ️ 用前须知

1、如果您想在配对的 Watch 上使用

2、则 ⌚️ 也需安装相同的 MitM 证书

# 简介
1、全面自定义Mapsapp，添加国际版功能，自定义服务版本

2、默认为高德版地图增加国际版功能:

    添加3D 卫星图像与地球卫星图像（含夜景）

    启用四处看看(Look Around)功能

# ✅ 小提示

1、修改生效后将会抹去左下角高德地图logo，但并不代表当前是或不是高德地图。

2、具体地图版本取决于[动态配置]的设置

# 解锁步骤

#第 1 步

启用🗺 地图模块

#第 2 步

重新冷启动一次地图 app：指后台无地图应用时，重开地图app

    在 Loon 的仪表-最近请求中应观察到:
    
    在 Surge 的工具-最近请求中应观察到:
    
    在 Quantumult X 的网络活动中应观察到:
    
    基于网络的地区检测的 https://gspe1-ssl.ls.apple.com/pep/gcc 链接，且流量抓取结果为当前修改的地区代码
    
    检测设备信息的 https://configuration.ls.apple.com/config/defaults 链接

#第 3 步

点击右上角选取地图-卫星，观察是否存在下列特征:

    将地图拉至最远，是否显示完整的地球球体模型及昼夜交替的卫星图像
    
    将地图拉至最远，选取地图最下方注释显示 iRingo: 📍 GEOResourceManifest字样及最后更新配置文件的时间

搜索并查看巴黎或东京或纽约等世界主要城市，观察是否存在下列特征:

    选取地图-卫星时，右上角显示3D按钮
    
    点击并放大卫星图像后，可查看拥有真实建模及贴图的 3D 建筑物
    
    选取地图-探索时，左下角显示四处看看(Look Around)按钮
    
    点击四处看看(Look Around)按钮，可查看拥有真实拍摄的 3D 街景

#第 4 步

正常使用 Maps

# 使用说明

1、启用坐标功能与指南针经纬度:

    [定位漂移]改为Apple（🈶️坐标，使用🇺🇳WGS-84坐标）

2、查看不同地区与版本的卫星图像

仅查看🇨🇳中国（不含🇹🇼中国台湾地区）最新2D 卫星图像

     [卫星图像]改为🇨🇳中国四维

查看🇨🇳中国（不含🇹🇼中国台湾地区）最新2D 卫星图像与🇺🇳国际主要城市的3D 卫星图像

    [卫星图像]改为混合(默认)

查看🇨🇳中国过期2D 卫星图像与🇺🇳国际非主要城市的2D 卫星图像与🇺🇳国际主要城市的3D 卫星图像

    [卫星图像]改为🇺🇳DigitalGlobe

3、启用俯瞰(Flyover)功能

    [调度器]改为Apple（维基百科/Yelp/Booking）（非必需，如非此选项，则无俯瞰(Flyover)按钮，但可在3D卫星地图下手动俯瞰）
    
    [卫星图像]改为混合或🇺🇳DigitalGlobe（🇨🇳:2D | 🇺🇳:3D）
    
    [飞行俯瞰]改为🇺🇳Apple（🇨🇳:🈚️ | 🇺🇳:🈶️）

4、启用四处看看(Look Around)功能

    [四处看看]改为🇺🇳Apple（🇨🇳:🈚️ | 🇺🇳:🈶️）

5、注：⌚️ WATCH部分功能有单独的设置面板，不随📍 定位模块内的配置而变更

# 配置方法

1、基础: 直接使用

2、采用默认配置

3、进阶: 配合Loon设置面板或Surge参数设置功能进行个性化设置

4、提供一定的自定义设置，如数据源选择、需要替换的供应商选择等

5、高级: 配合BoxJs及订阅使用

# 功能列表

1、修改默认(Defaults)配置

终结点(Endpoint): https://configuration.ls.apple.com/config/defaults

已知启用的功能

    地图-路线-步行-现实世界中的路线
    
    地图-路线-步行-导航准确性
    
    地图-为“地图”提供助力-评分与照片
    
    地图-为“地图”提供助力-显示评分和照片建议
    
2、指定通告(Announcements)配置版本

终结点(Endpoint): https://gspe35-ssl.ls.apple.com/config/announcements

已知影响的功能：无已知影响

3、指定动态(Dynamic)配置版本

终结点(Endpoint): https://gspe35-ssl.ls.apple.com/geo_manifest/dynamic/config

4、指定调度器(Dispatcher)API版本

终结点(Endpoint):

    国际版: https://gsp-ssl.ls.apple.com/dispatcher.arpc
    
    高德版: https://dispatcher.is.autonavi.com/dispatcher

已知影响的功能

    地图内公共指南(来自第三方机构的城市与景点旅游指南)
    
    地图内查询与搜索功能
    
    地图内地标与地点的基础信息
    
    地图内兴趣点(POI)的高级信息(来自大众点评或Yelp等第三方的商户信息)

5、指定导航与ETA(Directions & ETA)API版本

终结点(Endpoint):

    国际版: https://gsp-ssl.ls.apple.com/directions.arpc
   
    高德版: https://direction2.is.autonavi.com/direction
   
已知影响的功能：地图的导航功能

6、指定评分和照片(Rating and Photo, RAP)API版本

7、指定定位漂移(Location Shift)API版本

终结点(Endpoint):

    高德版: https://shift.is.autonavi.com/localshift
    
8、指定瓦片地图(Tiles Map)数据源

终结点(Endpoint):

    国际版: https://gspe19-ssl.ls.apple.com/tile.vf
    
    高德版: https://gspe19-cn-ssl.ls.apple.com/tiles

已知影响的功能

    地图的图层数据

9、指定卫星图像(Satellite Map)数据源

10、指定交通状况(Traffic)数据源

终结点(Endpoint):

    国际版: https://gspe12-ssl.ls.apple.com/traffic
    
    高德版: https://gspe12-cn-ssl.ls.apple.com/traffic

已知影响的功能

    地图的交通浏览与路况信息

11、指定兴趣点(Point of Interest, POI)数据源

12、指定飞行俯瞰(Flyover)数据源

13、指定四处看看(Look Around)数据源


