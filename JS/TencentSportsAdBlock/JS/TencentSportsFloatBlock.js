const url = $request.url;

/*
 * 腾讯体育浮层 / 活动弹窗清理脚本。
 *
 * 已确认的处理链路：
 *
 * 1. CoinLayer
 *    “做任务免费看比赛 / 看广告得会员”金币任务会员弹层。
 *    返回 data:null，使 H5 页面不设置 visible=true。
 *
 * 2. GetColumn -> forceNotice
 *    世界杯、赛事 PageCard 强制弹窗。
 *    例如：
 *    “7月5日打响世界杯1/8决赛”
 *    “加拿大 vs 摩洛哥”
 *
 * 3. ColumnWidget
 *    首页悬浮运营入口、活动组件。
 *
 * 4. MatchWidgets
 *    比赛页横幅推广。
 */

/*
 * 金币任务会员弹层：
 * “做任务免费看比赛 / 看广告得会员”
 */
if (
  /^https:\/\/matchweb\.sports\.qq\.com\/trpc\.dorae\.coin\.Coin\/CoinLayer(?:\?.*)?$/.test(
    url
  )
) {
  console.log(
    "TencentSportsFloatBlock: CoinLayer membership task popup blocked."
  );

  $done({
    body: JSON.stringify({
      code: 0,
      data: null,
      traceID: ""
    })
  });
} else if (
  /^https:\/\/sports\.qq\.com\/sapp\/h5msg\.htm(?:\?.*)?$/.test(url)
) {
  /*
   * 通用全屏图片跳转页：
   * 游戏、运营活动等 H5 整屏推广。
   */
  closeH5MessagePopup();
} else {
  try {
    const body = JSON.parse($response.body);
    const data = body?.data;
    let removed = 0;

    /*
     * 比赛页横幅推广。
     */
    if (
      /^https:\/\/app\.sports\.qq\.com\/trpc\.sports_resource\.cgi\.ResourceCGI\/MatchWidgets(?:\?.*)?$/.test(
        url
      )
    ) {
      if (Array.isArray(data?.bannerList)) {
        removed = data.bannerList.length;
        data.bannerList = [];
      }
    }

    /*
     * 首页悬浮运营入口、活动组件。
     */
    else if (
      /^https:\/\/app\.sports\.qq\.com\/vaccess\/trpc\.sports_resource\.cgi\.ResourceCGI\/ColumnWidget(?:\?.*)?$/.test(
        url
      )
    ) {
      const title = data?.jumpData?.param?.title || "";
      const widgetUrl = data?.jumpData?.param?.url || "";

      if (data && (data.img || title || widgetUrl)) {
        body.data = null;
        removed = 1;
      }
    }

    /*
     * 世界杯、赛事栏目 PageCard 强制弹窗。
     *
     * 已实锤接口：
     * app.sports.qq.com/vaccess/trpc.sportsbasic.column.Column/GetColumn
     *
     * 处理内容：
     * 1. 清空 forceNotice，阻止弹窗；
     * 2. 删除与 forceNotice 同 ID 的 newRecommend，
     *    避免首页继续保留同一张赛事推广卡。
     */
    else if (
      /^https:\/\/app\.sports\.qq\.com\/vaccess\/trpc\.sportsbasic\.column\.Column\/GetColumn(?:\?.*)?$/.test(
        url
      )
    ) {
      if (Array.isArray(data?.forceNotice) && data.forceNotice.length > 0) {
        const popupIds = new Set(
          data.forceNotice
            .map((item) => String(item?.id || ""))
            .filter(Boolean)
        );

        removed += data.forceNotice.length;
        data.forceNotice = [];

        if (Array.isArray(data?.newRecommend) && popupIds.size > 0) {
          const beforeCount = data.newRecommend.length;

          data.newRecommend = data.newRecommend.filter(
            (item) => !popupIds.has(String(item?.id || ""))
          );

          removed += beforeCount - data.newRecommend.length;
        }
      }
    }

    console.log(`TencentSportsFloatBlock: removed ${removed} item(s).`);

    $done({
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.log(`TencentSportsFloatBlock error: ${error}`);
    $done({});
  }
}

/*
 * 通用 H5 整屏运营弹窗自动关闭函数。
 */
function closeH5MessagePopup() {
  const closePage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title></title>
</head>
<body>
<script>
(function () {
  function closeNativePage() {
    try {
      var frame = document.createElement("iframe");
      frame.style.cssText =
        "display:none;width:0;height:0;border:0;position:fixed;left:0;top:0;";
      frame.src = "http://sports.qq.com/jsBridge/close?";
      document.documentElement.appendChild(frame);
    } catch (error) {}

    setTimeout(function () {
      try {
        history.back();
      } catch (error) {}
    }, 150);
  }

  closeNativePage();
}());
</script>
</body>
</html>`;

  console.log("TencentSportsFloatBlock: H5 popup closed.");

  $done({
    body: closePage
  });
}
