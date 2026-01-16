let body = JSON.parse($response.body);
body.allowTrialTariff = false;
body.autoPayment = false;
body.subscribe = {
    "tariffPrice": 1999,
    "tariffId": "657478afd394b2a34c463530",
    "finishAt": "2099-01-01T15:52:50.402Z",
    "lastPaymentSystemName": "Tinkoff",
    "startAt": "2025-02-25T15:52:50.402Z",
    "tariffName": "12 месяцев"
  }
$done({body: JSON.stringify(body)});