function b64urlToB64(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return s;
}

function b64ToB64url(s) {
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function replaceAll(input, from, to) {
  return input.split(from).join(to);
}

let url = $request.url;

try {
  let u = new URL(url);

  if (
    u.hostname === "mobilemaps.googleapis.com" &&
    u.pathname === "/maps/vt/proto" &&
    u.searchParams.has("bpb")
  ) {
    let raw = atob(b64urlToB64(u.searchParams.get("bpb")));

    raw = replaceAll(raw, "\x1a\x02HK", "\x1a\x02CN");

    u.searchParams.set("bpb", b64ToB64url(btoa(raw)));
    url = u.toString();
  }
} catch (e) {
  console.log("Google Maps iOS CN BPB region-only error: " + e);
}

$done({
  url
});
