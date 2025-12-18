# ParamountHelper

Paramount+ iOS App 外挂字幕和强制1080p插件

**本插件与DualSubs字幕插件可能存在冲突，请按需启用。**  
**我使用的Essential套餐没发现广告，所以暂时不更新去广告功能。请发现广告的朋友向我反馈。**

## All-in-One配置

在QuanX引用以下重写资源：
```
https://raw.githubusercontent.com/liunice/ParamountHelper/master/quanx.conf
```
这将开启本插件的所有功能，包括外挂字幕、强制1080p和禁用强制更新。  
接下来请参考本文档【外挂字幕】章节来正确放置字幕文件。

## 外挂字幕

- ### QuanX配置
  单独开启外挂字幕功能的配置如下：
  ```
  hostname = pubads.g.doubleclick.net, link.theplatform.com, vod*.cbsaavideo.com

  # 外挂srt字幕 pubads.g.doubleclick.net, link.theplatform.com, vod*.cbsaavideo.com
  ^https:\/\/link\.theplatform\.com\/s\/\w+\/\w+\?format=SMIL url script-response-body https://raw.githubusercontent.com/liunice/ParamountHelper/master/paramount_helper.js
  ^https:\/\/pubads\.g\.doubleclick\.net\/ondemand\/hls\/content\/.*?\/\d+\-\d+\.vtt$ url script-response-body https://raw.githubusercontent.com/liunice/ParamountHelper/master/paramount_helper.js
  ^https:\/\/vod\-.*?\.cbsaavideo\.com\/intl_vms\/.*?\/seg_\d+\.vtt$ url script-response-body https://raw.githubusercontent.com/liunice/ParamountHelper/master/paramount_helper.js
  ```

- ### 字幕文件的放置
  **【前置步骤】**  
  打开iOS的``文件``App，在 ``iCloud云盘/Quantumult X/Data``下新建``Subtitles``文件夹，如果没有``Data``文件夹请先新建, 注意字母大小写。  
  **【文件放置】**  
  我们以Paramount+上的剧集 ``Tulsa King``为例。  
  1. 先开启插件。然后在Paramount+上播放``Tulsa King``第一季第一集，等待顶部出现``正在播放剧集``的通知，注意观察通知框上的剧集名称，应为``Tulsa King``
  2. 浏览到``iCloud云盘/Quantumult X/Data/Subtitles``目录，你会发现插件已经自动建立了一个新文件夹名为``Tulsa King``，再往下还会有一个文件夹名为``S01``。如果没有请自行建立。
  3. 如果你观看的是第1季第1集，请将srt字幕文件复制到``Tulsa King/S01``目录下，并重命名为``S01E01.srt``，**注意字母S和E均为大写，且后面的数字固定为两位数。**  
  **如果你在Mac上复制文件，请在iOS上打开``文件``App并确认修改已云同步。**

- ### 字幕时间轴的微调
  同样以上面的``Tulsa King``为例。如果你觉得字幕提前了，想将所有字幕往后调2秒，步骤如下：  
  1. 如果插件已经激活过一次``正在播放剧集``的通知，那么``Tulsa King/S01``文件夹下应该已经自动创建好了一个新文件名为``subtitle.conf``，这就是默认的字幕配置文件。如果没有请自行建立。
  2. 用文本编辑工具打开``subtitle.conf``，修改offset设置项为：``offset=2000``  
     **注意这里的offset的单位为毫秒**

  类似的，如果你只想将S01E02往前调3秒，请在``subtitle.conf``中添加设置项：``S01E02:offset=-3000``  
     **注意offset前的符号为英文冒号，此设置可以与上面的设置项共存**
  
  部分网友反馈下载的字幕时快时慢，即使配置了时间轴微调还是对不上。这种情况一般不是插件问题，而是**你下载的字幕和Paramount+的视频源不匹配，建议换一个字幕组的再试试。**  
  比如Tulsa King的字幕可以从SubHD网站下载，字幕文件名格式为``tulsa.king.s01e01.2160p.web.h265-glhf``，该字幕的时间轴完美匹配Paramount+片源。如果下载到的是ASS格式，可通过第三方工具将ASS转成SRT格式再使用。

## 强制1080p
本功能适用于网络不佳且不希望app在缓冲时频繁调整到低码率导致画面模糊的用户。启用后画面会保持最高1080p画质，负作用是首次缓冲和每次快进时可能需要多等待两到三秒，具体取决于你的网络状况。  
单独开启强制1080p功能的配置如下：
```
hostname = vod*.cbsaavideo.com

# 强制1080p vod*.cbsaavideo.com
^https:\/\/vod.*?\.cbsaavideo\.com\/intl_vms\/.*?\/master\.m3u8 url script-response-body https://raw.githubusercontent.com/liunice/ParamountHelper/master/paramount_helper.js
```
插件默认限制最高分辨率为1080p，如需开启4K画质，请按以下步骤操作：
1. 在``iCloud云盘/Quantumult X/Data/Subtitles``目录下新建文件``helper.conf``
2. 在``helper.conf``中添加设置项：``4k=true``

**注意**
1. Pramount+的很多剧集最高只有1080p，最近上线的新剧可能提供4K画质。
2. 如果你在Mac上修改配置，请在iOS上打开``文件``App并确认修改已云同步。

## 禁用强制更新
最近打开iPad上的v14.0.40版本会提示更新，不更新还用不了。然而更新后所有视频却突然播放不了了，很奇怪。无奈之下尝试用iMazing回退到v14.0.40版本就可以了。不知道是不是新版的bug？还好我iPhone上有老版本的备份。  
总之为了一劳永逸，我建议禁用app的强制更新机制。
```
hostname = www.paramountplus.com

# 禁用强制更新 www.paramountplus.com
^https:\/\/www\.paramountplus\.com\/apps\-api\/v\d+\.\d+\/\w+\/app\/status\.json\? url script-response-body https://raw.githubusercontent.com/liunice/ParamountHelper/master/paramount_helper.js
```

## 插件通知的禁用

本插件默认开启通知。如需禁用，请按以下步骤操作：  
1. 在``iCloud云盘/Quantumult X/Data/Subtitles``目录下新建文件``helper.conf``
2. 在``helper.conf``中添加设置项：``notify=false``  

**注意**  
1. 一般不建议禁用通知。禁用通知后你将不知道插件的所有功能是否在正常运作。
2. 如果你在Mac上修改配置，请在iOS上打开``文件``App并确认修改已云同步。

## 自动创建文件夹的禁用

本插件默认为每一部剧集的每一季自动创建两级文件夹，同时生成一个默认的``subtitle.conf``文件。  
如需禁用，请按以下步骤操作：  
1. 在``iCloud云盘/Quantumult X/Data/Subtitles``目录下新建文件``helper.conf``
2. 在``helper.conf``中添加设置项：``auto.create=false``  

**注意**  
1. 一般不建议禁用。禁用后你每次都需要自己创建``subtitle.conf``以实现时间轴微调功能。
2. 如果你在Mac上修改配置，请在iOS上打开``文件``App并确认修改已云同步。

## 注意
- 本插件暂只支持QuanX，后续会支持Surge
- 本插件暂只支持电视剧，不支持电影
- 仅支持srt格式的字幕
- 字幕文件建议为utf-8编码，否则可能无法解析
- 本插件与DualSubs字幕插件可能存在冲突，请按需启用

## 反馈和建议
不建议在github上提交issue，我不一定看得到。欢迎加入官方TG群组：https://t.me/+W6aJJ-p9Ir1hNmY1v