/**
允许引用Github私有仓库/gist中的订阅分流，重写，脚本等配置文件。QX专用版
修改自：@author: Peng-YM (原版支持surge和loon) 原版地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Rewrites/GithubPrivate/github-private-repo.js
制作:dcpeng

🛎[配置说明]
0️⃣ 
1. 使用QX重写:
https://raw.githubusercontent.com/dcpengx/QuantumultX/main/rewrite/github-private-repo.conf
1️⃣ 登陆Github > 点击头像下拉菜单 > 选择Settings > 左边菜单栏选择最后一个Developer settings > 选择Personal access tokens > Generate new token > Note里面填写token名字 > ☑️下面的勾选框选择第一项repo打钩（所有子项目自动勾选）> 点击Generate token按钮保存并返回。
（如已有repo权限的token，可直接使用已有的token)
2️⃣ 在BoxJS里面填入用户名（打开Github，浏览器地址栏应该会显示https://github.com/这里是你的用户名/）和上面的token。
可直接使用Peng-YM大佬的boxjs订阅：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/box.js.json
或使用我的boxjs订阅：https://github.com/dcpengx/QuantumultX/blob/main/dcpeng_boxjs.json

*/

// 如果不使用BoxJS配置，可以在这里修改
let config = {
  username: "Peng-YM", // 用户名
  token: "Your token", // token
};

// load user prefs from box
const boxConfig = $prefs.valueForKey("github_private_repo");
if (boxConfig) {
  config = JSON.parse(boxConfig);
}

const username = $request.url.match(
  /https:\/\/(?:raw|gist)\.githubusercontent\.com\/([^\/]+)\//
)[1];
// rewrite headers for specific user
if (username == config.username) {
  console.log(`ACCESSING PRIVATE REPO: ${$request.url}`);
  $done({ headers: {...$request.headers, Authorization: `token ${config.token}`} });
} else $done({});
