/**
 * K歌 
 * * 功能：解锁唱唱会员、KTV房间权限、修改个人、移除唱VIP入口、屏蔽游戏与招募广告
 * * Update: 2025-12-15
 * * 注意：接口可能变动，若失效请反馈
 *
 * 免责声明：此脚本仅供学习与交流，请勿用于商业用途或非法用途，使用过程中产生的任何后果与本人无关。
[rewrite_local]
^https?:\/\/(nacsing\.kugou\.com|acsing\.service\.kugou\.com|vipos\.kugou\.com|gateway\.kugou\.com|gamecenter\.kugou\.com|acsing\.tx\.kugou\.com)\/(sing7\/json\/v2\/user\/login|ccktv\/v1\/ktv_room\/room\/room_config|fxsing\/vip\/member\/info|sing7\/homepage\/json\/v3\/vip\/tip|v4\/price\/get_tips|vipenergy\/v2\/entrance\/vip_center_user_info|fxsing\/vip\/user\/info|sing7\/homepage\/json\/v3\/cdn\/kroom_tab_enter|v1\/home\/member_game|sing7\/homepage\/json\/v3\/cdn\/kroom_tab\/banners) url script-response-body http://192.168.1.100:9191/kgksong.js
[mitm]
hostname = nacsing.kugou.com, acsing.service.kugou.com, vipos.kugou.com, gateway.kugou.com, gamecenter.kugou.com, acsing.tx.kugou.com
 */

const url = $request.url;
let body = $response.body;

// === 配置常量 ===
const vipDate = "2099-09-09 09:09:09";
const beginDate = "2024-01-01 00:00:00";
// 原接口加密串（死数据 解密不了暂用）
const fxSingData = "Uxw0FTAhi9RwGpk0CaH3g8Dtsl3GjfyX5J6WYSSu5h0YAazP7i8wKfozLshiE5sDz023bGftjrSv2kdUhkNKwSV9t2J3VRLnFAh1UzS+MzA=";

function main() {
    if (!body) return null;
    let obj = JSON.parse(body);
    const timeNow = new Date().getTime();

    // 用户信息
    // https://nacsing.kugou.com/sing7/json/v2/user/login
    if (url.includes("sing7/json/v2/user/login")) {
        if (obj.data && obj.data.playerBase) {
            const pb = obj.data.playerBase;
            pb.yearType = 1;          // 年费标识
            pb.userYType = 1;         // 年费用户类型
            pb.userType = 29;         // SVIP 用户类型
            pb.svipScore = 999999;    // 成长值
            pb.vipType = 6;           // VIP 类型
            pb.svipLevel = 9;         // SVIP 等级
            pb.musicpackType = 1;     // 音乐包
            pb.isStar = 1;            // 星级用户
            pb.isFx = 1;              // 繁星用户
        }
    }

    // K歌房间配置
    // https://acsing.service.kugou.com/ccktv/v1/ktv_room/room/room_config
    else if (url.includes("ktv_room/room/room_config")) {
        const traverse = (o) => {
            if (typeof o !== 'object' || o === null) return;
            for (let key in o) {
                if (key === 'vipType' || key === 'isVip' || key === 'is_vip') o[key] = 1;
                else if (key === 'svipLevel') o[key] = 9;
                else if (key === 'auth') o[key] = 1; // 某些权限字段
                else traverse(o[key]);
            }
        };
        traverse(obj);
    }

    // (加密串替换)
    // https://acsing.service.kugou.com/fxsing/vip/member/info
    else if (url.includes("fxsing/vip/member/info")) {
        obj.code = 0;
        obj.data = fxSingData; // 写入死数据
        obj.timestamp = timeNow; 
        obj.msg = "";
    }

    // 首页 VIP 提示/状态
    // https://acsing.service.kugou.com/sing7/homepage/json/v3/vip/tip
    else if (url.includes("sing7/homepage/json/v3/vip/tip")) {
        if (obj.data) {
            obj.data.status = 1;       
            obj.data.vipLevel = 9;      
            obj.data.svip = 1;          
            obj.data.vipExpTime = 4092599349000;            
            // 提示语
            if (obj.data.vipTips && Array.isArray(obj.data.vipTips)) {
                obj.data.vipTips.forEach(tip => {
                    tip.btnText = "SVIP已激活";
                    tip.singVipTips = "尊贵SVIP 畅享所有特权";
                });
            }
        }
    }

    // 价格/提示信息
    // https://vipos.kugou.com/v4/price/get_tips
    else if (url.includes("v4/price/get_tips")) {
        // 创建
        if (!obj.data) obj.data = {};
        if (!obj.data.vip_info) {
            obj.data.vip_info = {
                "vip_begin_time": beginDate,
                "vip_end_time": vipDate,
                "su_vip_begin_time": beginDate,
                "su_vip_end_time": vipDate
            };
        } else {
            // 覆盖
            obj.data.vip_info.vip_begin_time = beginDate;
            obj.data.vip_info.vip_end_time = vipDate;
            obj.data.vip_info.su_vip_begin_time = beginDate;
            obj.data.vip_info.su_vip_end_time = vipDate;
        }
    }

    // 用户信息 (会员能量/类型)
    // https://gateway.kugou.com/vipenergy/v2/entrance/vip_center_user_info
    else if (url.includes("vipenergy/v2/entrance/vip_center_user_info")) {
        if (obj.data) {
            obj.data.energy_total = 999999;
            obj.data.user_type = 29; // 目前29 后续可能变动
        }
    }

    // 繁星/唱唱 用户信息 (非加密)
    // https://acsing.service.kugou.com/fxsing/vip/user/info
    else if (url.includes("fxsing/vip/user/info")) {
        if (obj.data) {
            obj.data.status = 1;
            obj.data.vipLevel = 9;
            obj.data.svip = 1;
            obj.data.expireTime = 4092599349000;
        }
    }

    // 移除 "唱VIP" 入口 (防止点击失效/误导/目前没其他的更好方法/暂用)
    // https://acsing.service.kugou.com/sing7/homepage/json/v3/cdn/kroom_tab_enter
    else if (url.includes("sing7/homepage/json/v3/cdn/kroom_tab_enter")) {
        if (obj.data && obj.data.entranceList) {
            // 过滤掉 id 为 14 (唱VIP) 的入口
            obj.data.entranceList = obj.data.entranceList.filter(item => item.id !== 14);
        }
    }

    // 广告屏蔽 (游戏中心 & 唱将招募)
    // https://gamecenter.kugou.com/v1/home/member_game
    // https://acsing.tx.kugou.com/sing7/homepage/json/v3/cdn/kroom_tab/banners
    else if (url.includes("v1/home/member_game") || url.includes("kroom_tab/banners")) {
        obj.data = []; 
    }

    return { body: JSON.stringify(obj) };
}

$done(main());
