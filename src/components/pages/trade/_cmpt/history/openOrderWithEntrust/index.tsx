import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";

import LimitAndMarket from "./limitAndMarket";
import EntrustStopLimit from "./entrust/stopLimit";
import EntrustTrailingStop from "./entrust/trailingStop";

import styles from "./index.module.scss";

import { TradeTypeEnum } from "store/trade";

export enum OrderListTypeEnum {
  limitAndMarket = "limitAndMarket", //现价市价
  stopLimit = "stopLimit", //止盈止损
  trailingStop = "trailingStop", //跟踪委托
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  setOpenOrderCount: (arg: undefined | number) => void;
  clsUl: string;
  clsLi: string;
  clickStamp?: string; //点击戳
}

const Main: React.FC<Props> = ({ className, isHideOtherPairs, setHideOtherPairs, setOpenOrderCount, clsUl, clsLi, clickStamp }) => {
  const t = useTranslation();
  const { name } = store.market;
  const { openOrder } = store.balances;
  const { openEntrustOrder } = store.entrustOrder;

  const [orderListType, setOrderListType] = useState<OrderListTypeEnum>(OrderListTypeEnum.limitAndMarket);

  const [limitAndMarketCount, setLimitAndMarketCount] = useState<undefined | number>();
  useEffect(() => {
    if (orderListType === OrderListTypeEnum.limitAndMarket) return;
    if (!openOrder) return setLimitAndMarketCount(undefined);

    const items = openOrder.filter((doc) => {
      if (isHideOtherPairs && doc.symbol !== name) return false;
      return true;
    });

    setLimitAndMarketCount(items.length);
  }, [name, openOrder, orderListType, isHideOtherPairs]);
  const [stopLimitCount, setStopLimitCount] = useState<undefined | number>();
  useEffect(() => {
    if (orderListType === OrderListTypeEnum.stopLimit) return;
    if (!openEntrustOrder) return setStopLimitCount(undefined);

    const items = openEntrustOrder.filter((doc) => {
      if (isHideOtherPairs && doc.symbol !== name) return false;
      if (doc.type !== TradeTypeEnum.stopLimit) return false;
      return true;
    });

    setStopLimitCount(items.length);
  }, [name, openEntrustOrder, orderListType, isHideOtherPairs]);
  const [trailingStopCount, setTrailingStopCount] = useState<undefined | number>();
  useEffect(() => {
    if (orderListType === OrderListTypeEnum.trailingStop) return;
    if (!openEntrustOrder) return setTrailingStopCount(undefined);

    const items = openEntrustOrder.filter((doc) => {
      if (isHideOtherPairs && doc.symbol !== name) return false;
      if (doc.type !== TradeTypeEnum.trailingStop) return false;
      return true;
    });

    setTrailingStopCount(items.length);
  }, [name, openEntrustOrder, orderListType, isHideOtherPairs]);
  useEffect(() => {
    if (limitAndMarketCount === undefined && stopLimitCount === undefined && trailingStopCount === undefined) return setOpenOrderCount(undefined);

    setOpenOrderCount((limitAndMarketCount || 0) + (stopLimitCount || 0) + (trailingStopCount || 0));
  }, [limitAndMarketCount, stopLimitCount, trailingStopCount]);

  const [btnClickStamp, setBtnClickStamp] = useState<string>();
  const handleBtnClick = useCallback((val: OrderListTypeEnum) => {
    const clickStamp = Math.round(Date.now() / 100) + "";
    setOrderListType(val);
    setBtnClickStamp(clickStamp);
  }, []);

  return (
    <div className={cx(styles.main, className)}>
      {/* <div className={styles.bar}>
        <div>
          <div>
            <button
              className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.limitAndMarket })}
              onClick={() => handleBtnClick(OrderListTypeEnum.limitAndMarket)}
            >
              {t("trade.limitAndMarket") + (limitAndMarketCount !== undefined ? `(${limitAndMarketCount})` : "")}
            </button>
            <button
              className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.stopLimit })}
              onClick={() => handleBtnClick(OrderListTypeEnum.stopLimit)}
            >
              {t("trade.stopLimit") + (stopLimitCount !== undefined ? `(${stopLimitCount})` : "")}
            </button>
            <button
              className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.trailingStop })}
              onClick={() => handleBtnClick(OrderListTypeEnum.trailingStop)}
            >
              {t("trade.trailingStop") + (trailingStopCount !== undefined ? `(${trailingStopCount})` : "")}
            </button>
          </div>
        </div>
      </div> */}

      <div className={styles.content}>
        {orderListType === OrderListTypeEnum.limitAndMarket && (
          <LimitAndMarket
            isHideOtherPairs={isHideOtherPairs}
            setHideOtherPairs={setHideOtherPairs}
            setCount={setLimitAndMarketCount}
            clsUl={clsUl}
            clsLi={clsLi}
            clickStamp={btnClickStamp}
          />
        )}
        {orderListType === OrderListTypeEnum.stopLimit && (
          <EntrustStopLimit
            isHideOtherPairs={isHideOtherPairs}
            setHideOtherPairs={setHideOtherPairs}
            setCount={setStopLimitCount}
            clsUl={clsUl}
            clsLi={clsLi}
            clickStamp={btnClickStamp}
          />
        )}
        {orderListType === OrderListTypeEnum.trailingStop && (
          <EntrustTrailingStop
            isHideOtherPairs={isHideOtherPairs}
            setHideOtherPairs={setHideOtherPairs}
            setCount={setTrailingStopCount}
            clsUl={clsUl}
            clsLi={clsLi}
            clickStamp={btnClickStamp}
          />
        )}
      </div>
    </div>
  );
};

export default observer(Main);
// export default Main;
