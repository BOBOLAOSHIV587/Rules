/*
 *
 *
# 个人备用
# 脚本功能：拦截100解锁超级会员
# 软件版本：3.0.2【最高支持版本】
# 下载地址：http://t.cn/A6MLFAJf
# 原脚本作者：Hausd0rff、ycq007
# 脚本作者：BOBOLAOSHIV587
# 更新时间：2022-02-15
*******************************

[rewrite_local]

# > 拦截100解锁超级会员
^https?:\/\/tagit\.hyhuo\.com\/cypt\/block100\/get_vip_info$ url script-response-body https://raw.githubusercontent.com/BOBOLAOSHIV587/Rules/main/JS/Block100/JS/Block100SVIPCrack.js

[mitm] 

hostname = tagit.hyhuo.com
*
*
*/


var body = $response.body;
body = "lvCQG8cCxqficLk+LttK+L2YRSLM39a3jj+Mfoba4wNaV8x54RYUAWrJvcwwFZemFEWG5xK2FlI8k2hlHsSW7uaAeW45GPxSPt1uvVwPI5zLiMJuHvGycPsqS+ozuIELZnJYBJk2unXdxQCbEof4Rmgo3m7O+4ByRFtdbPMM/COhtxmSVeHXnNcSfVlkALSnTyKl0xORwbczE2UdkNg/uioD0AtxIrGJ4jaUVNVKvJsibH0dOKL/bljPSrG31RQt";
$done({ 
    body 
});
