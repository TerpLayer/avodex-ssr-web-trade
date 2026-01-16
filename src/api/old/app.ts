import { Request } from "@az/base";
const { AzAxios } = Request;

const URL = "/exapi/app/";

//获取市场提示列表
export function get_marketTips(config?) {
  return AzAxios.get(URL + `public/market-tips-config`, config);
}

//获取维护提示语
export function get_maintainTips(config?) {
  return AzAxios.get(URL + `public/maintain-tips-config`, config);
}

//获取热门搜索
export function get_searchMarketHot(config?) {
  return AzAxios.get(URL + `public/search-market/hot`, config);
}
