/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP显示与音质解锁
 * @Version: 1.2.0
 * @Description: 修改酷狗用户信息与资源权限接口，让账号显示为SVIP并解锁全部音质与试听（仅前端效果）
 * @UpdateTime: 2025-12-07
 *
 * https://loginservice.kugou.com/v5/login_by_token?
 * 响应体JSON：
 {
  "data": {
    "is_vip": 0,
    "servertime": "2025-12-07 17:22:10",
    "roam_type": 0,
    "t1": "74b197c8a843b394ffc6ad932af0145777ea11038fe8efcc29c70a99358ee60d6913bd9dd1823c7848e3f13c83e46f93206d373760b36173b406f59c34a565b02c077e24c029da2f6a21cf99207ef6a0",
    "reg_time": "2025-09-25 15:20:44",
    "vip_type": 0,
    "birthday_mmdd": "",
    "userid": 2408712914,
    "listen_end_time": "",
    "su_vip_end_time": "",
    "su_vip_y_endtime": "",
    "user_type": 0,
    "username": "2408712914",
    "qq": 0,
    "exp": 0,
    "m_end_time": "",
    "score": 0,
    "bookvip_valid": 0,
    "bookvip_end_time": "",
    "arttoy_avatar": "",
    "totp_server_timestamp": 1765099331,
    "roam_end_time": "",
    "secu_params": "ae0161c3e69b8a76b0f6a7fd5070ab5c5b6e265a8fbb3e8741164aac5315bab6e434f7bf5e261d7f52104d0e01a26b9dbfac9ca1bcb1668d56d19086bb7bec8159b9f7a33ec52b0e25460403aecce6f9",
    "su_vip_begin_time": "",
    "roam_begin_time": "",
    "vip_end_time": "",
    "sex": 1,
    "listen_type": 0,
    "vip_token": "",
    "nickname": "General",
    "mobile": 1,
    "y_type": 0,
    "m_type": 0,
    "listen_begin_time": "",
    "bc_code": "",
    "su_vip_clearday": "",
    "roam_list": {},
    "user_y_type": 0,
    "pic": "http://imge.kugou.com/kugouicon/165/20250925/20250925152046595698.jpg",
    "m_begin_time": "",
    "t_expire_time": 1767691331,
    "vip_begin_time": "",
    "birthday": "",
    "m_is_old": 0,
    "wechat": 1
  },
  "status": 1,
  "error_code": 0
}
 *https://vip.kugou.com/mobile/vipinfoV2

 响应体JSON：
 {
  "status": 1,
  "errno": 0,
  "error_code": 0,
  "data": {
    "is_vip": 0,
    "servertime": "2025-12-07 17:22:11",
    "h_list": [],
    "m_reset_time": "",
    "m_y_endtime": "",
    "vip_type": 0,
    "vip_begin_time": "",
    "userid": 2408712914,
    "vip_y_endtime": "",
    "svip_level": 0,
    "listen_end_time": "",
    "su_vip_end_time": "",
    "su_vip_y_endtime": "",
    "user_type": 0,
    "m_list": [],
    "annual_fee_begin_time": "",
    "m_end_time": "",
    "su_vip_clearday": "",
    "roam_end_time": "",
    "su_vip_begin_time": "",
    "roam_begin_time": "",
    "y_type": 0,
    "svip_score": 0,
    "h_begin_time": "",
    "m_clearday": "",
    "m_is_old": 0,
    "h_type": 0,
    "dual_su_vip_end_time": "",
    "dual_su_vip_begin_time": "",
    "vip_clearday": "",
    "listen_begin_time": "",
    "vip_end_time": "",
    "vip_list": [],
    "roam_list": [],
    "user_y_type": 0,
    "h_signed": "",
    "m_begin_time": "",
    "listen_type": 0,
    "h_end_time": "",
    "roam_type": 0,
    "annual_fee_end_time": "",
    "m_type": 0,
    "autotype": 0,
    "autoChargeType": 0,
    "autoChargeTime": "",
    "producttype": 0,
    "phone": 0,
    "autostatus": 0,
    "auto_list": [],
    "auto_sub_list": [],
    "autoVipType": 0,
    "lottery_status": 0,
    "first_svip": 1,
    "signed_svip_before": 0,
    "promise": {
      "sign_type": 0,
      "biz_sign": "",
      "sign_valid": 0,
      "sign_status": 0,
      "withhold_count": 0,
      "total_count": 0,
      "first_price": 0,
      "next_price": 0,
      "start_time": "",
      "end_time": "",
      "last_withhold_time": "",
      "next_withhold_time": ""
    },
    "ios_products_sub_tag": 0,
    "promotion_offer_tag": 0,
    "su_vip_upgrade_days": 0,
    "super_vip_upgrade_month": 0,
    "promotion_list": {
      "val1": 0,
      "val2": 0,
      "val3": 0,
      "val4": 0
    },
    "promotion_tag": 0,
    "question_id": 1
  },
  "error": {
    "is_vip": 0,
    "servertime": "2025-12-07 17:22:11",
    "h_list": [],
    "m_reset_time": "",
    "m_y_endtime": "",
    "vip_type": 0,
    "vip_begin_time": "",
    "userid": 2408712914,
    "vip_y_endtime": "",
    "svip_level": 0,
    "listen_end_time": "",
    "su_vip_end_time": "",
    "su_vip_y_endtime": "",
    "user_type": 0,
    "m_list": [],
    "annual_fee_begin_time": "",
    "m_end_time": "",
    "su_vip_clearday": "",
    "roam_end_time": "",
    "su_vip_begin_time": "",
    "roam_begin_time": "",
    "y_type": 0,
    "svip_score": 0,
    "h_begin_time": "",
    "m_clearday": "",
    "m_is_old": 0,
    "h_type": 0,
    "dual_su_vip_end_time": "",
    "dual_su_vip_begin_time": "",
    "vip_clearday": "",
    "listen_begin_time": "",
    "vip_end_time": "",
    "vip_list": [],
    "roam_list": [],
    "user_y_type": 0,
    "h_signed": "",
    "m_begin_time": "",
    "listen_type": 0,
    "h_end_time": "",
    "roam_type": 0,
    "annual_fee_end_time": "",
    "m_type": 0,
    "autotype": 0,
    "autoChargeType": 0,
    "autoChargeTime": "",
    "producttype": 0,
    "phone": 0,
    "autostatus": 0,
    "auto_list": [],
    "auto_sub_list": [],
    "autoVipType": 0,
    "lottery_status": 0,
    "first_svip": 1,
    "signed_svip_before": 0,
    "promise": {
      "sign_type": 0,
      "biz_sign": "",
      "sign_valid": 0,
      "sign_status": 0,
      "withhold_count": 0,
      "total_count": 0,
      "first_price": 0,
      "next_price": 0,
      "start_time": "",
      "end_time": "",
      "last_withhold_time": "",
      "next_withhold_time": ""
    },
    "ios_products_sub_tag": 0,
    "promotion_offer_tag": 0,
    "su_vip_upgrade_days": 0,
    "super_vip_upgrade_month": 0,
    "promotion_list": {
      "val1": 0,
      "val2": 0,
      "val3": 0,
      "val4": 0
    },
    "promotion_tag": 0,
    "question_id": 1
  }
}
*
 * http://u.mobile.kugou.com/v/ck?
 响应体JSON:
 {
  "data": null,
  "errcode": 0,
  "status": 1,
  "error": ""
}
*
* http://acshow.kugou.com/show7/json/v2/user/switchState
* 响应体JSON：
* {
  "code": 0,
  "data": {
    "kugouId": 2408712914,
    "onlyWifi": 1,
    "status": 0
  },
  "msg": "",
  "times": 1765196917464
}
*
* http://tools.mobile.kugou.com/v1/privacy/info?
* 响应体JSON：
* {
  "data": {
    "info": null
  },
  "errcode": 0,
  "status": 1,
  "error": ""
}

