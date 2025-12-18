# AutoSubSyncer

本工具是我为之前推出的一系列iOS流媒体App外挂字幕插件开发的一款辅助工具，运行在电脑端，主要解决外挂字幕的时间轴对齐问题。

## 项目诞生背景

大家在使用外挂字幕插件的时候一定发现一个很棘手的问题，那就是在网上很难下载到时间轴完全匹配的srt字幕。   
有的字幕文件名中虽有WEB-DL, HDTV等字样，但并没有具体说明是来自于哪个流媒体平台,  
所以你很可能是下载了一个Hulu的字幕，然后去匹配HBO Max的片源，这样当然匹配不上。  
上面这种情况还算好的了，有的剧集你在网上只能找到Bluray的ass字幕，  
结果发现插件直接不支持，即便插件支持了ass字幕，十有八九时间轴也是对不上的。  

于是我在想，既然手动调轴不现实，那有没有可能实现自动调轴呢？  
答案是有的。  

目前几乎所有的海外流媒体平台，都使用WebVTT格式的CC字幕（除了Showtime）。  
而我们很容易在网上下载到的ass字幕，大多提供双语（中英）格式。  
一般来说，ass字幕的英文部分和流媒体App使用的CC字幕，  
在内容上来说，基本是大致相同的，除了时间轴可能不一样。  
那我们就通过文本相似度对比算法，来将ass字幕的时间轴一条条对齐到WebVTT字幕上，  
最后将调轴后的ass字幕，生成一个纯中文的srt字幕，以供我们外挂字幕插件使用。  
经过我在多个平台的大量测试，这个方案完全可行。  
而且最关键的是，这种方案对于ass字幕只有一个要求，那就是：只要是中英双语即可。

## 运行环境

本工具支持MacOS和Windows，需要运行在``NodeJS``环境下。  
Windows用户需要自行安装iCloud并开启iCloud云盘。  
至于前面提到的外挂字幕插件，当然是运行在iOS的Quantumult X下。

## 术语约定
- ``vtt字幕``：即前面提到的WebVTT格式的CC字幕，是流媒体App广泛使用的一种在线字幕格式
- ``数据库文件``: 在``iCloud云盘/Quantumult X/Data/Subtitles/{剧集名}``目录下，存储的是每一集的播放记录，它是本工具的数据来源，用于下载vtt字幕
- ``调轴``: 将每一条字幕的时间戳调整到与片源对齐的正确位置
- ``匹配率``: 假设原ass字幕中有100条字幕，我们通过相似度对比算法在vtt字幕中发现了95条，那么``匹配率``就是95%
- ``QuanX``: 即我们使用的科学上网工具``Quantumult X``的简称

## 如何安装

