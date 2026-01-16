import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big, moment } = Util;
import store from "store";
import SocketPrivate from "@/utils/socket/private";
import { post_copyTradeOrderSell, post_copyTradeOrderSellAll, post_copyTradeOrderClose, post_copyTradeOrderCloseAll } from "api/v4/order";

import AppDivNoData from "components/app/div/noData";
import AzSvg from "components/az/svg";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import ModalShare from "./modalShare";
import ModalStopLimit from "./modalStopLimit";
import CMPT_btnPair from "../_cmpt/btnPair";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";

import { ClsUpDownEnum } from "store/app";
import { CopyTradeCurOrderProps } from "store/copyTrade";
import AntdModalAlert from "@/components/antd/modal/alert";

enum OrderListTypeEnum {
  detail = 1, //明细
  summary = 2, //汇总
}

export interface CopyTradeCurOrderExtendProps extends CopyTradeCurOrderProps {
  // _symbol: string;
  _amount: string;
  _buyPrice: string;
  _buyTime: string;
  _latestPrice: string;
  _profit: string;
  _profitRate: string;
  _profitCls: string;
  _leader: string;
  _coinQuantity: string;
  _coinPrice: string;
  _triggerProfitPrice: string;
  _triggerStopPrice: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  setCopyTradeCount: (arg: undefined | number) => void;
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  clsUl: string;
  clsLi: string;
  clickStamp?: string; //点击戳
}

