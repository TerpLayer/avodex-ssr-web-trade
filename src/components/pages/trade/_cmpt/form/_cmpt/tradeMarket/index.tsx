import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { useRouter } from "next/router";
import { Hooks, Util } from "@az/base";
import store from "store";
import { $g } from "utils/statistics";
import { post_order } from "api/v4/order";
import Storage from "utils/storage";
import { Dropdown, MenuProps, Tooltip, Checkbox } from "antd";
import AzSvg from "components/az/svg";
import ModalAlert from "components/antd/modal/alert";
import AppInputNumber from "components/app/input/number";
import useCoinMemo from "components/pages/trade/_hook/useCoinMemo";
import useBalancesAvailable from "components/pages/trade/_hook/useBalancesAvailable";
import useFeeEstimated from "@/components/pages/trade/_cmpt/form/_hook/useFeeEstimated";
import FeeEstimated from "@/components/pages/trade/_cmpt/form/_cmpt/feeEstimated";
import Option from "../option";
import Slider from "../slider";
import LoginOrRegister from "../loginOrRegister";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";

import { ClsUpDownEnum } from "store/app";
import { TradeSideEnum } from "store/trade";
import { AzInputNumberRefProps } from "@/components/az/input/number";
import useModalRiskTip from "@/components/app/modal/riskTip/useHook";

const { useTranslation } = Hooks;
const { getUrl, Big } = Util;

interface Props extends HTMLAttributes<HTMLDivElement> {
  tradeSide: TradeSideEnum;
  onSuccess?: () => void;
}

enum MarketTradeType { //市价交易类型
  total = "total", //成交额
  amount = "amount", //数量
}

