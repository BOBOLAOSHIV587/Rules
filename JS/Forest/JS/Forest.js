/* 
forest 
闲鱼卖脚本司马
[rewrite_local]
^https:\/\/forest-api\.upwardsware\.com\/user\/users\/\d+\/service-levels\/status\?.*$ url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/refs/heads/main/forest.js

[mitm]
hostname = forest-api.upwardsware.com
*/
const now = new Date();
const formattedNow = now.toISOString().replace(/\.000Z$/, 'Z');
const futureDate = "2099-12-31T23:59:59Z";
const fakebody =  {
    "is_premium": true,
    "service_level": "subscription",
    "subscription": {
        "id": 1232,
        "is_in_trial": false, 
        "is_in_introductory": false,
        "transaction_id": "520002450573219",
        "receiptable_id": 2911007,
        "expires_at": futureDate,
        "created_at": formattedNow,
        "user_id": 4472689,
        "sku_id": "forest_annual_early_bird",
        "is_auto_renewing": true,
        "cancelled_at": null,
        "cancel_reason": null,
        "promotional_offer_identifier": null,
        "auto_renew_sku_id": "forest_annual_early_bird",
        "payment_system_psid": 11,
        "starts_at": formattedNow
    }
};

const statusCode = typeof $task !== "undefined" ? "HTTP/1.1 200 OK" : 200;

$done({ status: statusCode, headers: $response.headers, body: JSON.stringify(fakebody) });
