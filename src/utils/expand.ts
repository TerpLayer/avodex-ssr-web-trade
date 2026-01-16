import moment from "moment";
declare module "moment" {
  export interface Moment {
    formatMs(): string;
  }
}
moment.prototype.formatMs = function (str) {
  return this.format(str || "YYYY-MM-DD HH:mm:ss");
};

import Big from "big.js";
Big.RM = 0;
Big.prototype.toFixedMax = function (max) {
  //限定小数最多保留 max 位
  return Big(this.toFixed(max)).toFixed();
};
Big.prototype.toFixedMin = function (min) {
  //限定小数最少保留 min 位
  const str = this.toFixed();
  const strMin = this.toFixed(min);
  return strMin.length > str.length ? strMin : str;
};
Big.prototype.toFixedCy = function (dp, rm) {
  try {
    const str = this.toFixed(dp, rm);
    const ary = str.split(".");
    const retAry = [ary[0].replace(/\d(?=(\d{3})+$)/g, "$&,")];
    ary[1] && retAry.push(ary[1]);
    return retAry.join(".");
  } catch (e) {
    console.error(e);
    return this.toFixed(dp, rm);
  }
};
Big.prototype.toFixedMaxCy = function (max) {
  try {
    const str = this.toFixedMax(max);
    const ary = str.split(".");
    const retAry = [ary[0].replace(/\d(?=(\d{3})+$)/g, "$&,")];
    ary[1] && retAry.push(ary[1]);
    return retAry.join(".");
  } catch (e) {
    console.error(e);
    return this.toFixedMaxCy(max);
  }
};
Big.prototype.toFixedMinCy = function (min) {
  try {
    const str = this.toFixedMin(min);
    const ary = str.split(".");
    const retAry = [ary[0].replace(/\d(?=(\d{3})+$)/g, "$&,")];
    ary[1] && retAry.push(ary[1]);
    return retAry.join(".");
  } catch (e) {
    console.error(e);
    return this.toFixedMinCy(min);
  }
};

export { moment, Big };
