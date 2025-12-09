/*
 simplypiano
Simply Piano	钢琴演奏课程	alicdn.joytunescn.com
Simply Guitar	吉他演奏课程	guitaralicdn.joytunescn.com
Simply Sing	唱歌和声乐训练	sing.joytunes.com
Simply Draw	绘画和素描基础	draw-accounts.joytunes.com
[rewrite_local]
# Simply Piano (alicdn.joytunescn.com)
^https:\/\/alicdn\.joytunescn\.com\/server\/asla\/accounts\/accountAuthenticate$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js
https://asla.joytunes.com/server/asla/accounts/accountAuthenticate url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js
^https:\/\/alicdn\.joytunescn\.com\/server\/asla\/accounts\/getAppleSubscriptionGroupInfo$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js

# Simply Guitar (guitaralicdn.joytunescn.com)
^https:\/\/guitaralicdn\.joytunescn\.com\/server\/accounts\/accountAuthenticate$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js
^https:\/\/guitaralicdn\.joytunescn\.com\/server\/accounts\/accountAuthenticateForAutoLogin$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js
^https:\/\/guitaralicdn\.joytunescn\.com\/server\/accounts\/accountSyncProgress$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js

# Simply Sing (sing.joytunes.com)
^https:\/\/sing\.joytunes\.com\/server\/accounts\/authenticate$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js
^https:\/\/sing\.joytunes\.com\/server\/accounts\/syncProgress$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js

# Simply Draw (draw-accounts.joytunes.com)
^https:\/\/draw-accounts\.joytunes\.com\/server\/accounts\/authenticate$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js
^https:\/\/draw-accounts\.joytunes\.com\/server\/accounts\/syncProgress$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js

# Intercom 客服系统 (fjfoh75b-ios.mobile-messenger.intercom.com)
^https:\/\/fjfoh75b-ios\.mobile-messenger\.intercom\.com\/messenger\/mobile\/users$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/simplypiano.js
[mitm]
hostname = alicdn.joytunescn.com, guitaralicdn.joytunescn.com, sing.joytunes.com, draw-accounts.joytunes.com, fjfoh75b-ios.mobile-messenger.intercom.com
*/
const replaceFalseWithTrue = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
                replaceFalseWithTrue(obj[key]);
            } else if (obj[key] === false) {
                obj[key] = true;
            }
        }
    }
};

const url = $request.url;
let body = $response.body;

const statusCode = typeof $task !== "undefined" ? "HTTP/1.1 200 OK" : 200;
const response = {
    status: statusCode,
    headers: $response.headers
};

if (body) {
    try {
        let obj = JSON.parse(body);  
        if (url.includes("intercom.com")) {
            if (obj.user) {
                obj.user.custom_attributes = {
                    "is_premium": true,
                    "plan": "premium_home",
                    "status": "active",
                    "subscribed": true
                };
                obj.user.is_premium = true;
            }
        } 
        else {
            replaceFalseWithTrue(obj);
            if (/authenticate/i.test(url)) {
                const FUTURE_DATE = "2099-12-31";
                const DAYS_REMAINING = 27000;
                
                const membershipInfo = {
                    "membershipDescription": "高级会员",
                    "familyIapID": "com.joytunes.asla.oneyearpremiummembership_trial_180_mpma_fp_5profiles_bundle_family",
                    "membershipTier": "premium_home",
                    "profilesAccess": "FAMILY",
                    "planDuration": "oneyear",
                    "membershipType": "JOYTUNESBUNDLE",
                    "daysRemaining": DAYS_REMAINING,
                    "autoRenewable": 1,
                    "dateStarted": "2023-10-14",
                    "isTrialPeriod": 0,
                    "currentIapID": "com.joytunes.asla.oneyearpremiummembership_trial_180_mpma_fp_5profiles_bundle",
                    "upgradeIapID": null,
                    "daysPassed": 70,
                    "dateExpire": FUTURE_DATE,
                    "isAutoRenew": true 
                };

                if (obj.accountInfo) {
                    obj.accountInfo.membershipInfo = membershipInfo;
                }
            }
        }

        response.body = JSON.stringify(obj);

    } catch (e) {
        response.body = body;
    }
}

$done(response);
