
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
  const reqURL = SL_url();

  if (!reqURL) {
    SL_done({ ok: false, error: "无法读取请求 URL", version: VERSION }, 400);
    return;
  }

  const u = new URL(reqURL);
  const lat = SL_num(u.searchParams.get("lat"), NaN);
  const lng = SL_num(u.searchParams.get("lng"), NaN);
  const accuracy = SL_num(u.searchParams.get("accuracy"), 25);
  const zoom = SL_num(u.searchParams.get("zoom"), 17);
  const target = (u.searchParams.get("target") || "地图选点").trim();

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180 ||
    (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001)
  ) {
    SL_done({ ok: false, error: "经纬度无效", lat, lng, version: VERSION }, 400);
    return;
  }

  const latitude = lat.toFixed(6);
  const longitude = lng.toFixed(6);
  const accuracyText = String(Math.max(1, Math.round(Number.isFinite(accuracy) ? accuracy : 25)));
  const zoomText = String(Math.max(1, Math.round(Number.isFinite(zoom) ? zoom : 17)));
  const updatedAt = String(Date.now());

  const keys = {
    "shadowloc.enabled": "1",
    "shadowloc.latitude": latitude,
    "shadowloc.longitude": longitude,
    "shadowloc.accuracy": accuracyText,
    "shadowloc.target": target,
    "shadowloc.zoom": zoomText,
    "shadowloc.updatedAt": updatedAt,

    "wloc.enabled": "1",
    "wloc.lat": latitude,
    "wloc.latitude": latitude,
    "wloc.lng": longitude,
    "wloc.lon": longitude,
    "wloc.longitude": longitude,
    "wloc.accuracy": accuracyText,
    "wloc.target": target
  };

  const writeStatus = {};
  for (const k in keys) {
    writeStatus[k] = SL_write(k, keys[k]);
  }

  SL_done({
    ok: true,
    mode: "script-storage",
    version: VERSION,
    message: "脚本传入已开启，坐标已保存到本地持久化存储",
    enabled: true,
    latitude,
    longitude,
    accuracy: accuracyText,
    zoom: zoomText,
    target,
    updatedAt,
    writeStatus
  }, 200);
})();