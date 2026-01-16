let body = JSON.parse($response.body);
body.data.results.subscriptions =
[
  {
    "id": "5714032c-dc15-46b9-a476-be497786da9a",
    "unit": "month",
    "group_id": "fbc1128b",
    "autorenew_enabled": true,
    "expires_at": "2099-12-31T23:59:59.000Z",
    "in_retry_billing": false,
    "introductory_activated": true,
    "cancelled_at": null,
    "platform": "ios",
    "product_id": "ru.bestfeeds.vkfeed.subscribeOneMonth",
    "retries_count": 0,
    "started_at": "2023-07-05T13:38:50.000Z",
    "local": false,
    "next_check_at": "2099-12-31T23:59:59.000Z",
    "kind": "autorenewable",
    "units_count": 1,
    "environment": "production",
    "status": "trial"
  }
]
$done({body: JSON.stringify(body)});
