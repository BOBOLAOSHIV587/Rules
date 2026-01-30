let body = JSON.parse($response.body);
body.data = {
    "rights": {
      "renewal": true,
      "vip_type": "YEAR_PACKAGE_PLUS",
      "vip_label": true,
      "vip_remainder_day": 2,
      "expires_date": 1738942908000,
      "have_trial": true,
      "expires_date_format": "2099-12-31 23:59:59.000",
      "vip_product_id": "106"
    }
}
$done({body: JSON.stringify(body)});
