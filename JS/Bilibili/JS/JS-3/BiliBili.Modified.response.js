const $ = new Env("📺 BiliBili: 👘 Modified v0.0.1(2) response");
const URL = new URLs();
const DataBase = {
	"Modified":{
		"Settings":{
			"Switch":true,
			"Skin":{
				"user_equip":1682863365001,
				"load_equip":32263
			},
			"Private":{
				"coin":"",
				"bcoin":"",
				"follower":"",
				"level":"",
				"like":"",
				"vip":false
			}
		},
		"Configs":{
			"Skin":{
				"user_equip":[
					{"id":2529,"name":"初音未来-日版","preview":"https://i0.hdslb.com/bfs/garb/item/2fa16380b31b3cee6c889d645f2699de8e9d9faf.jpg","ver":1625570999,"package_url":"https://i0.hdslb.com/bfs/garb/zip/bbd834e1f783cef686569ff3cf94bdc3bc57f9e8.zip","package_md5":"b251980ad26b33b8c4a0a64049b14daf","data":{"color_mode":"light","color":"#212121","color_second_page":"#fff2d2","side_bg_color":"#ffe7ae","tail_color":"#996c00","tail_color_selected":"#0d6872","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"#ffaf4c","pub_btn_shade_color_bottom":"#ffc37a","pub_btn_plus_color":"#fff6df","tail_icon_mode":"img"}},{"id":2530,"name":"初音未来-夜版","preview":"https://i0.hdslb.com/bfs/garb/item/51b5a4e7147c4fdcad1bb349e0b6ecd2ba6a82a6.jpg","ver":1625571046,"package_url":"https://i0.hdslb.com/bfs/garb/zip/14e2f377e601481e2befab34e0773c81886b7232.zip","package_md5":"e10f4ff37f3d964c6ecb3f8f2c8434c9","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#4c4974","side_bg_color":"#29244d","tail_color":"#ffffff","tail_color_selected":"#a2f3f7","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"#40b7bb","pub_btn_shade_color_bottom":"#8edfe3","pub_btn_plus_color":"#4c4975","tail_icon_mode":"img"}},{"id":4124,"name":"良辰美景·不问天","preview":"https://i0.hdslb.com/bfs/garb/item/844860e8970ab045a4fd8e5c0923c902df25062f.jpg","ver":1625040105,"package_url":"https://i0.hdslb.com/bfs/garb/zip/5d83e72e2ca76b4c8c2b14dc7c5eb729d5c25e9a.zip","package_md5":"d1ae5d6445a9f12f388a097fe1dde9ad","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#b22d43","side_bg_color":"#8a2736","tail_color":"#ffbcbc","tail_color_selected":"#ffeaab","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"#ffeaab","pub_btn_shade_color_bottom":"#ffdbb8","pub_btn_plus_color":"#c02e4b","tail_icon_mode":"img"}},{"id":32264,"name":"EveOneCat2","preview":"https://i0.hdslb.com/bfs/garb/item/af6ab166af22ed45d429bfde4e3962bb78f270c8.png","ver":1632051567,"package_url":"https://i0.hdslb.com/bfs/garb/zip/4f047ea64e0659dcbcf70092dd6e30c1eadb9390.zip","package_md5":"0f81680da60b12d0ca9ebe869b81e1b1","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#32376b","side_bg_color":"#32376b","tail_color":"#e9e9e9","tail_color_selected":"#fff57a","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":33459,"name":"有栖mana","preview":"https://i0.hdslb.com/bfs/garb/item/5d98f29bcada07b06e07bc7b61d379111dc70cd0.jpg","ver":1639638559,"package_url":"https://i0.hdslb.com/bfs/garb/zip/a1dc66b63b3e29c7b7b56a257d766cce42c5406b.zip","package_md5":"e63c4df74b0337db58336b7cf4df5a08","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#d54358","side_bg_color":"#d54358","tail_color":"#2e0505","tail_color_selected":"#ff0344","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":34813,"name":"嘉然个性装扮2.0","preview":"https://i0.hdslb.com/bfs/garb/item/4d280c3ac38059c7c528a629b7e043a90bf5ff91.jpg","ver":1655707875,"package_url":"https://i0.hdslb.com/bfs/garb/zip/6349c29877c87ffb6967a13e01c17a237380197d.zip","package_md5":"80fbc07a421a3dd885b9ec7cf6884f66","data":{"side_bg_color":"","pub_btn_shade_color_top":"","color_mode":"dark","color_second_page":"#9cbcf5","tail_color_selected":"#526fff","color":"#ffffff","tail_color":"#2648a8","pub_btn_shade_color_bottom":"","head_myself_mp4_play":"loop","tail_icon_ani_mode":"once","tail_icon_ani":false,"tail_icon_mode":"img","pub_btn_plus_color":""}},{"id":34814,"name":"嘉然个性装扮2.0","preview":"https://i0.hdslb.com/bfs/garb/item/c45dd226c6eeee0dc43307995efb0b1529321e0a.jpg","ver":1655707892,"package_url":"https://i0.hdslb.com/bfs/garb/zip/14d71e4f8fda27e52a3aec6a93b358b5686cbada.zip","package_md5":"3522719bc452ad2b0c4562dd8611734a","data":{"side_bg_color":"","pub_btn_shade_color_top":"","color_mode":"light","color_second_page":"#fec9dd","tail_color_selected":"#155fe7","color":"#212121","tail_color":"#b93668","pub_btn_shade_color_bottom":"","head_myself_mp4_play":"loop","tail_icon_ani_mode":"once","tail_icon_ani":false,"tail_icon_mode":"img","pub_btn_plus_color":""}},{"id":38342,"name":"萌节六周年装扮","preview":"https://i0.hdslb.com/bfs/garb/item/ac688b44a0ebf682b1640f9f63058da93910f79a.jpg","ver":1664203693,"package_url":"https://i0.hdslb.com/bfs/garb/zip/ceaa31ef56926928071b3c16a7b3752bb18e183e.zip","package_md5":"71bc3d7ec18215d44d61fc49b31bf108","data":{"side_bg_color":"","pub_btn_shade_color_top":"","color_mode":"light","color_second_page":"#85c3fe","tail_color_selected":"#8080ef","color":"#212121","tail_color":"#252525","pub_btn_shade_color_bottom":"","head_myself_mp4_play":"once","tail_icon_ani_mode":"once","tail_icon_ani":true,"tail_icon_mode":"img","pub_btn_plus_color":""}},{"id":39859,"name":"眠眠兔","preview":"https://i0.hdslb.com/bfs/garb/item/aa6cc4ba42eb1ecb978c3c937852e89ea913ef0c.jpg","ver":1667550979,"package_url":"https://i0.hdslb.com/bfs/garb/zip/2bc9d734bd161ae80e29301952637c2aa9a15e62.zip","package_md5":"0d6c7322a49775e73dc8463ae0822ecd","data":{"color_mode":"light","color":"#212121","color_second_page":"#7b80ba","side_bg_color":"","tail_color":"#695785","tail_color_selected":"#ffffff","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":49390,"name":"提摩西小队第二弹","preview":"https://i0.hdslb.com/bfs/garb/item/3f825654a20dc6a936f539ec0d79600422d4c435.jpg","ver":1677753583,"package_url":"https://i0.hdslb.com/bfs/garb/zip/0598e721e0a42904224d2813ae405da9d5453cf2.zip","package_md5":"36a76686dfa20830c3ddb7dfb090db4f","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#819b50","side_bg_color":"","tail_color":"#fffbde","tail_color_selected":"#eaff88","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":50107,"name":"灰原哀","preview":"https://i0.hdslb.com/bfs/garb/item/6a12360353e80c9e9b2396bf5ae4678eb597d22e.jpg","ver":1680087164,"package_url":"https://i0.hdslb.com/bfs/garb/zip/e53d3456e925aeb0b32d501fa9a81d9f0a6379d7.zip","package_md5":"85ab095b4a27b3611de951f73f0d740a","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#4b2d8d","side_bg_color":"","tail_color":"#dad6d6","tail_color_selected":"#5ce233","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":50605,"name":"铃芽之旅","preview":"https://i0.hdslb.com/bfs/garb/item/29fd3ec81a9d970cbc1c918eb9c256ef7442f24e.jpg","ver":1683363152,"package_url":"https://i0.hdslb.com/bfs/garb/zip/a1d0b1689f5803c2b5fe1015b8996075e5d77f02.zip","package_md5":"b116708315b872acb28e33722077cea7","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#3789c0","side_bg_color":"","tail_color":"#ffffff","tail_color_selected":"#00285a","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":50763,"name":"有兽焉","preview":"https://i0.hdslb.com/bfs/garb/item/60215faa57e4bc2a79a9109e5ced5ea9838f34e7.jpg","ver":1681406718,"package_url":"https://i0.hdslb.com/bfs/garb/zip/beda39e8106d37a5df698318457aea5057e005e9.zip","package_md5":"7102438eb052ab6826e7f82b25526759","data":{"color_mode":"light","color":"#212121","color_second_page":"#c5db9c","side_bg_color":"","tail_color":"#04191e","tail_color_selected":"#005a70","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":50874,"name":"樱花未来","preview":"https://i0.hdslb.com/bfs/garb/item/f148a31f00c195d8f8403061d7a24f376c2ed5b7.jpg","ver":1681469869,"package_url":"https://i0.hdslb.com/bfs/garb/zip/b8faab964ae2f61671e416cca22bcba546799c6d.zip","package_md5":"cb2b384cb6d8e7635a394f6f3100d53a","data":{"color_mode":"light","color":"#ffffff","color_second_page":"#ffced1","side_bg_color":"","tail_color":"#881337","tail_color_selected":"#ff3dc1","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":52484,"name":"JDG坚定信仰","preview":"https://i0.hdslb.com/bfs/garb/item/41e4ccbe678d1e91a58680c3884a1fb60a25d6f6.png","ver":1683352743,"package_url":"https://i0.hdslb.com/bfs/garb/zip/9bde3318fedc895962461c5582eed05300d40c44.zip","package_md5":"08c8a6568afd338b15efcdf5b7798f95","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#c8102e","side_bg_color":"","tail_color":"#fff5f7","tail_color_selected":"#c8102e","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"once","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":59580,"name":"创作之翼个性主题","preview":"https://i0.hdslb.com/bfs/garb/item/320186e70545079eb0f2bce7bea02dca9da4d7f2.png","ver":1695098318,"package_url":"https://i0.hdslb.com/bfs/garb/zip/23362a35bfdcc5f3e556689045c632c8bb126bb3.zip","package_md5":"155279760465acbe213d21b6e4382ad3","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#1a7bbf","side_bg_color":"","tail_color":"#90ffee","tail_color_selected":"#ebffe3","tail_icon_ani":true,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"#6dfff9","tail_icon_mode":"img"}},{"id":1679479030001,"name":"奶蓝梦境","preview":"https://i0.hdslb.com/bfs/garb/c8d384c60d5b32a0373f1c7544143faa79a1bcf7.jpg","ver":1679575410,"package_url":"https://i0.hdslb.com/bfs/garb/zip/1c55154e72c4557ac1e4395d7c4e980b75a52ec9.zip","package_md5":"d06e78cc6330dec66db9c791677524af","data":{"color_mode":"light","color":"#000000","color_second_page":"#FFFFFF","side_bg_color":"","tail_color":"#606D90","tail_color_selected":"#E980A2","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1680162579001,"name":"领结猫","preview":"https://i0.hdslb.com/bfs/garb/1b8aedd4a4ea7dccbbecd08892aa311e5ea59f83.jpg","ver":1680233134,"package_url":"https://i0.hdslb.com/bfs/garb/zip/49f66876cef15333c0f73c3e054feb300b631383.zip","package_md5":"41209e0d25a96ea61941f8fe92a9eeca","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#010046","side_bg_color":"","tail_color":"#8A9FC6","tail_color_selected":"#051856","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1680348700001,"name":"幻想乡的日常 第1弹","preview":"https://i0.hdslb.com/bfs/garb/41f8974a016ccd8e47bc892d945316e227c6e94b.jpg","ver":1680573803,"package_url":"https://i0.hdslb.com/bfs/garb/zip/c5d3ceb305754e7b222d67b93ad3de21882c20c4.zip","package_md5":"95806a78585ac34276a90d680a8f152a","data":{"color_mode":"light","color":"#000000","color_second_page":"#99C9E3","side_bg_color":"","tail_color":"#7D4E28","tail_color_selected":"#B6268C","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1680580240001,"name":"乐正绫八周年生日纪念","preview":"https://i0.hdslb.com/bfs/garb/0eb2b6c4575f231be90b16ae22f8454209ff8220.jpg","ver":1680597997,"package_url":"https://i0.hdslb.com/bfs/garb/zip/9becf2f86ac3073d22e607cc8a09263ef850d229.zip","package_md5":"a5d13b485e47309411affeeeebbc4886","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#1F286D","side_bg_color":"","tail_color":"#E9E9E9","tail_color_selected":"#FFE556","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1680591891001,"name":"恬豆发芽了","preview":"https://i0.hdslb.com/bfs/garb/8d0dfc3140709359fdc2c51cb1268dde4749d97e.jpg","ver":1682263027,"package_url":"https://i0.hdslb.com/bfs/garb/zip/d4bd126da21434ba31e35d3a7906e410f05c5559.zip","package_md5":"409ee27c71a255f163c60321189e4312","data":{"color_mode":"light","color":"#000000","color_second_page":"#9ED4FA","side_bg_color":"","tail_color":"#454433","tail_color_selected":"#3283C8","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1682047060001,"name":"生日快乐","preview":"https://i0.hdslb.com/bfs/garb/73bf17dd1e22606a8f065b44f4efafcf0d02b71b.jpg","ver":1682066416,"package_url":"https://i0.hdslb.com/bfs/garb/zip/03238fa6749db7ba564bdb57ad45826f94ea30ac.zip","package_md5":"2bd66f54a4b535fb5b5f9bbee1928fb2","data":{"color_mode":"light","color":"#000000","color_second_page":"#FFEBD8","side_bg_color":"","tail_color":"#3F251B","tail_color_selected":"#C23C52","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1682268079001,"name":"仓鼠松鼠","preview":"https://i0.hdslb.com/bfs/garb/9aa060fa3c16ecee3ae352cb3ac2d81fa5a9960f.jpg","ver":1682497086,"package_url":"https://i0.hdslb.com/bfs/garb/zip/514f50b0bf4654fa3f2c85445f7b95fc74072c93.zip","package_md5":"039679403c3d29e8d7912793fb9c9155","data":{"color_mode":"light","color":"#000000","color_second_page":"#F3C489","side_bg_color":"","tail_color":"#34200A","tail_color_selected":"#FFFFFF","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1682400543001,"name":"大耳狗 甜品时刻","preview":"https://i0.hdslb.com/bfs/garb/1d988e88c9b63f422127f18b7168468d5b28303c.png","ver":1683163632,"package_url":"https://i0.hdslb.com/bfs/garb/zip/48ee0b0b5c8853de809801a220fa2bc317e8686e.zip","package_md5":"901f2bb7e88449787b568e1fed2c396c","data":{"color_mode":"light","color":"#000000","color_second_page":"#D7E7F5","side_bg_color":"","tail_color":"#ACA097","tail_color_selected":"#745943","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1682588261001,"name":"愿望成真 生日快乐2","preview":"https://i0.hdslb.com/bfs/garb/a91e67b7ada4c2046ee90fa7f7a53d87f6fe4196.jpg","ver":1682601597,"package_url":"https://i0.hdslb.com/bfs/garb/zip/0b6363d79f070aa548fd1a7067851d2db76d5bd7.zip","package_md5":"30f1cbf11c97daa0a2052a1469363790","data":{"color_mode":"light","color":"#000000","color_second_page":"#FDE3C5","side_bg_color":"","tail_color":"#963040","tail_color_selected":"#B63443","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1682863365001,"name":"小猫咪金的没烦恼","preview":"https://i0.hdslb.com/bfs/garb/beb223310a2a244e032aed3389d8d331c600011c.png","ver":1682913734,"package_url":"https://i0.hdslb.com/bfs/garb/zip/86913b45793d61fa134bc55a99577a7c1bc91c70.zip","package_md5":"caaedf3c9a4903c3e3dc09fc83739a77","data":{"color_mode":"light","color":"#000000","color_second_page":"#FFF1E1","side_bg_color":"","tail_color":"#A45100","tail_color_selected":"#FFB113","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1683039767001,"name":"章章梦工厂","preview":"https://i0.hdslb.com/bfs/garb/555033074a243694e16f7ac26e30669920185fa3.jpg","ver":1683087502,"package_url":"https://i0.hdslb.com/bfs/garb/zip/4e658604421dca5c1f4bd081440d2c124c21df54.zip","package_md5":"933f6c5cef56ce396ebd4e04fb11aa97","data":{"color_mode":"light","color":"#000000","color_second_page":"#FEE5B4","side_bg_color":"","tail_color":"#BA6177","tail_color_selected":"#782E41","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1683341615001,"name":"星光六角螈","preview":"https://i0.hdslb.com/bfs/garb/b8a910356879ecddf35705157dab18eb016b23b3.png","ver":1683353506,"package_url":"https://i0.hdslb.com/bfs/garb/zip/5259062476c4fb8731ce2d7031a0d1c9aa299a0d.zip","package_md5":"75d4f03caeafa73fd6440485c9e4a053","data":{"color_mode":"light","color":"#000000","color_second_page":"#FFFFFF","side_bg_color":"","tail_color":"#9465B7","tail_color_selected":"#E485CF","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1683355602001,"name":"脑洞波系列主题装扮-贝拉","preview":"https://i0.hdslb.com/bfs/garb/7217b87aee2b2522f84970874307bab271db8b06.png","ver":1683630000,"package_url":"https://i0.hdslb.com/bfs/garb/zip/d87bf2d15462e2a00957593bb0a248e99448fae7.zip","package_md5":"d5ad4ec45fb657ee2861de3107e3a849","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#302C49","side_bg_color":"","tail_color":"#FFFFFF","tail_color_selected":"#9AC8E2","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}},{"id":1683518214001,"name":"蜜桃猫情侣篇","preview":"https://i0.hdslb.com/bfs/garb/2cf56cdbaecc803804b6636b183b4e3f73c72338.jpg","ver":1683522964,"package_url":"https://i0.hdslb.com/bfs/garb/zip/293a1db879bcbb6b13afd7913a74840fc2cdb3ee.zip","package_md5":"c07353adfa361f061eeaf2e71f00478b","data":{"color_mode":"light","color":"#000000","color_second_page":"#FFD6D6","side_bg_color":"","tail_color":"#FFFFFF","tail_color_selected":"#FFE0B3","tail_icon_ani":false,"tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","pub_btn_shade_color_top":"","pub_btn_shade_color_bottom":"","pub_btn_plus_color":"","tail_icon_mode":"img"}}
				],
				"load_equip":[
					{"id":2531,"name":"初音未来13周年","ver":"1598602035","loading_url":"https://i0.hdslb.com/bfs/garb/item/9b12e8b5cc16a4c2e71e91c43796f09d5e132847.webp"},{"id":4125,"name":"良辰美景·不问天","ver":"1612771141","loading_url":"https://i0.hdslb.com/bfs/garb/item/4d6ac226ba78cc4fe14c3c97f3bd0bb2e7166c73.webp"},{"id":32263,"name":"EveOneCat2","ver":"1632046310","loading_url":"https://i0.hdslb.com/bfs/garb/item/880560233ce3fe7bde792f619bc02ac7b59fb02a.webp"},{"id":33460,"name":"有栖mana","ver":"1639638609","loading_url":"https://i0.hdslb.com/bfs/garb/item/a6a0063cfb3855035191b50a5e8384911a83bf48.webp"},{"id":34811,"name":"嘉然个性装扮2.0","ver":1650337335,"loading_url":"https://i0.hdslb.com/bfs/garb/item/fed79dceb1ea584a3f336e58689fbe5ae93f69a6.webp"},{"id":49391,"name":"提摩西小队第二弹","ver":"1677753596","loading_url":"https://i0.hdslb.com/bfs/garb/item/a248fb3fe86cf2009ce68e7e4d485b7c6229f6aa.webp"},{"id":1680172285001,"name":"豆豆摇头晃脑","ver":"1682766010","loading_url":"https://i0.hdslb.com/bfs/baselabs/op/0de868e5c679962dd4ef1187c6754ea4059eec4d89f0467dc0378b77eaf5c1c4.webp"},{"id":1680280135001,"name":"幻想乡的日常 第1弹","ver":"1680606000","loading_url":"https://i0.hdslb.com/bfs/baselabs/op/6f33bea9f45c5dac7468ab82065a66e3c1b415cb582a3d66a843d68b142f9ebd.webp"}
				]
			},
			"Private":{
			}
		}
	},
	"Default": {
		"Settings":{"Switch":"true"}
	}
};

/***************** Processing *****************/
(async () => {
	const { Settings, Caches, Configs } = setENV("BiliBili", "Modified", DataBase);
	$.log(`⚠ ${$.name}`, `Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings?.Switch) {
		case true:
		default:
			let url = URL.parse($request?.url);
			const METHOD = $request?.method, HOST = url?.host, PATH = url?.path, PATHs = PATH.split("/");
			// 解析格式
			const FORMAT = ($response?.headers?.["Content-Type"] ?? $response?.headers?.["content-type"])?.split(";")?.[0];
			$.log(`⚠ ${$.name}`, `METHOD: ${METHOD}`, `HOST: ${HOST}`, `PATH: ${PATH}`, `FORMAT: ${FORMAT}`, "");
			// 创建空数据
			let body = { "code": 0, "message": "0", "data": {} };
			// 格式判断
			switch (FORMAT) {
				case undefined: // 视为无body
					break;
				case "application/x-www-form-urlencoded":
				case "text/plain":
				case "text/html":
				default:
					break;
				case "text/xml":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body);
					let data = body.data;
					// 解析链接
					switch (HOST) {
						case "www.bilibili.com":
							break;
						case "app.bilibili.com":
						case "app.biliapi.net":
							switch (PATH) {
								case "x/v2/splash/show": // 开屏页
								case "x/v2/splash/list": // 开屏页
								case "x/v2/splash/brand/list": // 开屏页
								case "x/v2/splash/event/list2": // 开屏页
									break;
								case "x/v2/feed/index": // 推荐页
									break;
								case "x/v2/feed/index/story": // 推荐story页
									break;
								case "x/v2/search/square": // 搜索页
									break;
								case "x/v2/account/myinfo": // 信息页
									if (Settings?.Private?.coin) {
										data.coins = Settings.Private.coin;
									}
									if (Settings?.Private.bcoin) {
										data.bcoin = Settings.Private.bcoin;
									}
									if (Settings?.Private.level) {
										data.level = Settings.Private.level;
									}
									if (Settings?.Private.vip) {
										data.vip = {
											type: 2,
											status: 1,
											due_date: 4102329600000,
											vip_pay_type: 0,
											theme_type: 0,
											label: {
												path: "",
												text: "年度大会员",
												label_theme: "hundred_annual_vip",
												text_color: "#FFFFFF",
												bg_style: 1,
												bg_color: "#FB7299",
												border_color: "",
												use_img_label: true,
												img_label_uri_hans: "",
												img_label_uri_hant: "",
												img_label_uri_hans_static: "https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png",
												img_label_uri_hant_static: "https://i0.hdslb.com/bfs/activity-plat/static/20220614/e369244d0b14644f5e1a06431e22a4d5/VEW8fCC0hg.png"
												},
											avatar_subscript: 1,
											nickname_color: "#FB7299",
											role: 3,
											avatar_subscript_url: "",
											tv_vip_status: 1,
											tv_vip_pay_type: 0
										}
									}
									body.data = data;
									break;
								case "x/v2/account/mine": // 我的页
									if (Settings?.Private?.coin) {
										data.coin = Settings.Private.coin;
									}
									if (Settings?.Private?.bcoin) {
										data.bcoin = Settings.Private.bcoin;
									}
									if (Settings?.Private?.follower) {
										data.follower = Settings.Private.follower;
									}
									if (Settings?.Private?.level) {
										data.level = Settings.Private.level;
									}
									if (Settings?.Private?.vip) {
										data.senior_gate.identity = 2;
										data.senior_gate.member_text = "硬核会员";
										data.vip_type = 2;
										data.achievement = {
											senior_gate_flash:
													{icon: "https://i0.hdslb.com/bfs/activity-plat/static/20220818/367d27000e27de458c114d7ca4ded948/6TQojRgCjO.webp"},
											top_level_flash:
													{icon: "https://i0.hdslb.com/bfs/activity-plat/static/20220818/367d27000e27de458c114d7ca4ded948/t5iD0zNIbM.webp"}
										};
										delete data.vip_section_v2;
										delete data.vip_section;
										data.vip = {
											status: 1,
											avatar_subscript: 1,
											nickname_color: "#FB7299",
											due_date: 4102329600000,
											role: 3,
											vip_pay_type: 0,
											avatar_subscript_url: "",
											label: {
												bg_color: "#FB7299",
												bg_style: 1,
												text: "年度大会员",
												border_color: "",
												path: "",
												image: "https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png",
												label_theme: "hundred_annual_vip",
												text_color: "#FFFFFF"
											},
											type: 2,
											themeType: 0,
											theme_type: 0
										};
									}
									body.data = data;
									break;
								case "x/v2/space": // 空间页
									if ($request.headers['x-bili-mid'] === data.card.mid) { //判断为用户本人，其他人不做修改
										if (Settings?.Private?.follower) {
											data.card.fans = Settings.Private.follower;
										}
										if (Settings?.Private?.level) {
											data.card.level_info.current_level = Settings.Private.level;
										}
										if (Settings?.Private?.vip) {
											data.card.level_info.senior_inquiry.inquiry_text = "硬核会员";
											data.card.vip = {
												vipStatusWarn: "",
												vipType: 2,
												dueRemark: "",
												vipDueDate: 4102329600000,
												accessStatus: 0,
												vipStatus: 1,
												themeType: 0,
												label: {
													bg_color: "#FB7299",
													bg_style: 1,
													text: "年度大会员",
													border_color: "",
													path: "",
													image: "https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png",
													label_theme: "annual_vip",
													text_color: "#FFFFFF"
												}
											};
										}
										if (Settings?.Private?.like) {
											data.card.likes.like_num = Settings.Private.like;
										}
									}
									body.data = data;
									break;
								case "x/resource/show/skin": // 皮肤页
									data.user_equip = Configs.Skin.user_equip.find(e => {
										if (Settings.Skin.user_equip.toString() === e.id.toString()) {
											$.log("切换皮肤为: "+ e.name);
											return e;
										}
									});
									data.load_equip = Configs.Skin.load_equip.find(e => {
										if (Settings.Skin.load_equip.toString() === e.id.toString()) {
											$.log("切换加载动画为: "+ e.name);
											return e;
										}
									});
									body.data = data;
									break;
							};
							break;
						case "api.bilibili.com":
						case "api.biliapi.net":
							switch (PATH) {
								case "pgc/player/api/playurl": // 番剧-播放地址-api
								case "pgc/player/web/playurl": // 番剧-播放地址-web
								case "pgc/player/web/playurl/html5":  // 番剧-播放地址-web-HTML5
									break;
								case "pgc/view/v2/app/season": // 番剧页面-内容-app
									break;
								case "pgc/view/web/season": // 番剧-内容-web
								case "pgc/view/pc/season": // 番剧-内容-pc
									break;
								case "pgc/page/bangumi": // 观影页
								case "pgc/page/cinema/tab": // 观影页
									break;
								case "x/vip/web/vip_center/combine": // 会员页
									if (Settings?.Private?.vip) {
										data.user.vip.theme_type = 0;
										data.user.vip.label = {
											img_label_uri_hans_static: "https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png",
											use_img_label: true,
											img_label_uri_hant_static: "https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png",
											bg_color: "#FB7299",
											bg_style: 1,
											text: "年度大会员",
											border_color: "",
											img_label_uri_hans: "",
											img_label_uri_hant: "",
											label_theme: "hundred_annual_vip",
											text_color: "#FFFFFF"
										}
										data.user.vip.vip_pay_type = 0,
										data.user.vip.vip_due_date = 4102329600000,
										data.user.vip.avatar_subscript = 1,
										data.user.vip.is_new_user = false,
										data.user.vip.tip_material = null,
										data.user.vip.vip_type = 2,
										data.user.vip.avatar_subscript_url = "https://i0.hdslb.com/bfs/vip/icon_Certification_big_member_22_3x.png",
										data.user.vip.vip_status = 1,
										data.user.vip.nickname_color = "#FB7299"
										data.user.account_exception_text = "",
										data.user.vip_keep_time = 946656000,
										data.user.notice = {
											tv_text: "",
											surplus_seconds: 0,
											tv_surplus_seconds: 0,
											type: 0,
											can_close: false,
											text: ""
										},
										data.user.background_image_small = "",
										data.user.is_auto_renew = false,
										data.user.panel_sub_title = "",
										data.user.tv = {
											vip_pay_type: 0,
											status: 1,
											type: 1,
											due_date: 4102329600000
										},
										data.user.background_image_big = "",
										data.user.vip_overdue_explain = "年度大会员有效期 2099/12/31",
										data.user.tv_overdue_explain = "超级大会员有效期 2099/12/31",
										data.user.renew = {
											link: "",
											text: ""
										}
									}
									body.data = data;
									break;
								case "x/vip/price/panel/lexi": // 会员页
									if (Settings?.Private?.vip) {
										data.basic.user_info = {
											vip_status: 1,
											vip_type: 2,
											vip_overdue_time: 4102329600000,
											tv_vip_overdue_time: 4102329600000,
											tv_vip_status: 1
										}
									}
									body.data = data;
									break;
								case "x/vip/top_panel_info": // 续费页
									if (Settings?.Private?.vip) {
										data.ever_vip = false;
										data.vip_overdue_time = 0;
										data.vip_type = 2;
										data.tv = "超级大会员：有效期至2099-12-31";
										data.vip_status = 1;
										data.vip = "大会员：有效期至2099-12-31";
										data.tv_vip_status = 1;
									}
									body.data = data;
									break;
								case "x/player/wbi/playurl": // UGC-用户生产内容-播放地址
									break;
								case "x/space/acc/info": // 用户空间-账号信息-pc
								case "x/space/wbi/acc/info": // 用户空间-账号信息-wbi
									switch (url.params?.vmid || url.params?.mid) {
										case "11783021": // 哔哩哔哩番剧出差
										case "1988098633": // b站_戲劇咖
										case "2042149112": // b站_綜藝咖
											break;
										default:
											break;
									};
									break;
							
							};
							break;
						case "api.live.bilibili.com":
							switch (PATH) {
								case "xlive/app-room/v1/index/getInfoByRoom": // 直播
									break;
							};
							break;
					};
					$response.body = JSON.stringify(body);
					break;
				case "application/x-protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "applecation/octet-stream":
					let rawBody = $.isQuanX() ? new Uint8Array($response.bodyBytes) : $response.body;
					//$.log(`🚧 ${$.name}`, `isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
					/******************  initialization start  *******************/
					/******************  initialization finish  ******************/
					switch (FORMAT) {
						case "application/x-protobuf":
							break;
						case "application/grpc":
						case "application/grpc+proto":
							/******************  initialization finish  ******************/
							// 先拆分B站gRPC校验头和protobuf数据体
							let header = rawBody.slice(0, 5);
							body = rawBody.slice(5);
							// 处理response压缩protobuf数据体
							switch (header?.[0]) {
								case 0: // unGzip
									break;
								case 1: // Gzip
									body = pako.ungzip(body);
									header[0] = 0; // unGzip
									break;
							};
							// 解析链接并处理protobuf数据
							switch (HOST) {
								case "grpc.biliapi.net": // HTTP/2
								case "app.bilibili.com": // HTTP/1.1
									/******************  initialization finish  ******************/
									switch (PATHs?.[0]) {
										case "bilibili.app.playurl.v1.PlayURL": // 普通视频
											switch (PATHs?.[1]) {
												case "PlayView": // 播放地址
													break;
												case "PlayConf": // 播放配置
													break;
											};
											break;
										case "bilibili.app.dynamic.v2.Dynamic": // 动态
											switch (PATHs?.[1]) {
												case "DynAll": // 视频动态
													break;
											}
											break;
										case "bilibili.app.view.v1.View": // 视频
											switch (PATHs?.[1]) {
												case "View": // 视频播放页
													break;
											}
											break;
										case "bilibili.pgc.gateway.player.v2.PlayURL": // 番剧

											switch (PATHs?.[1]) {
												case "PlayView": { // 播放地址
													break;
												};
												case "PlayConf": // 播放配置
													break;
											};
											break;
										case "bilibili.app.nativeact.v1.NativeAct": // 活动-节目、动画、韩综（港澳台）
											switch (PATHs?.[1]) {
												case "Index": // 首页
													break;
											};
											break;
										case "bilibili.app.interface.v1.Search": // 搜索框
											switch (PATHs?.[1]) {
												case "Suggest3": // 搜索建议
													break;
											};
											break;
										case "bilibili.polymer.app.search.v1.Search": // 搜索结果
											/******************  initialization start  *******************/
											/******************  initialization finish  *******************/
											switch (PATHs?.[1]) {
												case "SearchAll": { // 全部结果（综合）
													/******************  initialization start  *******************/
													/******************  initialization finish  *******************/
													break;
												};
												case "SearchByType": { // 分类结果（番剧、用户、影视、专栏）
													break;
												};
											};
											break;
									};
									break;
							};
							// protobuf部分处理完后，重新计算并添加B站gRPC校验头
							rawBody = newRawBody({ header, body }); // gzip压缩有问题，别用
							break;
					};
					// 写入二进制数据
					if ($.isQuanX()) $response.bodyBytes = rawBody
					else $response.body = rawBody;
					break;
			};
			break;
		case "false":
			break;
	}
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: { // 有回复数据，返回回复数据
				const FORMAT = ($response?.headers?.["Content-Type"] ?? $response?.headers?.["content-type"])?.split(";")?.[0];
				$.log(`🎉 ${$.name}, finally`, `$response`, `FORMAT: ${FORMAT}`, "");
				//$.log(`🚧 ${$.name}, finally`, `$response: ${JSON.stringify($response)}`, "");
				if ($response?.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response?.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
					switch (FORMAT) {
						case undefined: // 视为无body
							// 返回普通数据
							$.done({ headers: $response.headers });
							break;
						case "application/x-www-form-urlencoded":
						case "text/plain":
						case "text/html":
						case "text/xml":
						case "text/plist":
						case "application/xml":
						case "application/plist":
						case "application/x-plist":
						case "text/json":
						case "application/json":
						default:
							// 返回普通数据
							$.done({ headers: $response.headers, body: $response.body });
							break;
						case "application/x-protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "applecation/octet-stream":
							// 返回二进制数据
							//$.log(`${$response.bodyBytes.byteLength}---${$response.bodyBytes.buffer.byteLength}`);
							$.done({ headers: $response.headers, bodyBytes: $response.bodyBytes.buffer.slice($response.bodyBytes.byteOffset, $response.bodyBytes.byteLength + $response.bodyBytes.byteOffset) });
							break;
					};
				} else $.done($response);
				break;
			};
			case undefined: { // 无回复数据
				break;
			};
		};
	})

