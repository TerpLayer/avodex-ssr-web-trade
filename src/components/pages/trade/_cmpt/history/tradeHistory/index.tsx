import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big, moment } = Util;
import store from "store";
import { routerPush, upperCaseFirstLetter } from "@/utils/method";
import { get_trade } from "api/v4/order";

import { Dropdown, MenuProps, Tooltip } from "antd";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import AzLoading from "components/az/loading";
import AzSvg from "components/az/svg";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
import DateSelectBar from "../_cmpt/dateSelectBar";
import MoreOrderTip from "../_cmpt/moreOrderTip";
import CMPT_btnPair from "../_cmpt/btnPair";
import H5 from "./h5";

import styles from "./index.module.scss";

import { TradeSideEnum } from "store/trade";
import { TypeEnum } from "store/market";

export enum OrderTradeDeductEnum {
  COUPON = "COUPON", //卡券
  PLATFORM_CURRENCY = "PLATFORM_CURRENCY", //平台币抵扣
}

export interface OrderTradeProps {
  tradeId: string;
  orderId: string;
  symbol: string;
  time: number;
  orderSide: TradeSideEnum;
  price: string;
  quantity: string;
  quoteQty: string;
  fee: string;
  feeCurrency: string;
  baseCurrency: string;
  quoteCurrency: string;
  takerMaker: string;
  nftId?: string;
  symbolType?: "normal" | "nft"; //类型
  deductType: OrderTradeDeductEnum | null; //抵扣类型
  deductFee: string; //抵扣手续费(减免部分)
  couponAmount: string; //折扣为抵扣券时抵扣券币种使用数量
  couponCurrency: string; //折扣为抵扣券时抵扣券币种
}

export interface OrderTradeExtendProps extends OrderTradeProps {
  _time: string;
  _pair: string;
  _side: string;
  _sideCls: string;
  _price: string;
  _executed: string;
  _total: string;
  _fee: string;
  _feeTip: string;
  _role: string;
}

interface QueryProps {
  limit: number;
  bizType: TypeEnum;
  symbol: WithUndefined<string>;
  orderSide: WithUndefined<TradeSideEnum>;
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
  const t = useTranslation();
  const { isH5 } = store.app;
  const { name, type, formatName, isLever } = store.market;
  const { wsOrder } = store.balances;
  const { wsEntrustOrder } = store.entrustOrder;

  const [loading, setLoading] = useState(false);
  const query = useRef<Partial<QueryProps>>({
    limit: 100,
  });
  const [items, setItems] = useState<OrderTradeProps[]>();

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

  const getFeeStr = useCallback((doc) => {
    const { fee, feeCurrency, orderSide, baseCurrency, quoteCurrency } = doc;

    const feeStr = Big(fee || 0).toFixedCy() + " ";

    if (feeCurrency) return feeStr + store.currency.getCurrencyDisplayName(feeCurrency);

    return orderSide === TradeSideEnum.buy
      ? feeStr + store.currency.getCurrencyDisplayName(baseCurrency)
      : feeStr + store.currency.getCurrencyDisplayName(quoteCurrency);
  }, []);
  const getFeeTip = useCallback((doc) => {
    const { deductType, deductFee, couponAmount, couponCurrency, feeCurrency } = doc;
    if (deductType !== OrderTradeDeductEnum.COUPON) return "";
    if (feeCurrency === couponCurrency) return t("trade.deductLab", [deductFee + " " + store.currency.getCurrencyDisplayName(feeCurrency)]);
    const label =
      deductFee + " " + store.currency.getCurrencyDisplayName(feeCurrency) + " ≈ " + couponAmount + " " + store.currency.getCurrencyDisplayName(couponCurrency);
    return t("trade.deductLab", [label]);
  }, []);

