import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
import store from "store";

import styles from "./index.module.scss";

import { TradeSideEnum, TradeTypeEnum } from "store/trade";
import { OpenEntrustOrderProps } from "store/entrustOrder";
import { Dropdown, MenuProps } from "antd";
import { delete_entrustOrder } from "@/api/v4/order";
import SocketPrivate from "@/utils/socket/private";
import { thousands } from "@/utils/method";
import useGetEntrustOrderStateLab from "components/pages/trade/_cmpt/history/_hook/useGetEntrustOrderStateLab";
import AzScrollBarY from "@/components/az/scroll/barY";
import AppDivNoData from "@/components/app/div/noData";
import CMPT_btnPair from "@/components/pages/trade/_cmpt/history/_cmpt/btnPair";
import AzSvg from "@/components/az/svg";
import AzLoading from "@/components/az/loading";
import H5 from "./h5";

const { useTranslation } = Hooks;
const { Big, moment } = Util;

export interface OpenEntrustOrderExtendProps extends OpenEntrustOrderProps {
  _time: string;
  _pair: string;
  _type: string;
  _side: string;
  _sideCls: string;
  _amount: string;
  _turnRate: string;
  _triggerPrice: string;
  _activePrice: string;
  _state: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  setCount: (arg: undefined | number) => void;
  clsUl: string;
  clsLi: string;
  clickStamp?: string; //点击戳
}

const Main: React.FC<Props> = ({ className, isHideOtherPairs, setHideOtherPairs, setCount, clsUl, clsLi, clickStamp }) => {
  const t = useTranslation();
  const { isH5 } = store.app;
  const { openEntrustOrder, getOpenEntrustOrder } = store.entrustOrder;
  const { name, type, formatName, isLever } = store.market;
  const { getCurrencyDisplayName } = store.currency;

  const { getStateLabel } = useGetEntrustOrderStateLab();

  const [side, setSide] = useState<"" | TradeSideEnum>("");

  const items = useMemo(() => {
    if (!openEntrustOrder) return;
    const ary: OpenEntrustOrderExtendProps[] = [];

    openEntrustOrder.map((doc) => {
      if (doc.type !== TradeTypeEnum.trailingStop) return;
      if (side && doc.side !== side) return;
      if (isHideOtherPairs && doc.symbol !== name) return;

      const coinAry = doc.symbol.split("_");
      const coinSell = getCurrencyDisplayName(coinAry[0]);
      const coinBuy = getCurrencyDisplayName(coinAry[1]);

      ary.push({
        ...doc,
        _time: moment(doc.createdTime).formatMs(),
        _pair: formatName(doc.symbol),
        _type: "",
        _side: t("trade." + doc.side.toLocaleLowerCase()),
        _sideCls: doc.side === TradeSideEnum.buy ? "up-color" : "down-color",
        _amount: (() => {
          if (doc.side === TradeSideEnum.buy) {
            return +doc.quoteQty > 0 ? Big(doc.quoteQty).toFixedCy() + " " + coinBuy : "--";
          } else {
            return +doc.quantity > 0 ? Big(doc.quantity).toFixedCy() + " " + coinSell : "--";
          }
        })(),
        _turnRate: (() => {
          if (doc.turnRate) return doc.turnRate;
          return Big(doc.priceDiff || 0).toFixedCy() + " " + coinBuy;
        })(),
        _triggerPrice: doc.triggerPrice ? Big(doc.triggerPrice).toFixedCy() : "--",
        _activePrice: (() => {
          const { currentPrice = "0", activePrice = "0" } = doc;
          if (!+currentPrice || !+activePrice) return "--";

          if (+activePrice < +currentPrice) return t("trade.lastPrice") + "<=" + thousands(activePrice);
          return t("trade.lastPrice") + ">=" + thousands(activePrice);
        })(),
        _state: getStateLabel(doc),
      });
    });

    return ary;
  }, [name, openEntrustOrder, side, isHideOtherPairs, getCurrencyDisplayName]);
  const hasItem = useMemo(() => {
    return !!(items && items.length);
  }, [items]);
  useEffect(() => {
    if (!items) return setCount(undefined);
    setCount(items.length);
  }, [items]);

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

  const [loading, setLoading] = useState(true);

  const refLoadAry = useRef<string[]>([]);
  const handleCancelOne = useCallback((orderId) => {
    if (refLoadAry.current.includes(orderId)) return;
    refLoadAry.current.push(orderId);
    delete_entrustOrder(orderId, {
      errorPop: true,
      successPop: true,
    })
      .then(() => {
        !SocketPrivate.isReady && getOpenEntrustOrder();
      })
      .finally(() => {
        const index = refLoadAry.current.findIndex((str) => str === orderId);
        if (index >= 0) refLoadAry.current.splice(index, 1);
      });
  }, []);
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await store.entrustOrder.getOpenEntrustOrder();
    setLoading(false);
  }, []);

  useEffect(() => {
    // console.log("Errrrrrrr----");
    setLoading(items !== undefined ? false : true);
  }, [items]);
  useEffect(() => {
    if (!clickStamp) return;
    // console.log("clickStamp-----");
    handleRefresh();
  }, [clickStamp]);

  return (
    <>
      {isH5 ? (
        <H5
          isHideOtherPairs={isHideOtherPairs}
          setHideOtherPairs={setHideOtherPairs}
          handleCancelOne={handleCancelOne}
          handleRefresh={handleRefresh}
          side={side}
          setSide={setSide}
          items={items}
          disabled={loading}
        />
      ) : (
        <AzScrollBarY noWrap={store.app.rtl} className={cx(styles.AzScrollBarY, className)} options={{}}>
          <div className={styles.main}>
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
                <div>{t("trade.status")}</div>
                <div>{t("trade.excute")}</div>
              </div>
            </div>
            {items && (
              <div className={cx(clsUl, styles.ul)}>
                {!items.length ? (
                  <AppDivNoData className={styles.noData} />
                ) : (
                  items.map((doc) => {
                    return (
                      <div key={doc.id} className={cx(clsLi, styles.li)}>
                        <div>{doc._time}</div>
                        <div>
                          <CMPT_btnPair disabled={loading} symbol={doc.symbol} />
                        </div>
                        <div className={doc._sideCls}>{doc._side}</div>
                        <div>{doc._amount}</div>
                        <div>{doc._turnRate}</div>
                        <div>{doc._triggerPrice}</div>
                        <div>{doc._activePrice}</div>
                        <div>{doc._state}</div>
                        <div>
                          <button disabled={loading} className={"btnTxt"} onClick={() => handleCancelOne(doc.id)}>
                            <AzSvg icon="delete" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
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
