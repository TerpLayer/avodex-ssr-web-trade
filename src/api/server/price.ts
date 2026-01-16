import { Request } from "@az/base";
const { AzAxios4 } = Request;
import { getServerSideDomain } from "utils/method";

const URL = getServerSideDomain({
  inner: "http://service-price-impl/api/public/",
  local: "/exapi/price/public/",
});

// 获取当前币种详细信息
export function get_currencyPrice(currency, config?) {
  return AzAxios4.get(URL + `currency/price/${currency}`, config);
}
