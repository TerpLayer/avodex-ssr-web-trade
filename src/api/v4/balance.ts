import { Request } from "@az/base";
const { AzAxios4 } = Request;

const URL = "/sapi/v4/balance/";

//获取币种列表
export function get_currencies(config?) {
  return AzAxios4.get(URL + `public/currencies`, config);
}

//获取所有币种折算价格
export function get_priceCurrencyConvert(config?) {
  return AzAxios4.get(URL + `public/price/currency/convert`, config);
}

//获取币种介绍列表
export function get_currencyInfoOne(currency, config?) {
  return AzAxios4.get(URL + `public/currency-info/${currency}`, config);
}

// 获取资产列表
export function get_balances(config?) {
  return AzAxios4.get(URL + `balances`, config);
}

// 获取杠杆单个资产
export function get_leverBalance(config?) {
  return AzAxios4.get(URL + `lever/balance`, config);
}

// 获取杠杆市场资产
export function get_leverBalances(config?) {
  return AzAxios4.get(URL + `lever/balances`, config);
}

// 获取type=NFT币种的持仓列表
export function get_nftPosition(config?) {
  return AzAxios4.get(URL + `nft/position`, config);
}
