/*
# 幕布 - 大纲笔记&思维导图 解锁终身会员
# https://apps.apple.com/cn/app/%E5%B9%95%E5%B8%83-%E5%A4%A7%E7%BA%B2%E7%AC%94%E8%AE%B0-%E6%80%9D%E7%BB%B4%E5%AF%BC%E5%9B%BE/id1214302139?uo=4


[rewrite_local]
https://api2.mubu.com/v3/api/user/current_user url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/main/mubu.js

[mitm] 
hostname = api2.mubu.com
*/

var body = $response.body.replace(/vipEndDate":"\d+"/g,'vipEndDate":"99991111"')
.replace(/level":\d+/g,'level":2')

$done({ body });