/***************** Function *****************/
/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	$.log(`☑️ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches, Configs } = getENV(name, platforms, database);
	/***************** Settings *****************/
	$.log(`✅ ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//$.log(`✅ ${$.name}, Set Environment Variables`, `Caches: ${typeof Caches}`, `Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	return { Settings, Caches, Configs };
};
/**
 * Create New Raw Body
 * @author app2smile
 * @param {ArrayBuffer} header - unGzip Header
 * @param {ArrayBuffer} body - unGzip Body
 * @param {String} type - encoding type
 * @return {ArrayBuffer} new raw Body with Checksum Header
 */
function newRawBody({ header, body }, encoding = undefined) {
	//$.log(`⚠ ${$.name}, Create New Raw Body`, "");
	// Header: 1位：是否校验数据 （0或者1） + 4位:校验值（数据长度）
	const flag = (encoding == "gzip") ? 1 : (encoding == "identity") ? 0 : (encoding == undefined) ? 0 : header?.[0] ?? 0; // encoding flag
	const checksum = Checksum(body.length); // 校验值为未压缩情况下的数据长度, 不是压缩后的长度
	if (encoding == "gzip") body = pako.gzip(body); // gzip压缩（有问题，别压）
	let rawBody = new Uint8Array(header.length + body.length);
	rawBody.set([flag], 0) // 0位：Encoding类型，当为1的时候, app会校验1-4位的校验值是否正确
	rawBody.set(checksum, 1) // 1-4位： 校验值(4位)
	rawBody.set(body, 5); // 5-end位：protobuf数据
	//$.log(`🎉 ${$.name}, Create New Raw Body`, "");
	return rawBody;

	// 计算校验和 (B站为数据本体字节数)
	function Checksum(num) {
		let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
		let view = new DataView(arr);
		// 首位填充计算过的新数据长度
		view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
		return new Uint8Array(arr);
	};
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t);break;case"Node.js":this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}

