/**************************
 *  * @Author: XiaoMao
 * @LastMod: 2024-06-07
 *
 * 


Leica LUX - Pro Photo Capture 徕卡相机解锁Pro


仅供学习参考，请于下载后24小时内删除

********************************
# 小版本更新请查看更新日志 ｜ 或加入xiaomao组织⬇️
# 微信公众号 【小帽集团】
# XiaoMao · TG通知频道：https://t.me/xiaomaoJT
# XiaoMao · Tg脚本频道：https://t.me/XiaoMaoScript
# XiaoMao · GitHub仓库：https://github.com/xiaomaoJT/QxScript
# https://apps.apple.com/us/app/leica-lux-pro-photo-capture/id6477182657?uo=4

使用方法：
1、QX > 右下角风车 > 重写 > 规则资源 > 引用以下脚本 > 打开资源解析器
https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/XiaoMaoLeicaLUX.js

2、打开软件 > 右下角设置 > 点击「恢复购买」

3、解锁成功理论上有消息弹窗，成功后即可关闭脚本。[🚨🚨🚨无效请关掉软件进程后，先打开脚本，再进软件进行解锁]

4、⚠️⚠️⚠️解锁脚本不可共存，请逐一使用并关闭。


[mitm]
hostname = api.revenuecat.com

[rewrite_local]
https:\/\/api\.revenuecat\.com\/v1\/(subscribers|receipts) url script-response-body https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/source/llux.js
https:\/\/api\.revenuecat\.com\/v1\/(subscribers|receipts) url script-response-header https://raw.githubusercontent.com/xiaomaoJT/QxScript/main/rewrite/boxJS/source/llux.js

********************************/

eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p;}('8t(8j(p,a,c,k,e,d){e=8j(c){8k(c<a?"":e(8s(c/a)))+((c=c%a)>35?8n.8p(c+29):c.8r(36))};8m(!\'\'.8o(/^/,8n)){8l(c--)d[e(c)]=k[c]||e(c);k=[8j(e){8k d[e]}];e=8j(){8k\'\\\\w+\'};c=1};8l(c--)8m(k[c])p=p.8o(8v 8q(\'\\\\b\'+e(c)+\'\\\\b\',\'g\'),k[c]);8k p}(\'6j(6e(p,a,c,k,e,d){e=6e(c){6d(c<a?"":e(6m(c/a)))+((c=c%a)>35?6h.6p(c+29):c.6l(36))};6g(!\\\'\\\'.6i(/^/,6h)){6f(c--)d[e(c)]=k[c]||e(c);k=[6e(e){6d d[e]}];e=6e(){6d\\\'\\\\\\\\w+\\\'};c=1};6f(c--)6g(k[c])p=p.6i(6k 6n(\\\'\\\\\\\\b\\\'+e(c)+\\\'\\\\\\\\b\\\',\\\'g\\\'),k[c]);6d p}(\\\'4j(48(p,a,c,k,e,d){e=48(c){47(c<a?"":e(4e(c/a)))+((c=c%a)>35?4a.4d(c+29):c.4f(36))};49(!\\\\\\\'\\\\\\\'.4b(/^/,4a)){4c(c--)d[e(c)]=k[c]||e(c);k=[48(e){47 d[e]}];e=48(){47\\\\\\\'\\\\\\\\\\\\\\\\w+\\\\\\\'};c=1};4c(c--)49(k[c])p=p.4b(4i 4g(\\\\\\\'\\\\\\\\\\\\\\\\b\\\\\\\'+e(c)+\\\\\\\'\\\\\\\\\\\\\\\\b\\\\\\\',\\\\\\\'g\\\\\\\'),k[c]);47 p}(\\\\\\\'2i(20(p,a,c,k,e,d){e=20(c){1Z(c<a?"":e(2C(c/a)))+((c=c%a)>35?25.2E(c+29):c.2D(36))};21(!\\\\\\\\\\\\\\\'\\\\\\\\\\\\\\\'.23(/^/,25)){24(c--)d[e(c)]=k[c]||e(c);k=[20(e){1Z d[e]}];e=20(){1Z\\\\\\\\\\\\\\\'\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\w+\\\\\\\\\\\\\\\'};c=1};24(c--)21(k[c])p=p.23(22 2B(\\\\\\\\\\\\\\\'\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\b\\\\\\\\\\\\\\\'+e(c)+\\\\\\\\\\\\\\\'\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\b\\\\\\\\\\\\\\\',\\\\\\\\\\\\\\\'g\\\\\\\\\\\\\\\'),k[c]);1Z p}(\\\\\\\\\\\\\\\'5 L="1M";5 u="1X";5 y="1b";5 3=r.17((g $E!="f"&&$E.3)||l);5 c=$H&&$H.c;5 4={};5 Y=$H.0;5 $=1e N(L);1(/^P:\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/1d\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\.V\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\.1f\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/1n\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/(1o|1u)?/.1s(Y)){1(g $E=="f"){R c["x-V-1h"];R c["X-1r-1q"];4.c=c}1p 1(3&&3.j){5 w={Q:"G-o-I:19:J",1m:"G-o-I:19:J",1l:"1k-O-1j:O:1i",1t:"1g",18:"1a",};3.j.1c[y]=w;3.j.T[u]=w;3.j.T[u].1L=y;3.j.Q="G-o-I:19:J";4.3=r.15(3);$.s("1w"+L+" 1O！","","1P!1Q，1R。","P://i.1S.1U/M-1Y/M/1V/12/19/1W/o/12/1v.1N")}}$p(4);1T N(14){2 8=g $1K!=="f";2 9=g $n!=="f"&&!8;2 a=g $m!=="f";2 K=(6)=>{1(8||9)b $S.K(6);1(a)b $16.1J(6)};2 C=(6,k)=>{1(8||9)b $S.C(6,k);1(a)b $16.1I(6,k)};2 s=(t="1H",q="",e="",0="",13=0)=>{1(8)$W.h(t,q,e,0);1(9)$W.h(t,q,e,{0});1(a)$s(t,q,e,{"1G-0":0,"1F-0":13})};2 A=(0,7)=>{1(8||9)$n.A(0,7);1(a){0.B=`1E`;$m.D(0).F((d)=>7(l,{},d.3))}};2 h=(0,7)=>{1(8||9)$n.h(0,7);1(a){0.B=`1D`;$m.D(0).F((d)=>7(l,{},d.3))}};2 z=(0,7)=>{1(8||9)$n.z(0,7);1(a){0.B="1C";$m.D(0).F((d)=>7(l,{},d.3))}};2 11=(U)=>r.17(U);2 10=(4)=>r.15(4);2 Z=(4)=>{b 1B.1A(4).1z((6)=>`${6}=${4[6]}`).1y("&")};2 v=(e)=>1x.v(e);2 p=(k={})=>$p(k);b{14,K,C,s,A,h,z,11,10,Z,v,p,}}\\\\\\\\\\\\\\\',2F,2G,\\\\\\\\\\\\\\\'2H|21|2I|2J|2K|2L|2M|2O|31|2P|2Q|1Z|2R|2S|2T|2U|2V|2W||2X|2Y|2Z|2z|2A|2N|2y|2l|33|2g|2f|2e|2d|2b||2h|2a|28|27|26|2c|2x|2k|2j|2m|2n|2o|2p|2q|2r|2s|2t|2u|2v|2w|30|32|3u|34|3E||3F|3G|3H|3T||3J|3K|3L|3M|3N|3O||3P|3Q|3R|3S|22|3V|3U|45|44|43|42|46|40|3Z|3Y|41|3X|3W|3D|3I|3B|3A|37|38|39|3a|3b|3c|3d|3e|3f|3g|3h|3C|3i|3j|3k|3l|3m|3n|3o|3p|3q|3r|3s|20|3t|3v|3w|3x|3y\\\\\\\\\\\\\\\'.3z(\\\\\\\\\\\\\\\'|\\\\\\\\\\\\\\\'),0,{}))\\\\\\\',62,4J,\\\\\\\'|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||47|48|49|4i|4b|4c|4a|4K|4L|4M||4N|4O|4P|4Q|4R|4S|4T|4U|4j|4V|4W|4X|4Y|4Z|50|51|52|53|54|55|4H|57|4I|58|5a|4G|4v|4g|4e|4f|4d|62|4l|4m|4n|4o|4p|4q|4r|4k|4F|4t|4u|4s|4w|4x|4y|4z|4A|4B|4C|4D|4E|56|59|5C|5b|||5K|5L|5Y|5M|5N|5O|5P|5Q|5R|5S|5T|5U|5V|5W|5X|60|5Z|6b|6a|69|68|6c|66|67|65|64|61|63|4h|5I|5J|5G|5F|5c|5d|5e|5f|5g|5h|5i|5j|5k|5l|5m|5n|5o|5p|5q|5r|5s|5t|5u|5v|5w|5x|5y|5z|5A|5B|5H|5D|5E\\\\\\\'.4h(\\\\\\\'|\\\\\\\'),0,{}))\\\',62,6R,\\\'|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||6d|6e|6g|6h|6i|6f|6p|6m|6l|6n|6o|6k|6j|6S|6T|6U|6V|6W|6v|6X|6Y|6Z|70|71|72|73|74|75|76|77|78|6P|7a|7b|7c|7d|6Q|7e|6O|6I|6z|6x|6w|7g|6A|6u|6q|6t|6r|6s|6y|6B|6N|6D|6E|6F|6G|6H|6C|6J|6K|6L|6M|79|7f|7A|7h|7Q|7R|7S|7T|7U|84|7V|7W|7X|7Y|7Z|80|81|82|83|87|85|8h|8g|8f|8e|8i|8c|8b|8d|8a|89|88|86|7O|7P|7M|7L|7i|7j|7k|7l|7m|7n|7o|7p|7q|7r|7s|7t|7u|7v|7w|7x|7y|7z|7N||7B|7C|7D|7E|7F|7G|7H|7I|7J|7K\\\'.6o(\\\'|\\\'),0,{}))\',62,8X,\'|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||8k|8j|8l|8m|8n|8o|8t|8v|8r|8s|8q|8u|8p|8Y|8Z|90|91|92|93|94|95|96|97|99|9l|9a|9b|9c|9d|9e|9f|8V|9h|9i|9j|9n|9k|8W|98|8U|8N|8x|8y|8z|8A|8B|8C|8D|8E|8F|8w|8G|8T|8I|8J|8K|8L|8M|8H|8O|8P|8Q|8R|8S|9g|9m|9Q|9o|9X|ab|9Y|9Z|a0|a1|a2|a3|a4|a5|a6|a7|a8|a9|aa|ad|ac|ao|an|am|al|ak|ap|ai|ah|aj|ag|af|ae|9V|9W|9T|9S|9p|9q|9r|9s|9t|9u|9v|9w|9x|9y|9z|9A|9B|9C|9D|9E|9F|9G|9H|9I|9J|9K|9L|9M|9N|9O|9P|9U|9R\'.8u(\'|\'),0,{}))',62,646,'|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||function|return|while|if|String|replace|fromCharCode|RegExp|toString|parseInt|eval|split|new|isQX|06|123|url|const|body|let|key|headers|isSurge|httpClient|response|message|undefined|typeof|post|subscriber|385|null|persistentStore|callback|task|delete|resp|https|write|255|515|entId|notify|subType|title|log|obj|put|get|2024|method|value|fetch|img|request|07T10|12Z|read|AppName|entitlements|Env|02|isLoon|subtitle|then|subscriberData|original_purchase_date|receipts|notification|requestUrl|queryStr|toStr|store|name|stringify|prefs|parse|ownership_type|PURCHASED|lux_7999_1y_2w0|subscriptions|api|url2|app_store|expires_date|toObj|etag|JSON|02T02|else|purchase_date|2222|subscribers|ETag|RevenueCat|revenuecat|v1|XiaoMao|test|com|02Z|pro|XiaoMao_|map|keys|Object|PUT|POST|GET|media|open|setValueForKey|valueForKey|loon|product_identifier|join|console|XiaoMaoLeicaLUX|png|103718184_p0|pixiv|执行成功|已解锁成功|可关掉此脚本|Nice|re|2022|00|original|done|str'.split('|'),0,{}))
