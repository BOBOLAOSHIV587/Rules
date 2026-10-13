/*
 Discord FakeNitro.display v2.1.0 — 纯手机 Loon 显示层
 拦截:
  1. GET /users/{id}/profile        → premium_type=2, premium_since 注入, NITRO 徽章前插
  2. GET /users/@me/entitlements    → 注入 Nitro PREMIUM_SUBSCRIPTION entitlement
 已知边界: 表情选择器/横幅上传等服务端与 READY 判定不在此列(需 gateway 改写, 见 PC 方案)。
*/
/* ---------- 跨平台兼容层(Loon / Shadowrocket / Surge 通用) ---------- */
function parseArgString(s) {
  var o = {}, parts = String(s).split("&");
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p) continue;
    var eq = p.indexOf("=");
    if (eq < 0) continue;
    var k = p.slice(0, eq), v = p.slice(eq + 1);
    try { k = decodeURIComponent(k); } catch (e) { }
    try { v = decodeURIComponent(v); } catch (e) { }
    /* 只转换布尔;数字一律保持字符串 —— 18 位雪花 ID 转 Number 会丢精度 */
    if (v === "true") v = true; else if (v === "false") v = false;
    o[k] = v;
  }
  return o;
}
/* 只保留真正被读取的两个槽位。历史包袱：这里曾是 ["enabled","feature","user_id"]，
   而 [Argument] 从没声明 feature，规则里只能用 {enabled} 顶位写成 [{enabled},{enabled},{user_id}]，
   Loon 遇到重复占位符会静默跳过整条规则、零日志 —— 显示层因此在真机上从未执行过。 */
var ARG_ORDER=["enabled","user_id","avatar_asset","avatar_sku"];
var _A=(typeof $argument==="undefined")?null:$argument;
if(typeof _A==="string"){
  var _s=_A.replace(/^\s+|\s+$/g,"");
  if(_s.charAt(0)==="{"||_s.charAt(0)==="["){ try{ _A=JSON.parse(_s); }catch(e){ _A=null; } }
  else if(_s.indexOf("=")!==-1){ _A=parseArgString(_s); }
  else { _A=null; }
}
if(Array.isArray(_A)){ var _p={}; for(var _i=0;_i<ARG_ORDER.length;_i++){ _p[ARG_ORDER[_i]]=_A[_i]; } _A=_p; }
if(!_A||typeof _A!=="object") _A={};
function bodyText(b){
  if(b===null||b===undefined) return null;
  if(typeof b==="string") return b;
  try{
    if(b&&typeof b.length==="number"&&typeof b.byteLength==="number"&&typeof b.charCodeAt!=="function"){ var s=""; for(var i=0;i<b.length;i++) s+=String.fromCharCode(b[i]&0xff); try{ return decodeURIComponent(escape(s)); }catch(e2){ return s; } }
    if(b&&typeof b.byteLength==="number"&&b.length===undefined) return bodyText(new Uint8Array(b));
  }catch(e3){}
  try{ return String(b); }catch(e4){ return null; }
}
var ARGS=_A;
function CFGv(k,d){ return ARGS&&ARGS[k]!==undefined&&ARGS[k]!==null&&ARGS[k]!==""?ARGS[k]:d; }
var _EN=CFGv("enabled", true); if(_EN==="false"||_EN===0||_EN==="0") _EN=false;
var USER_ID=String(CFGv("user_id", _A.user_id||""));
var AVATAR_ASSET=String(CFGv("avatar_asset", _A.avatar_asset||""));
var AVATAR_SKU=String(CFGv("avatar_sku", _A.avatar_sku||""));
/* 留空 = 不注入头像框；只填 asset 没填 sku 也不注入（两者必须配对） */
var WANT_AVATAR=(AVATAR_ASSET.length>0 && AVATAR_SKU.length>0);
var DONE=false;
function doneOnce(a){ if(DONE) return; DONE=true; try{$done(a);}catch(e){} }
function log(m){ try{ console.log("[FakeNitro] "+m); }catch(e){} }
function probeLog(m){ try{ console.log("[FakeNitro] hit " + m); }catch(e){} }
probeLog("url=" + ($request?($request.url||""):"?"));

/* 伪装徽章与时间戳: 字段结构取自 645 真会员抓包的真实 badge 条目, 仅本地显示 */
var DEFAULT_SINCE="2024-01-01T00:00:00+00:00";
var FAKE_BADGES=[
  { id:"nitro", description:"Discord Nitro", icon:"a7a36a80e2ebc06eeab8481f30b5d543", link:"https://discord.com/nitro" },
  { id:"premium_tenure_6_month_v2", description:"Discord Nitro", icon:"2895086c18d5531d499862e41d1155a6" },
  { id:"guild_booster_lvl1", description:"Server Booster", icon:"51040c70d4f20a921ad6674ff86fc95c" }
];

/* 本地装饰解锁。字段结构取自 discord-userdoccers 的 user.mdx / collectibles.mdx；
   取值全部来自真实抓包：avatar_decoration / nameplate / profile_effect 是 642 抓包里
   另一位用户已装配的值(该号本身没有 Nitro，说明客户端对"查看者不拥有的装饰"也只渲染、不校验归属)；
   display_name_styles 抓包里全是 null，无真实样本，按文档枚举合成，置信度低于前三项。 */
