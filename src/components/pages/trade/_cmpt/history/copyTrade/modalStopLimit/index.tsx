import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation, FormattedMessage } = Hooks;
const { Big, moment } = Util;
import store from "store";
import { post_copyTradeOrderStopProfitLoss } from "api/v4/order";

import { Modal, ModalProps } from "antd";
import AppInputNumber from "components/app/input/number";
// import AzSvg from "components/az/svg";
import AzLoading from "@/components/az/loading";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";

import { CopyTradeCurOrderExtendProps } from "@/components/pages/trade/_cmpt/history/copyTrade";
import { SymbolProps } from "@/store/market";
import { ClsUpDownEnum } from "@/store/app";

interface Props extends ModalProps {
  doc: CopyTradeCurOrderExtendProps;
  successCallback?: () => void;
  //
  open?: boolean;
  onCancel?: (e?: React.MouseEvent<HTMLElement>) => void;
}

const Main: React.FC<Props> = ({ doc, successCallback, open, onCancel, ...rest }) => {
  const t = useTranslation();
  // const {isLogin} = store.user;
  const { formatName, config } = store.market;
  const { currencyObj } = store.currency;
  const { isFollower } = store.copyTrade;

  const symbolCfg: Partial<SymbolProps> = useMemo(() => {
    if (!config) return {};
    return config[doc.symbol] || {};
  }, [doc, config]);
  const coinPricePrecisionMarket = useMemo(() => {
    return symbolCfg.pricePrecision && symbolCfg.pricePrecision >= 0 ? symbolCfg.pricePrecision : 0;
  }, [symbolCfg]); //买方币市场精度
  const coinPricePrecisionCurrency = useMemo(() => {
    const coinPrice = doc.symbol.split("_")[1];
    if (!currencyObj || !currencyObj[coinPrice]) return 0;
    return currencyObj[coinPrice].maxPrecision >= 0 ? currencyObj[coinPrice].maxPrecision : 0;
  }, [doc, currencyObj]);

  const [loading, setLoading] = useState(false);
  const [profitPrice, setProfitPrice] = useState("");
  const [profitRate, setProfitRate] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [stopRate, setStopRate] = useState("");

  const isErrProfit = useMemo(() => {
    if (!profitPrice) return false;
    return +profitPrice <= +doc.buyPrice;
  }, [doc, profitPrice]);
  const isErrStop = useMemo(() => {
    if (!stopPrice) return false;
    return +stopPrice >= +doc.buyPrice || +stopPrice <= 0;
  }, [doc, stopPrice]);

  const getTipObj = useCallback(
    (price) => {
      const obj = {
        price: "--",
        profit: "--",
        cls: "",
        unit: doc._coinPrice,
      };

      if (price && +price) {
        obj.price = price;
        const val = Big(price)
          .minus(doc.buyPrice || 0)
          .times(doc.buySize || 0)
          .toFixed(coinPricePrecisionCurrency);
        if (+val > 0) {
          obj.profit = "+" + val;
          obj.cls = ClsUpDownEnum.up;
        } else if (+val < 0) {
          obj.profit = val;
          obj.cls = ClsUpDownEnum.down;
        } else {
          obj.profit = val;
        }
      }

      return obj;
    },
    [doc, coinPricePrecisionCurrency]
  );
  const profitTipObj = useMemo(() => {
    return getTipObj(profitPrice);
  }, [profitPrice, getTipObj]);
  const stopTipObj = useMemo(() => {
    return getTipObj(stopPrice);
  }, [stopPrice, getTipObj]);

  const isConfirmDisabled = useMemo(() => {
    return isErrProfit || isErrStop;
  }, [isErrProfit, isErrStop]);

  const handleInputProfitPrice = useCallback(
    (val) => {
      setProfitPrice(val);
      if (val) {
        const rate = Big(val)
          .minus(doc.buyPrice || 0)
          .div(doc.buyPrice)
          .times(100)
          .toFixed(2);
        setProfitRate(rate);
      } else {
        setProfitRate("");
      }
    },
    [doc]
  );
  const handleInputProfitRate = useCallback(
    (val) => {
      setProfitRate(val);
      if (val) {
        const price = Big(val)
          .plus(100)
          .times(doc.buyPrice || 0)
          .div(100)
          .toFixed(coinPricePrecisionMarket);
        setProfitPrice(price);
      } else {
        setProfitPrice("");
      }
    },
    [doc, coinPricePrecisionMarket]
  );
  const handleInputStopPrice = useCallback(
    (val) => {
      setStopPrice(val);
      if (val && !isNaN(+val)) {
        const rate = Big(val)
          .minus(doc.buyPrice || 0)
          .div(doc.buyPrice)
          .times(100)
          .toFixed(2);
        setStopRate(rate);
      } else {
        setStopRate("");
      }
    },
    [doc]
  );
  const handleInputStopRate = useCallback(
    (val) => {
      setStopRate(val);
      if (val && !isNaN(+val)) {
        const price = Big(val)
          .add(100)
          .times(doc.buyPrice || 0)
          .div(100)
          .toFixed(coinPricePrecisionMarket);
        setStopPrice(price);
      } else {
        setStopPrice("");
      }
    },
    [doc, coinPricePrecisionMarket]
  );
  const handleInputFocusStopRate = useCallback(
    (e) => {
      if (stopRate === "") {
        setStopRate("-");
        setTimeout(() => {
          const end = e.target.value.length;
          e.target.setSelectionRange(end, end);
        }, 0);
      }
    },
    [stopRate]
  );
  const handleInputBlurStopRate = useCallback((e) => {
    console.log("e====", e);
    if (e.target.value === "-") {
      setStopRate("");
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (isConfirmDisabled) return;
    setLoading(true);

    post_copyTradeOrderStopProfitLoss({
      data: {
        symbol: doc.symbol,
        leaderOrderId: isFollower ? doc.leaderOrderId : doc.orderId,
        triggerProfitPrice: profitPrice,
        triggerStopPrice: stopPrice,
      },
      errorPop: true,
      successPop: true,
    })
      .then(() => {
        successCallback && successCallback();
        onCancel && onCancel();
      })
      .catch(() => {
        //empty
      })
      .finally(() => {
        setLoading(false);
      });
  }, [doc, isFollower, isConfirmDisabled, profitPrice, stopPrice]);

  useEffect(() => {
    if (!open) return;
    console.log(doc);
    handleInputProfitPrice(doc.triggerProfitPrice || "");
    handleInputStopPrice(doc.triggerStopPrice || "");

    return () => {
      console.log("useEffect = open");
      setProfitPrice("");
      setProfitRate("");
      setStopPrice("");
      setStopRate("");
    };
  }, [open]);

  return (
    <Modal
      open={open}
      title={t("trade.stopLimit")}
      width={440}
      centered
      className={styles.main}
      closeIcon={<SvgIcon className={"svgIcon"} src={SvgClose} />}
      onCancel={(e) => !loading && onCancel && onCancel(e)}
      okButtonProps={{ disabled: isConfirmDisabled }}
      onOk={handleConfirm}
      {...rest}
    >
      <div className={styles.orderInfo}>
        <div>
          <div>{t("trade.pair")}</div>
          <div>{formatName(doc.symbol)}</div>
        </div>
        <div>
          <div>{t("trade.buyPrice")}</div>
          <div>{doc._buyPrice + " " + doc._coinPrice}</div>
        </div>
        <div>
          <div>{t("trade.lastPrice2")}</div>
          <div>{doc._latestPrice + " " + doc._coinPrice}</div>
        </div>
      </div>

      <div className={styles.stopLimit}>
        <div>{t("trade.profitPrice")}</div>
        <div>
          <AppInputNumber
            prefix={t("trade.triggerProfitPrice")}
            suffix={doc._coinPrice}
            value={profitPrice}
            onInput={handleInputProfitPrice}
            disabled={loading}
            isErr={isErrProfit}
            noBtns={true}
            point={coinPricePrecisionMarket}
            isStepPoint={true}
          />
          <AppInputNumber
            prefix={t("trade.gainers")}
            suffix={"%"}
            value={profitRate}
            onInput={handleInputProfitRate}
            disabled={loading}
            isErr={isErrProfit}
            noBtns={true}
            point={2}
            isStepPoint={true}
          />
        </div>
        <div>
          <FormattedMessage
            id={"trade.stopLimitEditTip"}
            values={{
              "0": <span className={styles.stopLimitTipPrice}>{profitTipObj.price}</span>,
              "1": <span className={profitTipObj.cls}>{profitTipObj.profit}</span>,
              "2": profitTipObj.unit,
            }}
          />
        </div>
      </div>

      <div className={styles.stopLimit}>
        <div>{t("trade.stopPrice")}</div>
        <div>
          <AppInputNumber
            prefix={t("trade.triggerStopPrice")}
            suffix={doc._coinPrice}
            value={stopPrice}
            onInput={handleInputStopPrice}
            disabled={loading}
            isErr={isErrStop}
            noBtns={true}
            max={+doc.buyPrice}
            point={coinPricePrecisionMarket}
            isStepPoint={true}
          />
          <AppInputNumber
            prefix={t("trade.losers")}
            suffix={"%"}
            value={stopRate}
            onInput={handleInputStopRate}
            onFocus={handleInputFocusStopRate}
            onBlur={handleInputBlurStopRate}
            disabled={loading}
            isErr={isErrStop}
            noBtns={true}
            max={0}
            min={-100}
            point={2}
            isStepPoint={true}
          />
        </div>
        <div>
          <FormattedMessage
            id={"trade.stopLimitEditTip"}
            values={{
              "0": stopTipObj.price,
              "1": <span className={stopTipObj.cls}>{stopTipObj.profit}</span>,
              "2": stopTipObj.unit,
            }}
          />
        </div>
      </div>

      {loading && <AzLoading />}
    </Modal>
  );
};

export default observer(Main);
// export default Main;
