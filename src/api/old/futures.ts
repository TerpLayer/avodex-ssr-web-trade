import { Request } from "@az/base";
const { AzAxios } = Request;

const URL = "/";

//U本位市场列表
export function get_fapiSymbolList(config?) {
  return AzAxios.get(URL + `fapi/market/v1/public/symbol/list`, config);
}
