/******************************
脚本功能：七猫小说解锁终身VIP + 去除所有广告 + 无限下载权限 + 无限听书权限 + 无限阅读权限
软件版本：5.13
使用声明：⚠️仅供学习交流，🈲️商业用途
*******************************

[rewrite_local]
# > 七猫小说(2022.01.18)
QiMaoXiaoShuo = type=http-response, pattern=^https?:\/\/(api-\w+|xiaoshuo)\.wtzw\.com\/api\/v\d\/, script-path=https://github.com/ifflagged/Darwin/raw/main/Modules/JS/zwf234/qxrules/QiMaoXiaoShuo.js, requires-body=true, max-size=-1, timeout=60

[mitm]
hostname = *.wtzw.com

*******************************/


<!DOCTYPE html>
<html>
  <head>
    <meta content="origin" name="referrer">
    <title>Forbidden &middot; GitHub</title>
    <style type="text/css" media="screen">
      body {
        background-color: #f1f1f1;
        margin: 0;
      }
      body,
      input,
      button {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      }
      .container { margin: 30px auto 40px auto; width: 800px; text-align: center; }
      a { color: #4183c4; text-decoration: none; font-weight: bold; }
      a:hover { text-decoration: underline; }
      h1, h2, h3 { color: #666; }
      ul { list-style: none; padding: 25px 0; }
      li {
        display: inline;
        margin: 10px 50px 10px 0px;
      }
      .logo { display: inline-block; margin-top: 35px; }
      .logo-img-2x { display: none; }
      @media
      only screen and (-webkit-min-device-pixel-ratio: 2),
      only screen and (   min--moz-device-pixel-ratio: 2),
      only screen and (     -o-min-device-pixel-ratio: 2/1),
      only screen and (        min-device-pixel-ratio: 2),
      only screen and (                min-resolution: 192dpi),
      only screen and (                min-resolution: 2dppx) {
        .logo-img-1x { display: none; }
        .logo-img-2x { display: inline-block; }
      }
    </style>
  </head>
  <body>

    <div class="container">
      <h1>Access to this site has been restricted.</h1>

      <p>
        <br>
        If you believe this is an error,
        please contact <a href="https://support.github.com">Support</a>.
      </p>

      <div id="s">
        <a href="https://githubstatus.com">GitHub Status</a> &mdash;
        <a href="https://twitter.com/githubstatus">@githubstatus</a>
      </div>
    </div>
  </body>
</html>
