let body = JSON.parse($response.body);
body.product_id = "";
body.expiration_date_unix = 4102444799;
body.expiration_date = "2099-12-31T23:59:59Z";
body.is_valid = true
$done({body: JSON.stringify(body)});