1. 请先确保你已经将iOS的外挂字幕插件更新到了最新版。已支持的流媒体平台如下表：  
   | 平台  | 外挂字幕 | 去广告 | 强制1080p |
   | :-: | :-: | :-: | :-: |
   | [Hulu](https://github.com/liunice/HuluHelper) | ✅ | ✅ | ✅ |
   | [HBO Max](https://github.com/liunice/HBOMaxHelper) | ✅ |  | ✅ |
   | [Max](https://github.com/liunice/MaxHelper) | ✅ |  | ✅ |
   | [Paramount+](https://github.com/liunice/ParamountHelper) | ✅ |  | ✅ |
   | [Peacock](https://github.com/liunice/PeacockHelper) | ✅ | ✅ | ✅ |
   | [Lionsgate+/STARZ](https://github.com/liunice/LionsgateHelper) | ✅ |  | ✅ |
   | [Britbox UK](https://github.com/liunice/BritboxHelper) | ✅ |  | ✅ |
   | [SkyShowtime](https://github.com/liunice/SkyShowtimeHelper) | ✅ |  | ✅ |
2. 确保``git``工具已安装。如未安装请参考[git官网](https://git-scm.com/downloads)
3. 安装``NodeJS``最新版，具体方法请参照[NodeJS官网](https://nodejs.org/en/download/)
4. Windows用户请到``Microsoft Store``安装``iCloud``并开启``iCloud云盘``，并等待云盘下的``Quantumult X``目录完成云同步
5. 打开命令行工具，输入``git clone https://github.com/liunice/AutoSubSyncer``，等待命令完成
6. 运行``cd``命令切换到``AutoSubSyncer``目录，输入``npm install``，等待依赖组件安装完成。  
   Windows用户如遇到类似``Visual Studio not found``的错误提示，请参考[此页面](https://github.com/nodejs/node-gyp#on-windows)安装``Visual Studio Build Tools``


## 如何运行
以HBO Max上``The White Lotus``这部剧的``第一季``为例，其他平台也是类似的。  
1. 在QuanX中开启HBO Max的外挂字幕插件
2. 播放``第一季第一集``，等待出现``正在播放剧集``的通知，注意方括号中的英文是本剧集名称，然后关闭播放器
3. 打开项目根目录下的``data``目录，新建文件夹``The White Lotus``，注意文件夹的名称是参考上一步通知中方括号里的英文
4. 从字幕网站(比如SubHD)上下载``The White Lotus``第一季的**ass双语字幕**，将每一集对应的ass字幕解压到``data/The White Lotus``目录。每一集对应一个ass文件，不要多放
5. 请确保每个ass文件都符合``*****S01E02*****``这样的命名规范，开头和结尾有其他字符无所谓。如果不符合请重命名。注意字母S和E后面都是两位数字。一般我们下载的ass字幕都是符合规范的
6. 在电脑上打开``iCloud云盘/Quantumult X/Data/Subtitles/The White Lotus/S01``目录，发现有一个自动生成的``subtitle.conf``文件。用文本编辑器打开，修改``subsyncer.enabled``配置项的值为``true``，如果没有请自行添加。
7. 在iOS上打开``文件``App，进入上一步的目录，等待``subtitle.conf``文件完成云同步
8. 重新播放``第一季第一集``，等待出现``播放记录已写入本地数据库``的通知，然后继续播放下一集
9. 重复上一步，直到播放完``第一季``的所有集。注意每次必须等待出现``已写入``的通知后才能切换下一集，否则相应的数据并没有收集成功
10. 电脑上打开``iCloud云盘/Quantumult X/Data/Subtitles/The White Lotus``目录，这里应该有一个刚生成的数据库文件名叫``sub_syncer.db``，这里面存放着我们刚刚的播放记录，这是我们接下来运行程序的数据来源
11. 确认``sub_syncer.db``已完成云同步之后，打开项目根目录下的``config``文件夹，这里有我们的主配置文件``sub_syncer.conf``，用文本编辑器打开，将参数``subsyncer.series``的值设置为``The White Lotus``，保存文件，其他参数先不用管
12. 打开命令行工具，先运行``cd``命令到项目根目录，然后运行``npm start``，自动调轴程序开始运行
13. 等待几十秒之后，如果一切顺利，程序运行完成，末尾会有``全部任务已结束``的提示。此时观察``匹配率汇总``这个区域的提示，一般情况下只要匹配率达到``80%``以上，生成的srt字幕都是可以正常使用的
14. 此时工具已经从ass字幕自动生成了所有调轴后的srt字幕，并保存到了``iCloud云盘/Quantumult X/Data/Subtitles/The White Lotus/S01``目录。此时打开iOS ``文件``App，进入相应目录，等待新生成的srt文件完成云同步。接下来就可以打开播放器享受外挂字幕的乐趣了。

## 配置文件

所有配置文件均在项目``config``目录下，一共有5个配置文件。  
其中``sub_syncer.conf``为主配置文件，索引为0，支持最多的参数配置，所有的参数修改都应在此文件中进行。  
其他4个文件名中带数字的是可选方案配置文件，目前支持5个参数的配置，不建议修改。  
程序通过使用这5个配置文件，来为每一个ass字幕完成5轮匹配算法，最终挑选一个匹配率最高的作为最佳方案。  

### 主配置文件参数
``subsyncer.series``  
默认值：``无``。**此参数在每次运行程序前必填**。对应剧集的英文名称，应和每次弹出的``正在播放剧集``通知中的英文名相同。

``subsyncer.episode``  
默认值：``无``。如果你在跑完一整季后，想单独对某一集重新跑一次，可以修改此参数。格式为``S01E01``。此参数默认是注释掉的，如需启用请去掉该行开头的 #。每次使用完记得重新注释掉此行。

``subsyncer.override``  
默认值：``true``。程序默认每次都会将新生成的srt字幕文件覆盖到iCloud云盘相应目录。如果你不希望每次覆盖，可以改为``false``

``subsyncer.download.concurrent``  
默认值：``100``。代表每个vtt字幕文件的并行下载数。电脑配置低的可以适当改小。部分流媒体平台的每一集CC字幕都是由上千个vtt分片文件组成的，通过采用多线程下载的方式可以提高下载速度。

``subsyncer.vtt.redownload``  
默认值：``false``。程序默认只下载一次vtt字幕文件，然后保存到``data/{剧集名}/vtt``目录下。如果需要程序每次重新下载，请将此参数设为``true``

``subsyncer.watermark``  
默认值：``true``。程序默认为每一个生成的srt文件插入一条新字幕，在最开头的5秒，以显示自动调轴后的匹配率。如需禁用请将参数设为``false``

``subsyncer.ass.repair``  
默认值：``false``。少数字幕组对ass文件的格式有特殊偏好，比如将中文和英文字幕分开存放，把所有中文放在文件最上面，所有英文放在最下面。这时候就需要程序做一下特殊处理，此时需将此参数设为``true``。用完后记得改回``false``

``subsyncer.match.mode``  
默认值：``1``。程序默认使用``config``目录下的5个配置文件来完成5轮匹配。如果只希望使用主配置文件，可以将此参数设为``0``

## 注意事项
- 不建议把项目放在中文目录下
- 程序默认Windows下的iCloud云盘在``C:\Users\用户名\iCloudDrive``下。如有变更，请自行修改源代码，位置在``Core.js``的``getICloudPath``函数
- 程序支持自动检测ass字幕文件编码，但不支持``UTF16-BE``等少数冷门编码，请自行转换成``UTF-8``
- 除了Britbox UK需要在``subtitle.conf``中设置``offset=10000``之外，其他平台都应设置``offset=0``
- 程序需要读取和写入iCloud云盘，当你发现任何问题的时候，请第一时间检查iCloud是否已同步

## 疑难解答
- 匹配率太低？
- vtt下载出错？
- 程序运行成功但在iOS上没看到字幕？

## 如何反馈问题
1. 加入官方TG群组：https://t.me/+W6aJJ-p9Ir1hNmY1
2. 进入项目``data``目录，将有问题的剧集文件夹打包，在TG上发送给管理员