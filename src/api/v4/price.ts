import { Request } from "@az/base";
const { AzAxios4 } = Request;

const URL = "/exapi/price/";

// 获取市值排序币种列表
export function get_currencyPage(config?) {
  return AzAxios4.get(URL + `public/currency/page`, config);
}

// 获取币种信息
export function get_currencyPrice(currency: string, config?) {
  return AzAxios4.get(URL + `public/currency/price/${currency}`, config);
}

// 获取法币间转换汇率
export function get_currencyExchangeRate(config?) {
  return AzAxios4.get(URL + `public/currency/exchange-rate`, config);
}

// 获取图表数据
export function get_currencyMarketChart(config?) {
  return AzAxios4.get(URL + `public/currency/market-chart`, config);
}

// 判断币种是否开放价格详情信息查看
export function get_currencyCgSupported(currency, config?) {
  return AzAxios4.get(URL + `public/currency/supported?currency=${currency}`, config);
}

// 币种信息，seo接口
export function get_currencyInfo(currency: string, config?) {
  return AzAxios4.get(URL + `public/currency/info/${currency}`, config);
}
