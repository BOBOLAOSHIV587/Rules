#  iRingo: 🗺 Maps

ℹ️ 用前须知
- iOS 26.0起，地图的俯瞰(Flyover)功能已被  移除
- iOS 15.1起，指南针的海拔与经纬度受动态(Dynamic)配置文件控制

ℹ️ 用前须知
- 如果您想在配对的 Watch 上使用
- 则 ⌚️ 也需安装相同的 MitM 证书

# 简介
- 全面自定义Mapsapp，添加国际版功能，自定义服务版本
- 默认为高德版地图增加国际版功能:
- 添加3D 卫星图像与地球卫星图像（含夜景）
- 启用四处看看(Look Around)功能
✅ 小提示
- 修改生效后将会抹去左下角高德地图logo，但并不代表当前是或不是高德地图。
- 具体地图版本取决于[动态配置]的设置

# 解锁步骤

## 第 1 步
启用🗺 地图模块

## 第 2 步
重新冷启动一次地图 app

- 指后台无地图应用时，重开地图app
- 在 Loon 的仪表-最近请求中应观察到:
- 在 Surge 的工具-最近请求中应观察到:
- 在 Quantumult X 的网络活动中应观察到:
<br>- 基于网络的地区检测的 https://gspe1-ssl.ls.apple.com/pep/gcc 链接，且流量抓取结果为当前修改的地区代码
<br>- 检测设备信息的 https://configuration.ls.apple.com/config/defaults 链接

## 第 3 步
- 点击右上角选取地图-卫星，观察是否存在下列特征:
<br>- 将地图拉至最远，是否显示完整的地球球体模型及昼夜交替的卫星图像
<br>- 将地图拉至最远，选取地图最下方注释显示 iRingo: 📍 GEOResourceManifest字样及最后更新配置文件的时间
- 搜索并查看巴黎或东京或纽约等世界主要城市，观察是否存在下列特征:
<br>- 选取地图-卫星时，右上角显示3D按钮，```点击并放大卫星图像后，可查看拥有真实建模及贴图的 3D 建筑物```
<br>- 选取地图-探索时，左下角显示四处看看(Look Around)按钮，```点击四处看看(Look Around)按钮，可查看拥有真实拍摄的 3D 街景```

## 第 4 步
正常使用 Maps

# 使用说明
- 启用坐标功能与指南针经纬度:
- - [定位漂移]改为Apple（🈶️坐标，使用🇺🇳WGS-84坐标）
- 查看不同地区与版本的卫星图像
- - 仅查看🇨🇳中国（不含🇹🇼中国台湾地区）最新2D 卫星图像
<br>- [卫星图像]改为🇨🇳中国四维
- - 查看🇨🇳中国（不含🇹🇼中国台湾地区）最新2D 卫星图像与🇺🇳国际主要城市的3D 卫星图像
<br>- [卫星图像]改为混合(默认)
- - 查看🇨🇳中国过期2D 卫星图像与🇺🇳国际非主要城市的2D 卫星图像与🇺🇳国际主要城市的3D 卫星图像
<br>- [卫星图像]改为🇺🇳DigitalGlobe
- 启用俯瞰(Flyover)功能
- - [调度器]改为Apple（维基百科/Yelp/Booking）（非必需，如非此选项，则无俯瞰(Flyover)按钮，但可在3D卫星地图下手动俯瞰）
- - [卫星图像]改为混合或🇺🇳DigitalGlobe（🇨🇳:2D | 🇺🇳:3D）
- - [飞行俯瞰]改为🇺🇳Apple（🇨🇳:🈚️ | 🇺🇳:🈶️）
- 启用四处看看(Look Around)功能
- - [四处看看]改为🇺🇳Apple（🇨🇳:🈚️ | 🇺🇳:🈶️）
- 注：⌚️ WATCH部分功能有单独的设置面板，不随📍 定位服务模块内的配置而变更

# 功能列表
- 修改默认(Defaults)配置
- - 终结点(Endpoint): https://configuration.ls.apple.com/config/defaults
- - 已知启用的功能
<br>- 地图-路线-步行-现实世界中的路线
<br>- 地图-路线-步行-导航准确性
<br>- 地图-为“地图”提供助力-评分与照片
<br>- 地图-为“地图”提供助力-显示评分和照片建议
- 指定通告(Announcements)配置版本
- - 终结点(Endpoint): https://gspe35-ssl.ls.apple.com/config/announcements
- - 已知影响的功能
<br>-  无已知影响
- 指定动态(Dynamic)配置版本
- - 终结点(Endpoint): https://gspe35-ssl.ls.apple.com/geo_manifest/dynamic/config
- 指定调度器(Dispatcher)API版本
- - 终结点(Endpoint):
<br>- 国际版: https://gsp-ssl.ls.apple.com/dispatcher.arpc
<br>- 高德版: https://dispatcher.is.autonavi.com/dispatcher
- - 已知影响的功能
<br>- 地图内公共指南(来自第三方机构的城市与景点旅游指南)
<br>- 地图内查询与搜索功能
<br>- 地图内地标与地点的基础信息
<br>- 地图内兴趣点(POI)的高级信息(来自大众点评或Yelp等第三方的商户信息)
- 指定导航与ETA(Directions & ETA)API版本
- - 终结点(Endpoint):
<br>- 国际版: https://gsp-ssl.ls.apple.com/directions.arpc
<br>- 高德版: https://direction2.is.autonavi.com/direction
- - 已知影响的功能
<br>- 地图的导航功能
- 指定评分和照片(Rating and Photo, RAP)API版本
- 指定定位漂移(Location Shift)API版本
- - 终结点(Endpoint):
<br>- 高德版: https://shift.is.autonavi.com/localshift
- 指定瓦片地图(Tiles Map)数据源
- - 终结点(Endpoint):
<br>- 国际版: https://gspe19-ssl.ls.apple.com/tile.vf
<br>- 高德版: https://gspe19-cn-ssl.ls.apple.com/tiles
- - 已知影响的功能
<br>-  地图的图层数据
- 指定卫星图像(Satellite Map)数据源
- 指定交通状况(Traffic)数据源
- - 终结点(Endpoint):
<br>- 国际版: https://gspe12-ssl.ls.apple.com/traffic
<br>- 高德版: https://gspe12-cn-ssl.ls.apple.com/traffic
- - 已知影响的功能
<br>-  地图的交通浏览与路况信息
- 指定兴趣点(Point of Interest, POI)数据源
- 指定飞行俯瞰(Flyover)数据源
- 指定四处看看(Look Around)数据源
