/* 
12.25
^https?:\/\/(m\.kugou\.com|gateway(retry)?\.kugou\.com|ads\.service\.kugou\.com|welfare\.kugou\.com|fx\.service\.kugou\.com|hwstore\.kugou\.com|loginservice\.kugou\.com|expendablekmrcdnretry\.kugou\.com|vipos\.kugou\.com)\/(ssr\/decocenter\/home|v5\/login_by_token|v2\/get_login_extend_info|card\/v1\/pxy\/top|ads\.gateway\/v2\/sidebar_link|ads\.gateway\/v2\/sidebar_top_card|ads\.gateway\/v2\/home_card|mobile\/vipinfoV2|v4\/mobile_splash(_sort)?|v2\/get_vip_config|ads\.gateway\/v5\/task_video\/qualification|els\.abt\/v1\/tmeab|pxy\/v1\/combo\/startup|mstc\/musicsymbol\/v1\/system\/profile|pendant\/v2\/get_user_pendant|v1\/blindbox_cabinet\/client_cabinet|ads\.gateway\/v2\/mobile_link|card\/v1\/pxy\/listen|flow\/user_config\/get_level_config_ios|v1\/starlight\/get_campaign_infos|searchnofocus\/v1\/search_no_focus_word|updateservice\/v1\/get_dev_user|v1\/login_by_quick_token|card\/v1\/pxy\/recommend_stream(_v2)?|v1\/get_res_privilege\/lite|v1\/union\/audio_info|ads\.gateway\/v2\/task_center_entrance|ocean\/v6\/theme\/category|tools\.mobile\/v2\/theme\/info|promotionvip\/v3\/vip_level\/detail|v4\/price\/get_tips|v1\/fusion\/userinfo|v2\/super\/welfarelist) url script-response-body https://raw.githubusercontent.com/your-repo/kugou1225_enhanced.js

hostname = m.kugou.com, gateway.kugou.com, gatewayretry.kugou.com, ads.service.kugou.com, welfare.kugou.com, fx.service.kugou.com, hwstore.kugou.com, loginservice.kugou.com, expendablekmrcdnretry.kugou.com, vipos.kugou.com
 */

const url = $request.url;
let body = $response.body;

const vipDate = "2099-09-09 09:09:09";
const beginDate = "2024-01-01 00:00:00";
const vipToken = "1234567890abcdef";

const vipFields = {
    is_vip: 1,
    vip_type: 6,
    y_type: 1,
    user_type: 29,
    m_type: 1,
    vip_token: vipToken,
    auth_token: vipToken,
    vip_end_time: vipDate,
    vip_begin_time: beginDate,
    m_end_time: vipDate,
    m_begin_time: beginDate,
    su_vip_end_time: vipDate,
    su_vip_begin_time: beginDate,
    su_vip_y_endtime: vipDate,
    roam_end_time: vipDate,
    listen_end_time: vipDate,
    bookvip_end_time: vipDate,
    su_vip_clearday: vipDate,
    roam_type: 1,
    is_first: 0,
    svip_level: 9,
    svip_score: 9999,
    bookvip_valid: 1,
    m_reset_time: vipDate,
    vip_clearday: beginDate,
    m_clearday: beginDate,
    upgrade_time: beginDate,
    annual_fee_begin_time: beginDate,
    annual_fee_end_time: vipDate,
    svip_begin_time: beginDate,
    svip_end_time: vipDate,
    dual_su_vip_begin_time: beginDate,
    dual_su_vip_end_time: vipDate,
    roam_begin_time: beginDate,
    h_begin_time: beginDate,
    h_end_time: vipDate,
    listen_begin_time: beginDate,
    m_is_old: 0,
    h_type: 0,
    listen_type: 0,
    user_y_type: 0,
    autotype: 0,
    autoChargeType: 0,
    producttype: 0,
    autostatus: 0,
    autoVipType: 0,
    lottery_status: 0,
    first_svip: 0,
    signed_svip_before: 0,
    promotion_tag: 0,
    ios_products_sub_tag: 0,
    promotion_offer_tag: 0,
    su_vip_upgrade_days: 999,
    super_vip_upgrade_month: 999
};

