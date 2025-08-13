let body = JSON.parse($response.body)
if($request.url.includes("info")) {
	body.data.user.billing = {
        "expiryDate": 4092657620,
        "subscriptionRegion": "",
        "state": "active",
        "rank": 2,
        "trialAvailable": true,
        "comboAvailable": false
      }
}
else{
	body = {
  "data": {
    "subscriptions": [
      {
        "rank": 10,
        "productSaleCostCurrency": "RUR",
        "apiId": "141053511",
        "pausedText": [],
        "subscriptionProvider": "vk",
        "title": "VK Музыка",
        "expiredText": [
          "подписка отключена"
        ],
        "gradientColor2": "#0F0219",
        "textColor": "#FFF824",
        "manageWeblinkUrl": "https://t.me/+BVA7-Vq6FA9hZTNi",
        "subscriptionRegion": "RU",
        "trialPeriod": false,
        "anotherSourceText": [],
        "activeText": [
          "Подписка успешно взломана, приятного пользования"
        ],
        "gradientColor1": "#0F0E46",
        "state": "active",
        "isCancellable": false,
        "manageDeeplinkUrl": "tg://join?invite=IyWXtppGkyI2Y2My",
        "createdDate": 1698694456,
        "productExpirationIntervalInSeconds": 999999999,
        "substitutionVariables": {},
        "startDate": 1592213063,
        "productSaleCost": 0.01,
        "expiryDate": 4092657620,
        "helpExpiredUrl": ""
      }
    ]
  }
}
}
$done({body: JSON.stringify(body)})
