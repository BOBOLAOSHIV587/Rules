// 2025-02-13 00:00:07
!(async () => {
  let timeouts = 5000;
  try {
    let url = typeof $request !== "undefined" && $request.url,
      ms = "1",
      ins;
    const getEnv = () => {
      return "undefined" != typeof Egern
        ? "Egern"
        : "undefined" != typeof $environment && $environment["surge-version"]
        ? "Surge"
        : "undefined" != typeof $environment && $environment["stash-version"]
        ? "Stash"
        : "undefined" != typeof module && module.exports
        ? "Node.js"
        : "undefined" != typeof $task
        ? "Quantumult X"
        : "undefined" != typeof $loon
        ? "Loon"
        : "undefined" != typeof $rocket
        ? "Shadowrocket"
        : void 0;
    };
    if (url && url.includes("?")) {
      ins = Object.fromEntries(
        (url.split("?")[1] || "")
          .split("&")
          .map((i) => i.split("="))
          .map(([k, v]) => [k, decodeURIComponent(v)])
      );
      timeouts = Number(ins.timeout) || 5000;
      if (ins.url != "test") {
        ms = await new Promise((resolve, reject) => {
          let e = Date.now();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject("");
              resolve(timeouts);
            }, timeouts);
          });
          let reqPromise;
          if (getEnv() == "Quantumult X") {
            reqPromise = new Promise((resolve, reject) => {
              $task
                .fetch({
                  url: ins.url,
                  method: "GET",
                })
                .then((response) => {
                  resolve(response);
                })
                .catch((error) => {
                  reject(error);
                  resolve(timeouts);
                });
            });
          } else {
            reqPromise = new Promise((resolve) => {
              $httpClient.get(ins.url, resolve);
            });
          }
          Promise.race([reqPromise, timeoutPromise])
            .then(() => {
              resolve(Date.now() - e);
            })
            .catch((error) => {
              reject(error);
              resolve(timeouts);
            });
        });
      }
    }
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    };
    if (getEnv() == "Quantumult X") {
      $done({
        status: "HTTP/1.1 200 OK",
        headers: headers,
        body: JSON.stringify({
          sp: 1,
          ms: ms,
          app: getEnv(),
          timeouts: timeouts,
        }),
      });
    } else {
      $done({
        response: {
          status: 200,
          headers: headers,
          body: JSON.stringify({
            sp: 1,
            ms: ms,
            app: getEnv(),
            timeouts: timeouts,
          }),
        },
      });
    }
  } catch (e) {
    console.log(e.message);
    throw new Error();
  }
})()
  .catch((e) => {
    console.log(e.message);
  })
  .finally(() => $done());
