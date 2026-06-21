// fetch.js

const MAX_REDIRECT = 8;

const UA = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
  Accept: "*/*",
};

function getUrl() {
  const match = $request.url.match(/[?&]url=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function request(url, count = 0) {
  if (count > MAX_REDIRECT) {
    $done({
      response: {
        status: 508,
        body: "Too many redirects",
      },
    });
    return;
  }

  $httpClient.get(
    {
      url,
      headers: UA,
    },
    (err, resp, body) => {
      if (err) {
        $done({
          response: {
            status: 500,
            body: String(err),
          },
        });
        return;
      }
      let status = resp.status || resp.statusCode;
      let headers = resp.headers || {};
      let location = headers.location || headers.Location;

      if ([301, 302, 303, 307, 308].includes(status) && location) {
        const nextUrl = location.startsWith("http") ? location : new URL(location, url).href;
        console.log(`redirect: ${url} -> ${nextUrl}`);
        request(nextUrl, count + 1);
        return;
      }

      $done({
        response: {
          status,
          headers: {
            ...headers,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
          body,
        },
      });
    },
  );
}

const target = getUrl();

if (!target) {
  $done({
    response: {
      status: 400,
      body: "missing url parameter",
    },
  });
} else {
  request(target);
}
