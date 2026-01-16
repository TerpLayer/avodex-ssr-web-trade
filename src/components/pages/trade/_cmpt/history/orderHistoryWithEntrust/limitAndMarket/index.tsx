import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment } = Util;
import store from "store";
// import { routerPush, thousands, upperCaseFirstLetter } from "@/utils/method";
import { get_historyOrder } from "api/v4/order";

import { Dropdown, MenuProps } from "antd";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
import DateSelectBar from "../../_cmpt/dateSelectBar";
import MoreOrderTip from "../../_cmpt/moreOrderTip";
import ListWithDetail from "./listWithDetail";
import H5 from "./h5";

import styles from "./index.module.scss";

import { TradeSideEnum, TradeOrderStateEnum } from "store/trade";
import { TypeEnum } from "@/store/market";

export interface OrderHistoryProps {
  orderId: string;
  time: number;
  updatedTime?: number; //更新时间
  symbol: string;
  type: string;
  side: string;
  avgPrice?: string;
  price: string;
  tradeBase: string;
  origQty: string; //原始数量
  tradeQuote: string; //成交报价(成交金额)
  executedQty: string; //成交报价(成交金额)
  state: TradeOrderStateEnum; //订单状态
  symbolType?: "normal" | "nft"; //类型
}

interface QueryProps {
  limit: number;
  bizType: TypeEnum;
  symbol: WithUndefined<string>;
  side: WithUndefined<TradeSideEnum>;
  state: WithUndefined<TradeOrderStateEnum>;
  startTime: number;
  endTime: number;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  clsUl: string;
  clsLi: string;
}

