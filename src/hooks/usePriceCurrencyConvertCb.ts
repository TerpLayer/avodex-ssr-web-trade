import React, { useCallback } from "react";
import { Util } from "@az/base";
const { Big } = Util;
import store from "store";

export interface PriceCurrencyConvertCbOptionProps {
  value?: number | string; //数量，譬如 200
  coin?: string; //币种，譬如 usdt，不传的话取 store.market.name.split("_")[1]
  targetCoin?: string; //折合成什么货币，默认是当前货币类型，譬如 usd
  thousands?: boolean; //返回字符串是否千分位分割，默认是
  unit?: boolean; //返回字符串是否加上货币单位，默认是 "1,024 USD"
  reverse?: boolean; // 是否反转 由已知货币数量转为币种数量
  exchangeRate?: string; // 法币之间汇率，存在优先使用此汇率计算
}

const usePriceCurrencyConvertCb: () => (option: PriceCurrencyConvertCbOptionProps) => string = () => {
  const { name } = store.market;
  const { priceCurrencyConvert } = store.currency;
  const { convertCurrency } = store.balances;

  const fn = useCallback(
    (option: PriceCurrencyConvertCbOptionProps) => {
      let { value, coin, targetCoin, thousands = true, unit = true, reverse, exchangeRate } = option;

      let result = "0";
      !value && (value = 0);
      !coin && (coin = name.split("_")[1] || "usdt");
      const referCoin = targetCoin || convertCurrency || "usd"; // 传入的优先 否则用默认的

      if (exchangeRate) {
        result = Big(value).times(exchangeRate).toFixed();
      } else {
        if (priceCurrencyConvert) {
          const doc = priceCurrencyConvert[coin];
          if (doc && doc[referCoin]) {
            result = reverse ? Big(value).div(doc[referCoin]).toFixed() : Big(value).times(doc[referCoin]).toFixed();
          }
        }
      }

      const affix = unit ? " " + (reverse ? store.currency.getCurrencyDisplayName(coin) : store.currency.getCurrencyDisplayName(referCoin)) : "";

      // console.log("usePriceCurrencyConvert=====>", store.currency.priceCurrencyConvert);

      if (["btc"].includes(referCoin)) {
        if (Big(result).minus(0.00000001).toNumber() >= 0 || Big(result).minus(0).toNumber() === 0) {
          return (thousands ? Big(result).toFixedCy(8) : Big(result).toFixed(8)) + affix;
        }
      } else if (referCoin === "krw") {
        if (Big(result).minus(1).toNumber() >= 0 || Big(result).minus(0).toNumber() === 0) {
          return (thousands ? Big(result).toFixedCy(0) : Big(result).toFixed(0)) + affix;
        }
      } else {
        let dp = 16;
        if (Big(result).minus(0.01).toNumber() >= 0) dp = 2;
        else if (Big(result).minus(0.0001).toNumber() >= 0) dp = 4;
        else if (Big(result).minus(0.000001).toNumber() >= 0) dp = 6;
        else if (Big(result).minus(0.00000001).toNumber() >= 0) dp = 8;
        else if (Big(result).minus(0.0000000001).toNumber() >= 0) dp = 10;
        else if (Big(result).minus(0.000000000001).toNumber() >= 0) dp = 12;
        else if (Big(result).minus(0.00000000000001).toNumber() >= 0) dp = 14;

        return (thousands ? Big(result).toFixedMaxCy(dp) : Big(result).toFixedMax(dp)) + affix;
        /*
        const minus01 = Big(result).minus(0.01).toNumber();
        const minus0001 = Big(result).minus(0.0001).toNumber();
        const minus000001 = Big(result).minus(0.000001).toNumber();
        const minus00000001 = Big(result).minus(0.00000001).toNumber();
        const minus000000000001 = Big(result).minus(0.000000000001).toNumber();
        const minus00000000000001 = Big(result).minus(0.00000000000001).toNumber();
        const minus0000000000000001 = Big(result).minus(0.0000000000000001).toNumber();
        if (minus01 >= 0 || Big(result).minus(0).toNumber() === 0) {
          return (thousands ? Big(result).toFixedCy(2) : Big(result).toFixed(2)) + affix;
        }
        if (minus0001 >= 0 && minus01 < 0) {
          return (thousands ? Big(result).toFixedCy(4) : Big(result).toFixed(4)) + affix;
        }
        if (minus000001 >= 0 && minus0001 < 0) {
          return (thousands ? Big(result).toFixedCy(6) : Big(result).toFixed(6)) + affix;
        }
        if (minus00000001 >= 0 && minus000001 < 0) {
          return (thousands ? Big(result).toFixedCy(8) : Big(result).toFixed(8)) + affix;
        }
        if (minus000000000001 >= 0 && minus00000001 < 0) {
          return (thousands ? Big(result).toFixedCy(10) : Big(result).toFixed(10)) + affix;
        }
        if (minus00000000000001 >= 0 && minus000000000001 < 0) {
          return (thousands ? Big(result).toFixedCy(12) : Big(result).toFixed(12)) + affix;
        }
        if (minus0000000000000001 >= 0 && minus00000000000001 < 0) {
          return (thousands ? Big(result).toFixedCy(14) : Big(result).toFixed(14)) + affix;
        }
         */
      }
      return (thousands ? Big(result).toFixedMaxCy(16) : Big(result).toFixedMax(16)) + affix;
    },
    [convertCurrency, name, priceCurrencyConvert]
  );

  return fn;
};

export default usePriceCurrencyConvertCb;
