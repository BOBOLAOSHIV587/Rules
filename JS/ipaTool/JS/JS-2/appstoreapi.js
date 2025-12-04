// 模块导入工具类
class $ {
  static async imports(...input) {
    return await Promise.all(input.map(i => this.import(...i)));
  }

  static async import(...args) {
    const url = this.#cdn(args.pop());
    const rule = args[0];

    try {
      const module = await import(url);
      const exp = "default" in module ? module.default : module;
      const expName = typeof exp.name === "string" ? exp.name : "default";
      this.#mountFunction(rule, exp, expName);
      console.log(`✅ ${url} 加载成功`);
    } catch (error) {
      console.log(`❌ 模块加载失败: ${url}`, error);
      throw error;
    }
  }
  static #cdn(path) {
    const { host } = new URL(path);
    if (!host.includes("github")) return path;
    return path
      .replace(host, `fastly.jsdelivr.net/gh`)
      .replace(/refs.+(?=main)/, "")
      .replace(/\/blob\//, "@")
      .replace(/\/main/, "@main")
      .replace(/\/master/, "@master");
  }
  static #mountFunction(rule, exp, expName, depth = 0) {
    if (typeof exp === "object" && depth === 0) {
      if (typeof rule === "string" && rule.includes("* as"))
        return (this[rule.split(" ").at(-1)] = exp);
      Object.entries(exp).forEach(([k, v]) => {
        this.#mountFunction(rule, v, k, depth + 1);
      });
    } else if (!rule) {
      this[expName] = exp;
    } else if (typeof rule === "string") {
      this[rule.split(" ").at(-1)] = exp;
    } else if (typeof rule === "function") {
      const result = rule({ name: expName, fn: exp });
      result.stop || (this[result.name ?? expName] = result.fn ?? exp);
    } else if (Array.isArray(rule)) {
      rule.forEach(n => {
        if (n.includes(expName)) this[n.split(" ").at(-1)] = exp;
      });
    }
  }
}
// LRU缓存类
class LRUCache {
  #cache;
  constructor(capacity, cache) {
    this.capacity = capacity;
    this.#cache = new Map(cache || []);
  }
  has(key) { return this.#cache.has(key); }
  get(key) {
    if (!this.#cache.has(key)) return;
    const value = this.#cache.get(key);
    this.#cache.delete(key);
    this.#cache.set(key, value);
    return value;
  }
  put(key, value) {
    if (this.#cache.has(key)) this.#cache.delete(key);
    else if (this.#cache.size >= this.capacity) this.#cache.delete(this.#cache.keys().next().value);
    this.#cache.set(key, value);
  }
  toArray() { return Array.from(this.#cache.entries()); }
}
// 自定义错误类（挂载状态码）
class CustomError extends Error {
  constructor(...args) {
    super(args.pop());
    this.name = args[0] || "Error";
    this.statusCode = args[1] || 500;
  }
}
// 生成虚拟GUID
const getMAc = key => {
  const generateHexPair = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  let uniqueId = $.cache ? $.cache.get(key) : null;
  if (!uniqueId) {
    uniqueId = Array.from({ length: 6 }, generateHexPair).join("").toUpperCase();
    $.cache && $.cache.set(key, uniqueId);
  }
  return uniqueId;
};
// 共享状态
const sharedState = {
  GUID: "AppleMac",
  LOGIN_KEY: "AppleLogin",
  VERSION_KEY: "AppVersions",
  MAX_APP_CACHE: 50,
  CONCURRENCY_CONFIG: { concurrencyLimit: 5, maxRetry: 2, waitTime: 0.5 }
};

// 第三方版本服务
const ThirdPartyService = class {
  static get type() { throw new CustomError("ServiceError", 500, "子类需实现type属性"); }
  static getAvailableInterfaces(limit = Number.MAX_SAFE_INTEGER) {
    const methods = Object.getOwnPropertyNames(this);
    const excludeMethod = `_getApp${this.type}List`;
    const regex = new RegExp(`^_get(.+)${this.type}$`);
    return methods.flatMap(method => {
      if (method.startsWith("_get") && method.endsWith(this.type) && method !== excludeMethod) {
        return method.replace(regex, "$1");
      }
      return [];
    }).slice(0, limit);
  }
  static async searchInterface(selset, ...args) {
    const methodName = `_get${selset.charAt(0).toUpperCase() + selset.slice(1)}${this.type}`;
    if (this[methodName]) return await this[methodName](...args);
    throw new CustomError("ServiceError", 500, `第三方接口 ${selset} 未实现`);
  }
  static async _fetchThirdPartyData(req, id, dataExtractor) {
    try {
      const { body } = await ($.http ? $.http(req, 8) : Promise.reject("$.http 未加载"));
      const data = dataExtractor(body);
      return { appId: id, data, total: data.length };
    } catch (error) {
      throw new CustomError("ServiceError", 500, `${req?.url ?? req} 请求失败: ${error.message}`);
    }
  }
};
const VersionService = class extends ThirdPartyService {
  static type = "Versions";
  static async getAppVersionList(id, selset) { return await this.searchInterface(selset, id); }
  static async concurrentGetVersionList(id, num = Number.MAX_SAFE_INTEGER) {
    const availableInterfaces = this.getAvailableInterfaces(num);
    if (availableInterfaces.length === 0) throw new CustomError("ServiceError", 500, "无可用版本接口");
    return Promise.any(availableInterfaces.map(interfaceName => this.getAppVersionList(id, interfaceName)));
  }
  static async _getTimbrdVersions(id) {
    const url = `https://api.timbrd.com/apple/app-version/index.php?id=${id}`;
    return this._fetchThirdPartyData(url, id, body => JSON.parse(body).reverse().map(({ external_identifier, bundle_version }) => [external_identifier, bundle_version]));
  }
  static async _getBilinVersions(id) {
    const url = `https://apis.bilin.eu.org/history/${id}`;
    return this._fetchThirdPartyData(url, id, body => {
      const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      return parsedBody.data.map(({ external_identifier, bundle_version }) => [external_identifier, bundle_version]);
    });
  }
};

// 认证服务
const AuthService = class {
  static async #login({ appleId, password, code }) {
    if (!$.http || !$.plist) throw new CustomError("ServiceError", 500, "依赖模块（http/plist）未加载");
    const dataJson = {
      attempt: code ? 2 : 4, createSession: "true", guid: getMAc(sharedState.GUID),
      rmp: 0, why: "signIn", appleId, password: `${password}${code ?? ""}`
    };
    const body = $.plist.build(dataJson);
    const url = `https://auth.itunes.apple.com/auth/v1/native/fast?guid=${dataJson.guid}`;
    const resp = await $.http.post({ url, body, timeout: 6 });
    const parsedResp = $.plist.parse(resp.body);
    this.validate(parsedResp);
    const cacheLoginResp = $.cache ? JSON.parse($.cache.get(sharedState.LOGIN_KEY) || "{}") : {};
    const { "set-cookie": Cookie } = resp.headers || {};
    const storeFront = resp.headers?.["x-set-apple-store-front"]?.split("-")?.[0];
    Object.assign(cacheLoginResp, parsedResp, { password, Cookie, storeFront });
    $.cache && $.cache.setJson(sharedState.LOGIN_KEY, cacheLoginResp);
    return { ...parsedResp, storeFront };
  }
  static async login(op) {
    const loginResp = $.cache ? JSON.parse($.cache.get(sharedState.LOGIN_KEY) || null) : null;
    if (op && !loginResp) return await this.#login(op);
    if (op && op.appleId !== loginResp?.accountInfo?.appleId) {
      $.cache && $.cache.remove(sharedState.LOGIN_KEY);
      return await this.#login(op);
    }
    if (op && op.password !== loginResp?.password) return await this.#login(op);
    this.validate(loginResp);
    return loginResp;
  }
  static async refreshCookie() {
    const loginResp = $.cache ? JSON.parse($.cache.get(sharedState.LOGIN_KEY) || "{}") : {};
    const { accountInfo = {}, password } = loginResp;
    if (!accountInfo.appleId || !password) throw new CustomError("LoginError", 401, "未登录，刷新失败");
    return await this.#login({ appleId: accountInfo.appleId, password });
  }
  static reset() {
    $.cache && $.cache.remove(sharedState.LOGIN_KEY);
    $.cache && $.cache.remove(sharedState.GUID);
    return { success: true, message: "重置成功" };
  }
  static validate(loginResp) {
    if (!loginResp) throw new CustomError("LoginError", 401, "未登录");
    if (!loginResp.accountInfo && !loginResp.customerMessage) throw new CustomError("LoginError", 500, "缓存异常");
    if (Object.hasOwn(loginResp, "failureType")) {
      throw new CustomError("LoginError", 401, `登录失败: ${loginResp.failureType} ${loginResp.customerMessage}`);
    }
    return true;
  }
};

// 商店服务
const StoreService = class {
  static async searchApps({ term, limit = 10, country = "CN", entity = "software" }) {
    if (!$.http) throw new CustomError("ServiceError", 500, "$.http 未加载");
    const searchUrl = new URL("https://itunes.apple.com/search");
    searchUrl.searchParams.set("term", term.trim());
    searchUrl.searchParams.set("country", country.toLowerCase());
    searchUrl.searchParams.set("entity", entity);
    searchUrl.searchParams.set("explicit", "yes");
    searchUrl.searchParams.set("limit", limit.toString());
    const { body } = await $.http(searchUrl.toString(), 8);
    return typeof body === 'string' ? JSON.parse(body) : body;
  }
  static async getAppInfo(salableAdamId, externalVersionId) {
    const { dsPersonId, Cookie } = await this.getValidatedAuth();
    if (!$.http || !$.plist) throw new CustomError("ServiceError", 500, "依赖模块未加载");
    const dataJson = { creditDisplay: "", guid: getMAc(sharedState.GUID), salableAdamId, externalVersionId };
    const resp = await $.http.post({
      url: `https://p25-buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/volumeStoreDownloadProduct?guid=${dataJson.guid}`,
      body: $.plist.build(dataJson), timeout: 6,
      headers: { Cookie, "X-Dsid": dsPersonId, "iCloud-DSID": dsPersonId }
    });
    const appInfo = $.plist.parse(resp.body);
    try {
      this.validateAppInfo(appInfo);
      return await this.formatAppInfo(appInfo);
    } catch (error) {
      if (error.name === "AppInfoError" && error.message.includes("2042") && error.message.includes("2034")) {
        await AuthService.refreshCookie();
        return await this.getAppInfo(salableAdamId, externalVersionId);
      }
      if (error.name === "AppInfoError" && error.message.includes("9610")) {
        await this.purchaseApp(salableAdamId);
        return await this.getAppInfo(salableAdamId, externalVersionId);
      }
      throw error;
    }
  }
  static async getValidatedAuth() { return await AuthService.login(); }
  static validateAppInfo(appInfo) {
    if (!appInfo) throw new CustomError("AppInfoError", 500, "应用信息为空");
    if (Object.hasOwn(appInfo, "failureType")) {
      throw new CustomError("AppInfoError", 500, `获取失败: ${appInfo.failureType} ${appInfo.customerMessage}`);
    }
    if (!appInfo?.songList?.length) throw new CustomError("AppInfoError", 500, "版本信息为空");
    return true;
  }
  static async getVersions({ direction, count = -1, salableAdamId, startVersionId }) {
    const { cachedVersionsAll, versionList } = await this.getAppVersionCache(salableAdamId, startVersionId);
    if (count === -1) return { data: Array.from(versionList.entries()), total: versionList.size };
    let index = Array.from(versionList.keys()).indexOf(startVersionId);
    index = index === -1 ? 0 : direction === "prev" ? index - count : index;
    index = index < 0 ? 0 : index;
    $.http && $.http.useReq(req => Object.assign(req, { timeout: 11 }));
    const page = Array.from(versionList.entries()).slice(index, index + count);
    const tasks = page.map(([extVersionId, cachebuildVersion]) => async () => {
      try {
        if (versionList.get(extVersionId)) return [extVersionId, cachebuildVersion];
        const { buildVersion } = await StoreService.getAppInfo(salableAdamId, extVersionId);
        versionList.set(extVersionId, buildVersion);
        return [extVersionId, buildVersion];
      } catch ({ message }) {
        throw new CustomError("VersionError", 500, message);
      }
    });
    const { fulfilled, rejected } = $.taskProcessor 
      ? await $.taskProcessor.runTasks({ tasks, ...sharedState.CONCURRENCY_CONFIG })
      : { fulfilled: [], rejected: [] };
    cachedVersionsAll.put(salableAdamId, Array.from(versionList.entries()));
    $.cache && $.cache.set(sharedState.VERSION_KEY, JSON.stringify(cachedVersionsAll.toArray()));
    return { data: [...fulfilled, ...rejected], total: versionList.size };
  }
  static async getAppVersionCache(salableAdamId, startVersionId) {
    const cachedVersionsAll = new LRUCache(sharedState.MAX_APP_CACHE, $.cache ? JSON.parse($.cache.get(sharedState.VERSION_KEY) ?? "[]") : []);
    if (!cachedVersionsAll.has(salableAdamId)) {
      const [processedVersions, legacyVersions] = await Promise.all([
        this.#processVersionIdList(salableAdamId, startVersionId),
        VersionService.concurrentGetVersionList(salableAdamId).catch(({ errors = [], error }) => {
          $.log && $.log(...errors, error);
          return { total: 0, data: [] };
        })
      ]);
      if (processedVersions.length >= legacyVersions.total) {
        processedVersions.forEach(p => {
          const legacy = legacyVersions.data.find(i => i[0] === p[0]);
          if (legacy && p[1] === "????") p[1] = legacy[1];
        });
        cachedVersionsAll.put(salableAdamId, processedVersions);
      } else {
        cachedVersionsAll.put(salableAdamId, legacyVersions.data);
      }
    }
    $.cache && $.cache.set(sharedState.VERSION_KEY, JSON.stringify(cachedVersionsAll.toArray()));
    return { cachedVersionsAll, versionList: new Map(cachedVersionsAll.get(salableAdamId)) };
  }
  static async #processVersionIdList(salableAdamId, startVersionId) {
    const appInfo = await this.getAppInfo(salableAdamId, startVersionId);
    const { externalVersionIdList, externalVersionId, displayVersion } = appInfo;
    return externalVersionIdList.length ? externalVersionIdList.reverse().map(id => [id, "????"]) : [[externalVersionId, displayVersion]];
  }
  static async purchaseApp(salableAdamId) {
    const authData = await AuthService.refreshCookie();
    const { dsPersonId, passwordToken, storeFront, Cookie } = authData;
    if (!$.http || !$.plist) throw new CustomError("ServiceError", 500, "依赖模块未加载");
    const dataJson = {
      appExtVrsId: "0", buyWithoutAuthorization: "true", guid: getMAc(sharedState.GUID),
      hasAskedToFulfillPreorder: "true", hasDoneAgeCheck: "true", price: "0",
      pricingParameters: "STDQ", productType: "C", salableAdamId
    };
    const body = $.plist.build(dataJson);
    const url = "https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/buyProduct";
    const headers = { Cookie, "X-Token": passwordToken, "X-Dsid": dsPersonId, "iCloud-DSID": dsPersonId, "X-Apple-Store-Front": storeFront };
    const resp = await $.http.post({ url, body, headers }, 6);
    const parsedResp = $.plist.parse(resp.body);
    const { failureType, customerMessage, jingleDocType } = parsedResp;
    switch (failureType) {
      case "5002": throw new CustomError("BuyError", 500, "[未知错误] 已购买");
      case "2040": throw new CustomError("BuyError", 500, "[购买失败] 已购且下架");
      case "2059": throw new CustomError("BuyError", 500, "[购买失败] 未购且下架");
      case "1010": throw new CustomError("BuyError", 500, "[无效Store] 地区未上架");
      case "2034": case "2042": throw new CustomError("BuyError", 401, "[未登录] CK过期");
      case "2019": throw new CustomError("BuyError", 500, "[购买失败] 无法购付费软件");
      case "9610": throw new CustomError("BuyError", 403, "[未找到许可] 未购或ID错");
      default: if (failureType || failureType === "") throw new CustomError("BuyError", 500, `[购买失败] ${customerMessage || '未知错误'}`);
    }
    if (jingleDocType) return salableAdamId;
    throw new CustomError("BuyError", 500, "[购买失败] 无凭证");
  }
  static async formatAppInfo(appInfo) {
    const { metrics: { currency } = {} } = appInfo;
    const songItem = appInfo.songList[0] || {};
    const { songId: appId, URL: url, "artwork-urls": artworkUrls = {}, sinfs = [], "asset-info": assetInfo = {}, metadata = {} } = songItem;
    const { url: icon } = artworkUrls.default || {};
    const { sinf } = sinfs[0] || {};
    const { "file-size": fileSize } = assetInfo;
    const {
      bundleDisplayName: name, softwareVersionBundleId: bundleId,
      bundleShortVersionString: displayVersion, bundleVersion: buildVersion,
      softwareVersionExternalIdentifier: externalVersionId,
      softwareVersionExternalIdentifiers: externalVersionIdList = [],
      rating: ratingInfo = {}
    } = metadata;
    const minimumOsVersion = (ratingInfo.label || '').replace("+", "");
    const { accountInfo = {} } = await this.getValidatedAuth();
    Object.assign(appInfo, { appleId: accountInfo.appleId });
    return {
      name, appId, url, icon, sinf, bundleId, displayVersion, buildVersion,
      externalVersionId, externalVersionIdList, fileSize,
      metadata: $.plist.build(metadata), minimumOsVersion, currency
    };
  }
};

// 统一响应格式
const createResponse = (success, data = null, error = null) => ({
  success,
  data,
  error,
  timestamp: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
});
// 参数验证
const validate = (condition, message) => {
  if (!condition) throw new CustomError("ValidateError", 400, message);
};

// 主函数（核心：跨域头+OPTIONS路由，完全适配SimpleExpress）
const main = async () => {
  try {
    // 预加载TaskProcessor
    const isTaskProcessor = $.import(
      ({ fn: TaskProcessor }) => ({ name: "taskProcessor", fn: new TaskProcessor() }),
      "https://raw.githubusercontent.com/xiaobailian67/Surge/refs/heads/main/TaskProcessor.js"
    );

    // 导入依赖模块
    await $.imports(
      ["* as plist", "https://esm.sh/plist"],
      ["express", "https://raw.githubusercontent.com/xiaobailian67/Surge/refs/heads/main/SimpleExpressBeta.js"],
      [({ name, fn }) => ({ name: name.slice(1), fn }), "https://raw.githubusercontent.com/xiaobailian67/Surge/refs/heads/main/utils.js"]
    );

    // 1. 跨域响应头配置（所有响应都带跨域头）
    $.http.useRes(res => {
      res.headers = {
        ...res.headers,
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "Content-Type",
        "access-control-max-age": "86400",
        "content-type": "application/json; charset=utf-8" // 统一返回JSON格式
      };
      return res;
    });

    // 请求头配置
    $.http.useReq(req => {
      req.headers = {
        ...req.headers,
        "User-Agent": "Configurator/2.15 (Macintosh; OS X 11.0.0; 16G29) AppleWebKit/2603.3.8",
        "Content-Type": "application/json; charset=utf-8" // 接收JSON格式请求
      };
      return req;
    });

    // 创建express实例
    const app = new $.express($request);

    // 2. OPTIONS请求处理（直接返回200+跨域头）
    app.options("*", (req, res) => {
      res.statusCode = 200;
      res.send(JSON.stringify(createResponse(true, null, "OPTIONS预检通过")));
    });

    // 根路径接口（测试用）
    app.get("/", (req, res) => {
      const data = {
        name: "Apple Store API",
        supportDomains: ["apple-api.com", "xiaobai.app"],
        status: "running"
      };
      res.send(JSON.stringify(createResponse(true, data)));
    });

    // 登录接口
    app.post("/auth/login", async (req, res) => {
      try {
        // 解析请求体（SimpleExpress需手动解析）
        const reqBody = req.body ? JSON.parse(req.body) : {};
        const { appleId, password, code } = reqBody;
        validate(appleId && password, "缺少appleId或password");
        
        const result = await AuthService.login({ appleId, password, code });
        res.send(JSON.stringify(createResponse(true, { message: "登录成功", loginData: result })));
      } catch (err) {
        res.statusCode = err.statusCode || 500;
        res.send(JSON.stringify(createResponse(false, null, err.message || "登录失败")));
      }
    });

    // 错误处理（兜底）
    app.use((req, res) => {
      res.statusCode = 404;
      res.send(JSON.stringify(createResponse(false, null, "接口不存在")));
    });

    const response = await app.run();
    $done({ response });
  } catch (error) {
    console.log("模块启动错误:", error.toString());
    $done({
      response: {
        statusCode: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(createResponse(false, null, "模块启动失败: " + error.message))
      }
    });
  }
};

main();