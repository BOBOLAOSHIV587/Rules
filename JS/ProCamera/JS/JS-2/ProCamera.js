/*******************************
脚本功能：ProCamera专业相机-解锁订阅
脚本作者：afengye
注意事项：查看频道说明
频道地址：https://t.me/afengye
使用声明：️仅供学习交流, 🈲️商业用途
********************************
[rewrite_local]
^https?:\/\/api\.revenuecat\.com\/.+\/(receipts$|subscribers\/?(.*?)*$) url script-response-body https://raw.githubusercontent.com/afengye/QX/main/camera.js
^https?:\/\/api\.revenuecat\.com\/.+\/(receipts$|subscribers\/?(.*?)*$) url script-request-header https://raw.githubusercontent.com/afengye/QX/main/camera.js

[mitm]
hostname = api.revenuecat.com
*******************************/
let obj = {};

if(typeof $response == "undefined") {
  delete $request.headers["x-revenuecat-etag"];
  delete $request.headers["X-RevenueCat-ETag"];
  obj.headers = $request.headers;
}else {
  let body = JSON.parse(typeof $response != "undefined" && $response.body || null);
  if(body && body.subscriber) {
    let subscriber = body.subscriber;
    let bundle_id = $request.headers["X-Client-Bundle-ID"]?$request.headers["X-Client-Bundle-ID"]:$request.headers["User-Agent"].match(/^[%a-zA-Z0-9]+/)[0];
   if (bundle_id == "com.cocologics.ProCamera") {
        subscriber.subscriptions = {
      "com.cocologics.ProCamera.vividHDR001" : {
        "store" : "app_store",
        "purchase_date" : "2021-01-01T00:00:00Z",
        "ownership_type" : "PURCHASED",
        "original_purchase_date" : "2021-01-01T00:00:00Z",
        "product_identifier" : "com.cocologics.ProCamera.vividHDR001",
        "expires_date" : "2999-01-01T00:00:00Z"
      },
      "com.cocologics.ProCamera.Up.Purchase1" : {
        "store" : "app_store",
        "purchase_date" : "2021-01-01T00:00:00Z",
        "ownership_type" : "PURCHASED",
        "original_purchase_date" : "2021-01-01T00:00:00Z",
        "product_identifier" : "com.cocologics.ProCamera.Up.Purchase1",
    }
   }
   subscriber.entitlements = {
      "private_lightbox_entitlement" : {
        "store" : "app_store",
        "purchase_date" : "2021-01-01T00:00:00Z",
        "ownership_type" : "PURCHASED",
        "original_purchase_date" : "2021-01-01T00:00:00Z",
        "product_identifier" : "com.cocologics.ProCamera.Up.Purchase1",
        "expires_date" : "2999-01-01T00:00:00Z"
      },
      "pro_camera_up_entitlement" : {
        "store" : "app_store",
        "purchase_date" : "2021-01-01T00:00:00Z",
        "ownership_type" : "PURCHASED",
        "original_purchase_date" : "2021-01-01T00:00:00Z",
        "product_identifier" : "com.cocologics.ProCamera.Up.Purchase1",
        "expires_date" : "2999-01-01T00:00:00Z"
      },
      "san_fran_entitlement" : {
        "store" : "app_store",
        "purchase_date" : "2021-01-01T00:00:00Z",
        "ownership_type" : "PURCHASED",
        "original_purchase_date" : "2021-01-01T00:00:00Z",
        "product_identifier" : "com.cocologics.ProCamera.Up.Purchase1",
        "expires_date" : "2999-01-01T00:00:00Z"
      },
      "vivid_hdr_entitlement" : {
        "store" : "app_store",
        "purchase_date" : "2021-01-01T00:00:00Z",
        "ownership_type" : "PURCHASED",
        "original_purchase_date" : "2021-01-01T00:00:00Z",
        "product_identifier" : "com.cocologics.ProCamera.vividHDR001",
        "expires_date" : "2999-01-01T00:00:00Z"
      },
      "procamera_full_entitlement" : {
        "store" : "app_store",
        "purchase_date" : "2021-01-01T00:00:00Z",
        "ownership_type" : "PURCHASED",
        "original_purchase_date" : "2021-01-01T00:00:00Z",
        "product_identifier" : "com.cocologics.ProCamera.Up.Purchase1",
        "expires_date" : "2999-01-01T00:00:00Z"
      }
   }
   obj.body = JSON.stringify(body);
   }
 }
}

$done(obj);
