import { Request } from "@az/base";
const { AzAxios } = Request;

const URL = "";

export function get_userVipDetail(config) {
  return AzAxios.get(URL + `/exapi/user/private/vip/detail`, config);
}
