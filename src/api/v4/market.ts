import { Request } from "@az/base";
const { AzAxios4 } = Request;

const URL = "/sapi/v4/market/public/";

//获取交易对
export function get_symbol(config?) {
  return AzAxios4.get(URL + `symbol`, config);
}

//获取24h行情统计
export function get_ticker24h(config?) {
  return AzAxios4.get(URL + `ticker/24h`, config);
}

//获取排行榜配置
export function get_topConfig(config?) {
  return AzAxios4.get(URL + `top/config`, config);
}

//获取所有板块
export function get_plate(config?) {
  return AzAxios4.get(URL + `plate`, config);
}

//查询近期成交列表
export function get_tradeRecent(config?) {
  return AzAxios4.get(URL + `trade/recent`, config);
}

//获取深度信息
export function get_depth(config?) {
  return AzAxios4.get(URL + `depth`, config);
}

//获取服务器时间
export function get_time(config?) {
  return AzAxios4.get(URL + `time`, config);
}

//获取K线数据
export function get_kline(config) {
  return AzAxios4.get(URL + `kline`, config);
}

//获取交易市场taker、maker费率
export function get_symbolFeeRate(config) {
  return AzAxios4.get(URL + `symbol/fee-rate`, config);
}

//获取杠杆交易对
export function get_leverSymbol(config?) {
  return AzAxios4.get(URL + `lever/symbol`, config);
}

//获取etf交易对列表
export function get_etf_list(config?) {
  return AzAxios4.get(URL + `etf/symbol`, config);
}

//获取净值
export function get_net_worth(symbolId, config?) {
  return AzAxios4.get(URL + `etf/symbol/net-worth/${symbolId}`, config);
}

//被st标签标记的交易对列表
export function get_symbolStList(config?) {
  return AzAxios4.get(URL + `symbol/st-list`, config);
}
