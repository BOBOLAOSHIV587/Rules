// fetch.js
const UA = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Dest": "document",
};
function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Expose-Headers": "*",
    "Access-Control-Max-Age": "86400",
    linkey: "key",
  };
}
function cleanHeaders(headers = {}, origin = "*") {
  const out = {};
  for (const key in headers) {
    const lower = key.toLowerCase();
    if (lower === "content-length" || lower === "content-encoding" || lower === "transfer-encoding" || lower === "connection" || lower.startsWith("access-control-")) {
      continue;
    }
    out[key] = headers[key];
  }
  Object.assign(out, corsHeaders(origin));
  return out;
}
function getQueryParam(name) {
  const match = $request.url.match(new RegExp("[?&]" + name + "=([^&]+)"));
  return match ? decodeURIComponent(match[1]) : null;
}
function parseJSON(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log("JSON Parse Error:", e);
    return null;
  }
}
function finish(status, headers, body) {
  $done({
    response: {
      status,
      headers,
      body,
    },
  });
}
if (($request.method || "").toUpperCase() === "OPTIONS") {
  finish(204, corsHeaders("*"), "");
  return;
}
const target = getQueryParam("url");
const extraHeaders = parseJSON(getQueryParam("linkeyheaders")) || {};
const requestBody = getQueryParam("linkeybody");
function request(url, redirectCount = 0) {
  if (redirectCount >= 9) {
    finish(508, corsHeaders("*"), "Too many redirects");
    return;
  }
  const headers = { ...UA };
  for (const key in extraHeaders) {
    if (key.toLowerCase() === "user-agent") {
      headers["User-Agent"] = extraHeaders[key];
    } else {
      headers[key] = extraHeaders[key];
    }
  }
  const options = {
    url,
    headers,
  };
  if (requestBody != null) {
    options.body = requestBody;
  }
  const method = requestBody != null ? "post" : "get";
  $httpClient[method](options, (err, resp, body) => {
    if (err) {
      finish(500, corsHeaders("*"), String(err));
      return;
    }
    const status = resp.status || resp.statusCode || 200;
    const headers = resp.headers || {};
    const location = headers.location || headers.Location;
    if ([301, 302, 303, 307, 308].includes(status) && location) {
      const nextUrl = location.startsWith("http") ? location : new URL(location, url).href;
      console.log("Redirect:", nextUrl);
      request(nextUrl, redirectCount + 1);
      return;
    }
    finish(status, cleanHeaders(headers), body);
  });
}
if (!target) {
  finish(400, corsHeaders("*"), "missing url parameter");
} else {
  request(target);
}