var FAKE_COSMETICS = {
  nameplate: { asset:"nameplates/orb/infinite_swirl/", palette:"violet", label:"COLLECTIBLES_ORB_INFINITE_SWIRL_NP_A11Y", sku_id:"1427463138646954035", expires_at:null },
  /* 名字颜色取 686 会员号抓包里的真实值, 不再按文档猜 */
  display_name_styles: { font_id:6, effect_id:2, colors:[2797222,16762000] },
  profile_effect: { sku_id:"1427463138634109028", expires_at:null }
};
/* 头像框改为面板参数 avatar_asset + avatar_sku, 默认值是会员号自己的那一件 */
function avatarDecoration(){
  if(!WANT_AVATAR) return null;
  return { asset:AVATAR_ASSET, sku_id:AVATAR_SKU, expires_at:null };
}

var body=bodyText($response?$response.body:null);
var url=$request?($request.url||""):"";
var path=url.split("?")[0];
if(_EN===false||!body){ doneOnce({}); }
else if(/\/api\/v\d+\/users\/[^\/]+\/profile$/i.test(path)){
  try{
    var mId=path.match(/\/users\/([^\/]+)\/profile/i);
    var SELF=USER_ID;
    if(SELF && mId && mId[1]!==SELF){ log("skip other user "+mId[1]); doneOnce({}); }
    var d=JSON.parse(body);
    if(d && typeof d==="object"){
      d.premium_type=2;
      d.premium=true;
      if(!d.premium_since) d.premium_since=DEFAULT_SINCE;
      if(!d.premium_guild_since) d.premium_guild_since=DEFAULT_SINCE;
      if(d.guild_member&&typeof d.guild_member==="object"&&!d.guild_member.premium_since) d.guild_member.premium_since=DEFAULT_SINCE;
      d.badges=d.badges||[];
      for(var bi=FAKE_BADGES.length-1;bi>=0;bi--){
        var fb=FAKE_BADGES[bi];
        var seen=false;
        for(var i=0;i<d.badges.length;i++){ if(d.badges[i]&&d.badges[i].id===fb.id){ seen=true; break; } }
        if(!seen) d.badges.unshift(fb);
      }
      /* 本地装饰解锁：只往已存在的 user / user_profile 里加字段，不新建对象，
         避免因为缺必填字段让客户端解析失败。装饰挂在 user 上，资料特效挂 user_profile 上。 */
      if(d.user&&typeof d.user==="object"){
        var _av=avatarDecoration();
        if(_av&&!d.user.avatar_decoration_data) d.user.avatar_decoration_data=_av;
        if(!d.user.display_name_styles) d.user.display_name_styles=FAKE_COSMETICS.display_name_styles;
        if(!d.user.collectibles||typeof d.user.collectibles!=="object") d.user.collectibles={};
        if(!d.user.collectibles.nameplate) d.user.collectibles.nameplate=FAKE_COSMETICS.nameplate;
      }
      if(d.user_profile&&typeof d.user_profile==="object"){
        if(!d.user_profile.profile_effect) d.user_profile.profile_effect=FAKE_COSMETICS.profile_effect;
        if(!Array.isArray(d.user_profile.collectibles)) d.user_profile.collectibles=[];
        var _hasEff=false;
        for(var ce=0;ce<d.user_profile.collectibles.length;ce++){
          if(d.user_profile.collectibles[ce]&&d.user_profile.collectibles[ce].sku_id===FAKE_COSMETICS.profile_effect.sku_id){ _hasEff=true; break; }
        }
        if(!_hasEff) d.user_profile.collectibles.push({ sku_id:FAKE_COSMETICS.profile_effect.sku_id, type:1, expires_at:null });
      }
      log("profile injected");
      doneOnce({ body: JSON.stringify(d) });
    } else doneOnce({});
  }catch(e){ log("profile parse fail"); doneOnce({}); }
}
else if(/\/api\/v\d+\/users\/@me$/i.test(path)){
  /* PATCH /users/@me:客户端改自己资料时服务端回传完整自助用户对象,
     含 premium_type / avatar_decoration_data / primary_guild / display_name_styles 等。
     历史文档曾说该端点不存在,684 真机抓包里实锤存在(PATCH, 200)。
     注意:这里不过滤 user_id —— /@me 注定是本人。 */
  try{
    var dm=JSON.parse(body);
    if(dm&&typeof dm==="object"){
      dm.premium_type=2;
      dm.premium=true;
      if(!dm.premium_since) dm.premium_since=DEFAULT_SINCE;
      var _av2=avatarDecoration();
      if(_av2&&!dm.avatar_decoration_data) dm.avatar_decoration_data=_av2;
      if(!dm.display_name_styles) dm.display_name_styles=FAKE_COSMETICS.display_name_styles;
      if(!dm.collectibles||typeof dm.collectibles!=="object") dm.collectibles={};
      if(!dm.collectibles.nameplate) dm.collectibles.nameplate=FAKE_COSMETICS.nameplate;
      log("self user injected");
      doneOnce({ body: JSON.stringify(dm) });
    } else doneOnce({});
  }catch(e){ log("self user parse fail"); doneOnce({}); }
}
else if(/\/api\/v\d+\/users\/@me\/entitlements$/i.test(path)){
  try{
    var d2=JSON.parse(body);
    if(Array.isArray(d2)){
      var ent={ id:"999999999999999990", type:2, sku_id:"521842831262875670", application_id:"521842831262875670", user_id:"0", deleted:false, starts_at:null, ends_at:null, gift_code_flags:0 };
      d2.push(ent);
      log("entitlements injected");
      doneOnce({ body: JSON.stringify(d2) });
    } else doneOnce({});
  }catch(e){ doneOnce({}); }
}
else doneOnce({});
