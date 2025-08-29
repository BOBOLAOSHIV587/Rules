<div align="center">
<br>
<img width="200" src="https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/Surge/Dualsub/JS/DualSubs.png">
<br>
<br>
<h1 align="center">DualSub双语及增强字幕生成工具<h1>
</div>

# iOS 流媒体 App 字幕脚本

# 🔣 Universal

# 简介 https://dualsubs.github.io/

1、为支持的 HLS 平台添加双语字幕选项

2、用户需要在播放器的字幕选项中选择脚本新增的双语字幕或翻译字幕选项，即可在播放器中显示双语字幕

# 使用说明

1、基础: 直接使用（采用默认配置）

2、默认主语言英文（自动），副语言中文（自动）

3、兼容的平台：增加官方双语与翻译双语字幕选项

4、如平台未提供副语言字幕，则仅增加翻译双语字幕选项

5、不兼容[^4]的平台：将主语言字幕替换替换为双语字幕

6、翻译器默认使用Google翻译进行字幕翻译，将字幕按127句为单位划分，进行整段翻译。

7、进阶: 配合Loon设置面板或Surge参数设置功能进行个性化设置

8、提供一定的自定义设置，如主语言、副语言、翻译器选择等

9、高级: 配合BoxJs及订阅使用

# ℹ️ 用前须知：使用BoxJs进行配置将被视为专业用户，官方不受理因使用BoxJs配置导致的各种问题

# 功能列表

1、官方播放器内提供自定义字幕选项

2、对于不兼容的播放器，提供了一个字幕选项，用来强制替换字幕为指定字幕类型。

3、自定义启用的第三方字幕种类

4、双语官方字幕

5、双语翻译字幕

    Google 翻译

    Google Cloud Translate API：V2版、V3版
    
    Microsoft Translator：国际版、中国版、美国政府版、Edge Translator
    
    DeepL：Free、Pro
   
4、双语外挂字幕
    中文，英文，西班牙文自动回退
    
    中文（自动）回退顺序为中文（简体）-中文（繁體）-中文（香港）/粤语（廣東話）
    
    英文（自动）回退顺序为English (US) [CC]-English (US)-English (UK)
    
    西班牙文（自动）回退顺序为Español (Latinoamérica) [CC]-Español (Latinoamérica)-Español (España) [CC]-Español (España)
    
    自定义字幕匹配时间戳容差值
    
    自定义外挂字幕时间戳偏移量
    
    翻译字幕模式支持逐段翻译（默认）和逐行翻译
    
    逐段翻译对于大分段的字幕文件的平台（如：HBO Max）响应更快，翻译效果更好，利于限制使用频率的翻译API。

# 安装链接
1、因v0.8版结构升级，旧版用户请清空DualSubs在BoxJs的全部设置后重新设置

2、因iOS16.4起MitM政策变更，TV及Fitness平台，需要配合 iRingo: 📺 TV恢复支持

3、本模块不包含YouTube平台支持，如需要请单独下载🍿 DualSubs: ▶ YouTube

4、本模块不包含Netflix平台支持，如需要请单独下载🍿 DualSubs: 🇳 Netflix

5、本模块不包含Spotify平台支持，如需要请单独下载🍿 DualSubs: 🎵 Spotify

