
let body = $response.body;
const url = $request.url;

if (!body) $done({});

try {
    if (url.indexOf("/flows/users/") !== -1) {
        let obj = JSON.parse(body);
        obj.subscriptions = [
            {
                "subscriptionTypeName": "ad-free",
                "lastUpdatedDate": "2025-12-22T01:16:21Z",
                "creationDate": "2025-12-22T01:16:21Z"
            },
            {
                "subscriptionTypeName": "vpn-free",
                "lastUpdatedDate": "2025-12-22T01:17:30Z",
                "creationDate": "2025-12-22T01:17:30Z"
            }
        ];
        if (obj.user) {
            obj.user.isVip = true;
        } else {
            obj.user = { "isVip": true };
        }
        body = JSON.stringify(obj);
    } 
    else if (url.indexOf("ios-config.php") !== -1) {
        body = body.replace(/<ad[\s\S]*?<\/ad>/g, '');
        body = body.replace(/<video[\s\S]*?<\/video>/g, '<video><![CDATA[{}]]></video>');
        body = body.replace(/vpn="true"/g, 'vpn="false"');
        body = body.replace(/networkStatusEnabled="false"/g, 'networkStatusEnabled="true"');
        body = body.replace(/tributeCount="\d+"/g, 'tributeCount="51"');
        body = body.replace(/tributeProgress="[\d\.]+"/g, 'tributeProgress="100.0"');
        body = body.replace(/multiServer="false"/g, 'multiServer="true"');
    }
} catch (e) {}

$done({ body });
