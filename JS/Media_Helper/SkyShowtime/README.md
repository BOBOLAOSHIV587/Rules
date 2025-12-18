# SkyShowtimeHelper

SkyShowtime iOS 界面全英文化、外挂字幕和强制1080p插件

**本插件与DualSubs字幕插件可能存在冲突，请按需启用。**

推荐和我开发的[AutoSubSyncer](https://github.com/liunice/AutoSubSyncer)一起使用。AutoSubSyncer运行在电脑端，可从任意一个ass双语字幕轻松生成一个自动调轴的srt字幕。

## All-in-One配置

在QuanX引用以下重写资源：
```
https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/quanx.conf
```
这将开启本插件的所有功能，包括界面全英文化、外挂字幕和强制1080p。  
接下来请参考本文档【外挂字幕】章节来正确放置字幕文件。

## 界面全英文化

单独开启界面全英文化功能的配置如下：

```
hostname = ovp.skyshowtime.com, atom.skyshowtime.com, mobile.clients.skyshowtime.com

# SkyShowtime界面全英文化 ovp.skyshowtime.com, atom.skyshowtime.com, mobile.clients.skyshowtime.com
^https:\/\/ovp\.skyshowtime\.com\/ls\/localisation$ url script-response-body https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
^https:\/\/atom\.skyshowtime\.com\/adapter\-calypso\/v\d+\/query\/node/.*?\?represent=\(items\) url script-request-header https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
^https:\/\/atom\.skyshowtime\.com\/adapter\-calypso\/v\d+\/query\/menu$ url script-request-header https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
^https:\/\/atom\.skyshowtime\.com\/adapter\-calypso\/v\d+\/labels$ url script-request-header https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
^https:\/\/mobile\.clients\.skyshowtime\.com\/bff\/sections\/v\d+\/personalised\? url script-request-header https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
^https:\/\/mobile\.clients\.skyshowtime\.com\/bff\/sections\/v\d+\?template=sections& url script-request-header https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
^https:\/\/atom\.skyshowtime\.com\/adapter\-calypso\/v\d+\/query\/node\/(provider_series_id|provider_variant_id)\/ url script-request-header https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
```

## 外挂字幕

- ### QuanX配置
  单独开启外挂字幕功能的配置如下：
  ```
  hostname = atom.skyshowtime.com, *.pcdn*.cssott.com

  # SkyShowtime外挂字幕 atom.skyshowtime.com, *.pcdn*.cssott.com  
  ^https:\/\/atom\.skyshowtime\.com\/adapter\-calypso\/v\d+\/query\/node/.*?\?represent=\(next url script-response-body https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
  ^https:\/\/.*?\.pcdn\d+\.cssott\.com\/SST\/.*?\.webvtt$ url script-response-body https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
  ```

- ### 字幕文件的放置
  **【前置步骤】**  
  打开iOS的``文件``App，在 ``iCloud云盘/Quantumult X/Data``下新建``Subtitles``文件夹，如果没有``Data``文件夹请先新建, 注意字母大小写。  
  **【文件放置】**  
  我们以SkyShowtime上的剧集 ``Penny Dreadful``为例。  
  1. 先开启插件。然后在SkyShowtime上播放``Penny Dreadful``第一季第一集，等待顶部出现``正在播放剧集``的通知，注意观察通知框上的剧集名称，应为``Penny Dreadful``
  2. 浏览到``iCloud云盘/Quantumult X/Data/Subtitles``目录，你会发现插件已经自动建立了一个新文件夹名为``Penny Dreadful``，再往下还会有一个文件夹名为``S01``。如果没有请自行建立。
  3. 如果你观看的是第1季第1集，请将srt字幕文件复制到``Penny Dreadful/S01``目录下，并重命名为``S01E01.srt``，**注意字母S和E均为大写，且后面的数字固定为两位数。**  
  **如果你在Mac上复制文件，请在iOS上打开``文件``App并确认修改已云同步。**

- ### 字幕时间轴的微调
  同样以上面的``Penny Dreadful``为例。如果你觉得字幕提前了，想将所有字幕往后调2秒，步骤如下：  
  1. 如果插件已经激活过一次``正在播放剧集``的通知，那么``Penny Dreadful/S01``文件夹下应该已经自动创建好了一个新文件名为``subtitle.conf``，这就是默认的字幕配置文件。如果没有请自行建立。
  2. 用文本编辑工具打开``subtitle.conf``，修改offset设置项为：``offset=2000``  
     **注意这里的offset的单位为毫秒**

  类似的，如果你只想将S01E02往前调3秒，请在``subtitle.conf``中添加设置项：``S01E02:offset=-3000``  
     **注意offset前的符号为英文冒号，此设置可以与上面的设置项共存**
  
  部分网友反馈下载的字幕时快时慢，即使配置了时间轴微调还是对不上。这种情况一般不是插件问题，而是**你下载的字幕和SkyShowtime的视频源不匹配，建议换一个字幕组的再试试。**

## 强制1080p

本功能适用于网络不佳且不希望app在缓冲时频繁调整到低码率导致画面模糊的用户。启用后画面会保持最高1080p画质，负作用是首次缓冲和每次快进时可能需要多等待两到三秒，具体取决于你的网络状况。  
单独开启强制1080p功能的配置如下：
```
hostname = *.pcdn*.cssott.com

# 强制1080p
^https:\/\/.*?\.pcdn\d+\.cssott\.com\/SST\/.*?\/mpeg_cbcs\/master_manifest_.*?\.m3u8 url script-response-body https://raw.githubusercontent.com/liunice/SkyShowtimeHelper/master/skyshowtime_helper.js
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

    - 本插件暂只支持QuanX
    - 本插件暂只支持电视剧，不支持电影
    - 仅支持srt格式的字幕
    - 字幕文件建议为utf-8编码，否则可能无法解析
    - 本插件与DualSubs字幕插件可能存在冲突，请按需启用

## 反馈和建议

不建议在github上提交issue，我不一定看得到。欢迎加入官方TG群组：https://t.me/+W6aJJ-p9Ir1hNmY1

