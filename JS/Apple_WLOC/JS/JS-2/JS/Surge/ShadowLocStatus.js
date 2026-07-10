
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
  const enabled = SL_read("shadowloc.enabled", SL_read("wloc.enabled", "0"));
  const latitude = SL_read("shadowloc.latitude", SL_read("wloc.latitude", SL_read("wloc.lat", "")));
  const longitude = SL_read("shadowloc.longitude", SL_read("wloc.longitude", SL_read("wloc.lng", SL_read("wloc.lon", ""))));
  const accuracy = SL_read("shadowloc.accuracy", SL_read("wloc.accuracy", ""));
  const target = SL_read("shadowloc.target", SL_read("wloc.target", ""));
  const zoom = SL_read("shadowloc.zoom", "");
  const updatedAt = SL_read("shadowloc.updatedAt", "");

  SL_done({
    ok: true,
    mode: "script-storage",
    version: "3.1.0",
    enabled: enabled === "1",
    message: enabled === "1" && latitude && longitude ? "脚本传入已开启" : "脚本传入未开启或未保存坐标",
    latitude,
    longitude,
    accuracy,
    zoom,
    target,
    updatedAt
  }, 200);
})();