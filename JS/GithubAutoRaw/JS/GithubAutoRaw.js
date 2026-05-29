/**
 * GitHub Web URL to Raw URL Converter
 * 适配 Loon
 */

const url = $request.url;
// 匹配标准 GitHub 文件浏览链接
// 示例: https://github.com/user/repo/blob/branch/path/to/file
const githubRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;

if (githubRegex.test(url)) {
    const rawUrl = url.replace(githubRegex, 'https://raw.githubusercontent.com/$1/$2/$3/$4');
    
    // 构造 302 重定向响应
    const response = {
        status: 302,
        headers: { 'Location': rawUrl }
    };
    
    // 兼容不同 App 的环境退出方式
    if (typeof $done !== "undefined") {
        $done({ response });
    } else {
        $done({});
    }
} else {
    $done({});
}