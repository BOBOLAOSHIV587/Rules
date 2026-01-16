let body = JSON.parse($response.body);
body.me.active_bundle_subscriptions = [
  {
    "features": [

    ],
    "expiry": "2099-12-31T23:59:59+00:00",
    "product_id": "com.focoslive.lifetime",
    "plan_id": null
  }
]
body.me.active_subscriptions_ids = [
  "com.focoslive.lifetime"
]
$done({body: JSON.stringify(body)});