import { Request } from "@az/base";
const { AzAxios } = Request;
import { getServerSideDomain } from "utils/method";

const URL = getServerSideDomain({
  inner: "http://seo-management-impl/",
  local: "http://app-doc.cexdemo-qa.com/data-center/seo-management-impl/",
  noLocalDomain: true,
});

//获取TDK
export function get_tdk(config) {
  return AzAxios.get(URL + `web`, config);
}
