
const isPanel = () => typeof $input != 'undefined' && $input.purpose === 'panel'
const isRequest = () => typeof $request !== 'undefined'

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
}

if (/^\d+$/.test(arg?.TIMEOUT)) {
  console.log(`超时参数 ${arg?.TIMEOUT} 秒`)
  setTimeout(() => {
    console.log(`超时 ${arg?.TIMEOUT - 1}`)
    $done({
      response: {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `超时 ${arg?.TIMEOUT - 1} 秒` }),
      },
    })
  }, (arg?.TIMEOUT - 1) * 1000)
}

let DISMISS = 0
if (/^\d+$/.test(arg?.DISMISS)) {
  DISMISS = parseInt(arg?.DISMISS, 10)
}

let result = {}
!(async () => {
  if (isPanel()) {
    // console.log($input)
    // console.log($trigger)
    if ($trigger === 'button') {
      const { requests = [] } = (await httpAPI('/v1/requests/active', 'GET')) || {}
      // console.log(requests.map(i => i.URL))
      // for await (const { id } of requests) {
      //   // console.log(id)
      //   const res = await httpAPI('/v1/requests/kill', 'POST', { id })
      //   // console.log(res)
      // }
      await kill()
      $notification.post('面板触发', '打断请求', `🅰 活跃请求数: ${requests.length}`, { 'auto-dismiss': DISMISS })
    }
    // await delay(1000)
    const { requests = [] } = (await httpAPI('/v1/requests/active', 'GET')) || {}
    // console.log(requests.map(i => i.URL))
    result = { title: `活跃请求数: ${requests.length}`, content: '点击一键打断', ...arg }
  } else if (isRequest()) {
    const params = parseQueryString($request.url)
    if (params?.REQ_RULE) {
      const { requests = [] } = (await httpAPI('/v1/requests/active', 'GET')) || {}
      let count = 0
      for await (const { id, rule, url, URL } of requests) {
        const re = new RegExp(params?.REQ_RULE)
        if (re.test(rule)) {
          console.log(`🅁 ${url || URL}, ${rule} 匹配规则 ${params?.REQ_RULE}`)
          count++
          await httpAPI('/v1/requests/kill', 'POST', { id })
        }
      }
      if (arg?.REQ_NOTIFY == 1) {
        $notification.post('请求触发', '', `🅰 活跃请求数: ${requests.length}\n🅂 打断请求数: ${count}`, { 'auto-dismiss': DISMISS })
      }
      result = {
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count, rule: params?.REQ_RULE }),
        },
      }
    } else {
      const { requests = [] } = (await httpAPI('/v1/requests/active', 'GET')) || {}
      await kill()
      if (arg?.REQ_NOTIFY == 1) {
        $notification.post('请求触发', '打断请求', `🅰 活跃请求数: ${requests.length}`, { 'auto-dismiss': DISMISS })
      }
      result = {
        response: {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
          body: `<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script>
          window.onload = () => {
            const btn = document.getElementById("btn");
            btn.disabled = true;
            btn.innerHTML = "刷新中...";
            setTimeout(function() {
              btn.disabled = false;
              btn.innerHTML = "刷新";
            }, 1000);
          }
      </script></head><body><h1>找到 ${requests.length} 个活跃请求</h1><h2>已尝试打断</h2><button id="btn" onclick="location.reload()">刷新</button></body></html>`,
        },
      }
    }
  } else if (arg?.TYPE == 'CRON' && arg?.CRON_RULE) {
    const { requests = [] } = (await httpAPI('/v1/requests/active', 'GET')) || {}
    let count = 0
    for await (const { id, rule, url, URL } of requests) {
      const re = new RegExp(arg?.CRON_RULE)
      if (re.test(rule)) {
        console.log(`🅁 ${url || URL}, ${rule} 匹配规则 ${arg?.CRON_RULE}`)
        count++
        await httpAPI('/v1/requests/kill', 'POST', { id })
      }
    }
    if (arg?.CRON_NOTIFY == 1) {
      $notification.post('定时任务', '', `🅰 活跃请求数: ${requests.length}\n🅂 打断请求数: ${count}`, { 'auto-dismiss': DISMISS })
    }
  } else {
    // console.log(JSON.stringify($network, null, 2))
    let wifi = $network.wifi && $network.wifi.bssid
    if (wifi) {
      // console.log(`现在有 wifi`)
      $persistentStore.write(wifi, 'last_network')
    } else {
      // console.log(`现在无 wifi`)
      wifi = $persistentStore.read('last_network')
      // console.log(`但是之前有 wifi`)
      if (wifi) {
        const { requests = [] } = (await httpAPI('/v1/requests/active', 'GET')) || {}
        // for await (const { id } of requests) {
        //   // console.log(id)
        //   const res = await httpAPI('/v1/requests/kill', 'POST', { id })
        //   // console.log(res)
        // }
        await kill()
        if (arg?.EVENT_NOTIFY == 1) {
          $notification.post('网络变化', '打断请求', `🅰 活跃请求数: ${requests.length}`, { 'auto-dismiss': DISMISS })
        }
      }
      $persistentStore.write('', 'last_network')
    }
  }
})()
  .catch(e => {
    console.log(e)
    const msg = `${e.message || e}`
    if (isPanel()) {
      result = { title: '❌', content: msg, ...arg }
    } else if (isRequest()) {
      result = {
        response: {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: msg }),
        },
      }
    } else {
      $notification.post('网络变化', `❌ 打断请求`, msg, { 'auto-dismiss': DISMISS })
    }
  })
  .finally(() => $done(result))

async function kill() {
  await httpAPI('/v1/dns/flush', 'POST')
  // 原本出站规则
  const beforeMode = (await httpAPI('/v1/outbound', 'GET')).mode
  console.log(`当前出站规则: ${beforeMode}`)
  const newMode = { direct: 'proxy', proxy: 'direct', rule: 'proxy' }
  // 切换出站利用surge杀死所有活跃连接
  console.log(`切换出站: ${newMode[beforeMode]}`)
  await httpAPI('/v1/outbound', 'POST', { mode: `${newMode[beforeMode]}` })
  await httpAPI('/v1/outbound', 'POST', { mode: `${newMode[newMode[beforeMode]]}` })
  console.log(`切换出站: ${newMode[newMode[beforeMode]]}`)
  // 切换原本出站规则
  console.log(`切换原本出站: ${beforeMode}`)
  await httpAPI('/v1/outbound', 'POST', { mode: `${beforeMode}` })
  if ((await httpAPI('/v1/outbound', 'GET')).mode != beforeMode) {
    console.log(`再切一次: ${beforeMode}`)
    await httpAPI('/v1/outbound', 'POST', { mode: `${beforeMode}` })
  }
}
function httpAPI(path = '', method = 'POST', body = null) {
  return new Promise(resolve => {
    $httpAPI(method, path, body, result => {
      resolve(result)
    })
  })
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
// 参数 与其他脚本逻辑一致
function parseQueryString(url) {
  const queryString = url.split('?')[1] // 获取查询字符串部分
  const regex = /([^=&]+)=([^&]*)/g // 匹配键值对的正则表达式
  const params = {}
  let match

  while ((match = regex.exec(queryString))) {
    const key = decodeURIComponent(match[1]) // 解码键
    const value = decodeURIComponent(match[2]) // 解码值
    params[key] = value // 将键值对添加到对象中
  }

  return params
}