function traverse(obj) {
    if (typeof obj !== "object" || obj === null) return;
    
    for (let key in obj) {
        // VIP状态相关字段
        if (["is_vip", "vip_type", "m_type", "y_type", "user_type", "is_special_vip", "vip_switch", "bookvip_valid"].includes(key)) {
            if (key === "vip_type") obj[key] = 6;
            else if (key === "user_type") obj[key] = 29;
            else obj[key] = 1;
        }
        // Token相关字段
        else if (["vip_token", "auth_token"].includes(key)) {
            obj[key] = vipToken;
        }
        // 结束时间相关字段
        else if (key.endsWith("_end_time") || key.endsWith("_endtime") || ["su_vip_clearday", "m_reset_time"].includes(key)) {
            obj[key] = vipDate;
        }
        // 开始时间相关字段
        else if (key.endsWith("_begin_time") || ["reg_time", "vip_clearday", "m_clearday", "upgrade_time", "annual_fee_begin_time", "svip_begin_time", "dual_su_vip_begin_time", "roam_begin_time", "h_begin_time", "listen_begin_time"].includes(key)) {
            obj[key] = beginDate;
        }
        // 布尔值字段
        else if (["valid", "is_original"].includes(key)) {
            obj[key] = true;
        }
        // 权限相关字段
        else if (key === "privilege") {
            obj[key] = 1;
        }
        else if (key === "pay_type") {
            obj[key] = 0;
        }
        else if (key === "roam_list") {
            obj[key] = {gd: 1};
        }
        else if (key === "svip_level") {
            obj[key] = 9;
        }
        else if (key === "svip_score") {
            obj[key] = 9999;
        }
        // 数值型字段设为0
        else if (["m_is_old", "h_type", "listen_type", "user_y_type", "autotype", "autoChargeType", "producttype", "autostatus", "autoVipType", "lottery_status", "first_svip", "signed_svip_before", "promotion_tag", "ios_products_sub_tag", "promotion_offer_tag"].includes(key)) {
            obj[key] = 0;
        }
        // 升级天数设为999
        else if (["su_vip_upgrade_days", "super_vip_upgrade_month"].includes(key)) {
            obj[key] = 999;
        }
        // 广告相关字段处理
        else if ((key === "ads" && !url.includes("search_no_focus_word") && !url.includes("task_center_entrance")) || 
                 ["ad_info", "mobile_link", "blindbox_list", "task"].includes(key) ||
                 (key === "info" && Array.isArray(obj[key]) && url.includes("mobile_link"))) {
            obj[key] = [];
        }
        else if (key.includes("ad_value") || key.includes("audioad") || key.includes("video_max_times") || 
                 key.includes("expire_prompt") || key.includes("already_expire")) {
            obj[key] = 0;
        }
        else if (key === "global" && url.includes("profile")) {
            if (obj[key]) {
                obj[key].open = 0;
                obj[key].shortplay_entrance_open = 0;
            }
        }
        else if (["pendant_id", "flicker_pendant_id"].includes(key)) {
            obj[key] = 0;
        }
        else if (["boot_ads", "front_ads", "least_ads"].includes(key)) {
            obj[key] = [];
        }
        else if (key === "popup") {
            obj[key] = null;
        }
        else if (key === "fail_process") {
            obj[key] = 0;
        }
        
        traverse(obj[key]);
    }
}

const processThemes = (themes) => {
    if (!themes) return;
    for (let theme of themes) {
        theme.vip_level = 6;
        theme.privilege = 0;
        theme.privileges = [0];
        if (theme.limit_free_info) {
            theme.limit_free_info.limit_free_status = 1;
            theme.limit_free_info.free_end_time = 4092599349;
            theme.limit_free_info.toast_content = "已解锁 SVIP 9 尊享皮肤";
        }
        if (theme.price) {
            theme.price = 0;
        }
        if (theme.themes) {
            processThemes(theme.themes);
        }
    }
};