* http://userinfo.user.kugou.com/get_bind
* 响应体JSON：
{
  "data": {
    "y_type": 0,
    "servertime": "2025-12-08 20:29:02",
    "roam_type": 0,
    "m_reset_time": "",
    "bindmobile": 1,
    "roam_end_time": "",
    "roam_list": {},
    "bindemail": 0,
    "vip_type": 0,
    "roam_begin_time": "",
    "vip_end_time": "",
    "m_end_time": "",
    "bindthird": {
      "qq": 0,
      "weibo": 0,
      "wechat": 1
    },
    "m_is_old": 0,
    "m_type": 0
  },
  "status": 1,
  "error_code": 0
}
*
* http://userinfo.user.kugou.com/v2/get_grade_info
*响应体JSON：
* {
  "data": {
    "p_grade_point": 1000,
    "servertime": "2025-12-08 20:28:33",
    "finish_percent": 55,
    "p_current_point": 1529,
    "p_speed": 2,
    "star_status": 0,
    "duration": 1466,
    "auth_info": "",
    "p_grade": 2,
    "d_sec": 88004,
    "p_speed_info": {
      "p2": 2,
      "p1": 1.5,
      "p0": 1,
      "p3": 2.5
    },
    "userid": 2408712914,
    "p_next_grade_point": 3000,
    "p_next_grade": 3,
    "star_id": 0
  },
  "status": 1,
  "error_code": 0
}
*
* https://usercenter.kugou.com/v3/get_my_info?
* 响应体JSON：
* {
  "data": {
    "nickname": "General",
    "k_nickname": "General",
    "fx_nickname": "",
    "kq_talent": 0,
    "pic": "http://imge.kugou.com/kugouicon/165/20250925/20250925152046595698.jpg",
    "k_pic": "http://imge.kugou.com/kugouicon/165/20250925/20250925152046595698.jpg",
    "fx_pic": "http://imge.kugou.com/kugouicon/165/20160113/20160113180717663307.jpg",
    "gender": 1,
    "vip_type": 0,
    "m_type": 0,
    "y_type": 0,
    "descri": "",
    "follows": 0,
    "fans": 0,
    "visitors": 0,
    "constellation": -1,
    "medal": {
      "ktv": {
        "type3": "C0",
        "type2": "B0",
        "type1": "A0"
      },
      "fx": {}
    },
    "star_status": 0,
    "star_id": 0,
    "birthday": "",
    "city": "",
    "province": "",
    "occupation": "",
    "bg_pic": "",
    "relation": 0,
    "auth_info": "",
    "auth_info_singer": "",
    "auth_info_talent": "",
    "tme_star_status": 0,
    "biz_status": 0,
    "p_grade": 2,
    "friends": 0,
    "face_auth": 0,
    "avatar_review": 0,
    "servertime": 1765196913,
    "bookvip_valid": 0,
    "iden": 0,
    "is_star": -1,
    "knock_cnt": 0,
    "knock": [],
    "real_auth": 0,
    "risk_symbol": 0,
    "user_like": 0,
    "user_is_like": 0,
    "user_likeid": "a5368a7a07b66c5bbd783e5169537892",
    "top_number": 0,
    "top_version": "0",
    "main_short_case": "",
    "main_long_case": "",
    "guest_short_case": "",
    "singer_status": 0,
    "bc_code": "",
    "arttoy_avatar": "",
    "visitor_visible": 1,
    "config_val": 2047,
    "config_val1": 32767,
    "kuqun_visible": 1,
    "user_type": 0,
    "user_y_type": 0,
    "su_vip_begin_time": "",
    "su_vip_end_time": "",
    "su_vip_clearday": "",
    "su_vip_y_endtime": "",
    "logintime": 1765119316,
    "loc": "浙江",
    "comment_visible": 0,
    "student_visible": 1,
    "followlist_visible": 0,
    "fanslist_visible": 1,
    "info_visible": 1,
    "follow_visible": 1,
    "listen_visible": 1,
    "album_visible": 1,
    "pictorial_visible": 1,
    "radio_visible": 1,
    "sound_visible": 1,
    "applet_visible": 1,
    "selflist_visible": 1,
    "collectlist_visible": 1,
    "lvideo_visible": 1,
    "svideo_visible": 1,
    "mv_visible": 1,
    "ksong_visible": 1,
    "box_visible": 1,
    "nft_visible": 1,
    "musical_visible": 1,
    "live_visible": 0,
    "timbre_visible": 1,
    "assets_visible": 1,
    "online_visible": 1,
    "lting_visible": 1,
    "listenmusic_visible": 1,
    "likemusic_visible": 1,
    "kuelf_visible": 1,
    "share_visible": 1,
    "musicstation_visible": 1,
    "yaicreation_visible": 1,
    "ylikestory_visible": 1,
    "ychannel_visible": 1,
    "ypublishstory_visible": 1,
    "myplayer_visible": 0,
    "usermedal_visible": 1,
    "singletrack_visible": 1,
    "faxingka_visible": 1,
    "ai_song_visible": 1,
    "mcard_visible": 1,
    "hvisitors": 0,
    "nvisitors": 0,
    "rtime": 1758784844,
    "hobby": "",
    "actor_status": 0,
    "remark": "",
    "duration": 1466,
    "svip_level": 0,
    "svip_score": 0,
    "visible": 1,
    "k_star": 0,
    "singvip_valid": 0
  },
  "error_code": 0,
  "status": 1
}
*
* https://userinfoservice.kugou.com/v1/get_login_extend_info
*响应体JSON：
* {
  "data": {
    "ads": {
      "val1": "Rhm0J1yINcVBlgKA5tDgIJ5CDfMsaHG3C530Yhnwppo",
      "val2": "hIIO60B5YEb0SRtNSq2xRsf6GVYnOeEP/mRBfIb+gqA"
    },
    "grade_info": {
      "p_grade_point": 1000,
      "p_grade": 2,
      "d_sec": 88004,
      "p_speed_info": {
        "p2": 2,
        "p1": 1.5,
        "p0": 1,
        "p3": 2.5
      },
      "p_current_point": 1529,
      "p_next_grade_point": 3000,
      "duration": 1466,
      "p_next_grade": 3
    },
    "user_label": {
      "val24": 536870912,
      "val17": 2097152,
      "val9": 0,
      "val23": 1024,
      "val10": 32,
      "val4": 0,
      "val22": 0,
      "val11": 0,
      "val1": 16,
      "val8": 0,
      "val25": 278722,
      "val16": 0,
      "val5": 0,
      "val20": 0,
      "val2": 1,
      "val18": 0,
      "val14": 0,
      "val27": 0,
      "val26": 1073742336,
      "val3": 0,
      "val15": 0,
      "val21": 0,
      "val19": 0,
      "val7": 0,
      "val12": 0,
      "val13": 0,
      "val6": 0
    },
    "preferences": {
      "addtime": 1760684507,
      "val1": 512
    },
    "vipinfo": {
      "bookvip_end_time": "",
      "svip_level": 0,
      "su_vip_end_time": "",
      "su_vip_y_endtime": "",
      "user_type": 0,
      "svip_score": 0,
      "bookvip_valid": 0,
      "su_vip_begin_time": "",
      "bookvip_rankvip": [],
      "y_type": 0,
      "user_y_type": 0,
      "vip_type": 0,
      "su_vip_clearday": "",
      "m_type": 0
    },
    "userinfo": {
      "fans": 0,
      "friends": 0,
      "iden": 0,
      "follows": 0
    },
    "servertime": "2025-12-08 20:28:37",
    "teenager": {
      "expired_at": 0,
      "is_user_dev": 0,
      "status": 0,
      "pwd": {}
    },
    "kq_talent_info": {
      "value": 0,
      "status": 1
    },
    "userid": 2408712914,
    "fx": {
      "is_star": -1,
      "follow_star": 0,
      "biz_type": 0
    },
    "auth": {
      "singer_status": 0,
      "biz_status": 0,
      "actor_status": 0,
      "star_status": 0,
      "tme_star_status": 0,
      "student_school": "",
      "userid": 2408712914,
      "star_id": 0,
      "status": 0,
      "student_status": 0
    },
    "bind_info": {
      "is_bind": 1,
      "text": "防止账号丢失，请绑定更多信息，绑定后可用于登录",
      "is_bind1": 1
    }
  },
  "status": 1,
  "error_code": 0
}
*
* https://gateway.kugou.com/media.store/v1/get_res_privilege/lite?
* 响应体JSON：
 */


