import { Request } from "@az/base";
const { AzAxios4 } = Request;
import { getServerSideDomain } from "utils/method";

const URL = getServerSideDomain({
  inner: "http://ryzen-biz-balance/public/",
  local: "/sapi/v4/balance/public/",
});

//获取币种介绍列表
export function get_currencyInfoOne(currency, config?) {
  return AzAxios4.get(URL + `currency-info/${currency}`, config);
}
