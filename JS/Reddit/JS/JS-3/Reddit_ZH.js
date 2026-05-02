let headers = $request.headers;

// 删除原有的请求头 (兼容不同大小写情况)
delete headers['x-reddit-translations'];
delete headers['X-Reddit-Translations'];

// 注入自动翻译请求头
headers['x-reddit-translations'] = 'enabled, seo, zh-hans';

$done({ headers });