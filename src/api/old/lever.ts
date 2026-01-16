import { Request } from "@az/base";
const { AzAxios } = Request;

const URL = "/exapi/lever/";

//获取杠杆市场配置
export function get_marketConfig(config?) {
  return AzAxios.get(URL + `marketConfig`, config);
}

//获取杠杆账户预览
export function get_accountOverview(marketName, config?) {
  return AzAxios.get(URL + `account/${marketName}/overview`, config);
}

//获取订阅杠杆 ws 的 userKey token
export function get_tokenUserKey(config?) {
  return AzAxios.get(URL + `token/userKey`, config);
}

//借款
export function post_loan({ market, coin, amount, trace }, config) {
  return AzAxios.post(URL + `loan/${market}/${coin}?amount=${amount}&trace=${trace}`, null, config);
}
//还款
export function post_repayLoan({ market, coin, amount, trace }, config) {
  return AzAxios.post(URL + `repayLoan/${market}/${coin}?amount=${amount}&trace=${trace}`, null, config);
}