var url = $request.url;
var body = $response.body;

var obj = JSON.parse(body);

// 修改登录接口的VIP信息
if (url.includes('v5/login_by_token?')) {
    if (obj.data) {
        obj.data.is_vip = 1;
        obj.data.vip_type = 3;  // SVIP
        obj.data.vip_begin_time = "2025-01-01 00:00:00";
        obj.data.vip_end_time = "2099-12-31 23:59:59";
        obj.data.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.su_vip_end_time = "2099-12-31 23:59:59";
        //obj.data.listen_type = 1;  // 解锁试听
        obj.data.user_type = 3;    // 高级用户
    }
}
/*
// 修改VIP信息接口
if (url.includes('vipinfoV2')) {
    if (obj.data) {
        obj.data.is_vip = 1;
        obj.data.vip_type = 3;
        obj.data.svip_level = 7;  // 最高SVIP等级
        obj.data.vip_begin_time = "2025-01-01 00:00:00";
        obj.data.vip_end_time = "2099-12-31 23:59:59";
        obj.data.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.su_vip_end_time = "2099-12-31 23:59:59";
       // obj.data.listen_type = 1;
        obj.data.user_type = 3;
        obj.data.m_type = 1;      // 解锁无损音质
        obj.data.y_type = 1;      // 解锁高品音质
        obj.data.h_type = 1;      // 解锁HiFi音质
    }
}

/*
/ 修改音质检查接口
if (url.includes('v/ck?')) {
    obj.data = {
        "is_vip": 1,
        "vip_type": 3,
       // "listen_type": 1,
        "m_type": 1,
        "y_type": 1,
        "h_type": 1,
        "vip_end_time": "2099-12-31 23:59:59"
    };
}

// 修改用户信息接口
if (url.includes('user.kugou.com/get_bind')) {
    if (obj.data) {
        obj.data.vip_type = 3;
        obj.data.m_type = 1;
        obj.data.y_type = 1;
        obj.data.vip_end_time = "2099-12-31 23:59:59";
    }
}

// 修改用户等级信息接口
if (url.includes('get_grade_info')) {
    if (obj.data) {
        obj.data.p_grade = 7;  // 最高等级
        obj.data.p_current_point = 99999;
        obj.data.p_next_grade_point = 99999;
    }
}

// 修改用户中心信息接口
if (url.includes('get_my_info')) {
    if (obj.data) {
        obj.data.vip_type = 3;
        obj.data.m_type = 1;
        obj.data.y_type = 1;
        obj.data.user_type = 3;
        obj.data.svip_level = 7;
        obj.data.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.su_vip_end_time = "2099-12-31 23:59:59";
    }
}

// 修改登录扩展信息接口
if (url.includes('get_login_extend_info')) {
    if (obj.data && obj.data.vipinfo) {
        obj.data.vipinfo.vip_type = 3;
        obj.data.vipinfo.m_type = 1;
        obj.data.vipinfo.y_type = 1;
        obj.data.vipinfo.user_type = 3;
        obj.data.vipinfo.svip_level = 7;
        obj.data.vipinfo.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.vipinfo.su_vip_end_time = "2099-12-31 23:59:59";
    }
}

// 修改隐私信息接口
if (url.includes('privacy/info')) {
    obj.data = {
        "info": {
            "vip_status": 1,
            "svip_level": 7,
            "expire_time": "2099-12-31 23:59:59"
        }
    };
}

// 修改用户状态接口
if (url.includes('switchState')) {
    if (obj.data) {
        obj.data.status = 1;  // 开启所有特权
        // 新增VIP相关字段
        obj.data.is_vip = 1;
        obj.data.vip_type = 3;  // SVIP
        obj.data.vip_end_time = "2099-12-31 23:59:59";
       // obj.data.listen_type = 1;  // 解锁试听
       // obj.data.m_type = 1;      // 解锁无损音质
       // obj.data.y_type = 1;      // 解锁高品音质
    }
}*/

if (url.includes('get_res_privilege/lite')) {
    obj.vip_user_type = 1;  // SVIP

    // 主对象 hash_offset
    if (obj.data?.[0]?.trans_param?.hash_offset) {
        delete obj.data[0].trans_param.hash_offset;
    }

    // relate_goods[0] 的 hash_offset
    if (obj.data?.[0]?.relate_goods?.[0]?.trans_param?.hash_offset) {
        delete obj.data[0].relate_goods[0].trans_param.hash_offset;
    }
}

body = JSON.stringify(obj);
$done({body});