const Main: React.FC<Props> = ({ className, tradeSide, onSuccess }) => {
  // const router = useRouter();
  const t = useTranslation();

  const { name, type, currentConfig } = store.market;
  // const { currencyQuantity, currencyPrice } = store.balances;
  // const { currencyObj } = store.currency;
  const { tradeRecentOnce, orderConfirm_market } = store.trade;
  const { isLogin } = store.user;

  const { coinQuantityUpperCase, coinPriceUpperCase, coinQuantityPrecisionMarket, coinPricePrecisionMarket, coinPricePrecisionCurrency, coinQuantityFilter } =
    useCoinMemo();
  const { balancesAvailable: balancesAvailableCanNegative, balancesAvailableLabel } = useBalancesAvailable(tradeSide);
  const balancesAvailable = useMemo(() => {
    const num = balancesAvailableCanNegative ? +balancesAvailableCanNegative : 0;
    if (!num || num < 0) return "0";
    return balancesAvailableCanNegative;
  }, [balancesAvailableCanNegative]);

  const isBuy = useMemo(() => tradeSide === TradeSideEnum.buy, [tradeSide]);
  const currency = useMemo(() => {
    const ary = name.split("_");
    return tradeSide === TradeSideEnum.buy ? ary[1] : ary[0];
  }, [tradeSide, name]); //当前交易币种
  const currencyGet = useMemo(() => {
    const ary = name.split("_");
    return isBuy ? ary[0] : ary[1];
  }, [isBuy, name]);

  const stepQuantity = useMemo(() => {
    if (coinQuantityFilter) return coinQuantityFilter.tickSize;
  }, [coinQuantityFilter]);

  // const cls = useMemo(() => {
  //   return tradeSide === TradeSideEnum.buy ? ClsUpDownEnum.up : ClsUpDownEnum.down;
  // }, [tradeSide]); //样式

  const [loading, setLoading] = useState(false);

  const [marketTradeType, setMarketTradeType] = useState<MarketTradeType>(tradeSide === TradeSideEnum.buy ? MarketTradeType.total : MarketTradeType.amount);
  const [inputValue, setInputValue] = useState("");
  const [isErrInputValue, setIsErrInputValue] = useState(false);

  const refInputAmount = useRef<AzInputNumberRefProps>(null);
  const timeoutAmount = useRef<number>();
  const focusInputAmount = useCallback(() => {
    timeoutAmount.current && clearTimeout(timeoutAmount.current);
    timeoutAmount.current = window.setTimeout(() => {
      if (refInputAmount.current) refInputAmount.current.focus();
    }, 0);
  }, []);

  const isTradeAmount = useMemo(() => marketTradeType === MarketTradeType.amount, [marketTradeType]);
  const getStepValue = useCallback((value, step) => {
    if (!value || !step || !+value || !+step) return value;
    const mod = Big(value).mod(step).toNumber();
    if (!mod) return value;
    if (+value < +step) return step + "";
    const decimal = ((value || "") + "").split(".")[1];
    const fixLen = decimal ? decimal.length : undefined;
    const newValue = Big(step)
      .times(Math.floor(+value / +step))
      .toFixed(fixLen);
    return newValue;
  }, []);
  const amountStep = useMemo(() => {
    if (!isTradeAmount) return "";
    return getStepValue(inputValue, stepQuantity);
  }, [isTradeAmount, inputValue, stepQuantity]);
  const isErrAmountStep = useMemo(() => {
    if (!isTradeAmount) return false;
    return inputValue !== amountStep;
  }, [isTradeAmount, inputValue, amountStep]);

  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: MarketTradeType.total,
        label: (
          <div className={styles.dropTotal} onClick={() => setMarketTradeType(MarketTradeType.total)}>
            <span>{t("trade.totalVol")}</span>
            <Tooltip placement="top" title={isBuy ? t("trade.marketTotalTipBuy") : t("trade.marketTotalTipSell")}>
              <span>
                <AzSvg icon={"faq"} />
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        key: MarketTradeType.amount,
        label: <a onClick={() => setMarketTradeType(MarketTradeType.amount)}>{t("trade.amount")}</a>,
      },
    ];
  }, [isBuy]);

  const point = useMemo(() => {
    return marketTradeType === MarketTradeType.total ? coinPricePrecisionCurrency : coinQuantityPrecisionMarket;
  }, [marketTradeType, coinPricePrecisionCurrency, coinQuantityPrecisionMarket]);
  const maxInputValue = useMemo<string>(() => {
    if (isBuy) {
      if (marketTradeType === MarketTradeType.total) {
        return balancesAvailable || "";
      } else {
        if (!tradeRecentOnce) return "";
        return Big(balancesAvailable || 0)
          .div(tradeRecentOnce.p)
          .toFixed(point);
      }
    } else {
      if (marketTradeType === MarketTradeType.total) {
        if (!tradeRecentOnce) return "";

        let ba = "0";
        if (balancesAvailable) {
          if (+Big(balancesAvailable).toFixed(coinQuantityPrecisionMarket)) {
            ba = balancesAvailable;
          }
        }
        return Big(ba).times(tradeRecentOnce.p).toFixed(point);
      } else {
        return balancesAvailable || "";
      }
    }
    //后面根据最新成交价变更
    // return balancesAvailable || "";
  }, [balancesAvailable, tradeRecentOnce, isBuy, marketTradeType, point]);
  const inputValueConvert = useMemo(() => {
    if (isBuy) {
      if (marketTradeType === MarketTradeType.total) {
        return inputValue;
        // return Big(inputValue || 0)
        //   .toFixedMax(coinPricePrecisionMarket);
      } else {
        if (!tradeRecentOnce) return "";
        return Big(inputValue || 0)
          .times(tradeRecentOnce.p)
          .toFixedMax(coinPricePrecisionMarket);
      }
    } else {
      if (marketTradeType === MarketTradeType.total) {
        if (!tradeRecentOnce) return "";
        return Big(inputValue || 0)
          .div(tradeRecentOnce.p)
          .toFixedMax(coinQuantityPrecisionMarket);
      } else {
        return inputValue;
      }
    }
  }, [inputValue, tradeRecentOnce, isBuy, maxInputValue, coinPricePrecisionMarket, coinQuantityPrecisionMarket]);
  const isErrInputValueMemo = useMemo(() => {
    return isErrInputValue || +inputValue - +maxInputValue > 0 || isErrAmountStep;
  }, [isErrInputValue, inputValue, maxInputValue, isErrAmountStep]);

  const canBuyOrSell = useMemo(() => {
    const unit = " " + store.currency.getCurrencyDisplayName(currencyGet);
    if (!tradeRecentOnce) return "--" + unit;
    if (isBuy) {
      return (
        Big(balancesAvailable || 0)
          .div(tradeRecentOnce.p)
          .toFixed(coinQuantityPrecisionMarket) + unit
      );
    } else {
      return (
        Big(balancesAvailable || 0)
          .times(tradeRecentOnce.p)
          .toFixed(coinPricePrecisionCurrency) + unit
      );
    }
  }, [balancesAvailable, tradeRecentOnce, isBuy, currencyGet, coinPricePrecisionMarket, coinQuantityPrecisionMarket]);

  const handleInputValue = useCallback(
    (val, isAfterChange?) => {
      setInputValue(val);

      if (isTradeAmount && isAfterChange && val !== getStepValue(val, stepQuantity)) {
        focusInputAmount();
      }
    },
    [isTradeAmount, stepQuantity]
  );
  const handleSliderChange = useCallback(
    (val, slider, isAfterChange) => {
      let value = val;
      if (!+val && !slider) {
        value = "";
      }
      handleInputValue(value, isAfterChange);
    },
    [handleInputValue]
  );

  const handleBlurAmount = useCallback(() => {
    if (!isTradeAmount) return;
    if (isErrAmountStep) handleInputValue(amountStep);
  }, [isTradeAmount, amountStep, isErrAmountStep, handleInputValue]);

  const btnSubmitObj = useMemo(() => {
    const cls = tradeSide === TradeSideEnum.buy ? styles.btnSubmit_buy : styles.btnSubmit_sell;
    let lab = t("trade.login2Register");
    if (isLogin) {
      lab = t(tradeSide === TradeSideEnum.buy ? "trade.buy" : "trade.sell") + " " + coinQuantityUpperCase;
    }
    return {
      cls,
      lab,
    };
  }, [isLogin, tradeSide, coinQuantityUpperCase]);
  const btnSubmitDisabled = useMemo(() => {
    if (!isLogin) return false;
    if (loading || !currentConfig.tradingEnabled) return true;
    return false;
  }, [isLogin, loading, currentConfig]);
  const apiResPostOrder = useCallback(() => {
    if (loading) return;
    setLoading(true);
    const data = {
      symbol: name,
      side: tradeSide,
      type: "MARKET",
      timeInForce: "IOC",
      bizType: type,
      [tradeSide === TradeSideEnum.buy ? "quoteQty" : "quantity"]: inputValueConvert,
    };

    post_order({
      data,
      errorPop: true,
      successPop: true,
    })
      .then((data) => {
        console.log("success", data);
        onSuccess && onSuccess();
        $g(tradeSide === TradeSideEnum.buy ? "WEB_Trade_Buy_click" : "WEB_Trade_Sell_click");
      })
      .catch((data) => {
        console.log("error", data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loading, name, tradeSide, type, inputValueConvert]);

  const FeeEstimatedValue = useMemo(() => {
    if (isBuy) {
      if (isTradeAmount) {
        return inputValue;
      } else {
        if (tradeRecentOnce && tradeRecentOnce.p && !isNaN(+tradeRecentOnce.p) && inputValue !== "" && !isNaN(+inputValue)) {
          return +inputValue / +tradeRecentOnce.p;
        } else {
          return;
        }
      }
    } else {
      if (isTradeAmount) {
        if (tradeRecentOnce && tradeRecentOnce.p && !isNaN(+tradeRecentOnce.p) && inputValue !== "" && !isNaN(+inputValue)) {
          return +inputValue * +tradeRecentOnce.p;
        } else {
          return;
        }
      } else {
        return inputValue;
      }
    }
  }, [isBuy, isTradeAmount, inputValue, tradeRecentOnce]);
  const { feeAndCoin } = useFeeEstimated({
    value: FeeEstimatedValue,
    isMaker: false,
    isBuy,
  });

  const checkRiskTip = useModalRiskTip();
  const handleSubmit = useCallback(() => {
    if (btnSubmitDisabled || isErrAmountStep) return;
    if (!isLogin) {
      const query = "?backurl=" + encodeURIComponent(location.href);
      location.href = getUrl("/accounts/login" + query);
      return;
    }

    if (!+inputValue) return setIsErrInputValue(true);

    // checkRiskTip(start);
    start();

    function start() {
      if (!orderConfirm_market) return todo();

      let checked = !orderConfirm_market;

      ModalAlert({
        title: t("trade.orderConfirm"),
        okText: t("confirm"),
        width: 450,
        closable: true,
        onOk: (close) => {
          close();
          store.trade.updateState({ orderConfirm_market: !checked });
          Storage.set("orderConfirm_market", !checked);
          todo();
        },
        closeIcon: (
          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12.1562" r="12" fill="var(--az-colorv2-bg-surface)" />
            <path
              d="M15.3459 16.4582C15.6099 16.7222 16.0379 16.7222 16.3019 16.4582C16.5659 16.1942 16.5659 15.7662 16.3019 15.5022L12.956 12.1563L16.302 8.81026C16.566 8.54627 16.566 8.11825 16.302 7.85426C16.038 7.59027 15.61 7.59027 15.346 7.85426L12 11.2003L8.65398 7.85424C8.38999 7.59025 7.96198 7.59025 7.69799 7.85424C7.434 8.11824 7.434 8.54625 7.69799 8.81024L11.044 12.1563L7.69809 15.5023C7.4341 15.7662 7.4341 16.1943 7.69809 16.4583C7.96208 16.7222 8.39009 16.7222 8.65408 16.4583L12 13.1123L15.3459 16.4582Z"
              fill="var(--az-colorv2-text-secondary)"
            />
          </svg>
        ),
        content: (
          <div className={styles.orderConfirm}>
            <div>
              <span>{store.market.formatName(store.market.name)}</span>&nbsp;
              <span className={isBuy ? ClsUpDownEnum.up : ClsUpDownEnum.down}>{isBuy ? t("trade.buy") : t("trade.sell")}</span>
            </div>

            <div>
              <div>
                <div>{t("trade.type")}</div>
                <div>{t("trade.marketOrder")}</div>
              </div>
              <div>
                <div>{t("trade.orderPrice")}</div>
                <div>{t("trade.market")}</div>
              </div>
              {marketTradeType === MarketTradeType.total && (
                <div>
                  <div>{t("trade.totalVol")}</div>
                  <div>{inputValue + " " + coinPriceUpperCase}</div>
                </div>
              )}
              {marketTradeType === MarketTradeType.amount && (
                <div>
                  <div>{t("trade.amount")}</div>
                  <div>{inputValue + " " + coinQuantityUpperCase}</div>
                </div>
              )}
              <div>
                <div>{t("trade.estimatedFee")}</div>
                <div>{feeAndCoin}</div>
              </div>
            </div>

            <div>
              <Checkbox className={styles.orderConfirmCheckbox} defaultChecked={checked} onChange={(e) => (checked = e.target.checked)}>
                {t("trade.noAlertAndSetTip")}
              </Checkbox>
            </div>
          </div>
        ),
      });
    }

    function todo() {
      if (+inputValue - +maxInputValue > 0) return ModalAlert(t("trade.amountBigTip"));

      apiResPostOrder();
    }
  }, [
    isLogin,
    btnSubmitDisabled,
    inputValue,
    maxInputValue,
    apiResPostOrder,
    orderConfirm_market,
    isBuy,
    marketTradeType,
    coinPriceUpperCase,
    coinQuantityUpperCase,
    feeAndCoin,
    checkRiskTip,
  ]);

  useEffect(() => {
    setInputValue("");
  }, [name, type, tradeSide, marketTradeType]);
  useEffect(() => {
    setMarketTradeType(tradeSide === TradeSideEnum.buy ? MarketTradeType.total : MarketTradeType.amount);
  }, [tradeSide]);
  useEffect(() => {
    setIsErrInputValue(false);
  }, [inputValue]);

  return (
    <div className={cx(styles.main, className)}>
      <div className={styles.nav}>
        <div>
          <span>{t("trade.avbl")}:</span>
          {/*<span className={cls}>{balancesAvailableLabel}</span>*/}
          <span>{balancesAvailableLabel}</span>
          <span>{store.currency.getCurrencyDisplayName(currency)}</span>
        </div>
        <Option tradeSide={tradeSide} currency={currency} />
      </div>

      <div className={styles.content}>
        <AppInputNumber
          className={styles.input}
          prefix={t("trade.price")}
          suffix={coinPriceUpperCase}
          disabled={true}
          disabledLabel={t("trade.market")}
          // noBtns={true}
        />
        <AppInputNumber
          ref={refInputAmount}
          className={styles.input}
          prefix={
            tradeRecentOnce ? (
              <Dropdown
                placement={"bottomLeft"}
                menu={{
                  items: dropdownItems,
                  selectable: true,
                  selectedKeys: marketTradeType ? [marketTradeType] : [],
                }}
              >
                <button className={cx("btnTxt btnDrop")} onClick={(e) => e.preventDefault()}>
                  {marketTradeType === MarketTradeType.total ? t("trade.totalVol") : t("trade.amount")}
                </button>
              </Dropdown>
            ) : (
              <span>{marketTradeType === MarketTradeType.total ? t("trade.totalVol") : t("trade.amount")}</span>
            )
          }
          suffix={marketTradeType === MarketTradeType.total ? coinPriceUpperCase : coinQuantityUpperCase}
          value={inputValue}
          onInput={handleInputValue}
          disabled={loading}
          isErr={isErrInputValueMemo}
          point={point}
          isStepPoint={isTradeAmount ? false : true}
          step={isTradeAmount ? stepQuantity : undefined}
          onBlur={handleBlurAmount}
        />
        <div className={styles.errStep}>{isErrAmountStep && <div>{t("trade.valueStepInputTip", [amountStep, stepQuantity])}</div>}</div>

        <Slider className={styles.slider} value={inputValue} max={maxInputValue} point={point} disabled={loading} onChange={handleSliderChange} />

        <div className={styles.canBuyOrSell}>
          <div>{isBuy ? t("trade.canBuy") : t("trade.canSell")}</div>
          <div>{canBuyOrSell}</div>
        </div>

        <FeeEstimated>{feeAndCoin}</FeeEstimated>

        {isLogin ? (
          <button className={cx("btnTxt", styles.btnSubmit, btnSubmitObj.cls)} disabled={btnSubmitDisabled} onClick={handleSubmit}>
            {btnSubmitObj.lab}
          </button>
        ) : (
          <LoginOrRegister isBuy={isBuy} />
        )}
      </div>
    </div>
  );
};

export default observer(Main);
