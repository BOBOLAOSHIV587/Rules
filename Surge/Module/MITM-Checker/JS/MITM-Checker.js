!(async () => {
  let result = {};
  try {
    let arg;
    if (typeof $argument != "undefined") {
      arg = Object.fromEntries(
        $argument.split("&").map((item) => item.split("=")),
      );
    }
    if (!(await getMitmStatus())) {
      await enableMitm();
      const enabled = await getMitmStatus();
      if (enabled) {
        if (arg?.notification) {
          $notification.post("MitM Checker", "检测到关闭", "已自动开启");
        } else {
          console.log("MitM Checker: 检测到关闭, 已自动开启");
        }
      } else {
        if (arg?.notification) {
          $notification.post("MitM Checker", "检测到关闭", "自动开启失败");
        } else {
          console.log("MitM Checker: 检测到关闭, 自动开启失败");
        }
      }
      result = { enabled };
    } else {
      result = { enabled: true };
    }
  } catch (e) {
    console.log(e);
  } finally {
    $done(result);
  }
})();

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve) => {
    $httpAPI(method, path, body, (result) => {
      resolve(result);
    });
  });
}

async function getMitmStatus() {
  return (await httpAPI("/v1/features/mitm", "GET"))?.enabled;
}
async function enableMitm() {
  return await httpAPI("/v1/features/mitm", "POST", { enabled: true });
}