  const itemsExtend = useMemo<WithUndefined<OrderTradeExtendProps[]>>(() => {
    if (!items) return undefined;
    const ary: OrderTradeExtendProps[] = [];
    items.map((doc) => {
      ary.push({
        ...doc,
        _time: moment(doc.time).formatMs(),
        _pair: formatName(doc.symbol),
        _side: t("trade." + doc.orderSide.toLocaleLowerCase()),
        _sideCls: doc.orderSide === TradeSideEnum.buy ? "up-color" : "down-color",
        _price: Big(doc.price || 0).toFixedCy(),
        _executed: Big(doc.quantity || 0).toFixedCy(),
        _total: Big(doc.quoteQty || 0).toFixedCy(),
        _fee: getFeeStr(doc),
        _feeTip: getFeeTip(doc),
        _role: upperCaseFirstLetter(doc.takerMaker),
      });
    });
    return ary;
  }, [items, getFeeStr]);

  const apiReqTradeArg = useMemo(() => {
    return {
      fn: get_trade,
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
    query.current.orderSide = side ? side : undefined;
    query.current.startTime = startTime;
    query.current.endTime = endTime;

    handleRefresh();
  }, [name, type, isHideOtherPairs, side, startTime, endTime]);

  const isFirst = useRef(true);
  useEffect(() => {
    if (!isFirst.current) {
      // setLoading(true);
      apiReqTrade();
    }
    isFirst.current = false;
  }, [wsOrder, wsEntrustOrder]);

  return (
    <>
      {isH5 ? (
        <H5
          isHideOtherPairs={isHideOtherPairs}
          setHideOtherPairs={setHideOtherPairs}
          handleRefresh={handleRefresh}
          side={side}
          setSide={setSide}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          resetTime={resetTime}
          items={itemsExtend}
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
                <div>{t("trade.price")}</div>
                <div>{t("trade.executed")}</div>
                <div>{t("trade.openOrderTotal")}</div>
                <div>{t("trade.fee")}</div>
                <div className={styles.role}>
                  <span>{t("trade.makerTaker")}</span>
                  <Tooltip
                    placement="topRight"
                    overlayStyle={{ maxWidth: "500px" }}
                    title={
                      <div style={{ padding: 24 }}>
                        <b>{t("trade.whatIsMaker")}</b>
                        <div>{t("trade.makerExplain")}</div>
                        <b>{t("trade.whatIsTaker")}</b>
                        <div>{t("trade.takerExplain")}</div>
                      </div>
                    }
                  >
                    <span>
                      {/* <AzSvg icon={"faq"} /> */}
                      <svg style={{ marginLeft: 4 }} xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                        <path
                          d="M8.33333 16.6667C3.73096 16.6667 0 12.9357 0 8.33333C0 3.73096 3.73096 0 8.33333 0C12.9357 0 16.6667 3.73096 16.6667 8.33333C16.6667 12.9357 12.9357 16.6667 8.33333 16.6667ZM8.33333 15C12.0153 15 15 12.0153 15 8.33333C15 4.65143 12.0153 1.66667 8.33333 1.66667C4.65143 1.66667 1.66667 4.65143 1.66667 8.33333C1.66667 12.0153 4.65143 15 8.33333 15ZM7.5 10.8333H9.16667V12.5H7.5V10.8333ZM7.5 4.16667H9.16667V9.16667H7.5V4.16667Z"
                          fill="#464646"
                        />
                      </svg>
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>

            {itemsExtend && (
              <div className={cx(clsUl, styles.ul)}>
                {!itemsExtend.length ? (
                  <AppDivNoData className={styles.noData} />
                ) : (
                  <div className={styles.ulCon}>
                    {itemsExtend.map((doc) => {
                      return (
                        <div key={doc.tradeId} className={cx(clsLi, styles.li)}>
                          <div>{doc._time}</div>
                          <div>
                            <CMPT_btnPair disabled={loading} symbol={doc.symbol} />
                          </div>
                          <div className={doc._sideCls}>{doc._side}</div>
                          <div>{doc._price}</div>
                          <div>{doc._executed}</div>
                          <div>{doc._total}</div>
                          <div>
                            {!doc._feeTip ? (
                              doc._fee
                            ) : (
                              <Tooltip placement="topLeft" title={doc._feeTip}>
                                <span className={cx(styles.tipStr)}>{doc._fee}</span>
                              </Tooltip>
                            )}
                          </div>
                          <div>{doc._role}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <MoreOrderTip />
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
