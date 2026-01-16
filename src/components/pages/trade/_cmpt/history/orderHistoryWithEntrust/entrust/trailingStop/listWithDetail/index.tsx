import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big, moment } = Util;
import store from "store";
import { routerPush, thousands, upperCaseFirstLetter } from "utils/method";
import { get_trade } from "api/v4/order";

import { Tooltip } from "antd";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import AzCopy from "components/az/copy";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
import WithPoint from "components/pages/trade/_cmpt/history/_cmpt/withPoint";
import useGetEntrustOrderStateLab from "components/pages/trade/_cmpt/history/_hook/useGetEntrustOrderStateLab";

import styles from "./index.module.scss";

import { TradeSideEnum, TradeOrderStateEnum } from "store/trade";
import { HistoryEntrustOrderProps } from "store/entrustOrder";
import { OrderTradeProps, OrderTradeDeductEnum } from "components/pages/trade/_cmpt/history/tradeHistory";

interface Props extends HTMLAttributes<HTMLDivElement> {
  doc: HistoryEntrustOrderProps;
  clsLi: string;
  disabled?: boolean;
}

const Main: React.FC<Props> = ({ className, doc, clsLi, disabled }) => {
  const router = useRouter();
  const t = useTranslation();
  // const { isLogin } = store.user;
  const { formatName, isLever } = store.market;
  const { getCurrencyDisplayName } = store.currency;

  const { getStateLabel, getStateCls } = useGetEntrustOrderStateLab();
  const getStateNode = useMemo(() => {
    // 已取消/已过期 且 数量大于0 的定性为部分成交
    const { state } = doc;
    const cls = getStateCls(state);
    const lab = getStateLabel(state);
    console.log("getStateNode=====", { state, cls, lab });

    return <WithPoint status={cls}>{lab}</WithPoint>;
  }, [doc]);
  const getFeeStr = useCallback((doc) => {
    const { fee, feeCurrency, orderSide, baseCurrency, quoteCurrency } = doc;

    const feeStr = Big(fee || 0).toFixedCy();

    if (feeCurrency) return feeStr + feeCurrency.toUpperCase();

    return orderSide === TradeSideEnum.buy ? feeStr + baseCurrency.toUpperCaseCurrency() : feeStr + quoteCurrency.toUpperCaseCurrency();
  }, []);
  const getFeeTip = useCallback((doc) => {
    const { deductType, deductFee, couponAmount, couponCurrency, feeCurrency } = doc;
    if (deductType !== OrderTradeDeductEnum.COUPON) return "";
    if (feeCurrency === couponCurrency) return t("trade.deductLab", [deductFee + " " + store.currency.getCurrencyDisplayName(feeCurrency)]);
    const label =
      deductFee + " " + store.currency.getCurrencyDisplayName(feeCurrency) + " ≈ " + couponAmount + " " + store.currency.getCurrencyDisplayName(couponCurrency);
    return t("trade.deductLab", [label]);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderTradeProps[]>();

  const apiReqTradeArg = useMemo(() => {
    return {
      fn: get_trade,
      config: {
        params: {
          limit: 100,
          orderId: doc.id,
        },
      },
      success: ({ items }) => setItems(items),
      callback: () => setLoading(false),
    };
  }, [doc]);
  const apiReqTrade = useAxiosCancelFun(apiReqTradeArg);

  const coin = useMemo(() => {
    const coinAry = doc.symbol.split("_");
    const sell = getCurrencyDisplayName(coinAry[0]);
    const buy = getCurrencyDisplayName(coinAry[1]);

    return {
      sell,
      buy,
    };
  }, [doc, getCurrencyDisplayName]);
  const amountLabel = useMemo(() => {
    if (doc.side === TradeSideEnum.buy) {
      return +doc.quoteQty > 0 ? Big(doc.quoteQty).toFixedCy() + " " + coin.buy : "--";
    } else {
      return +doc.quantity > 0 ? Big(doc.quantity).toFixedCy() + " " + coin.sell : "--";
    }
  }, [doc, coin]);
  const rateLabel = useMemo(() => {
    if (doc.turnRate) return doc.turnRate;
    return Big(doc.priceDiff || 0).toFixedCy() + " " + coin.buy;
  }, [doc, coin]);
  const activePriceLabel = useMemo(() => {
    const { currentPrice = "0", activePrice = "0" } = doc;
    if (!+currentPrice || !+activePrice) return "--";

    if (+activePrice < +currentPrice) return t("trade.lastPrice") + "<=" + thousands(activePrice);
    return t("trade.lastPrice") + ">=" + thousands(activePrice);
  }, [doc]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    apiReqTrade();

    return () => {
      setLoading(false);
      setItems(undefined);
    };
  }, [isOpen]);
  useEffect(() => {
    if (!disabled) setIsOpen(false);
  }, [disabled]);

  return (
    <div className={cx(styles.main, className)}>
      <div className={cx(clsLi, styles.nav)} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <div className={cx(styles.arrow, { [styles.arrowOpen]: isOpen })}>{moment(doc.createdTime).formatMs()}</div>
        <div>
          <button
            disabled={disabled}
            className={"btnTxt"}
            onClick={(e) => {
              e.stopPropagation();
              routerPush(router, { symbol: doc.symbol, isLever });
            }}
          >
            {formatName(doc.symbol)}
          </button>
        </div>
        <div className={doc.side === TradeSideEnum.buy ? "up-color" : "down-color"}>{t("trade." + doc.side.toLocaleLowerCase())}</div>
        <div>{amountLabel}</div>
        <div>{rateLabel}</div>
        <div>{doc.triggerPrice ? Big(doc.triggerPrice).toFixedCy() : "--"}</div>
        <div>{activePriceLabel}</div>
        <div>{getStateNode}</div>
      </div>
      <div className={styles.content} style={{ display: isOpen ? "block" : "none" }}>
        <div className={styles.subBar}>
          <div>
            <span>{t("trade.endTime")}:&nbsp;</span>
            <div>{moment(doc.updatedTime).formatMs()}</div>
          </div>
          <div>
            <span>{t("trade.orderNumber")}:&nbsp;</span>
            <div>
              <span>{doc.id}</span>
              <AzCopy text={doc.id} />
            </div>
          </div>
        </div>

        <AzScrollBarY noWrap={store.app.rtl} className={styles.AzScrollBarY}>
          <div className={styles.subBody}>
            <div className={styles.subNav}>
              <div className={cx(clsLi, styles.subLi)}>
                <div>{t("trade.time")}</div>
                <div>{t("trade.price")}</div>
                <div>{t("trade.executed")}</div>
                <div>{t("trade.fee")}</div>
                <div>{t("trade.makerTaker")}</div>
              </div>
            </div>

            {items && (
              <div className={styles.subContent}>
                {!items.length ? (
                  <AppDivNoData className={styles.noData} noIcon={true} />
                ) : (
                  items.map((subDoc) => {
                    const _fee = getFeeStr(subDoc);
                    const _feeTip = getFeeTip(subDoc);
                    return (
                      <div key={subDoc.tradeId} className={cx(clsLi, styles.subLi)}>
                        <div>{moment(subDoc.time).formatMs()}</div>
                        <div>{Big(subDoc.price || 0).toFixedCy()}</div>
                        <div>{Big(subDoc.quantity || 0).toFixedCy()}</div>
                        <div>
                          {!_feeTip ? (
                            _fee
                          ) : (
                            <Tooltip placement="topLeft" title={_feeTip}>
                              <span className={cx(styles.tipStr)}>{_fee}</span>
                            </Tooltip>
                          )}
                        </div>
                        <div>{upperCaseFirstLetter(subDoc.takerMaker)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </AzScrollBarY>

        {loading && <AzLoading />}
      </div>
    </div>
  );
};

export default observer(Main);
// export default Main;
