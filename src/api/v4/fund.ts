import { Request } from "@az/base";
const { AzAxios4 } = Request;

const URL = "/sapi/v4/fund/";

//划转
export function post_balanceTransfer(config?) {
  return AzAxios4.post(URL + `balance/transfer`, null, config);
}
