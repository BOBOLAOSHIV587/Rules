/******************************

脚本功能：DeepFaker换脸——解锁订阅
下载地址：https://is.gd/USZXXL
软件版本：1.1.8
脚本作者：彭于晏💞
更新时间：2023-10-5

*******************************

[rewrite_local]

^https:\/\/api\.deepfaker\.app\/api\/v1\/account\/update-profile url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/DeepFaker/JS/DeepFaker.js

[mitm] 

hostname = api.deepfaker.app



*******************************/


var objc = JSON.parse($response.body);

    objc = 
{
  "config" : {
    "paywall_video_duration_string" : "3 minutes video duration"
  },
  "uid" : "03a4432f-3cc1-478a-8773-c4c3c0734ed4",
  "max_photo_file_size" : 10000000,
  "supported_video_codecs" : [
    "h264",
    "h265",
    "hevc",
    "avc"
  ],
  "subscription_type" : "PRO",
  "max_video_file_size" : 270000000,
  "subscription_expiration_date" : "9999-10-13T12:11:39Z",
  "max_video_fps" : 35,
  "max_video_duration" : 180,
  "in_app_subscriptions" : [
    {
      "max_video_duration" : 180,
      "id" : 12,
      "external_id" : "26",
      "order" : 1,
      "name" : "PRO YEAR (id12)"
    },
    {
      "max_video_duration" : 180,
      "id" : 13,
      "external_id" : "27",
      "order" : 4,
      "name" : "PRO WEEK (id13)"
    }
  ]
}

$done({body : JSON.stringify(objc)});
