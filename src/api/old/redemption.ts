import { Request } from "@az/base";
const { AzAxios } = Request;

const URL = "/exapi/redemption/";

//etf获取交易对列表
export function get_etfDealPairList(config?) {
  return AzAxios.get(URL + `etf/dealPairList`, config);
}

//etf获取交易对通证净值
// export function post_etfNetWorth(config?) {
//   return AzAxios.post(URL + `etf/net-worth`, null, config);
// }

//获取现货市场对应的etf市场(旧)
export function post_getEtfByTradeMarket(config?) {
  return AzAxios.post(URL + `etf/getEtfByTradeMarket`, null, config);
}

//etf获取交易对申购记录
export function get_orderV4BuyList(config?) {
  return AzAxios.get(URL + `order/v4/buy-list`, config);
}

//etf获取交易对赎回记录
export function get_orderV4RedeemList(config?) {
  return AzAxios.get(URL + `order/v4/redeem-list`, config);
}

//首页交易对产品信息
export function getDealPairInfo({ dealPair }) {
  return AzAxios.get(URL + "etf/productInfo/" + dealPair);
}

//etf获取额度
export function getBalance(config) {
  return AzAxios.post(URL + `order/buy-sell-used-balance`, config);
}

//etf申购
export function post_etfApply(config?) {
  return AzAxios.post(URL + `order/buy`, null, config);
}
//etf赎回
export function post_etfAtone(config?) {
  return AzAxios.post(URL + `order/redeem`, null, config);
}
