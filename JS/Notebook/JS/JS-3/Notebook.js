/*******************************
notebook
     @Mike
*******************************
[rewrite_local] 
^https:\/\/notebook\.zoho\.com\/api\/v1\/userprofile\/accounts\/payment\?action=get_current_plan_detail&include_(expired_plans|purchase_platform)=(true|false) url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/notebooktest.js
^https:\/\/notebook\.zoho\.com\/api\/v1\/payments\/feature\/consumptions url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/notebooktest.js
^https:\/\/sdk-apptics\.zoho\.com\/sdk\/api\/apptics\/v1\/app\/bearertoken url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/notebooktest.js

[MITM]
hostname = notebook.zoho.com, sdk-apptics.zoho.com

*******************************/


var mikephie = JSON.parse($response.body);

if ($request.url.indexOf("/userprofile/accounts/payment") !== -1) {
    mikephie = {
        "code": 200,
        "status": "Success",
        "message": "User profile fetched successfully",
        "plan_details": [
            {
                "expiry_time": 3742762088000,
                "purchase_source": "notebook",
                "service_id": "107000",
                "source": "PAID",
                "plan_name": "Notebook Pro",
                "payment_frequency": 12,
                "service": "NoteBook",
                "grace_period": 999160000000,
                "notebook_plan_id": "com.zoho.notebook.pro",
                "plan_description": "Upgrade to Notebook Pro and stay more productive",
                "zoho_store_plan_id": 107102,
                "purchase_time": 1717644792301
            }
        ]
    };
} else if ($request.url.indexOf("/payments/feature/consumptions") !== -1) {
    mikephie = {
        "code": 200,
        "status": "Success",
        "message": "Success",
        "feature_consumptions": [
            {
                "feature_id": "com.zoho.notebook.storage",
                "consumptions": [
                    {
                        "value": "5268006",
                        "name": "SIZE",
                        "unit": "BYTES",
                        "user_type": "INDIVIDUAL_USER"
                    }
                ],
                "source": "PAID"
            }
        ]
    };
} else if ($request.url.indexOf("/apptics/v1/app/bearertoken") !== -1) {
    mikephie = {
        "result": "success",
        "data": {
            "anon_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
        }
    };
}

$done({body: JSON.stringify(mikephie)});
