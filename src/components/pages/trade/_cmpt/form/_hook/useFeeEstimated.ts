import { useEffect, useMemo } from "react";
import store from "store";
import { Util } from "@az/base";
const { Big } = Util;
import useCoinMemo from "@/components/pages/trade/_hook/useCoinMemo";

interface ArgProps {
  value?: string | number;
  isMaker?: boolean;
  isBuy?: boolean;
}

const useFeeEstimated = ({ value = "", isMaker = false, isBuy = false }: ArgProps) => {
  const { isLogin, userVipInfo, tradeDeductionFee } = store.user;
  const { name } = store.market;

  const { coinQuantityUpperCase, coinPriceUpperCase, coinQuantityPrecisionCurrency, coinPricePrecisionCurrency } = useCoinMemo();

  const coin = useMemo(() => (isBuy ? coinQuantityUpperCase : coinPriceUpperCase), [isBuy, coinQuantityUpperCase, coinPriceUpperCase]);
  const point = useMemo(
    () => (isBuy ? coinQuantityPrecisionCurrency : coinPricePrecisionCurrency),
    [isBuy, coinQuantityPrecisionCurrency, coinPricePrecisionCurrency]
  );
  const vipFee = useMemo(() => {
    if (!userVipInfo) return;
    const rate = userVipInfo[isMaker ? "spotMakerFeeRate" : "spotTakerFeeRate"];
    return Big(rate || 0).toFixed();
  }, [isMaker, userVipInfo]);
  const suffixNumStr = useMemo(() => {
    if (!tradeDeductionFee || !tradeDeductionFee.deductEnable || vipFee === undefined) return vipFee;
    return Big(1)
      .minus(tradeDeductionFee.discountRate || 0)
      .times(vipFee)
      .toFixed();
  }, [tradeDeductionFee, vipFee]);
  const feeStr = useMemo(() => {
    if (value === "" || isNaN(+value) || suffixNumStr === undefined) return;
    return Big(Big(value).times(suffixNumStr).toFixed(point, 3)).toFixed();
  }, [value, suffixNumStr, point]);
  const feeAndCoin = useMemo(() => {
    return (feeStr || "--") + " " + coin;
  }, [feeStr, coin]);

  useEffect(() => {
    if (!isLogin) return;
    !userVipInfo && store.user.getUserVipInfo();
    !tradeDeductionFee && store.user.getTradeDeductionFee();
  }, [isLogin]);
  useEffect(() => {
    if (!name) return;
    store.market.getSymbolFeeRate(name);
  }, [name]);

  return {
    feeAndCoin,
  };
};

export default useFeeEstimated;
