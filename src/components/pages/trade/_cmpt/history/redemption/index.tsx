import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big, moment } = Util;
import store from "store";
// import { routerPush, thousands, upperCaseFirstLetter } from "@/utils/method";
import { get_orderV4RedeemList } from "api/old/redemption";

import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
import DateSelectBar from "../_cmpt/dateSelectBar";
import WithPoint from "../_cmpt/withPoint";
import MoreOrderTip from "../_cmpt/moreOrderTip";

import styles from "./index.module.scss";

interface OrderEtfRedeemProps {
  orderDetails?: string;
  id: number;
  dealPair: string;
  dealType: string;
  count: string;
  countUnit: string;
  status: string; //1=未交易，2=交易成功，3=交易失败，4=未知
  netWorth: string;
  feeRate: number;
  fee: string;
  feeUnit: string;
  price: string;
  priceUnit: string;
  createTime: number;
  uid: number;
  utype: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  clsUl: string;
  clsLi: string;
}

const Main: React.FC<Props> = ({ className, clsUl, clsLi }) => {
  // const router = useRouter();
  const t = useTranslation();
  // const { isLogin } = store.user;
  const { name, type } = store.market;
  const { wsOrder } = store.balances;
  const { getCurrencyDisplayName } = store.currency;

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState();
  const [items, setItems] = useState<OrderEtfRedeemProps[]>();

  const getStatusStr = useCallback((doc) => {
    const obj = {
      "1": t("trade.noTrade"),
      "2": t("trade.tradeSuccess"),
      "3": t("trade.tradeFail"),
      "4": t("trade.tradeUnknown"),
    };
    return obj[doc.status];
  }, []);
  const getStatusCls = useCallback((doc) => {
    const obj = {
      "2": "success",
      "3": "error",
      "4": "warn",
    };

    return obj[doc.status];
  }, []);

  const apiReqArg = useMemo(() => {
    return {
      fn: get_orderV4RedeemList,
      config: {
        params: query,
      },
      success: ({ items }) => setItems(items),
      callback: () => setLoading(false),
    };
  }, [query]);
  const apiReq = useAxiosCancelFun(apiReqArg);

  const handleSearch = useCallback(
    (send) => {
      console.log("handleSearch", send);
      setQuery({
        ...(query || {}),
        ...send,
      });
    },
    [query]
  );

  useEffect(() => {
    const send: any = {
      limit: 100,
      bizType: type,
    };

    setQuery({
      ...(query || {
        startTime: moment().subtract(30, "days").startOf("day").valueOf(),
        endTime: moment().endOf("day").valueOf(),
      }),
      ...send,
    });
  }, [name, type]);
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    apiReq();
  }, [query]);

  const isFirst = useRef(true);
  useEffect(() => {
    if (!isFirst.current) {
      // setLoading(true);
      apiReq();
    }
    isFirst.current = false;
  }, [wsOrder]);

  return (
    <>
      <AzScrollBarY noWrap={store.app.rtl} className={cx(styles.AzScrollBarY, className)} options={{}}>
        <div className={cx(styles.main, className)}>
          <DateSelectBar disabled={loading} onSearch={handleSearch} />
          <div className={styles.nav}>
            <div className={cx(clsLi, styles.li)}>
              <div>{t("trade.time")}</div>
              <div>{t("trade.coin")}</div>
              <div>{t("trade.etfNet")}</div>
              <div>{t("trade.applyNum")}</div>
              <div>{t("trade.fee")}</div>
              <div>{t("trade.totalExpenses")}</div>
              <div>{t("trade.status")}</div>
            </div>
          </div>

          {items && (
            <div className={cx(clsUl, styles.ul)}>
              {!items.length ? (
                <AppDivNoData className={styles.noData} />
              ) : (
                <div className={styles.ulCon}>
                  {items.map((doc) => {
                    return (
                      <div key={doc.id} className={cx(clsLi, styles.li)}>
                        <div>{moment(doc.createTime).formatMs()}</div>
                        <div>{getCurrencyDisplayName(doc.countUnit)}</div>
                        <div>{Big(doc.netWorth || 0).toFixedCy() + " USDT"}</div>
                        <div>{Big(doc.count || 0).toFixedCy() + " " + getCurrencyDisplayName(doc.countUnit)}</div>
                        <div>{Big(doc.fee || 0).toFixedCy() + " " + getCurrencyDisplayName(doc.feeUnit)}</div>
                        <div>{Big(doc.price || 0).toFixedCy() + " " + getCurrencyDisplayName(doc.priceUnit)}</div>
                        <div className={styles.status}>
                          <WithPoint status={getStatusCls(doc)}>{getStatusStr(doc)}</WithPoint>
                        </div>
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
      {loading && <AzLoading />}
    </>
  );
};

export default observer(Main);
// export default Main;