const Main: React.FC<Props> = ({ className, setCopyTradeCount, isHideOtherPairs, setHideOtherPairs, clsUl, clsLi, clickStamp }) => {
  const t = useTranslation();
  // const {isLogin} = store.user;
  const { name, formatName } = store.market;
  const { currencyObj, getCurrencyDisplayName } = store.currency;
  const { tickers } = store.trade;
  const { curOrder, isFollower } = store.copyTrade;

  const [loading, setLoading] = useState(false);
  const [orderListType, setOrderListType] = useState<OrderListTypeEnum>(OrderListTypeEnum.detail);
  const [modalShareOpen, setModalShareOpen] = useState(false);
  const [modalStopLimitOpen, setModalStopLimitOpen] = useState(false);
  const [modalOrderId, setModalOrderId] = useState();

  const isDetail = useMemo(() => orderListType === OrderListTypeEnum.detail, [orderListType]);
  const items = useMemo(() => {
    if (!curOrder) return;

    const ary: CopyTradeCurOrderExtendProps[] = [];

    curOrder.map((doc) => {
      if (isHideOtherPairs && doc.symbol !== name) return;

      const coinQuantity = doc.symbol.split("_")[1];
      const coinPrice = doc.symbol.split("_")[1];
      const precision = (() => {
        if (!currencyObj || !currencyObj[coinPrice]) return 0;
        return currencyObj[coinPrice].maxPrecision >= 0 ? currencyObj[coinPrice].maxPrecision : 0;
      })();
      const latestPrice: string = (() => {
        const ticker = tickers.find((obj) => obj.s === doc.symbol);
        if (ticker && ticker.c) return ticker.c;
        return "";
      })();

      if (!isDetail) {
        const index = ary.findIndex((obj) => obj.symbol === doc.symbol);
        if (index >= 0) {
          const docPrev = ary[index];
          const buySize = Big(doc.buySize || 0)
            .add(docPrev.buySize || 0)
            .toFixed();
          const totalDoc = Big(doc.buyPrice || 0)
            .times(doc.buySize || 0)
            .toFixed();
          const totalPrev = Big(docPrev.buyPrice || 0)
            .times(docPrev.buySize || 0)
            .toFixed();
          const docMerge = {
            orderId: doc.symbol,
            symbol: doc.symbol,
            buySize,
            buyPrice: Big(totalPrev).add(totalDoc).div(buySize).toFixedMax(precision),
          };
          ary.splice(index, 1, getExtendDoc(docMerge));
          return;
        }
      }
      ary.push(getExtendDoc(doc));

      function getExtendDoc(doc): CopyTradeCurOrderExtendProps {
        const profit: string = (() => {
          if (!latestPrice) return "";
          return Big(latestPrice)
            .minus(doc.buyPrice || 0)
            .times(doc.buySize || 0)
            .toFixedMax(precision);
        })();

        return {
          ...doc,
          _amount: Big(doc.buySize || 0).toFixedCy(),
          _buyPrice: Big(doc.buyPrice || 0).toFixedCy(),
          _buyTime: doc.buyTime ? moment(doc.buyTime).format("YYYY-MM-DD HH:mm") : "",
          _latestPrice: latestPrice ? Big(latestPrice).toFixedCy() : "--",
          _profit: (profit ? Big(profit).toFixedCy() : "--") + " " + getCurrencyDisplayName(coinPrice),
          _profitRate: (() => {
            const val = Big(latestPrice || 0)
              .minus(doc.buyPrice)
              .div(doc.buyPrice)
              .times(100)
              .toFixedCy(2);
            return (+val > 0 ? "+" : "") + val + "%";
          })(),
          _profitCls: (() => {
            const val = +profit;
            if (val > 0) return ClsUpDownEnum.up;
            if (val < 0) return ClsUpDownEnum.down;
            return "";
          })(),
          _leader: doc.leaderNickname || "",
          _coinQuantity: getCurrencyDisplayName(coinQuantity),
          _coinPrice: getCurrencyDisplayName(coinPrice),
          _triggerProfitPrice: doc.triggerProfitPrice ? Big(doc.triggerProfitPrice).toFixedCy() : "--",
          _triggerStopPrice: doc.triggerStopPrice ? Big(doc.triggerStopPrice).toFixedCy() : "--",
        };
      }
    });

    return ary;
  }, [name, curOrder, isHideOtherPairs, tickers, currencyObj, orderListType]);
  const modalOrder = useMemo(() => {
    if (!modalOrderId || !items) return;
    return items.find((doc) => doc.orderId === modalOrderId);
  }, [modalOrderId, items]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await store.copyTrade.getCurOrder();
    setLoading(false);
  }, []);
  const handleClickShare = useCallback((doc) => {
    console.log("handleClickShare");
    setModalShareOpen(true);
    setModalOrderId(doc.orderId);
  }, []);
  const handleClickEdit = useCallback((doc) => {
    console.log("handleClickEdit");
    setModalStopLimitOpen(true);
    setModalOrderId(doc.orderId);
  }, []);
  const handleClickOnKeySell = useCallback(() => {
    AntdModalAlert.confirm({
      title: t("trade.oneKeySell"),
      closable: true,
      closeIcon: <SvgIcon className={"svgIcon"} src={SvgClose} />,
      content: t("trade.oneKeySellConfirmTxt"),
      onOk: () => {
        setLoading(true);
        post_copyTradeOrderSellAll({
          params: {
            leaderOrder: !store.copyTrade.isFollower,
          },
          errorPop: true,
          successPop: true,
        })
          .then(() => {
            setLoading(false);
            !SocketPrivate.isReady && handleRefresh();
          })
          .catch(() => {
            setLoading(false);
          });
      },
    });
  }, [handleRefresh]);
  const handleClickSell = useCallback(
    (doc) => {
      AntdModalAlert({
        title: t("trade.sell"),
        okText: t("confirm"),
        closable: true,
        closeIcon: <SvgIcon className={"svgIcon"} src={SvgClose} />,
        content: (
          <div className={cx(styles.orderSellConfirm)}>
            <div>
              <div>
                <div>{t("trade.pair")}</div>
                <div>{formatName(doc.symbol)}</div>
              </div>
              <div>
                <div>{t("trade.buyPrice")}</div>
                <div>{doc._buyPrice + " " + doc._coinPrice}</div>
              </div>
              <div>
                <div>{t("trade.sellPrice")}</div>
                <div>{t("trade.marketPrice")}</div>
              </div>
              <div>
                <div>{t("trade.sellAmount")}</div>
                <div>{doc._amount + " " + doc._coinQuantity}</div>
              </div>
              <div>
                <div>{t("trade.unrealizedP/L")}</div>
                <div className={cx(doc._profitCls)}>{doc._profit}</div>
              </div>
            </div>
          </div>
        ),
        onOk: () => {
          setLoading(true);
          const func = isDetail ? post_copyTradeOrderSell : post_copyTradeOrderSellAll;
          const params = (() => {
            if (store.copyTrade.isFollower) {
              if (isDetail) {
                return {
                  leaderOrderId: doc.leaderOrderId,
                  symbol: doc.symbol,
                };
              } else {
                return {
                  leaderOrder: false,
                  symbol: doc.symbol,
                };
              }
            } else {
              if (isDetail) {
                return {
                  leaderOrderId: doc.orderId,
                  symbol: doc.symbol,
                };
              } else {
                return {
                  leaderOrder: true,
                  symbol: doc.symbol,
                };
              }
            }
          })();

          func({
            params,
            errorPop: true,
            successPop: true,
          })
            .then(() => {
              setLoading(false);
              !SocketPrivate.isReady && handleRefresh();
            })
            .catch(() => {
              setLoading(false);
            });
        },
      });
    },
    [isDetail]
  );
  const handleClickEnd = useCallback(
    (doc) => {
      AntdModalAlert.confirm({
        title: t("trade.end"),
        closable: true,
        closeIcon: <SvgIcon className={"svgIcon"} src={SvgClose} />,
        content: t("trade.endCopyTradeTxt"),
        onOk: () => {
          setLoading(true);
          const func = isDetail ? post_copyTradeOrderClose : post_copyTradeOrderCloseAll;
          const params = isDetail
            ? {
                leaderOrderId: doc.leaderOrderId,
                symbol: doc.symbol,
              }
            : {
                symbol: doc.symbol,
              };

          func({
            params,
            errorPop: true,
            successPop: true,
          })
            .then(() => {
              setLoading(false);
              !SocketPrivate.isReady && handleRefresh();
            })
            .catch(() => {
              setLoading(false);
            });
        },
      });
    },
    [isDetail]
  );

  useEffect(() => {
    if (!clickStamp) return;
    handleRefresh();
  }, [clickStamp]);

  return (
    <>
      <AzScrollBarY noWrap={store.app.rtl} className={cx(styles.AzScrollBarY, isFollower ? styles.follower : styles.leader, className)} options={{}}>
        <div className={cx(styles.main, isDetail ? styles.main_detail : styles.main_summary, className)}>
          <div className={styles.bar}>
            <div>
              <button
                disabled={loading}
                className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.detail })}
                onClick={() => setOrderListType(OrderListTypeEnum.detail)}
              >
                {t("trade.details")}
              </button>
              <button
                disabled={loading}
                className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.summary })}
                onClick={() => setOrderListType(OrderListTypeEnum.summary)}
              >
                {t("trade.summary")}
              </button>
            </div>
            <div>
              <button disabled={loading} className={cx("btnTxt", styles.atv)} onClick={handleClickOnKeySell}>
                {t("trade.oneKeySell")}
              </button>
            </div>
          </div>
          <div className={styles.nav}>
            <div className={cx(clsLi, styles.li)}>
              <div>{t("trade.pair")}</div>
              <div>{t("trade.amount")}</div>
              <div>{t("trade.buyPrice")}</div>
              <div>{t("trade.lastPrice2")}</div>
              <div>{t("trade.profit2rate")}</div>
              {isFollower && isDetail && <div>{t("trade.copyTradeLeader")}</div>}
              <div>{t("trade.excute")}</div>
              {isDetail && <div>{t("trade.tp2sl")}</div>}
            </div>
          </div>
          {items && (
            <div className={cx(clsUl, styles.ul)}>
              {!items.length ? (
                <AppDivNoData className={styles.noData} />
              ) : (
                items.map((doc) => {
                  return (
                    <div key={isDetail ? doc.orderId : doc.symbol} className={cx(clsLi, styles.li)}>
                      <div>
                        <CMPT_btnPair disabled={loading} symbol={doc.symbol} />
                      </div>
                      <div>{doc._amount}</div>
                      <div className={cx(styles.li_price)}>
                        <div>{doc._buyPrice}</div>
                        <p>{doc._buyTime}</p>
                      </div>
                      <div>{doc._latestPrice}</div>
                      <div className={cx(styles.li_div2btn)}>
                        <div className={cx(doc._profitCls)}>
                          <div>{doc._profit}</div>
                          <div>{doc._profitRate}</div>
                        </div>
                        <div></div>
                        <div>
                          <button disabled={loading} className={cx("btnTxt")} onClick={() => handleClickShare(doc)}>
                            <AzSvg icon={"share"} />
                          </button>
                        </div>
                      </div>
                      {isFollower && isDetail && <div>{doc._leader}</div>}
                      <div className={cx(styles.li_opt)}>
                        <button disabled={loading} className={cx("btnTxt", styles.atv)} onClick={() => handleClickSell(doc)}>
                          {isDetail ? t("trade.sell") : t("trade.allSell")}
                        </button>
                        {isFollower && (
                          <button disabled={loading} className={cx("btnTxt", styles.atv)} onClick={() => handleClickEnd(doc)}>
                            {t("trade.end")}
                          </button>
                        )}
                      </div>
                      {isDetail && (
                        <div className={cx(styles.li_div2btn, styles.li_tp2tl)}>
                          <div>
                            <div>{doc._triggerProfitPrice}</div>
                            <div>{doc._triggerStopPrice}</div>
                          </div>
                          <div></div>
                          <div>
                            <button disabled={loading} className={cx("btnTxt")} onClick={() => handleClickEdit(doc)}>
                              <AzSvg icon={"edit"} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </AzScrollBarY>
      {loading && <AzLoading />}
      {!!modalOrder && <ModalStopLimit doc={modalOrder} open={modalStopLimitOpen} onCancel={() => setModalStopLimitOpen(false)} />}
      {!!modalOrder && <ModalShare doc={modalOrder} open={modalShareOpen} onCancel={() => setModalShareOpen(false)} />}
    </>
  );
};

export default observer(Main);
// export default Main;
