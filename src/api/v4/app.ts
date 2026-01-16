import { type CustomAxiosRequestConfig, Request } from "@az/base";
const { AzAxios4 } = Request;

const URL = "/exapi/app/";

//搜索市场点击上报
export function post_searchMarketTraceClick(config?) {
  /*
  const data = {
    type: 1, //业务：1.现货 4.杠杆 8.全币种合约 10.币本位合约 11.U本位合约
    marketName: "btc_usdt",
  };
  */
  return AzAxios4.post(URL + `public/search-market/trace-click`, null, config);
}

//查询搜索热门市场
export function get_search(config?) {
  return AzAxios4.get(URL + `public/search`, config);
}

//获取广告
export function get_advertSpaceCode(code: string, config?) {
  return AzAxios4.get(URL + `public/advert-space/${code}`, config);
}
