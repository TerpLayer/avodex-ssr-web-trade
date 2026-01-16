import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { useRouter } from "next/router";
import { Hooks, Util } from "@az/base";
import store from "store";
import { post_order } from "api/v4/order";
import Storage from "utils/storage";
import { Checkbox } from "antd";
// import AzSvg from "components/az/svg";
import ModalAlert from "components/antd/modal/alert";
import AppInputNumber from "components/app/input/number";
import useCoinMemo from "components/pages/trade/_hook/useCoinMemo";
import useBalancesAvailable from "components/pages/trade/_hook/useBalancesAvailable";
import Option from "../option";
import NftDropDown from "../nftDropdown";
// import Slider from "../slider";
import LoginOrRegister from "../loginOrRegister";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";

import { ClsUpDownEnum } from "store/app";
import { TradeSideEnum } from "store/trade";
import { NftPositionProps } from "store/balances";
import useModalRiskTip from "@/components/app/modal/riskTip/useHook";

const { useTranslation } = Hooks;
const { Big, getUrl } = Util;

interface Props extends HTMLAttributes<HTMLDivElement> {
  tradeSide: TradeSideEnum;
  onSuccess?: () => void;
}

const Main: React.FC<Props> = ({ className, tradeSide, onSuccess }) => {
  const t = useTranslation();

  const { name, type, currentConfig, feeRate, getSymbolFeeRate } = store.market;
  const { tradeRecent, tradeRecentOnce, orderConfirm_limit } = store.trade;
  const { isLogin } = store.user;

  const { coinQuantityUpperCase, coinPriceUpperCase, coinQuantityPrecisionMarket, coinPricePrecisionMarket, coinPricePrecisionCurrency } = useCoinMemo();
  const { balancesAvailable, balancesAvailableLabel } = useBalancesAvailable(tradeSide);

  const isBuy = useMemo(() => tradeSide === TradeSideEnum.buy, [tradeSide]);
  const currency = useMemo(() => {
    const ary = name.split("_");
    return isBuy ? ary[1] : ary[0];
  }, [isBuy, name]); //当前交易币种
  const currencyDisplayName = useMemo(() => {
    return store.currency.getCurrencyDisplayName(currency);
  }, [currency]);

  // const cls = useMemo(() => {
  //   return isBuy ? ClsUpDownEnum.up : ClsUpDownEnum.down;
  // }, [isBuy]); //样式

  const [loading, setLoading] = useState(false);

  const [price, setPrice] = useState("");
  const [nftAmount, setNftAmount] = useState<WithUndefined<string | NftPositionProps>>();
  const amount = useMemo(() => {
    if (!nftAmount) return "";
    if (typeof nftAmount === "string") return nftAmount;
    return nftAmount.amount;
  }, [nftAmount]);
  const nftObj = useMemo(() => {
    if (nftAmount && typeof nftAmount === "object") return nftAmount;
  }, [nftAmount]);
  const [total, setTotal] = useState(""); //成交额

  const [isErrPrice, setIsErrPrice] = useState(false);
  const [isErrAmount, setIsErrAmount] = useState(false);

  const handleInputPrice = useCallback(
    (val) => {
      setPrice(val);
      if (!val) return setTotal("");
      if (amount) {
        setTotal(
          Big(val || 0)
            .times(amount)
            .toFixed(coinPricePrecisionMarket)
        );
      }
    },
    [amount, coinPricePrecisionMarket]
  );
  const handleNftAmount = useCallback(
    (val) => {
      console.log("handleNftAmount =", val);

      setNftAmount(val);
      if (!val) return setTotal("");
      const amount = typeof val === "string" ? val : val.amount;
      console.log("price, amount", { price, amount });
      if (price) {
        setTotal(
          Big(amount || 0)
            .times(price)
            .toFixed(coinPricePrecisionMarket, isBuy ? 3 : 0) //产品vivian需求，买入时计算值向上舍入
        );
      }
    },
    [price, coinPricePrecisionMarket, isBuy]
  );
  const handleInputTotal = useCallback(
    (val) => {
      setTotal(val);

      if (amount) {
        if (val) {
          setPrice(Big(val).div(amount).toFixed(coinPricePrecisionMarket));
        } else {
          setPrice("");
        }
      }
    },
    [price, amount, coinPricePrecisionMarket, coinQuantityPrecisionMarket]
  );

  const btnSubmitObj = useMemo(() => {
    const cls = isBuy ? styles.btnSubmit_buy : styles.btnSubmit_sell;
    let lab = t("trade.login2Register");
    if (isLogin) {
      lab = t(isBuy ? "trade.buy" : "trade.sell") + " " + coinQuantityUpperCase;
    }
    return {
      cls,
      lab,
    };
  }, [isLogin, isBuy, coinQuantityUpperCase]);
  const btnSubmitDisabled = useMemo(() => {
    if (!isLogin) return false;
    if (loading || !currentConfig.tradingEnabled) return true;
    return false;
  }, [isLogin, loading, currentConfig]);
  const apiResPostOrder = useCallback(() => {
    if (loading) return;
    setLoading(true);
    const data: any = {
      symbol: name,
      side: tradeSide,
      type: "LIMIT",
      timeInForce: "GTC",
      bizType: type,
      price: price,
      quantity: amount,
    };
    nftObj && (data.nftId = nftObj.nftId);

    post_order({
      data,
      errorPop: true,
      successPop: true,
    })
      .then((data) => {
        console.log("success", data);
        if (tradeSide === TradeSideEnum.sell) {
          setNftAmount(undefined);
          setTotal("");
        }
        onSuccess && onSuccess();
      })
      .catch((data) => {
        console.log("error", data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loading, name, tradeSide, type, price, amount, nftObj]);

  useEffect(() => {
    isBuy && getSymbolFeeRate();
  }, []);
  const userFee = useMemo(() => {
    if (!feeRate[name]) return;
    return Big(feeRate[name].takerFeeRate || 0).toFixed();
  }, [name, feeRate]);
  const userFeeLabel = useMemo(() => {
    if (!userFee) return "--%";
    return (
      Big(userFee || 0)
        .times(100)
        .toFixed() + "%"
    );
  }, [userFee]);
  const fee = useMemo(() => {
    if (!isBuy || !userFee || !total) return;
    return Big(total || 0)
      .times(userFee || 0)
      .toFixed(coinPricePrecisionCurrency);
  }, [isBuy, userFee, total, coinPricePrecisionCurrency]);
  const totalWithFee = useMemo(() => {
    if (!isBuy || !fee || !total) return;
    return Big(total || 0)
      .plus(fee || 0)
      .toFixed(coinPricePrecisionCurrency);
  }, [isBuy, fee, total, coinPricePrecisionCurrency]);

  const isErrAmountMemo = useMemo(() => {
    if (!isBuy) return isErrAmount;
    if (isErrAmount) return isErrAmount;

    if (amount && total) {
      if (+total - +(balancesAvailable || 0) > 0) return true;
      if (totalWithFee && +totalWithFee - +(balancesAvailable || 0) > 0) return true;
    }

    return false;
  }, [isBuy, isErrAmount, balancesAvailable, amount, total, totalWithFee]);

  const checkRiskTip = useModalRiskTip();
  const handleSubmit = useCallback(() => {
    if (btnSubmitDisabled) return;
    if (!isLogin) {
      const query = "?backurl=" + encodeURIComponent(location.href);
      location.href = getUrl("/accounts/login" + query);
      return;
    }

    if (!+price) return setIsErrPrice(true);
    if (!+amount) return setIsErrAmount(true);

    checkRiskTip(start);

    function start() {
      if (!orderConfirm_limit) return todo();

      let checked = !orderConfirm_limit;

      ModalAlert({
        title: t("trade.orderConfirm"),
        okText: t("confirm"),
        width: 450,
        closable: true,
        onOk: (close) => {
          close();
          store.trade.updateState({ orderConfirm_limit: !checked });
          Storage.set("orderConfirm_limit", !checked);
          todo();
        },
        closeIcon: <SvgIcon className={"svgIcon"} src={SvgClose} />,
        content: (
          <div className={styles.orderConfirm}>
            <div>
              <span>{store.market.formatName(store.market.name)}</span>&nbsp;
              <span className={isBuy ? ClsUpDownEnum.up : ClsUpDownEnum.down}>{isBuy ? t("trade.buy") : t("trade.sell")}</span>
            </div>

            <div>
              <div>
                <div>{t("trade.type")}</div>
                <div>{t("trade.limitOrder")}</div>
              </div>
              <div>
                <div>{t("trade.orderPrice")}</div>
                <div>{price + " " + coinPriceUpperCase}</div>
              </div>
              {nftObj && (
                <div>
                  <div>{t("trade.softnoteSerial")}</div>
                  <div>{nftObj.nftId}</div>
                </div>
              )}
              <div>
                <div>{t("trade.amount")}</div>
                <div>{amount + " " + coinQuantityUpperCase}</div>
              </div>

              {isBuy && (
                <div>
                  <div>{t("trade.fee")}</div>
                  <div>{(fee || "--") + " " + coinPriceUpperCase}</div>
                </div>
              )}

              <div>
                <div>{t("trade.totalVol")}</div>
                <div>{(isBuy ? totalWithFee || "--" : total) + " " + coinPriceUpperCase}</div>
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
      if (isErrAmountMemo) return ModalAlert(t("trade.amountBigTip"));

      //交易提示：最新成交价5%
      if (tradeRecent && tradeRecent.p) {
        if (isBuy) {
          if (+price - +tradeRecent.p * 1.05 > 0) {
            return ModalAlert.confirm({
              content: t("trade.tradeAlertBuy"),
              onOk: (clsoe) => {
                clsoe();
                apiResPostOrder();
              },
            });
          }
        } else {
          if (+price - +tradeRecent.p * 0.95 < 0) {
            return ModalAlert.confirm({
              content: t("trade.tradeAlertSell"),
              onOk: (clsoe) => {
                clsoe();
                apiResPostOrder();
              },
            });
          }
        }
      }

      apiResPostOrder();
    }
  }, [
    isLogin,
    btnSubmitDisabled,
    price,
    amount,
    isBuy,
    tradeRecent,
    apiResPostOrder,
    orderConfirm_limit,
    coinPriceUpperCase,
    coinQuantityUpperCase,
    total,
    isErrAmountMemo,
    nftObj,
    fee,
    totalWithFee,
    checkRiskTip,
  ]);

  useEffect(() => {
    // console.log("tradeRecentOnce change", tradeRecentOnce);
    setPrice("");
    setNftAmount(undefined);
    setTotal("");

    if (tradeRecentOnce) {
      const price = Big(tradeRecentOnce.p || 0).toFixed(coinPricePrecisionMarket);
      setPrice(price);
      if (tradeRecentOnce.isClick) {
        if (!isBuy) return;
        const amount = tradeRecentOnce.q;
        handleNftAmount(Big(amount).toFixed());
        // const amountNum = Math.min(+amount, +getMaxAmount(price));
        // setAmount(Big(amountNum).toFixed(coinQuantityPrecisionMarket));
        // setTotal(Big(price).times(amountNum).toFixed(coinPricePrecisionMarket));
      }
    }
  }, [tradeRecentOnce, type, tradeSide]);
  useEffect(() => {
    setIsErrPrice(false);
  }, [price]);
  useEffect(() => {
    setIsErrAmount(false);
  }, [amount]);

  return (
    <div className={cx(styles.main, className)}>
      <div className={styles.nav}>
        <div>
          <span>{t("trade.avbl")}:</span>
          {/*<span className={cls}>{balancesAvailableLabel}</span>*/}
          <span>{balancesAvailableLabel}</span>
          <span>{currencyDisplayName}</span>
        </div>
        <Option tradeSide={tradeSide} currency={currency} />
      </div>

      <div className={styles.content}>
        <AppInputNumber
          className={styles.input}
          prefix={t("trade.price")}
          suffix={coinPriceUpperCase}
          value={price}
          onInput={handleInputPrice}
          disabled={loading}
          isErr={isErrPrice}
          point={coinPricePrecisionMarket}
          isStepPoint={true}
        />

        <NftDropDown tradeSide={tradeSide} isErr={isErrAmountMemo} value={nftAmount} onChange={handleNftAmount} />

        <AppInputNumber
          className={styles.input}
          prefix={t("trade.totalVol")}
          suffix={coinPriceUpperCase}
          value={total}
          onInput={handleInputTotal}
          disabled={loading}
          // noBtns={true}
          point={coinPricePrecisionMarket}
          isStepPoint={true}
        />

        <div className={styles.feeInfo}>
          {isBuy && (
            <>
              <div>
                <span>{t("trade.tradingFee")}&nbsp;</span>
                <span>{`(${userFeeLabel}): ${fee || "--"} ` + coinPriceUpperCase}</span>
              </div>
              <div>
                <span>{t("trade.totalWithFee")}:&nbsp;</span>
                <span className={styles.feeInfoMain}>{`${totalWithFee || "--"} ` + coinPriceUpperCase}</span>
              </div>
            </>
          )}
        </div>

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
