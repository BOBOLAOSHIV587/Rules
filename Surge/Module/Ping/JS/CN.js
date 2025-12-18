// @timestamp thenkey 2023-11-22 22:34:40

let size = 18,
  t = "http://connectivitycheck.platform.hicloud.com/generate_204";
if (typeof $argument !== "undefined" && $argument !== "") {
  const ins = getin("$argument");
  size = ins.Size || size;
  t = ins.cnUrl || t;
}

// function n() {
//   return new Promise((n) => {
//     let e = Date.now();
//     $httpClient.get(t, () => {
//       let t = Date.now();
//       n(t - e);
//     });
//   });
// }

async function n(url) {
  return new Promise((resolve, reject) => {
    let e = Date.now();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject("");
        resolve("2e3");
      }, 1900);
    });
    const reqPromise = new Promise((resolve) => {
      $httpClient.get(url, resolve);
    });
    Promise.race([reqPromise, timeoutPromise])
      .then((i) => {
        resolve(Date.now() - e);
      })
      .catch((error) => {
        reject(error);
        resolve("1e4");
      });
  });
}

function e(t) {
  const n = $persistentStore.read("KEY_CNs"),
    e = (n ? JSON.parse(n) : o(1, size)).concat(t).slice(-size);
  return $persistentStore.write(JSON.stringify(e), "KEY_CNs"), e;
}
function r(t) {
  let n = Math.max(...t),
    e = n;
  n < 50
    ? (e += 50)
    : n < 100
    ? (e += 60)
    : n < 300
    ? (e += 20)
    : n > 300 && (e = 300);
  const r = t
    .map((t) => {
      let n = (t - 10) / (e - 10);
      n > 1 && (n = 1);
      const r = Math.floor(6 * n) + 9601;
      return r > 9607 ? "▇" : r < 9601 ? "▁" : String.fromCharCode(r);
    })
    .join("");
  return r;
}
function o(t, n) {
  return Array(n).fill(t);
}
(async () => {
  let o = [];
  for (let e = 0; e < 2; e++) {
    const e = await n(t),
      r = parseFloat(e);
    o.push(r);
  }
  const c = e(Math.round((o[0] + o[1]) / 2)),
    i = r(c);
  let a = Math.round(c.reduce((t, n) => t + n, 0) / c.length),
    s = `CN: ${a.toString().padEnd(5, " ")} ms\t➟     Ping: ${o}ms`;
  $done({ title: s, content: i });
})();

// prettier-ignore
function getin() {return Object.fromEntries($argument.split("&").map((i) => i.split("=")).map(([k, v]) => [k, decodeURIComponent(v)]));}
