const url = new URL($request.url);

if (
  (url.hostname === "www.youtube.com" ||
    url.hostname === "m.youtube.com") &&
  url.pathname === "/api/timedtext"
) {
  /*
   * 只添加本项目使用的 Translate 标记。
   *
   * 不删除、不修改 YouTube 原有参数：
   * lang=ko / lang=en
   * kind=asr
   * name=字幕轨道ID
   * tlang
   * signature
   * 以及其他参数
   */
  if (!url.searchParams.has("subtype")) {
    url.searchParams.set("subtype", "Translate");
  }
}

$done({
  url: url.toString(),
  headers: $request.headers
});
