import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment } = Util;
import store from "store";
// import { routerPush, thousands, upperCaseFirstLetter } from "@/utils/method";
import { get_entrustOrderHistory } from "api/v4/order";

import { Dropdown, MenuProps } from "antd";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
import DateSelectBar from "components/pages/trade/_cmpt/history/_cmpt/dateSelectBar";
import MoreOrderTip from "components/pages/trade/_cmpt/history/_cmpt/moreOrderTip";
import useGetEntrustOrderState from "components/pages/trade/_cmpt/history/_hook/useGetEntrustOrderState";
import ListWithDetail from "./listWithDetail";
import H5 from "./h5";

import styles from "./index.module.scss";

import { TradeSideEnum, TradeTypeEnum } from "store/trade";
import { TypeEnum } from "store/market";
import { HistoryEntrustOrderProps, EntrustOrderStateEnum } from "store/entrustOrder";

interface QueryProps {
  type: string;
  limit: number;
  bizType: TypeEnum;
  symbol: WithUndefined<string>;
  side: WithUndefined<TradeSideEnum>;
  state: WithUndefined<EntrustOrderStateEnum>;
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
  const { wsEntrustOrder } = store.entrustOrder;

  const [loading, setLoading] = useState(true);
  const query = useRef<Partial<QueryProps>>({
    limit: 100,
  });
  const [items, setItems] = useState<HistoryEntrustOrderProps[]>();

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

  const [state, setState] = useState<"" | EntrustOrderStateEnum>("");
  const { dropdownItemsState, dropdownLabelState } = useGetEntrustOrderState({ state, setState });

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
      fn: get_entrustOrderHistory,
      config: {
        params: query.current,
      },
      success: ({ items }) => setItems(items),
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
    query.current.type = TradeTypeEnum.trailingStop;
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
  }, [wsEntrustOrder]);

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
                <div>{t("trade.amount")}</div>
                <div>{t("trade.turnRate")}</div>
                <div>{t("trade.triggerPrice2")}</div>
                <div>{t("trade.activePrice")}</div>
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
                      return <ListWithDetail key={doc.id} doc={doc} clsLi={cx(clsLi, styles.li)} disabled={loading} />;
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
