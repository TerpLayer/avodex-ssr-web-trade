import { useMemo } from "react";
import { Util } from "@az/base";
import store from "store";

// import { TradeSideEnum } from "store/trade";
import useCoinMemo from "./useCoinMemo";

const { Big } = Util;

export const useLeverAccount = () => {
  const { tradeRecent } = store.trade;
  const { currentLeverConfig, name } = store.market;
  const { getCurrencyDisplayName } = store.currency;
  const { currentLeverBalance } = store.balances;

  const { coinPricePrecisionMarket, coinQuantityPrecisionCurrency, coinPricePrecisionCurrency } = useCoinMemo();

  const liquidationRate = useMemo(() => {
    /*
    风险率
    = 总资产/ 借贷金额
    = [(买方币总资产-买方币未还利息)/最新成交价+(卖方币总资产-卖方币未还利息)]/(买方币借入资产/最新成交价+卖方币借入资产)
     */

    if (!tradeRecent || !tradeRecent.p || !currentLeverBalance) return "0";
    const { quote, base } = currentLeverBalance;

    const { p } = tradeRecent; //最新成交价
    const q_t = quote.totalAmount || "0"; //买方币总资产
    const q_i = quote.interestAmount || "0"; //买方币未还利息
    const b_t = base.totalAmount || "0"; //卖方币总资产
    const b_i = base.interestAmount || "0"; //卖方币未还利息
    const q_l = quote.loanAmount || "0"; //买方币借入资产
    const b_l = base.loanAmount || "0"; //卖方币借入资产

    const loan = Big(q_l).div(p).plus(b_l);
    if (!loan.toNumber()) return "0";

    return Big(q_t).minus(q_i).div(p).plus(Big(b_t).minus(b_i)).div(loan).toFixed();
  }, [tradeRecent, currentLeverBalance]); //风险率

  const liquidationPriceSell = useMemo(() => {
    //（卖方币种总资产 – 卖方币种未还利息 – 卖方币种借贷金额 * 爆仓风险率）
    if (!currentLeverBalance || !currentLeverConfig.liquidationRate) return "0";

    const { base } = currentLeverBalance;

    const lr = currentLeverConfig.liquidationRate; //爆仓风险率
    const b_t = base.totalAmount || "0"; //卖方币种总资产
    const b_i = base.interestAmount || "0"; //卖方币种未还利息
    const b_l = base.loanAmount || "0"; //卖方币种借贷金额

    return Big(b_t).minus(b_i).minus(Big(b_l).times(lr)).toFixed();
  }, [currentLeverConfig, currentLeverBalance]);
  const liquidationPrice = useMemo(() => {
    //爆仓价
    //= （买方币种借贷金额 * 爆仓风险率 + 买方币种未还利息 – 买方币种总资产）/（卖方币种总资产 – 卖方币种未还利息 – 卖方币种借贷金额 * 爆仓风险率）

    if (!currentLeverBalance || !currentLeverConfig.liquidationRate) return "0";

    const { quote, base } = currentLeverBalance;

    const lr = currentLeverConfig.liquidationRate; //爆仓风险率
    const q_l = quote.loanAmount || "0"; //买方币种借贷金额
    const q_i = quote.interestAmount || "0"; //买方币种未还利息
    const q_t = quote.totalAmount || "0"; //买方币种总资产
    const b_t = base.totalAmount || "0"; //卖方币种总资产
    const b_i = base.interestAmount || "0"; //卖方币种未还利息
    const b_l = base.loanAmount || "0"; //卖方币种借贷金额

    if (!+q_l && !+q_i && !+b_l && !+b_i) return "0";

    const sell = Big(b_t).minus(b_i).minus(Big(b_l).times(lr));
    if (!sell.toNumber()) return "0";

    const result = Big(q_l).times(lr).plus(q_i).minus(q_t).div(sell).toFixed();
    if (+result < 0) return "0";

    return result;
  }, [currentLeverConfig, currentLeverBalance]); //爆仓价
  const liquidationPriceLab = useMemo(() => {
    const unit = getCurrencyDisplayName(name.split("_")[1]);
    const rm = +liquidationPriceSell > 0 ? 3 : 0;
    return (+liquidationPrice > 0 ? Big(liquidationPrice).toFixed(coinPricePrecisionMarket, rm) : "--") + " " + unit;
  }, [liquidationPriceSell, liquidationPrice, name, getCurrencyDisplayName, coinPricePrecisionMarket]);

  const toLiquidationPrice = useMemo(() => {
    //(爆仓价 - 最新价格) / 最新价格
    if (!tradeRecent || !tradeRecent.p || !+liquidationPrice) return "0";

    const { p } = tradeRecent; //最新成交价

    return Big(liquidationPrice).minus(p).div(p).toFixed();
  }, [liquidationPrice, tradeRecent]); //距爆仓价
  const toLiquidationPriceLab = useMemo(() => {
    if (+toLiquidationPrice < 0) return "--%";
    return Big(toLiquidationPrice).times(100).toFixed(2) + "%";
  }, [toLiquidationPrice]);

  //持仓（Position）=净资产=总资产-已借-利息
  const positionQuantity = useMemo(() => {
    if (!currentLeverBalance) return "0";

    const { totalAmount, loanAmount, interestAmount } = currentLeverBalance.base;

    return Big(totalAmount || 0)
      .minus(loanAmount || 0)
      .minus(interestAmount || 0)
      .toFixed();
  }, [currentLeverBalance]);
  const positionQuantityLabel = useMemo(
    () => Big(positionQuantity).toFixedCy(coinQuantityPrecisionCurrency),
    [positionQuantity, coinQuantityPrecisionCurrency]
  );
  const positionPrice = useMemo(() => {
    if (!currentLeverBalance) return "0";

    const { totalAmount, loanAmount, interestAmount } = currentLeverBalance.quote;

    return Big(totalAmount || 0)
      .minus(loanAmount || 0)
      .minus(interestAmount || 0)
      .toFixed();
  }, [currentLeverBalance]);
  const positionPriceLabel = useMemo(() => Big(positionPrice).toFixedCy(coinPricePrecisionCurrency), [positionPrice, coinPricePrecisionCurrency]);

  return {
    liquidationRate, //风险率
    liquidationPrice, //爆仓价
    liquidationPriceLab,
    toLiquidationPrice,
    toLiquidationPriceLab,
    positionQuantity,
    positionPrice,
    positionQuantityLabel,
    positionPriceLabel,
  };
};

export default useLeverAccount;
