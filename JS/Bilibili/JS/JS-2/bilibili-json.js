/**
 * Bilibili JSON ad cleaner for Surge.
 *
 * Local project adaptation by Hey-sayiwanna.
 * Feed/search/live-room handling is derived from BiliUniverse/ADBlock
 * (Apache-2.0). See THIRD_PARTY_NOTICES.md and licenses/.
 *
 * Deliberately does NOT process /x/v2/account/mine, so the bottom
 * navigation (including 会员购) is never removed or rearranged.
 */

const url = new URL($request.url);
let body;

try {
  body = JSON.parse($response.body ?? "{}");
  cleanResponse(url.pathname, body);
  $done({ body: JSON.stringify(body) });
} catch (error) {
  console.log(`[Hey-sayiwanna Bilibili] JSON unchanged: ${error}`);
  $done({});
}

function cleanResponse(path, data) {
  switch (path) {
    case "/x/v2/feed/index":
      cleanFeed(data);
      break;
    case "/x/v2/search/square":
      if (Array.isArray(data?.data)) {
        data.data = data.data.filter((item) => item?.type !== "trending" && !isAd(item));
      }
      break;
    case "/x/resource/top/activity":
      data.data = {};
      break;
    case "/xlive/app-room/v1/index/getInfoByRoom":
    case "/xlive/app-room/v1/index/getInfoByUser":
      cleanLiveRoom(data);
      break;
    case "/xlive/app-interface/v2/index/feed":
      cleanLiveFeed(data?.data);
      break;
    case "/xlive/app-interface/v2/second/getList":
      cleanLiveTab(data?.data);
      break;
  }
}

function cleanFeed(data) {
  if (!Array.isArray(data?.data?.items)) return;

  data.data.items = data.data.items
    .map((item) => {
      if (["banner_v8", "banner_ipad_v8"].includes(item?.card_type) && Array.isArray(item?.banner_item)) {
        item.banner_item = item.banner_item.filter((banner) => !isAd(banner));
      }
      return item;
    })
    .filter((item) => !isAd(item));
}

function cleanLiveRoom(data) {
  const room = data?.data;
  if (!room || typeof room !== "object") return;

  delete room.activity_banner_info;
  delete room.banner_info;
  if (room.shopping_info) room.shopping_info = { is_show: 0 };
  if (Array.isArray(room?.new_tab_info?.outer_list)) {
    room.new_tab_info.outer_list = room.new_tab_info.outer_list.filter((item) => item?.biz_id !== 33 && !isAd(item));
  }
}

function cleanLiveFeed(data) {
  if (!data || typeof data !== "object") return;
  for (const key of ["card_list", "items", "list"]) {
    if (Array.isArray(data[key])) data[key] = data[key].filter((item) => !isAd(item));
  }
  for (const key of ["banner", "banner_list", "activity_banner", "activity_banner_info"]) {
    if (key in data) data[key] = Array.isArray(data[key]) ? [] : null;
  }
}

function cleanLiveTab(data) {
  if (!data || typeof data !== "object") return;
  for (const key of ["banner", "banner_list", "activity_banner", "activity_banner_info"]) {
    if (key in data) data[key] = Array.isArray(data[key]) ? [] : null;
  }
  for (const key of ["card_list", "items", "list"]) {
    if (Array.isArray(data[key])) data[key] = data[key].filter((item) => !isAd(item));
  }
}

function isAd(item) {
  if (!item || typeof item !== "object") return false;
  const cardType = String(item.card_type ?? "").toLowerCase();
  const cardGoto = String(item.card_goto ?? "").toLowerCase();
  const goto = String(item.goto ?? "").toLowerCase();
  const type = String(item.type ?? "").toLowerCase();

  return Boolean(
    item.ad_info ||
      item.cm ||
      item.is_ad === 1 ||
      item.is_ad === true ||
      type === "ad" ||
      goto === "ad" ||
      cardType.startsWith("cm_") ||
      cardType.startsWith("ad_") ||
      cardGoto.startsWith("ad_") ||
      (cardType === "small_cover_v10" && cardGoto === "game")
  );
}
