# 🌤 WeatherKit
# ⚠️ 最低支持 https://nsringo.github.io/
1、iOS 18 beta (22A5282m)

2、iPadOS 18 beta (22A5282m)

3、macOS 15 beta (24A5264n)

4、tvOS 18 beta (22J5290l)

5、visionOS 2 beta (22N5252n)

6、watchOS 11 beta (22R5284o)

# ℹ️ 用前须知

1、如果您想在配对的 Watch 上使用

2、则 ⌚️ 也需安装相同的 MitM 证书

# 简介

1、解锁全部天气数据类型

2、替换「空气质量」数据

3、添加「未来一小时降水强度」信息

4、替换「天气」数据

5、包括「当前天气」、「每小时天气预报」、「10日天气预报」

# ✅ 小提示

1、未来一小时降水强度：面板仅在此城市未来一小时内有降水的情况下显示。

2、降水通知：仅在城市位于您天气 app 的关注列表中，并于关注列表右上角的通知中，开启此城市的未来一小时降水强度通知，且此城市的降水您还并未主动获知（主动查看或显示在小组件上均为已获知）的情况下，才会进行降水通知。

# 配置方法

1、基础: 直接使用

2、采用默认配置

3、进阶: 配合Loon设置面板或Surge参数设置功能进行个性化设置

4、提供一定的自定义设置，如数据源选择、需要替换的供应商选择等

5、高级: 配合BoxJs及订阅使用

# ✅ 小提示

1、彩云天气的分钟级降水接口：权限不对普通开发者开放，需要额外采购，请勿在此脚本中填写使用普通开发者token

2、和风天气的昨日空气质量对比：接口权限仅对付费订阅用户开放，请勿在此脚本中填写使用普通开发者token

# 功能列表

1、解锁全部天气数据类型

2、未来一小时降水强度与降水通知

     彩云天气 （默认，可选 Token）
     和风天气 （需要 Host 和 Token）
     默认为增补模式，不会替换已有降水数据，仅补充无数据城市

3、空气质量数据

    彩云天气 （默认，支持昨日同时段对比，可选 Token）
    和风天气 （支持昨日对比，需要 Host 和 Token）
    WAQI （可选 Token）
    默认为增补模式，不会替换已有空气质量数据，仅补充无数据城市

4、空气质量昨日对比

    自动 （默认，与空气质量数据源相同）
    彩云天气 （默认，支持昨日同时段对比，可选 Token）
    和风天气 （支持昨日对比，需要 Host 和 Token）
    默认为增补模式，不会替换已有空气质量数据，仅补充无数据城市

5、空气质量标准换算

    默认开启，将中国空气质量标准换算为最新美国空气质量标准

6、空气质量污染物单位转换

    默认关闭，转换可能会导致进度损失

# 默认设置

[天气] 数据源

    WeatherKit: WeatherKit (不进行替换)
    
    ColorfulClouds: 彩云天气
    
    QWeather: 和风天气

[未来一小时降水强度] 数据源

    WeatherKit: WeatherKit (不进行替换)
    
    ColorfulClouds: 彩云天气
    
    QWeather: 和风天气

[空气质量] 数据源

    WeatherKit: WeatherKit (不进行替换)
    
    ColorfulClouds: 彩云天气
    
    QWeather: 和风天气
    
    WAQI: The World Air Quality Project

[空气质量] 需要替换的供应商

    QWeather: 和风天气
    
    BreezoMeter: BreezoMeter
    
    TWC: The Weather Channel

[空气质量] 对比昨日数据源

    Auto: 自动选择 (与[空气质量] 数据源一致)
    
    WeatherKit: WeatherKit (不进行替换)
    
    ColorfulClouds: 彩云天气
    
    QWeather: 和风天气

[空气质量] 本地替换算法

    NONE: None (不进行替换)
    
    EPA_NowCast: 美国 (EPA NowCast)
    
    WAQI_InstantCast: WAQI InstantCast

[空气质量] 需要修改的标准

    HJ6332012: 中国 (HJ 633—2012)
    
    EPA_NowCast: 美国 (EPA NowCast)

[空气质量] 转换污染物计量单位: false (关闭)

