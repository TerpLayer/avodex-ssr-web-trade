import { Request } from "@az/base";
const { AzAxios4 } = Request;

const URL = "/sapi/v4/account/";

//获取收藏列表
export function get_symbolStar(config?) {
  return AzAxios4.get(URL + `symbol-star/list`, config);
}

//加入收藏列表
export function post_symbolStar(config?) {
  return AzAxios4.post(URL + `symbol-star/add`, null, config);
}

//取消收藏列表
export function delete_symbolStarId(id, config?) {
  return AzAxios4.delete(URL + `symbol-star/cancel/${id}`, config);
}

//获取用户身份，跟单员或带单员
export function get_copyTradeUserStatus(config?) {
  // return new Promise((resolve) => resolve("FOLLOWER"));
  return AzAxios4.get(URL + `copy-trade/user-status`, config);
}

//获取用户手续费抵扣配置
export function get_tradeDeductionFee(config?) {
  return AzAxios4.get(URL + `trade-deduction/fee`, config);
}

//设置用户手续费抵扣配置
export function post_tradeDeductionFee(config?) {
  return AzAxios4.post(URL + `trade-deduction/fee`, null, config);
}
