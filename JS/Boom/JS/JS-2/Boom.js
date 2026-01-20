/*************************************

项目名称：Boom
下载地址：https://t.cn/A6f1C1rG
使用声明：仅供学习与交流，请勿转载与贩卖！⚠️⚠️⚠️

**************************************

[rewrite_local]

^https:\/\/apimboom2\.globaldelight\.net\/itunesreceipt_v2\.php$ url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/boom.js

[mitm]

hostname = apimboom2.globaldelight.net

*************************************/


let chxm1023 = JSON.parse($response.body);
chxm1023 =
{"status":"0","receipt-data":{"status":0,"environment":"Production","receipt":{"receipt_type":"Production","app_item_id":1065511007,"receipt_creation_date":"2019-10-30 16:52:23 Etc\\\\/GMT","bundle_id":"com.globaldelight.iBoom","original_purchase_date":"2019-04-17 04:07:39 Etc\\\\/GMT","in_app":[{"quantity":"1","purchase_date_ms":"1555474256000","expires_date":"2099-09-09 09:09:09 Etc\\\\/GMT","expires_date_pst":"2099-09-09 09:09:09 America\\\\/Los_Angeles","is_in_intro_offer_period":"false","transaction_id":"470000445785125","is_trial_period":"false","original_transaction_id":"470000445785125","purchase_date":"2019-04-17 04:10:56 Etc\\\\/GMT","product_id":"com.globaldelight.iBoom.LifetimeDiscountPack","original_purchase_date_pst":"2019-04-16 21:10:59 America\\\\/Los_Angeles","original_purchase_date_ms":"1555474259000","web_order_line_item_id":"470000137081235","expires_date_ms":"4092599350000","purchase_date_pst":"2019-04-16 21:10:56 America\\\\/Los_Angeles","original_purchase_date":"2019-04-17 04:10:59 Etc\\\\/GMT"}],"adam_id":1065511007,"receipt_creation_date_pst":"2019-10-30 09:52:23 America\\\\/Los_Angeles","request_date":"2019-10-30 16:52:29 Etc\\\\/GMT","request_date_pst":"2019-10-30 09:52:29 America\\\\/Los_Angeles","version_external_identifier":832251566,"request_date_ms":"1572454349573","original_purchase_date_pst":"2019-04-16 21:07:39 America\\\\/Los_Angeles","application_version":"1.4.70002","original_purchase_date_ms":"1555474059000","receipt_creation_date_ms":"1572454343000","original_application_version":"1.4.10008","download_id":87042883772350},"latest_receipt_info":[{"quantity":"1","purchase_date_ms":"1555474256000","expires_date":"2099-09-09 09:09:09 Etc\\\\/GMT","expires_date_pst":"2099-09-09 09:09:09 America\\\\/Los_Angeles","is_in_intro_offer_period":"false","transaction_id":"470000445785125","is_trial_period":"false","original_transaction_id":"470000445785125","purchase_date":"2019-04-17 04:10:56 Etc\\\\/GMT","product_id":"com.globaldelight.iBoom.LifetimeDiscountPack","original_purchase_date_pst":"2019-04-16 21:10:59 America\\\\/Los_Angeles","subscription_group_identifier":"20461753","original_purchase_date_ms":"1555474259000","web_order_line_item_id":"470000137081235","expires_date_ms":"4092599350000","purchase_date_pst":"2019-04-16 21:10:56 America\\\\/Los_Angeles","original_purchase_date":"2019-04-17 04:10:59 Etc\\\\/GMT"}],"pending_renewal_info":[{"product_id":"com.globaldelight.iBoom.LifetimeDiscountPack","original_transaction_id":"470000445785125","auto_renew_product_id":"com.globaldelight.iBoom.LifetimeDiscountPack","auto_renew_status":"0"}]}};

$done({body: JSON.stringify(chxm1023)});
