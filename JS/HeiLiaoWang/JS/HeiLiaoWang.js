//2026/5/2
var body = $response.body;

if (!body || (body.indexOf('<!doctype') === -1 && body.indexOf('<!DOCTYPE') === -1 && body.indexOf('<html') === -1)) {
  $done({ body: body });
} else {

var css = '<style id="hl-adblock">'
  + '#notice_container,.event-notice,.application-popup,'
  + '.addbox,.download,.infomation,.post-content,'
  + '.list-sec-top,.list-sec,'
  + '#copy-img,'
  + '.slider-banners,'
  + '.footer,'
  + 'iframe[src*="yandex"],iframe[src*="google"],iframe[src*="kwvprfcr"]'
  + '{display:none!important;height:0!important;overflow:hidden!important;opacity:0!important}'
  + '.video-item:has(a.gotoclick),'
  + '.video-item:has(a.tjtagmanager),'
  + '.video-item:has(a[adv_id])'
  + '{display:none!important;height:0!important}'
  + '</style>';

var js = '<script id="hl-adblock-js">'
  + '!function(){'
  + 'function isAdItem(e){'
  + 'var a=e.querySelector("a");'
  + 'if(a&&(a.classList.contains("gotoclick")||a.classList.contains("tjtagmanager")||a.hasAttribute("adv_id")))return true;'
  + 'var t=e.querySelector("h2.title,div.title");'
  + 'if(t&&!t.textContent.trim())return true;'
  + 'return false}'
  + 'function clean(){'
  + 'document.querySelectorAll(".video-item").forEach(function(e){if(isAdItem(e))e.remove()});'
  + '["notice_container"].forEach(function(i){var e=document.getElementById(i);if(e)e.remove()});'
  + '[".application-popup",".event-notice",".addbox",".download",".infomation",".post-content",'
  + '".list-sec-top",".list-sec","#copy-img",".slider-banners",".footer"]'
  + '.forEach(function(s){document.querySelectorAll(s).forEach(function(e){e.remove()})});'
  + 'document.querySelectorAll("script").forEach(function(s){'
  + 'var r=s.getAttribute("src")||"";'
  + 'if(r.indexOf("stats.kwvprfcr.xyz")>-1||r.indexOf("yandex.ru")>-1||r.indexOf("googletagmanager.com")>-1||r.indexOf("gtag/js")>-1||r.indexOf("cghhqca.cc")>-1||r.indexOf("cloudflareinsights.com")>-1||r.indexOf("shuifeng.cc")>-1||r.indexOf("zyudkkup.com")>-1)s.remove()});'
  + 'try{window.plausible=function(){};window.gtag=function(){};window.ym=function(){};window.dataLayer=[];window.tjDataLayer=[];window.tjtag=function(){};window.tjtag2=function(){}}catch(e){}'
  + '}'
  + 'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",clean);else clean();'
  + 'setTimeout(clean,1500);setTimeout(clean,4000);setTimeout(clean,8000)'
  + '}();'
  + '<\/script>';

body = body.replace('</head>', css + '</head>');
body = body.replace('</body>', js + '</body>');

body = body.replace(/<script[^>]+stats\.kwvprfcr\.xyz[^>]*><\/script>/gi, '');
body = body.replace(/<script[^>]+yandex\.ru\/metrika[^>]*><\/script>/gi, '');
body = body.replace(/<script[^>]+googletagmanager\.com\/gtag[^>]*><\/script>/gi, '');
body = body.replace(/<script[^>]+cloudflareinsights\.com[^>]*><\/script>/gi, '');
body = body.replace(/<script[^>]+shuifeng\.cc[^>]*><\/script>/gi, '');
body = body.replace(/<script[^>]+zyudkkup\.com[^>]*><\/script>/gi, '');

$done({ body: body });
}
