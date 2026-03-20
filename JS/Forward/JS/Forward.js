const StatusTexts = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable"
};

const requestUrl = $request.url;
const requestHeaders = $request.headers;
const requestBody = $request.body;

const options = {
  url: "https://mock.forward1.workers.dev/forward/v1/purchase/iap/subscription",
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "X-Auth-Key": requestHeaders["x-auth-key"] || ""
  },
  body: requestBody,
  timeout: 10000
};

$task.fetch(options).then(
  response => {
    $done({
      status: `HTTP/1.1 ${response.statusCode || 200} ${StatusTexts[response.statusCode || 200]}`,
      headers: response.headers || {
        server: "openresty",
        date: new Date().toUTCString(),
        "content-type": "application/json; charset=utf-8",
      },
      body: response.body
    });
  },
  reason => {
    console.log("Request failed:", reason);
    $done({
      status: "HTTP/1.1 500 Internal Server Error",
      headers: {
        server: "openresty",
        date: new Date().toUTCString(),
        "content-type": "application/json; charset=utf-8",
      },
      body: '{"error":"Request failed"}'
    });
  }
);
