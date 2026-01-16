import { Util } from "@az/base";
const { Big } = Util;
import store from "store";
import { thousands, numberIndented } from "utils/method";

const indentFormat = (strOrNum?: string | number | null): string => {
  let str = "";
  if (typeof strOrNum === "number") {
    str = Big(strOrNum).toFixed();
  } else if (typeof strOrNum === "string") {
    str = strOrNum;
  }
  str = str.replaceAll(",", "");
  return store.app.isNumberIndent ? numberIndented(str) : thousands(str);
};

export default indentFormat;
