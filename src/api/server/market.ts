import { Request } from "@az/base";
const { AzAxios4 } = Request;
import { getServerSideDomain } from "utils/method";

const URL = getServerSideDomain({
  inner: "http://ryzen-biz-market/public/",
  local: "/sapi/v4/market/public/",
});

//获取交易对
export function get_symbol(config?) {
  return AzAxios4.get(URL + `symbol`, config);
}

//获取交易对
export function get_builder_symbol(config?) {
  const domain = process.env.NEXT_PUBLIC_ENV ? "https://app.azverse.xyz" : "https://app.az-qa.xyz";
  return AzAxios4.get(`${domain}/sapi/v4/market/public/symbol`, config);
}