function main() {
    if (!body) return null;
    
    try {
        // 处理SSR页面
        if (/ssr\/decocenter\/home/.test(url)) {
            let regex = /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/;
            let match = body.match(regex);
            if (match && match[1]) {
                try {
                    let data = JSON.parse(match[1]);
                    if (data.props && data.props.pageProps) {
                        let pageProps = data.props.pageProps;
                        if (pageProps.state && pageProps.state.vipInfo) {
                            pageProps.state.vipInfo.isVip = 1;
                            pageProps.state.vipInfo.isSvip = 1;
                            pageProps.state.vipInfo.level = 9;
                            pageProps.state.vipInfo.user_type = 29;
                        }
                        if (pageProps.funsionData && pageProps.funsionData.vipInfo) {
                            Object.assign(pageProps.funsionData.vipInfo, vipFields);
                            pageProps.funsionData.vipInfo.is_vip = 1;
                            pageProps.funsionData.vipInfo.vip_type = 6;
                            pageProps.funsionData.vipInfo.user_type = 29;
                            pageProps.funsionData.vipInfo.svip_level = 9;
                        }
                    }
                    let newData = JSON.stringify(data);
                    let newBody = body.replace(regex, `<script id="__NEXT_DATA__" type="application/json">${newData}</script>`);
                    return {body: newBody};
                } catch (e) {
                    console.log("[Kugou_SSR_Error] " + e.message);
                }
            }
            return null;
        }

        let data = JSON.parse(body);
        let modified = false;

        // 任务中心入口处理
        if (/task_center_entrance/i.test(url)) {
            let customTitle = "联合国儿童基金会";
            let customLink = "https://t.me/Jsforbaby";
            if (data && data.data && data.data.ads) {
                let ads = data.data.ads;
                for (let i = 0; i < ads.length; i++) {
                    let ad = ads[i];
                    if (ad.title) ad.title = customTitle;
                    if (ad.main_heading) ad.main_heading = customTitle;
                    if (ad.entrance_name) ad.entrance_name = customTitle;
                    if (ad.desc) ad.desc = "立即查看";
                    if (ad.jumpLink) ad.jumpLink = customLink;
                }
            }
            modified = true;
        }
        // 主题相关处理
        else if (/theme\/(category|info)/i.test(url)) {
            if (data && data.data) {
                if (data.data.info) {
                    data.data.info.forEach(item => {
                        if (item.themes) processThemes(item.themes);
                    });
                }
                if (data.data.themes) {
                    processThemes(data.data.themes);
                }
                if (/theme\/info/i.test(url)) {
                    processThemes([data.data]);
                }
            }
            modified = true;
        }
        // VIP等级详情处理
        else if (/promotionvip\/v3\/vip_level\/detail/i.test(url) && data.data) {
            data.data.growth = 999999;
            data.data.grade = 9;
            data.data.level_start_growth = 300000;
            data.data.next_level_growth = 1000000;
            modified = true;
        }
        // 资源权限处理
        else if (/get_res_privilege\/lite/i.test(url) && data.data && Array.isArray(data.data)) {
            let processPrivilege = (item) => {
                item.status = 1;
                item.fail_process = 0;
                item.pay_type = 0;
                item.price = 0;
                item.pkg_price = 0;
                item.privilege = 10;
                item.popup = null;
                if (item.trans_param) {
                    item.trans_param.musicpack_advance = 0;
                    item.trans_param.pay_block_tpl = 0;
                    item.trans_param.display = 0;
                    item.trans_param.display_rate = 0;
                    item.trans_param.all_quality_free = 1;
                    item.trans_param.free_limited = 0;
                    item.trans_param.download_privilege = 8;
                    item.trans_param.classmap = {attr0: 234881032};
                }
            };
            data.data.forEach(item => processPrivilege(item));
            if (data.relate_goods && Array.isArray(data.relate_goods)) {
                data.relate_goods.forEach(item => processPrivilege(item));
            }
            if (data.userinfo) {
                data.userinfo.vip_type = 6;
                data.userinfo.m_type = 1;
                data.userinfo.vip_user_type = 3;
                data.userinfo.quota_remain = 999;
            }
            if (data.vip_user_type !== undefined) {
                data.vip_user_type = 3;
            }
            modified = true;
        }
        // 价格提示处理
        else if (/v4\/price\/get_tips/i.test(url) && data.data) {
            if (data.data.get_tips) {
                data.data.get_tips.forEach(tip => {
                    tip.user_type = 29;
                    tip.price = 0;
                    tip.next_price = 0;
                    tip.price_text = "0";
                    if (tip.tips) {
                        tip.tips.forEach(tipItem => {
                            tipItem.originalPrice = "0";
                            tipItem.discount = "10";
                            tipItem.discountText = "免费享受";
                        });
                    }
                });
            }
            if (data.data.vip_info) {
                Object.assign(data.data.vip_info, vipFields);
            }
            modified = true;
        }
        // 融合用户信息处理
        else if (/v1\/fusion\/userinfo/i.test(url) && data.data) {
            if (data.data.get_vip_info_v3 && data.data.get_vip_info_v3.data) {
                Object.assign(data.data.get_vip_info_v3.data, vipFields);
            }
            if (data.data.price_product_list && data.data.price_product_list.data && data.data.price_product_list.data.goods) {
                if (data.data.price_product_list.data.goods.super_vip) {
                    data.data.price_product_list.data.goods.super_vip.forEach(product => {
                        product.price = 0;
                        product.next_price = 0;
                        product.origin_price = 0;
                        product.tag = "免费享受";
                    });
                }
            }
            modified = true;
        }
        // 超级VIP福利列表处理 
        else if (/v2\/super\/welfarelist/i.test(url) && data.data) {
            data.data.close_time = vipDate;
            if (data.data.qqksong) {
                data.data.qqksong.status = 1;
                data.data.qqksong.month = 999;
            }
            if (data.data.book) {
                data.data.book.status = 1;
                data.data.book.month = 999;
            }
            if (data.data.iot) {
                data.data.iot.status = 1;
                data.data.iot.month = 999;
                data.data.iot.iot_status = 1;
                data.data.iot.tv_rec_status = 1;
                data.data.iot.box_rec_status = 1;
                data.data.iot.car_rec_status = 1;
                if (data.data.iot.iot_info) {
                    data.data.iot.iot_info.forEach(info => {
                        info.end_time = vipDate;
                        info.month = 999;
                    });
                }
            }
            if (data.data.ring) {
                data.data.ring.status = 1;
                data.data.ring.month = 999;
            }
            modified = true;
        }
        // 音频信息处理
        else if (/union\/audio_info/i.test(url) && data.data) {
            traverse(data.data);
            modified = true;
        }
        // 批量响应处理
        else if (data.data && Array.isArray(data.data.responses)) {
            data.data.responses.forEach(response => {
                if (response.body && typeof response.body === "string" && 
                    (response.body.startsWith("{") || response.body.startsWith("["))) {
                    try {
                        let responseData = JSON.parse(response.body);
                        traverse(responseData);
                        if (responseData.data && responseData.data.song_list) {
                            responseData.data.song_list.forEach(song => {
                                song.privilege = 1;
                                song.pay_type = 0;
                                song.popup = null;
                                if (song.trans_param) {
                                    song.trans_param.musicpack_advance = 0;
                                    song.trans_param.all_quality_free = 1;
                                    song.trans_param.free_limited = 0;
                                }
                            });
                        }
                        response.body = JSON.stringify(responseData);
                        modified = true;
                    } catch (e) {
                        console.log("[Kugou_Response_Error] " + e.message);
                    }
                }
            });
            modified = true;
        }
        // TME AB测试配置处理
        else if (data.data && data.data.TmeabConfigs && typeof data.data.TmeabConfigs === "string") {
            (() => {
                try {
                    let tmeabData = JSON.parse(data.data.TmeabConfigs);
                    traverse(tmeabData);
                    const adConfigs = {
                        "TMEAB0MyFavorite0adbanner": {else_ad_show: "0"},
                        "TMEAB0playpage0admanagement": {add: "0"},
                        "TMEAB0huiyuan0wangzhuancard": {card: "0"},
                        "TMEAB0huiyuan0wangzhuanzidong": {shouye_is_open: "0"}
                    };
                    for (let configKey in adConfigs) {
                        if (tmeabData[configKey] && tmeabData[configKey].mapParams) {
                            Object.assign(tmeabData[configKey].mapParams, adConfigs[configKey]);
                        }
                    }
                    data.data.TmeabConfigs = JSON.stringify(tmeabData);
                    modified = true;
                } catch (e) {
                    console.log("[Kugou_Tmeab_Error] " + e.message);
                }
            })();
            modified = true;
        }
        // 登录相关处理
        else if ((/login_by_token/i.test(url) || /get_login_extend_info/i.test(url) || /get_dev_user/i.test(url) || 
                  /login_by_quick_token/i.test(url) || /mobile\/vipinfoV2/i.test(url) || /get_vip_config/i.test(url)) && data.data) {
            Object.assign(data.data, vipFields);
            if (data.data.vipinfo) {
                Object.assign(data.data.vipinfo, vipFields);
            }
            modified = true;
        }
        // 搜索无焦点词处理
        else if (/searchnofocus\/v1\/search_no_focus_word/i.test(url) && data.data && data.data.ads) {
            data.data.ads = data.data.ads.filter(ad => ad.id === 0 && ad.is_preview === 0 && ad.type !== 103);
            if (data.data.fallback) {
                data.data.fallback = data.data.fallback.filter(item => item.id === 0);
            }
            modified = true;
        }
        // 星光活动信息处理
        else if (/starlight\/get_campaign_infos/i.test(url) && data.data) {
            data.data = [];
            modified = true;
        }
        // 用户等级配置处理
        else if (/flow\/user_config\/get_level_config_ios/i.test(url) && data.data) {
            if (data.data.user) {
                data.data.user.forEach(user => {
                    if (user.userLevelId === 0) {
                        user.userLevelName = "自定义神";
                        user.kg.iconType = 1;
                        user.fx.iconType = 1;
                    }
                });
            }
            if (data.data.star) {
                data.data.star.forEach(star => {
                    if (star.starLevelId === 0) {
                        star.starLevelName = "神话5级";
                        star.kg.iconType = 1;
                        star.fx.iconType = 1;
                    }
                });
            }
            modified = true;
        }
        // 播放页面组合处理
        else if (/playerpxy\/v1\/combo\/play_page_index/i.test(url) && data.data && data.data.modules) {
            traverse(data.data);
            modified = true;
        }
        // 广告相关处理
        else if (/adp\/ad\/v1\/playpage_combine/i.test(url)) {
            data.data = {};
            modified = true;
        }
        else if (/v3\/vip_center/i.test(url)) {
            data.data = [];
            modified = true;
        }
        else if (/ads\.gateway\/v4\/search_banner/i.test(url)) {
            data.data = [];
            modified = true;
        }
        else if (/mine_top_banner/i.test(url)) {
            data.data = [];
            modified = true;
        }
        else if (/card\/v1\/pxy\/listen/i.test(url)) {
            data.data = [];
            modified = true;
        }
        // 默认处理
        else {
            traverse(data);
            modified = true;
        }

        let result = JSON.stringify(data);
        
        // 全局字符串替换
        result = result.replace(/"is_vip"\s*:\s*0/g, '"is_vip":1')
                      .replace(/"vip_type"\s*:\s*0/g, '"vip_type":6')
                      .replace(/"user_type"\s*:\s*0/g, '"user_type":29')
                      .replace(/"m_type"\s*:\s*0/g, '"m_type":1')
                      .replace(/"y_type"\s*:\s*0/g, '"y_type":1')
                      .replace(/"valid"\s*:\s*false/g, '"valid":true')
                      .replace(/"vip_begin_time"\s*:\s*""/g, `"${beginDate}"`)
                      .replace(/"su_vip_begin_time"\s*:\s*""/g, `"${beginDate}"`)
                      .replace(/"m_begin_time"\s*:\s*""/g, `"${beginDate}"`);

        if (!/theme\/(category|info)/i.test(url)) {
            result = result.replace(/"svip_level"\s*:\s*\d+/g, '"svip_level":9');
        }
        
        if (!/get_res_privilege\/lite/i.test(url)) {
            result = result.replace(/"privilege"\s*:\s*(0|8)/g, '"privilege":1');
        }
        
        result = result.replace(/"pay_type"\s*:\s*3/g, '"pay_type":0')
                      .replace(/"fail_process"\s*:\s*4/g, '"fail_process":0')
                      .replace(/"popup"\s*:\s*{[^}]+}/g, '"popup":null');

        return {body: result};
        
    } catch (e) {
        console.log("[Kugou_Error] " + e.message);
        return null;
    }
}

let res = main();
res ? $done(res) : $done({});
