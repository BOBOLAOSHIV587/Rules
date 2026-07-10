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

function SL_isQX() {
  try {
    return (typeof $prefs !== "undefined" && $prefs && typeof $prefs.valueForKey === "function");
  } catch (_) {}
  return false;
}

function SL_done(data, status) {
  if (typeof $done !== "function") return;

  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  };
  const body = JSON.stringify(data, null, 2);
  const code = status || 200;

  // Quantumult X 的 script-response-body 使用顶层 headers/body，不能只放 response 包裹里。
  if (SL_isQX()) {
    $done({ status: code, headers, body });
    return;
  }

  // Surge / Loon 保持原 response 结构，避免影响原有规则。
  $done({
    response: {
      status: code,
      headers,
      body
    }
  });
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
  const enabledText = SL_read("shadowloc.enabled", SL_read("wloc.enabled", "0"));
  const enabled = /^(1|true|yes|on)$/i.test(String(enabledText || "").trim());
  const latitude = SL_read("shadowloc.latitude", SL_read("wloc.latitude", SL_read("wloc.lat", "")));
  const longitude = SL_read("shadowloc.longitude", SL_read("wloc.longitude", SL_read("wloc.lng", SL_read("wloc.lon", ""))));
  const accuracy = SL_read("shadowloc.accuracy", SL_read("wloc.accuracy", ""));
  const target = SL_read("shadowloc.target", SL_read("wloc.target", ""));
  const zoom = SL_read("shadowloc.zoom", "");
  const updatedAt = SL_read("shadowloc.updatedAt", "");

  const latNum = Number(latitude);
  const lngNum = Number(longitude);
  const hasValidLocation =
    enabled &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    Math.abs(latNum) <= 90 &&
    Math.abs(lngNum) <= 180 &&
    !(Math.abs(latNum) < 0.000001 && Math.abs(lngNum) < 0.000001);

  SL_done({
    ok: true,
    mode: SL_isQX() ? "QuantumultX-$prefs" : "script-storage",
    version: "4.0.0",
    message: hasValidLocation ? "脚本已开启，已读取有效位置" : "脚本未生效：未开启或未保存有效位置",
    enabled,
    hasValidLocation,
    latitude,
    longitude,
    accuracy,
    zoom,
    target,
    updatedAt
  }, 200);
})();