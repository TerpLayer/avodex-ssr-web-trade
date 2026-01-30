import { Request } from "@az/base";
const { AzAxios4 } = Request;

const URL = "/sapi/v4/order/";

//单笔获取
export function get_order(config?) {
  return AzAxios4.get(URL + `order`, config);
}

//单笔下单
export function post_order(config?) {
  return AzAxios4.post(URL + `order`, null, { ...config, withBuilderFeeRate: "spot" });
}

//单笔撤单
export function delete_order(config?) {
  return AzAxios4.delete(URL + `order`, config);
}

//单笔改单(限价)
export function put_order(orderId, config?) {
  return AzAxios4.put(URL + `order/${orderId}`, null, config);
}

//当前挂单查询
export function get_openOrder(config?) {
  return AzAxios4.get(URL + `open-order`, config);
}

//撤销当前挂单
export function delete_openOrder(config?) {
  return AzAxios4.delete(URL + `open-order`, config);
}

//历史订单查询
export function get_historyOrder(config?) {
  return AzAxios4.get(URL + `history-order`, config);
}

//历史成交查询
export function get_trade(config) {
  return AzAxios4.get(URL + `trade`, config);
}

//杠杆，借贷/还款
export function post_leverOrder(config?) {
  return AzAxios4.post(URL + `lever/order`, null, config);
}

//跟单-我的带单-当前带单
export function get_copyTradeOrderCurLeaderOrder(config) {
  return AzAxios4.get(URL + `copy-trade/order/cur-leader-order`, config);
}

//跟单-我的跟单-当前跟单
export function get_copyTradeOrderCurFollowerOrder(config) {
  // return new Promise((resolve) =>
  //   resolve([
  //     {
  //       orderId: "orderId1",
  //       leaderOrderId: "string",
  //       symbol: "btc_usdt",
  //       buySize: 11,
  //       buyTime: 1704338252277,
  //       buyPrice: 42000.0,
  //       sellSize: 10,
  //       sellTime: 0,
  //       sellPrice: 0,
  //       profit: 10,
  //       profitRate: 1,
  //       triggerProfitPrice: 45000.0,
  //       triggerStopPrice: 40000.0,
  //       leaderNickname: "Darren",
  //       leaderAvatar: "string",
  //     },
  //     {
  //       orderId: "orderId2",
  //       leaderOrderId: "string",
  //       symbol: "btc_usdt",
  //       buySize: 10,
  //       buyTime: 1704338252277,
  //       buyPrice: 45000.0,
  //       sellSize: 10,
  //       sellTime: 0,
  //       sellPrice: 0,
  //       profit: 10,
  //       profitRate: 1,
  //       triggerProfitPrice: 5000.0,
  //       triggerStopPrice: 40000.0,
  //       leaderNickname: "Darren",
  //       leaderAvatar: "string",
  //     },
  //   ])
  // );
  return AzAxios4.get(URL + `copy-trade/order/cur-follower-order`, config);
}

//跟单-我的跟单/带单-卖出
export function post_copyTradeOrderSell(config?) {
  return AzAxios4.post(URL + `copy-trade/order/sell`, null, config);
}

//跟单-我的跟单/带单-全部卖出/一键卖出
export function post_copyTradeOrderSellAll(config?) {
  return AzAxios4.post(URL + `copy-trade/order/sell-all`, null, config);
}

//跟单-我的跟单-结束
export function post_copyTradeOrderClose(config?) {
  return AzAxios4.post(URL + `copy-trade/order/close`, null, config);
}

//跟单-我的跟单-全部结束
export function post_copyTradeOrderCloseAll(config?) {
  return AzAxios4.post(URL + `copy-trade/order/close-all`, null, config);
}

//跟单-我的跟单/带单-止盈止损
export function post_copyTradeOrderStopProfitLoss(config?) {
  return AzAxios4.post(URL + `copy-trade/order/stop-profit-loss`, null, config);
}

//计划委托，单笔下单
export function post_entrustOrder(config?) {
  return AzAxios4.post(URL + `entrust-order`, null, { ...config, withBuilderFeeRate: "spot" });
}

//计划委托，当前挂单查询
export function get_entrustOrderOpen(config?) {
  return AzAxios4.get(URL + `entrust-order/open`, config);
}

//计划委托，单笔撤单
export function delete_entrustOrder(entrustOrderId, config?) {
  return AzAxios4.delete(URL + `entrust-order/${entrustOrderId}`, config);
}

//计划委托，历史订单
export function get_entrustOrderHistory(config?) {
  return AzAxios4.get(URL + `entrust-order/history`, config);
}