/**
 * Get Environment Variables
 * @link https://github.com/VirgilClyne/GetSomeFries/blob/main/function/getENV/getENV.min.js
 * @author VirgilClyne
 * @param {String} key - Persistent Store Key
 * @param {Array} names - Platform Names
 * @param {Object} database - Default Database
 * @return {Object} { Settings, Caches, Configs }
 */
function getENV(key,names,database){let BoxJs=$.getjson(key,database),Argument={};if("undefined"!=typeof $argument&&Boolean($argument)){let arg=Object.fromEntries($argument.split("&").map((item=>item.split("="))));for(let item in arg)setPath(Argument,item,arg[item])}const Store={Settings:database?.Default?.Settings||{},Configs:database?.Default?.Configs||{},Caches:{}};Array.isArray(names)||(names=[names]);for(let name of names)Store.Settings={...Store.Settings,...database?.[name]?.Settings,...BoxJs?.[name]?.Settings,...Argument},Store.Configs={...Store.Configs,...database?.[name]?.Configs},BoxJs?.[name]?.Caches&&"string"==typeof BoxJs?.[name]?.Caches&&(BoxJs[name].Caches=JSON.parse(BoxJs?.[name]?.Caches)),Store.Caches={...Store.Caches,...BoxJs?.[name]?.Caches};return function traverseObject(o,c){for(var t in o){var n=o[t];o[t]="object"==typeof n&&null!==n?traverseObject(n,c):c(t,n)}return o}(Store.Settings,((key,value)=>("true"===value||"false"===value?value=JSON.parse(value):"string"==typeof value&&(value?.includes(",")?value=value.split(","):value&&!isNaN(value)&&(value=parseInt(value,10))),value))),Store;function setPath(object,path,value){path.split(".").reduce(((o,p,i)=>o[p]=path.split(".").length===++i?value:o[p]||{}),object)}}

// https://github.com/VirgilClyne/GetSomeFries/blob/main/function/URL/URLs.embedded.min.js
function URLs(t){return new class{constructor(t=[]){this.name="URL v1.2.2",this.opts=t,this.json={scheme:"",host:"",path:"",type:"",query:{}}}parse(t){let s=t.match(/(?:(?<scheme>.+):\/\/(?<host>[^/]+))?\/?(?<path>[^?]+)?\??(?<query>[^?]+)?/)?.groups??null;return s?.path?s.paths=s?.path?.split("/"):s.path="",s?.paths&&(s.type=s?.paths?.[s?.paths?.length-1]?.split(".")?.[1]),s?.query&&(s.query=Object.fromEntries(s.query.split("&").map((t=>t.split("="))))),s}stringify(t=this.json){let s="";return t?.scheme&&t?.host&&(s+=t.scheme+"://"+t.host),t?.path&&(s+=t?.host?"/"+t.path:t.path),t?.query&&(s+="?"+Object.entries(t.query).map((t=>t.join("="))).join("&")),s}}(t)}
