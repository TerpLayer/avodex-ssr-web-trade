const keyList = {
  symbols: "az.symbols", //市场列表，{version: "", symbols: []}
  currencies: "az.currencies", //币种列表，{version: "", currencies: []}
  layout: "az.trade.layout", //排版布局
  marketGroup: "az.trade.marketGroup", //选择的市场分组，tabCfg, {key: "zone", plateId?: 2}
  tvChart: "az.trade.tradingview.chart", //tradingView持久化数据
  tvOption: "az.trade.tradingview.option", //tradingView选项 {interval: "15", chartType: 1}
  isEtfGuideKnown: "az.trade.isEtfGuideKnown", //etf引流，存在的话不提示
  symbolDepthMergePrecision: "az.trade.symbolDepthMergePrecision", //市场深度合并精度，{"btc_usdt": "0.01"}
  orderConfirm_limit: "az.trade.orderConfirm_limit", //下单确认，限价单，默认true
  orderConfirm_market: "az.trade.orderConfirm_market", //下单确认，市价单，默认true
  orderConfirm_stopLimit: "az.trade.orderConfirm_stopLimit", //下单确认，止盈止损，默认true
  orderConfirm_trailingStop: "az.trade.orderConfirm_trailingStop", //下单确认，跟踪委托，默认true
  searchHistory: "az.trade.searchHistory", //搜索历史，上限10条，[{symbol: "btc_usdt", isLever: true, tag: "20X"}]
  //
  colorReverse: "colorReverse", //红绿偏好设置，0=绿涨红跌，1=红涨绿跌
  numberFormat: "numberFormat", //数值展示格式，0=标准格式，1=缩进格式
  numberIndentGuide: "az.trade.numberIndentGuide", //数值缩进展示引导提示，1，如果存在表示提示过了
  //兼容导航市场
  market: "market", //现货市场
  leverMarket: "leverMarket", //杠杆市场
  //
  depth_upDown: "az.trade.depth_upDown", //{count: 1, ...}
  depth_wsInfo: "az.trade.depth_wsInfo", //{count: 1, ...}
  //
  formOrder5TipTsObj: "az.trade.formOrder5TipTsObj", //下单5%溢价提示时间戳，{SPOT_SELL: 1712634529345}
  depthShowTotalPrice: "az.trade.depthShowTotalPrice", //盘口深度是否显示累计价格币种，0=累计数量，1=累计价格
  channel: "channel", // 推广页面有 channel 记录 pv 并在注册时关联注册账户
  inviteCode: "inviteCode", // 记录邀请码到本地，并上报访问记录
  footerTickerType: "az.trade.footerTickerType", // 底部行情类型，hot=热门搜索，self=自选
  modalRiskTip: "az.trade.modalRiskTip", //风险提示，创新金融区，{innovative: 1}
};
type Key = keyof typeof keyList;

export default {
  keyList,
  get(key: Key) {
    if (typeof window === "undefined") return;
    const itemKey = keyList[key];
    if (!itemKey) return console.log("%c$storage.get 键名不在列表内: %c" + key, "color: #ac2925", "color: red");

    const itemValue: any = localStorage.getItem(itemKey);
    let result;
    try {
      result = JSON.parse(itemValue);
    } catch (e) {
      result = itemValue;
    }
    if (result && typeof result === "object" && result["expire"]) {
      const time = result["expire"];
      if (time > Date.parse(new Date() as unknown as string)) {
        return result.value;
      }
      this.remove(key);
      return "";
    }
    if (result === "[object Object]") {
      this.remove(key);
      return null;
    }
    return result;
  },
  /**
   * @param {Key} key
   * @param {*} value
   * @param {number} time 时间戳 过期时间 可选
   * @return {*}
   */
  set(key: Key, value: any, time?: number) {
    if (typeof window === "undefined") return;
    const itemKey = keyList[key];
    if (!itemKey) return console.log("%c$storage.set 键名不在列表内: %c" + key, "color: #ac2925", "color: red");

    try {
      if (time) {
        return localStorage.setItem(itemKey, JSON.stringify({ value, expire: time }));
      }
      localStorage.setItem(itemKey, JSON.stringify(value));
    } catch (e) {
      // localStorage.setItem(itemKey, value);
    }
  }, //对象会被压成字符串
  remove(key: Key) {
    if (typeof window === "undefined") return;
    const itemKey = keyList[key];
    if (!itemKey) return console.log("%c$storage.remove 键名不在列表内: %c" + key, "color: #ac2925", "color: red");

    localStorage.removeItem(itemKey);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.clear();
    return true;
  },
};
