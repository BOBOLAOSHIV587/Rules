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
    mode: SL_isQX() ? "QuantumultX-$prefs" : "script-storage",
    version: "4.0.0",
    message: SL_isQX() ? "已清除位置并关闭传入，脚本不生效" : "已清除脚本坐标并关闭传入，脚本不生效",
    enabled: false,
    latitude: "",
    longitude: "",
    accuracy: "",
    zoom: "",
    target: "",
    updatedAt,
    writeStatus
  }, 200);
})();