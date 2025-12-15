/*        
        ➪：酷狗音乐解锁永久🆅🅸🅿

        ★：解锁永久🆅🅸🅿

        𖣘： @𝙍𝙣𝙞𝙠➏➏➏
# https://apps.apple.com/cn/app/%E9%85%B7%E7%8B%97%E9%9F%B3%E4%B9%90-%E5%B0%B1%E6%98%AF%E6%AD%8C%E5%A4%9A/id472208016?uo=4
𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹𒊹

[rewrite_local]
^https?:\/\/gateway\.kugou\.com url script-response-body https://raw.githubusercontent.com/Rnik666/YJTJS/main/KG.js

[MITM]
hostname = gateway.kugou.com


*/
var body = $response.body.replace(/"user_type":\d/g,'"user_type":1')
.replace(/"user_y_type":\d/g,'"user_y_type":9')
.replace(/"is_vip":\d/g,'"is_vip":6')
.replace(/"vip_type":\d/g,'"vip_type":6')
.replace(/"svip_score":\d/g,'"svip_score":9')
.replace(/"svip_level":\d/g,'"svip_level":9')
.replace(/"annual_fee_begin_time":".*?\"/g,'"annual_fee_begin_time":"2024-12-08 15:51:09"')
.replace(/"annual_fee_end_time":".*?\"/g,'"annual_fee_end_time":"2024-12-08 15:51:09"')
.replace(/"su_vip_end_time":".*?\"/g,'"su_vip_end_time":"2099-09-09"')
.replace(/"vip_end_time":".*?\"/g,'"vip_end_time":"2099-09-09 15:51:09"')
.replace(/"roam_type":\d/g,'"roam_type":1')
.replace(/"roam_end_time":".*?\"/g,'"roam_end_time":"2024-02-21 21:54:36"')
.replace(/"m_y_endtime":".*?\"/g,'"m_y_endtime":"2030-02-21 21:54:36"')
.replace(/"vip_y_endtime":".*?\"/g,'"vip_y_endtime":"2099-09-09 21:54:36"')
.replace(/"m_type":\d/g,'"m_type":1')
.replace(/"m_is_old":\d/g,'"m_is_old":1')
.replace(/"su_vip_y_endtime":".*?\"/g,'"su_vip_y_endtime":"2099-09-09"')
.replace(/"roam_begin_time":".*?\"/g,'"roam_begin_time":"2024-02-21 21:54:36"')
.replace(/"y_type":\d/g,'"y_type":1')
.replace(/"signed_svip_before":\d/g,'"signed_svip_before":8')
.replace(/"end_time":".*?\"/g,'"end_time":"2024-02-21 21:54:36"')
.replace(/"duration":\d+/g,'"duration":14213245')
.replace(/"p_grade":\d+/g,'"p_grade":20')
.replace(/"p_current_point":\d+/g,'"p_current_point":14213245')
.replace(/"p_next_grade":\d+/g,'"p_next_grade":20')
.replace(/"m_reset_time":"\d+",/g,'"m_reset_time":"2099-02-21 21:54:36",')
.replace(/"vip_clearday":"\d+"/g,'"vip_clearday":"2099-02-21 21:54:36"')
.replace(/"h_signed":"\d+"/g,'"h_signed":"2099-02-21 21:54:36"')
.replace(/"m_clearday":"\d+"/g,'"m_clearday":"2030-02-21 21:54:36"')
.replace(/"su_vip_clearday":"\d+/g,'"su_vip_clearday":"2030-02-21 21:54:36"')
.replace(/"vip_list":"\d+"/g,'"vip_list":"2030-02-21 21:54:36"')
.replace(/"m_end_time":"\d+"/g,'"m_end_time":"2024-12-08 15:51:09"')
.replace(/"servertime":".*?\"/g,'"servertime":"2099-09-09 17:30:36"')
.replace(/"m_end_time":".*?\"/g,'"m_end_time":"2099-09-09 13:43:38"')
.replace(/"svip_score":\d/g,'"svip_score":1')
.replace(/"m_is_old":\d/g,'"m_is_old":8')
.replace(/("photo"\s*:\s*")[^"]*(")/g, '$1https://pavo.elongstatic.com/i/ori/1uG8Yb8CUWA.png$2') 
.replace(/"nickname":".*?\"/g,'"nickname":"Rnik666🎖"');

$done({ body });
