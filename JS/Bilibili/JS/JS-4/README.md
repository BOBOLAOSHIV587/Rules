# 比狸比狸过滤

适用于 [Loon](https://nsloon.app/) 的 Bilibili iOS 与 iPadOS 客户端过滤插件。通过在代理层改写 Bilibili App 的请求与响应，按关键词屏蔽视频与动态，并移除开屏、推荐流、搜索结果等位置的广告和推广内容。

- 插件名称：比狸比狸过滤
- 适用平台：iOS、iPadOS（系统版本不低于 15）
- Loon 版本：不低于 3.4.0(962)（需要启用 MitM-over-HTTP/2）
- MitM 域名：`app.bilibili.com`、`grpc.biliapi.net`、`api.bilibili.com`、`api.live.bilibili.com`
- 常开拦截域名：`api.biliapi.com`、`app.biliapi.com`、`api.biliapi.net`、`app.biliapi.net`，以及 `chat.bilibili.com` 下包含 `stun` 或 `tracker` 的请求

> 本插件可能会与其他 Bilibili 插件的功能重叠并产生冲突，建议不要同时启用作用范围相同的插件。

## 功能概览

插件覆盖以下页面与接口：

| 页面 | 处理内容 |
| --- | --- |
| 开屏 | 清空开屏广告展示列表与素材缓存；`/splash/list` 直接返回 `OK` 阻断创意缓存刷新 |
| 首页热门 | 按标题关键词、UP 主名称或视频 Tag 屏蔽视频卡片 |
| 首页推荐页 | 按标题关键词、UP 主名称或视频 Tag 屏蔽视频；移除广告与推广视频卡片 |
| 首页搜索页 | 移除热搜、搜索历史、搜索发现模块；移除搜索框滚动推荐词 |
| 搜索结果与候选词条 | 按内容关键词屏蔽各类搜索结果；按标题关键词或视频 Tag 屏蔽普通视频，并按 UP 主名称屏蔽视频、用户和动态卡片；按关键词屏蔽输入联想候选项；移除广告、创作推广、直播与聚合卡片 |
| 动态页 | 按关键词屏蔽整条动态；移除 UP 主推荐商品；控制「最常访问」列表的显示方式 |
| 视频详情页 | iOS `ViewUnite` 与 iPadOS 旧版 `View` 分别按各自 protobuf 结构移除广告、视频页推荐流中的直播卡片等内容；开启深度屏蔽后缓存视频 Tag |
| 视频页推荐流 | 按标题关键词、UP 主名称或视频 Tag 屏蔽；移除推广内容、广告与直播推荐卡片 |
| 我的页面 | 分别识别 iOS 模块列表和 iPadOS 独立分组数组，按开关删除创作中心与我的服务 |
| iPadOS 大会员广告素材 | 与启动推广共用 `cleanStartupAds` 开关；清空 `/x/vip/ads/materials` 中的 `data.list`、`data.list_v2`，并移除 `vip_login_coupon.login_layer`，其他实验与上报字段保持不变 |
| 评论区 | 移除置顶广告回复 |
| 直播间 | 移除信息流与房间页广告；拦截直播电商购物信息 |
| 青少年模式与交互式弹幕 | 关闭青少年模式弹窗；移除交互式弹幕 |
| 数据上报与追踪 | 拦截 `biliapi` 上报域名以及 WebRTC STUN 追踪；改写 `pd-proxy/tracker` 的 STUN 服务器 |

> 以上所有清理项都可以在插件参数中按需开关；`biliapi` 上报域名与 WebRTC STUN 的拦截为常开（`[Rule]`，不受开关控制）。

除上述常开 `[Rule]` 外，其余屏蔽与清理均发生在响应阶段，按命中规则改写后返回给客户端。当结果为空时，客户端的对应位置不会展示被移除的内容。

## 安装

1. 在 Loon 中添加插件订阅，订阅地址填写 `.lpx` 文件地址：

   ```
   https://raw.githubusercontent.com/ElyDemiurge/Loon-Plugins/main/bilibili/bilibili_cleaner.lpx
   ```

2. 在 Loon 的插件管理中启用本插件。
3. 按需在插件参数中填写屏蔽关键词，并选择需要开启的清理开关。

## 参数说明

参数分为六组：关键词屏蔽、深度屏蔽、内容关键词屏蔽、广告与推荐移除、个性化、调试与日志。布尔型参数均为开关，默认值见各参数说明。

### 关键词屏蔽

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `titleKeywords` | 文本 | 空 | 视频标题关键词，标题中包含任一关键词的视频即被屏蔽。多个关键词可通过逗号、竖线、分号或换行来分隔 |
| `blockedUps` | 文本 | 空 | UP 主名称，必须完全匹配才会屏蔽。多个名称同样以上述分隔符分隔 |

> 标题与 UP 主屏蔽作用于首页推荐页、首页热门、视频页推荐流和搜索结果等位置；搜索结果中的标题和 Tag 仅匹配普通视频，UP 主名称还会匹配用户与动态卡片。

### 深度屏蔽

深度屏蔽会记录视频详情接口中的视频 Tag，并在首页热门、首页推荐页、视频页推荐流和搜索结果普通视频中按 Tag 屏蔽。开启此功能后会额外发起 Tag 查询请求，会消耗更多的流量。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `deepFilter` | 开关 | 关闭 | 是否启用深度屏蔽。开启后才会按视频 Tag 进行屏蔽 |
| `videoTagKeywords` | 文本 | 空 | 视频 Tag 正则，任一正则匹配到 Tag 即屏蔽。多个正则可通过逗号、分号或换行来分隔 |

深度屏蔽的远端请求有以下限制，用于控制流量与并发：

- 单条 Tag 缓存有效期 7 天，缓存最多保留 500 条。
- 远端 Tag 请求并发上限 24 路，单次请求超时 1.5 秒。
- 同一视频的 Tag 命中缓存后不会重复请求。

### 内容关键词屏蔽

按页面分别配置关键词，命中的时候移除对应的内容。

| 参数 | 类型 | 默认值 | 作用位置 | 说明 |
| --- | --- | --- | --- | --- |
| `dynamicKeywords` | 文本 | 空 | 关注页动态 | 动态内容包含任一关键词时移除整条动态 |
| `searchResultKeywords` | 文本 | 空 | 搜索结果与候选词条 | 搜索结果卡片内容或输入联想候选项包含任一关键词时移除 |

### 广告与推荐移除

以下开关默认全部开启，按需关闭即可保留对应内容。

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `cleanSplashAds` | 开启 | 清空开屏广告展示列表与素材缓存 |
| `cleanStartupAds` | 开启 | 清理启动资源接口中的活动 Tab、启动皮肤装扮和开屏预加载推广资源；同一开关还会清空 iPadOS `/x/vip/ads/materials` 的广告素材列表并移除登录优惠浮层 |
| `cleanFeedAds` | 开启 | 移除首页推荐页的横幅、非视频广告与非普通视频卡片 |
| `cleanFeedPromotedVideos` | 开启 | 移除首页推荐页带广告标记的推广视频卡片 |
| `cleanVideoRelatedPromotedContent` | 开启 | 移除视频详情页中的商业推广内容 |
| `cleanVideoRelatedAds` | 开启 | 移除视频详情页推荐流中的普通广告卡片，以及 iPadOS 旧版 `View` 中的独立广告素材 |
| `cleanVideoBannerAds` | 开启 | 仅作用于 iOS；移除视频详情页中的横幅下载广告 |
| `cleanVideoRelatedLiveRecommendations` | 开启 | 移除视频详情页推荐流中的直播推荐卡片 |
| `cleanVideoUpGoodsAds` | 开启 | 仅作用于 iOS；移除视频详情页下方的 UP 主推荐好物 |
| `cleanSearchResultAds` | 开启 | 移除搜索结果中的广告卡片 |
| `cleanSearchResultCreatorPromotions` | 开启 | 移除搜索结果中的创作推广卡片 |
| `cleanSearchResultLiveRooms` | 开启 | 移除搜索结果中的直播间卡片 |
| `cleanSearchResultAggregationCards` | 开启 | 移除搜索结果中的百科、官方入口等聚合卡片 |
| `cleanTeenagersMode` | 开启 | 关闭青少年模式弹窗 |
| `cleanInteractiveDanmaku` | 开启 | 移除视频交互式弹幕 |
| `blockTrackers` | 开启 | 改写 `pd-proxy/tracker` 的 STUN/追踪服务器为失效地址（`biliapi` 上报域名与 WebRTC STUN 拦截为常开，不受此开关控制） |
| `cleanReplyTopAds` | 开启 | 移除评论区置顶的广告回复 |
| `cleanLiveAds` | 开启 | 移除直播间信息流与房间页的广告卡片，并拦截直播电商购物信息 |
| `cleanHomeGameButton` | 开启 | 移除首页右上角、消息按钮左侧的游戏中心按钮 |

搜索结果页的清理规则按优先级判定，同一张卡片只会归入优先级最高的一类，不会重复计数。

### 个性化

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `cleanDynamicUpRecommendations` | 移除推荐动态 | 动态页 UP 主推荐商品的处理方式。可选：移除整条推荐动态、仅移除推荐模块、关闭 |
| `cleanSearchTrending` | 开启 | 移除首页搜索页的 bilibili 热搜模块 |
| `cleanSearchHistory` | 开启 | 移除首页搜索页的搜索历史模块 |
| `cleanSearchDiscovery` | 开启 | 移除首页搜索页的搜索发现模块 |
| `cleanSearchDefaultWords` | 开启 | 移除首页搜索框内滚动的默认推荐词 |
| `cleanHomeTopTabs` | 开启 | 仅精简 iOS 首页顶部分区，只保留直播、推荐和热门；iPadOS 不使用该过滤代码 |
| `cleanBottomExtraButtons` | 开启 | 删除底部栏的发布或投稿入口（包括加号形式）与会员购按钮，保留首页、动态、我的等普通入口 |
| `cleanMineCreationCenter` | 开启 | 删除 iOS 与 iPadOS 我的页面里的创作中心模块或入口组 |
| `cleanMineServices` | 开启 | 删除 iOS 与 iPadOS 我的页面里的我的服务模块或入口组 |
| `dynamicUpListDisplay` | 始终显示 | 动态页「最常访问」UP 列表的显示方式。可选：仅存在直播时显示、始终显示、始终隐藏 |

### 调试与日志

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `notifyFilter` | 开关 | 关闭 | 显示标题、UP 主以及视频 Tag 的屏蔽结果通知 |
| `notifyRemove` | 开关 | 关闭 | 显示开屏、搜索、动态页和广告清理等移除类结果通知 |
| `notifyPersonalization` | 开关 | 关闭 | 显示个性化清理结果通知，比如首页顶部分区、底部按钮和我的页面模块 |
| `logLevel` | 选择 | warn | 脚本日志等级，可选 off / error / warn / info / debug |

通知默认关闭。如需排查插件是否正常工作，可临时开启对应类别的弹窗通知。每次弹窗触发时，通知内容会同步写入脚本运行日志，便于在 Loon 日志中复核。

## 工作机制

插件只改写 Loon 拦截到的响应，不修改客户端。响应没有变化时原样放行；需要清理时只替换响应体。JSON 接口由对应页面处理器解析，gRPC 接口由内置 protobuf 工具按字段结构处理。

更详细的实现说明参见 [TECH.md](./TECH.md)。

## 项目结构

```text
bilibili/
├── core_modules/                    # 模块化维护源码
│   ├── Common/                      # iOS 与 iPadOS 共用能力
│   ├── iOS/                         # iOS 独有响应结构与处理器
│   └── iPadOS/                      # iPadOS 独有响应结构与处理器
├── testcases/                       # 自动发现的模块化测试套件
├── bilibili_cleaner.js              # 构建生成、由 Loon 加载的单文件脚本
├── bilibili_cleaner.lpx             # 正式插件配置
├── bilibili_cleaner.lan.lpx         # 局域网测试配置
├── build_bilibili_cleaner.js        # 无依赖构建与同步检查脚本
├── README.md                         # 使用说明
└── TECH.md                           # 维护与实现说明
```

`bilibili_cleaner.js` 是生成文件。修改功能时应编辑 `core_modules` 中的对应模块，再运行构建脚本；不要直接修改生成文件。跨平台逻辑放在 `Common`，只适用于单个平台的 protobuf / JSON 结构分别放在 `iOS` 或 `iPadOS`。

## 本地测试

维护源码位于 `core_modules`，通过无依赖构建脚本生成 Loon 实际加载的根目录 `bilibili_cleaner.js`。测试套件直接位于 `testcases`，使用代码内生成的最小 JSON / protobuf 样本，不依赖抓包目录，也不写入真实抓包里的敏感值。

```bash
npm run build
npm test
```

`npm test` 会依次检查生成文件同步状态、JavaScript 语法并运行全部测试套件。

## 致谢

- 作者：Cyberangel、Codex
