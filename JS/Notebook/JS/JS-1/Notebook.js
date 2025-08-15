/*******************************    
        ➪：脚本名称: Notebook （永久会员）

        ★：解锁永久🆅🅸🅿

        𖣘： 🅜ⓘ🅚ⓔ🅟ⓗ🅘ⓔ

*******************************

[Script]
# VIP 订阅 & 多项权益
^https:\/\/notebook\.zoho\.com\/api\/v1\/userprofile\/accounts\/payment\?action=(get_current_plan_detail|get_feature_template)(&include_expired_plans=true|&include_purchase_platform=false|&platform=ios)? url script-response-body https://raw.githubusercontent.com/Mikephie/Script/main/qx/notetest.js


[MITM]
hostname = notebook.zoho.com

*******************************/


var url = $request.url;

if (url.indexOf('get_current_plan_detail') !== -1) {
    // VIP 订阅 (包括 notebook-subs 和 notebookMac1)
    let response = JSON.parse($response.body);

    if (!response.plan_details || response.plan_details.length === 0) {
        response.plan_details = [{}];
    }

    let plan = response.plan_details[0];
    plan.expiry_time = 3742762088000;
    plan.purchase_source = "notebook";
    plan.service_id = "107000";
    plan.source = "PAID";
    plan.plan_name = "Notebook Pro";
    plan.payment_frequency = 12;
    plan.grace_period = 999160000000;
    plan.notebook_plan_id = "com.zoho.notebook.pro";
    plan.plan_description = "Upgrade to Notebook Pro and stay more productive";
    plan.zoho_store_plan_id = 107102;
    plan.purchase_time = 1717644792301;

    $done({ body: JSON.stringify(response) });

} else if (url.indexOf('get_feature_template') !== -1) {
    // VIP 多项权益 (包括 notebook-all 和 notebookMac2)
    function createFeature(feature_name, feature_id, supported_platforms = ["android", "ios", "macos"], limits = null, source = "PAID") {
        let feature = {
            feature_name: feature_name,
            feature_id: feature_id,
            supported_platforms: supported_platforms,
            feature_meta_data: [
                {
                    end_date: 3742762088000,
                    grace_period: 999160000000,
                    source: source,
                    type: "PRIMARY",
                    start_date: 1717644792301
                }
            ]
        };
        if (limits) {
            feature.feature_meta_data[0].limits = limits;
        }
        return feature;
    }

    var mikephie = {
        code: 200,
        status: "Success",
        message: "User profile fetched successfully",
        feature_template: [
            createFeature("AUDIO_CARD", "com.zoho.notebook.audiocard", ["android", "ios"], [
                { value: "60", applied_for: "NOTE", name: "DURATION", unit: "MINUTES" }
            ]),
            createFeature("OCR", "com.zoho.notebook.ocr"),
            createFeature("CHAT_WITH_US", "com.zoho.notebook.support.chat"),
            createFeature("FLIGHT_CARD", "com.zoho.notebook.flight_card"),
            createFeature("EMAIL_IN", "com.zoho.notebook.email_in"),
            createFeature("CUSTOM_RECURRING_REMINDER", "com.zoho.notebook.reminder.custom"),
            createFeature("PREMIUM_COVERS", "com.zoho.notebook.covers.premium"),
            createFeature("NOTECARD", "com.zoho.notebook.notecard", ["android", "ios", "macos"], [
                { value: "100", applied_for: "NOTE", name: "VERSIONS", unit: "RESOURCES" },
                { value: "209715200", applied_for: "NOTE", name: "MAX_SIZE", unit: "BYTES" },
                { value: "1073741824", applied_for: "NOTE", name: "MAX_FILE_SIZE", unit: "BYTES" }
            ]),
            createFeature("STORAGE", "com.zoho.notebook.storage", ["android", "ios"], [
                { value: "107374182400", name: "MAX_SIZE", unit: "BYTES", user_type: "INDIVIDUAL_USER" }
            ]),
            createFeature("PHONE_SUPPORT", "com.zoho.notebook.support.phone_call"),
            createFeature("NOTEBOOK_SHARING", "com.zoho.notebook.sharing", ["android", "ios"], [
                { value: "CO_OWNER", applied_for: "NOTEBOOK", name: "PERMISSION", unit: "STRING" },
                { value: "WRITE_DELETE", applied_for: "NOTEBOARD", name: "PERMISSION", unit: "STRING" }
            ]),
            createFeature("SCAN_TABLE", "com.zoho.notebook.table.scan"),
            createFeature("TAG_SUGGESTIONS", "com.zoho.notebook.tags.suggestions"),
            createFeature("EXPORT_AS_PDF", "com.zoho.notebook.notecard.export_as_pdf", ["android", "ios", "macos", "windows"], null, "FREE"),
            createFeature("BCR", "com.zoho.notebook.bcr", ["android", "ios"]),
            createFeature("SMART_SEARCH", "com.zoho.notebook.search.smart_search"),
            createFeature("FEATURE_X", "com.zoho.notebook.feature_x", ["ios", "macos", "windows"], null, "FREE")
        ]
    };

    $done({ body: JSON.stringify(mikephie) });

} else {
    $done({});
}
