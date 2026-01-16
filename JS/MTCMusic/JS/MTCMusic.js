// ==UserScript==
// @name         Yandex Music MTS Unlock
// @match        https://api.music.yandex.net/account/mts/status
// @run-at       document-start
// ==/UserScript==

var body = JSON.parse($response.body);

body["result"]["subscription"] = {
    "mcdonalds": false,
    "canStartTrial": false
};

body["result"]["masterhub"] = {
    "activeSubscriptions": [
        {
            "subscriptionId": "1f777aaa-50c6-4711-a209-93a96b10b9bd"
        }
    ],
    "availableSubscriptions": []
};

body["result"]["permissions"] = {
    "until": "2099-05-04T14:07:05+00:00",
    "values": [
        "landing-play",
        "feed-play",
        "radio-play",
        "mix-play",
        "radio-skips",
        "library-cache",
        "library-play",
        "high-quality",
        "ads-skips",
        "non-shuffled-play",
        "background-play",
        "play-premium-tracks",
        "auto-flow",
        "play-full-tracks",
        "play-radio-full-tracks"
    ],
    "default": [
        "landing-play",
        "feed-play",
        "mix-play"
    ]
};

$done({ body: JSON.stringify(body) });