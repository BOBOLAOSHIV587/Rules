
function SL_read(key, def) {
  try {
    if (typeof $persistentStore !== "undefined" && $persistentStore && typeof $persistentStore.read === "function") {
      const v = $persistentStore.read(key);
      if (v !== null && v !== undefined && String(v).length > 0) return String(v);
    }
  } catch (_) {}

  try {
    if (typeof $prefs !== "undefined" && $prefs && typeof $prefs.valueForKey === "function") {
      const v = $prefs.valueForKey(key);
      if (v !== null && v !== undefined && String(v).length > 0) return String(v);
    }
  } catch (_) {}

  return def;
}

function SL_write(key, value) {
  value = String(value);
  let ok = false;

  try {
    if (typeof $persistentStore !== "undefined" && $persistentStore && typeof $persistentStore.write === "function") {
      ok = !!$persistentStore.write(value, key) || ok;
    }
  } catch (_) {}

  try {
    if (typeof $prefs !== "undefined" && $prefs && typeof $prefs.setValueForKey === "function") {
      ok = !!$prefs.setValueForKey(value, key) || ok;
    }
  } catch (_) {}

  return ok;
}

function SL_done(data, status) {
  if (typeof $done === "function") {
    $done({
      response: {
        status: status || 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "access-control-allow-origin": "*"
        },
        body: JSON.stringify(data, null, 2)
      }
    });
  }
}

function SL_url() {
  try {
    if (typeof $request !== "undefined" && $request && $request.url) return $request.url;
  } catch (_) {}
  return "";
}

function SL_num(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

(function () {
  const VERSION = "3.1.0";
  const updatedAt = String(Date.now());
  const keys = {
    "shadowloc.enabled": "0",
    "shadowloc.latitude": "",
    "shadowloc.longitude": "",
    "shadowloc.accuracy": "",
    "shadowloc.target": "",
    "shadowloc.zoom": "",
    "shadowloc.updatedAt": updatedAt,

    "wloc.enabled": "0",
    "wloc.lat": "",
    "wloc.latitude": "",
    "wloc.lng": "",
    "wloc.lon": "",
    "wloc.longitude": "",
    "wloc.accuracy": "",
    "wloc.target": ""
  };

  const writeStatus = {};
  for (const k in keys) {
    writeStatus[k] = SL_write(k, keys[k]);
  }

  SL_done({
    ok: true,
    mode: "script-storage",
    version: VERSION,
    enabled: false,
    message: "已关闭脚本定位，未传入坐标时 ShadowLocPro 不再修改响应内容",
    latitude: "",
    longitude: "",
    accuracy: "",
    zoom: "",
    target: "",
    updatedAt,
    writeStatus
  }, 200);
})();