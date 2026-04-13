/**
 * YouTube 强制简体中文字幕
 * 请求头脚本 - 通用版
 * 支持平台：Surge / QuantumultX
 */

var headers = Object.assign({}, $request.headers);
delete headers['Cookie'];
delete headers['cookie'];
$done({ headers: headers });
