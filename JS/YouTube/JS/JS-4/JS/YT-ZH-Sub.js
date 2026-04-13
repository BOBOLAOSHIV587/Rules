/**
 * YouTube 强制简体中文字幕
 * 响应体脚本 - 通用版
 * 支持平台：Surge / QuantumultX
 */

const TAG = '[YT-ZH-Sub]';

(function () {
    var url = $request.url;

    // 已是中文或递归请求，跳过
    if (/[?&]tlang=zh/.test(url) || /[?&]lang=zh/.test(url) || /[?&]_ytzhsub=1/.test(url)) {
        console.log(TAG + ' already zh or recursive, skip');
        $done({});
        return;
    }

    var zhUrl = url + '&tlang=zh-Hans&_ytzhsub=1';

    // 清理请求头
    var headers = {};
    if ($request.headers) {
        Object.keys($request.headers).forEach(function (k) {
            if (k.toLowerCase() !== 'host') {
                headers[k] = $request.headers[k];
            }
        });
    }
    delete headers['Cookie'];
    delete headers['cookie'];

    console.log(TAG + ' fetching: ' + zhUrl.substring(0, 120));

    // 平台检测：QX 使用 $task.fetch，Surge/Loon/Stash 使用 $httpClient
    var isQX = typeof $task !== 'undefined';

    function onSuccess(body, status) {
        console.log(TAG + ' status=' + status + ' bodyLen=' + (body ? body.length : 0));
        if (status === 200 && body && body.length > 100) {
            console.log(TAG + ' replaced with zh subtitle');
            $done({ body: body });
        } else {
            console.log(TAG + ' fetch failed, keep original');
            $done({});
        }
    }

    function onError(err) {
        console.log(TAG + ' error: ' + (err.error || err.message || JSON.stringify(err)));
        $done({});
    }

    if (isQX) {
        // QuantumultX
        $task.fetch({ url: zhUrl, method: 'GET', headers: headers }).then(
            function (resp) {
                onSuccess(resp.body, resp.statusCode || resp.status || 0);
            },
            onError
        );
    } else {
        // Surge / Loon / Stash
        $httpClient.get({ url: zhUrl, headers: headers }, function (err, resp, body) {
            if (err) { onError(err); return; }
            onSuccess(body, resp.status);
        });
    }
})();
