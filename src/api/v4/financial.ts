import { Request } from "@az/base";
const { AzAxios4 } = Request;
import { getOrigin } from "utils/method";

const URL = getOrigin("financial") + "/api/v4/";

//获取资产列表，只返回有值
export function get_balanceBalances(config?) {
  return AzAxios4.get(URL + `balance/balances`, config);
}