const Main: React.FC<Props> = ({ className, isHideOtherPairs, setHideOtherPairs, clsUl, clsLi }) => {
  // const router = useRouter();
  const t = useTranslation();
  const { isH5 } = store.app;
  const { name, type } = store.market;
  const { wsOrder } = store.balances;

  const [loading, setLoading] = useState(true);
  const query = useRef<Partial<QueryProps>>({
    limit: 100,
  });
  const [items, setItems] = useState<OrderHistoryProps[]>();

  const [side, setSide] = useState<"" | TradeSideEnum>("");
  const dropdownItemsSide: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "",
        label: <a onClick={() => setSide("")}>{t("trade.all")}</a>,
      },
      {
        key: TradeSideEnum.buy,
        label: <a onClick={() => setSide(TradeSideEnum.buy)}>{t("trade.buy")}</a>,
      },
      {
        key: TradeSideEnum.sell,
        label: <a onClick={() => setSide(TradeSideEnum.sell)}>{t("trade.sell")}</a>,
      },
    ];
  }, []);
  const dropdownLabelSide = useMemo(() => {
    if (side === TradeSideEnum.buy) return t("trade.buy");
    if (side === TradeSideEnum.sell) return t("trade.sell");
    return t("trade.direction");
  }, [side]);

  const [state, setState] = useState<"" | TradeOrderStateEnum>("");
  const OrderStateMemo = useMemo(() => {
    return {
      [TradeOrderStateEnum.FILLED]: t("trade.filled"),
      [TradeOrderStateEnum.PARTIALLY_FILLED]: t("trade.partiallyFilled"),
      [TradeOrderStateEnum.CANCELED]: t("trade.canceled"),
      [TradeOrderStateEnum.EXPIRED]: t("trade.expired"),
      [TradeOrderStateEnum.REJECTED]: t("trade.rejected"),
    };
  }, []);
  const dropdownItemsState: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "",
        label: <a onClick={() => setState("")}>{t("trade.all")}</a>,
      },
      {
        key: TradeOrderStateEnum.FILLED,
        label: <a onClick={() => setState(TradeOrderStateEnum.FILLED)}>{OrderStateMemo[TradeOrderStateEnum.FILLED]}</a>,
      },
      {
        key: TradeOrderStateEnum.PARTIALLY_FILLED,
        label: <a onClick={() => setState(TradeOrderStateEnum.PARTIALLY_FILLED)}>{OrderStateMemo[TradeOrderStateEnum.PARTIALLY_FILLED]}</a>,
      },
      {
        key: TradeOrderStateEnum.CANCELED,
        label: <a onClick={() => setState(TradeOrderStateEnum.CANCELED)}>{OrderStateMemo[TradeOrderStateEnum.CANCELED]}</a>,
      },
      {
        key: TradeOrderStateEnum.REJECTED,
        label: <a onClick={() => setState(TradeOrderStateEnum.REJECTED)}>{OrderStateMemo[TradeOrderStateEnum.REJECTED]}</a>,
      },
      {
        key: TradeOrderStateEnum.EXPIRED,
        label: <a onClick={() => setState(TradeOrderStateEnum.EXPIRED)}>{OrderStateMemo[TradeOrderStateEnum.EXPIRED]}</a>,
      },
    ];
  }, [OrderStateMemo]);
  const dropdownLabelState = useMemo(() => {
    if (state === TradeOrderStateEnum.FILLED) return OrderStateMemo[TradeOrderStateEnum.FILLED];
    if (state === TradeOrderStateEnum.PARTIALLY_FILLED) return OrderStateMemo[TradeOrderStateEnum.PARTIALLY_FILLED];
    if (state === TradeOrderStateEnum.CANCELED) return OrderStateMemo[TradeOrderStateEnum.CANCELED];
    if (state === TradeOrderStateEnum.REJECTED) return OrderStateMemo[TradeOrderStateEnum.REJECTED];
    if (state === TradeOrderStateEnum.EXPIRED) return OrderStateMemo[TradeOrderStateEnum.EXPIRED];
    return t("trade.status");
  }, [state, OrderStateMemo]);

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const resetTime = useCallback(() => {
    const startTime = moment().subtract(30, "days").startOf("day").valueOf();
    const endTime = moment().endOf("day").valueOf();
    setStartTime(startTime);
    setEndTime(endTime);
    return { startTime, endTime };
  }, []);
  useEffect(() => {
    resetTime();
  }, []);

  const apiReqTradeArg = useMemo(() => {
    return {
      fn: get_historyOrder,
      config: {
        params: query.current,
      },
      success: ({ items }) => setItems(items),
      error: () => setItems([]),
      callback: () => setLoading(false),
    };
  }, [query]);
  const apiReqTrade = useAxiosCancelFun(apiReqTradeArg);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    apiReqTrade();
  }, [apiReqTrade]);

  const handleSearch = useCallback(
    (send) => {
      console.log("handleSearch", send);
      if (send.startTime === startTime && send.endTime === endTime) return handleRefresh();
      setStartTime(send.startTime);
      setEndTime(send.endTime);
    },
    [handleRefresh, startTime, endTime]
  );

  useEffect(() => {
    if (!startTime || !endTime) return;
    query.current.bizType = type;
    query.current.symbol = isHideOtherPairs ? name : undefined;
    query.current.side = side ? side : undefined;
    query.current.state = state ? state : undefined;
    query.current.startTime = startTime;
    query.current.endTime = endTime;

    handleRefresh();
  }, [name, type, isHideOtherPairs, side, state, startTime, endTime]);

  const isFirst = useRef(true);
  useEffect(() => {
    if (!isFirst.current) {
      // setLoading(true);
      apiReqTrade();
    }
    isFirst.current = false;
  }, [wsOrder]);

  return (
    <>
      {isH5 ? (
        <H5
          isHideOtherPairs={isHideOtherPairs}
          setHideOtherPairs={setHideOtherPairs}
          handleRefresh={handleRefresh}
          side={side}
          setSide={setSide}
          state={state}
          setState={setState}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          resetTime={resetTime}
          items={items}
          disabled={loading}
        />
      ) : (
        <AzScrollBarY noWrap={store.app.rtl} className={cx(styles.AzScrollBarY, className)} options={{}}>
          <div className={cx(styles.main, className)}>
            <DateSelectBar disabled={loading} onSearch={handleSearch} />
            <div className={styles.nav}>
              <div className={cx(clsLi, styles.li)}>
                <div>{t("trade.time")}</div>
                <div>{t("trade.pair")}</div>
                <div>{t("trade.type")}</div>
                <div>
                  <Dropdown
                    disabled={loading}
                    placement={"bottomLeft"}
                    getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
                    menu={{
                      items: dropdownItemsSide,
                      selectable: true,
                      selectedKeys: [side],
                    }}
                  >
                    <button className={"btnTxt btnDrop"}>
                      <span>{dropdownLabelSide}</span>
                    </button>
                  </Dropdown>
                </div>
                <div>{t("trade.avgTradedPrice")}</div>
                <div>{t("trade.price")}</div>
                <div>{t("trade.executed")}</div>
                <div>{t("trade.amount")}</div>
                <div>{t("trade.openOrderTotal")}</div>
                <div>
                  <Dropdown
                    disabled={loading}
                    placement={"bottomRight"}
                    getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
                    menu={{
                      items: dropdownItemsState,
                      selectable: true,
                      selectedKeys: [state],
                    }}
                  >
                    <button className={"btnTxt btnDrop"}>
                      <span>{dropdownLabelState}</span>
                    </button>
                  </Dropdown>
                </div>
              </div>
            </div>

            {items && (
              <div className={cx(clsUl, styles.ul)}>
                {!items.length ? (
                  <AppDivNoData className={styles.noData} />
                ) : (
                  <div className={styles.ulCon}>
                    {items.map((doc) => {
                      return <ListWithDetail key={doc.orderId} doc={doc} clsLi={cx(clsLi, styles.li)} disabled={loading} OrderStateMemo={OrderStateMemo} />;
                    })}
                  </div>
                )}

                <MoreOrderTip type="order" />
              </div>
            )}
          </div>
        </AzScrollBarY>
      )}
      {loading && <AzLoading />}
    </>
  );
};

export default observer(Main);
// export default Main;
