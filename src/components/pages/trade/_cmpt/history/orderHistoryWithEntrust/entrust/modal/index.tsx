import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big, moment } = Util;
import store from "store";
import { upperCaseFirstLetter } from "utils/method";
import { get_trade } from "api/v4/order";

import { Modal, ModalProps, Tooltip } from "antd";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";
// import AzSvg from "components/az/svg";
import AzLoading from "components/az/loading";
import AppDivNoData from "components/app/div/noData";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";

import { TradeSideEnum } from "store/trade";

import { HistoryEntrustOrderProps } from "store/entrustOrder";
import { OrderTradeProps, OrderTradeDeductEnum } from "components/pages/trade/_cmpt/history/tradeHistory";

interface Props extends ModalProps {
  doc: null | HistoryEntrustOrderProps;
  setDoc: (arg: null | HistoryEntrustOrderProps) => void;
}

const Main: React.FC<Props> = ({ doc, setDoc, ...rest }) => {
  const t = useTranslation();
  // const {isLogin} = store.user;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderTradeProps[]>();

  const getFeeStr = useCallback((doc) => {
    const { fee, feeCurrency, orderSide, baseCurrency, quoteCurrency } = doc;

    const feeStr = Big(fee || 0).toFixedCy();

    if (feeCurrency) return feeStr + feeCurrency.toUpperCaseCurrency();

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

  const apiReqTradeArg = useMemo(() => {
    return {
      fn: get_trade,
      config: {
        params: {
          limit: 100,
          orderId: doc && doc.id,
        },
      },
      success: ({ items }) => setItems(items),
      callback: () => setLoading(false),
    };
  }, [doc]);
  const apiReqTrade = useAxiosCancelFun(apiReqTradeArg);

  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    apiReqTrade();

    return () => {
      setLoading(false);
      setItems(undefined);
    };
  }, [doc]);

  return (
    <Modal
      className={styles.main}
      open={!!doc}
      title={t("trade.transDetails")}
      width={440}
      centered
      closeIcon={<SvgIcon className={"svgIcon"} src={SvgClose} />}
      footer={null}
      onCancel={() => !loading && setDoc(null)}
      {...rest}
    >
      <div className={styles.nav}>
        <span>{t("trade.orderNumber")}</span>
        <span>{doc?.id}</span>
      </div>
      <div className={styles.content}>
        {items && (
          <>
            {!items.length ? (
              <AppDivNoData />
            ) : (
              items.map((subDoc) => {
                const _fee = getFeeStr(subDoc);
                const _feeTip = getFeeTip(subDoc);
                return (
                  <div key={subDoc.tradeId} className={styles.ul}>
                    <div className={styles.li}>
                      <div>{t("trade.time")}</div>
                      <div>{moment(subDoc.time).formatMs()}</div>
                    </div>
                    <div className={styles.li}>
                      <div>{t("trade.price")}</div>
                      <div>{Big(subDoc.price || 0).toFixedCy()}</div>
                    </div>
                    <div className={styles.li}>
                      <div>{t("trade.executed")}</div>
                      <div>{Big(subDoc.quantity || 0).toFixedCy()}</div>
                    </div>
                    <div className={styles.li}>
                      <div>{t("trade.fee")}</div>
                      <div>
                        {!_feeTip ? (
                          _fee
                        ) : (
                          <Tooltip placement="topLeft" title={_feeTip}>
                            <span className={cx(styles.tipStr)}>{_fee}</span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className={styles.li}>
                      <div>{t("trade.makerTaker")}</div>
                      <div>{upperCaseFirstLetter(subDoc.takerMaker)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {loading && <AzLoading />}
      </div>
    </Modal>
  );
};

export default observer(Main);
// export default Main;
