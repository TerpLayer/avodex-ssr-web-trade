import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big, moment } = Util;
// import store from "store";

import { Checkbox, Dropdown, MenuProps, Tooltip } from "antd";
import AzSvg from "@/components/az/svg";
import AppDivNoData from "components/app/div/noData";
import WithPoint from "components/pages/trade/_cmpt/history/_cmpt/withPoint";
import useGetEntrustOrderState from "components/pages/trade/_cmpt/history/_hook/useGetEntrustOrderState";
import MoreOrderTip from "components/pages/trade/_cmpt/history/_cmpt/moreOrderTip";
import CMPT_btnPair from "components/pages/trade/_cmpt/history/_cmpt/btnPair";
import CMPT_filter from "components/pages/trade/_cmpt/history/_cmpt/filter";
import CMPT_dateSelectMobile from "components/pages/trade/_cmpt/history/_cmpt/dateSelectMobile";
import Modal from "../modal";

import styles_h5 from "components/pages/trade/_cmpt/history/h5.module.scss";
import styles from "./h5.module.scss";

import { TradeSideEnum, TradeOrderStateEnum } from "store/trade";
import { EntrustOrderStateEnum, HistoryEntrustOrderProps } from "store/entrustOrder";

interface Props extends HTMLAttributes<HTMLDivElement> {
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  handleRefresh: () => void;
  side: "" | TradeSideEnum;
  setSide: (arg: "" | TradeSideEnum) => void;
  state: "" | EntrustOrderStateEnum;
  setState: (arg: "" | EntrustOrderStateEnum) => void;
  startTime: number;
  setStartTime: (arg: number) => void;
  endTime: number;
  setEndTime: (arg: number) => void;
  resetTime: () => void;
  items?: HistoryEntrustOrderProps[];
  disabled?: boolean;
}

const Main: React.FC<Props> = ({
  isHideOtherPairs,
  setHideOtherPairs,
  handleRefresh,
  side,
  setSide,
  state,
  setState,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  resetTime,
  items,
  disabled,
}) => {
  const t = useTranslation();

  const [selfSide, setSelfSide] = useState(side);
  const dropdownItemsSide: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "",
        label: <a onClick={() => setSelfSide("")}>{t("trade.all")}</a>,
      },
      {
        key: TradeSideEnum.buy,
        label: <a onClick={() => setSelfSide(TradeSideEnum.buy)}>{t("trade.buy")}</a>,
      },
      {
        key: TradeSideEnum.sell,
        label: <a onClick={() => setSelfSide(TradeSideEnum.sell)}>{t("trade.sell")}</a>,
      },
    ];
  }, []);
  const dropdownLabelSide = useMemo(() => {
    if (selfSide === TradeSideEnum.buy) return t("trade.buy");
    if (selfSide === TradeSideEnum.sell) return t("trade.sell");
    return t("trade.all");
  }, [selfSide]);

  const [selfState, setSelfState] = useState(state);
  const { dropdownItemsState, dropdownLabelState, getStateLabel, getStateCls } = useGetEntrustOrderState({ state: selfState, setState: setSelfState });

  const [selfStartTime, setSelfStartTime] = useState(startTime);
  const [selfEndTime, setSelfEndTime] = useState(endTime);

  const [curDoc, setCurDoc] = useState<null | HistoryEntrustOrderProps>();
  const handleViewMore = useCallback((doc) => {
    setCurDoc(doc);
  }, []);

  const handleDrawerOpen = useCallback(() => {
    setSelfSide(side);
    setSelfState(state);
    setSelfStartTime(startTime);
    setSelfEndTime(endTime);
  }, [side, state, startTime, endTime]);
  const handleDrawerReset = useCallback(() => {
    setSide("");
    setState("");
    resetTime();
  }, []);
  const handleDrawerSearch = useCallback(() => {
    if (selfSide === side && selfState === state && selfStartTime === startTime && selfEndTime === endTime) return handleRefresh();
    setSide(selfSide);
    setState(selfState);
    setStartTime(selfStartTime);
    setEndTime(selfEndTime);
  }, [handleRefresh, selfSide, selfState, selfStartTime, selfEndTime]);

  return (
    <div className={cx(styles_h5.main, styles.main)}>
      <div className={styles_h5.nav}>
        <Checkbox className={styles_h5.checkbox} checked={isHideOtherPairs} onChange={(e) => setHideOtherPairs(e.target.checked)}>
          {t("trade.hideOtherSymbol")}
        </Checkbox>

        <div className={styles_h5.opts}>
          <CMPT_filter onOpen={handleDrawerOpen} onReset={handleDrawerReset} onSearch={handleDrawerSearch}>
            <CMPT_dateSelectMobile startTime={selfStartTime} setStartTime={setSelfStartTime} endTime={selfEndTime} setEndTime={setSelfEndTime} />
            <div className={styles_h5.li2}>
              <div className={styles_h5.dropdown}>
                <p>{t("trade.direction")}</p>
                <Dropdown
                  overlayClassName={styles_h5.overlay}
                  disabled={disabled}
                  // getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
                  menu={{
                    items: dropdownItemsSide,
                    selectable: true,
                    selectedKeys: [selfSide],
                  }}
                >
                  <button className={cx("btnTxt btnDrop", styles.trigger)} onClick={(e) => e.preventDefault()}>
                    <span>{dropdownLabelSide}</span>
                  </button>
                </Dropdown>
              </div>
              <div className={styles_h5.dropdown}>
                <p>{t("trade.status")}</p>
                <Dropdown
                  overlayClassName={styles_h5.overlay}
                  disabled={disabled}
                  // getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
                  menu={{
                    items: dropdownItemsState,
                    selectable: true,
                    selectedKeys: [selfState],
                  }}
                >
                  <button className={cx("btnTxt btnDrop", styles.trigger)} onClick={(e) => e.preventDefault()}>
                    <span>{dropdownLabelState}</span>
                  </button>
                </Dropdown>
              </div>
            </div>
          </CMPT_filter>
        </div>
      </div>

      {items && (
        <div className={styles_h5.content}>
          <MoreOrderTip style={{ paddingInlineStart: 0, paddingInlineEnd: 0 }} type="order" />
          {!items.length ? (
            <AppDivNoData />
          ) : (
            items.map((doc) => {
              const { state } = doc;
              const cls = getStateCls(state);
              const lab = getStateLabel(state);

              return (
                <div key={doc.id} className={styles_h5.card}>
                  <div className={styles_h5.cardNav}>
                    <CMPT_btnPair disabled={disabled} symbol={doc.symbol} />

                    <button disabled={disabled} className={cx("btnTxt", styles_h5.atv)} onClick={() => handleViewMore(doc)}>
                      {t("trade.transDetails")}
                    </button>
                  </div>

                  <div className={styles_h5.cardUl}>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.time")}</div>
                      <div>{moment(doc.createdTime).formatMs()}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.direction")}</div>
                      <div className={doc.side === TradeSideEnum.buy ? "up-color" : "down-color"}>{t("trade." + doc.side.toLocaleLowerCase())}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.amount")}</div>
                      <div>{+doc.quantity > 0 ? Big(doc.quantity).toFixedCy() : "--"}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.triggerPrice2")}</div>
                      <div>{Big(doc.triggerPrice || 0).toFixedCy()}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.orderPrice")}</div>
                      <div>{Big(doc.price || 0).toFixedCy()}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.status")}</div>
                      <div>
                        <WithPoint status={cls}>{lab}</WithPoint>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {curDoc !== undefined && <Modal doc={curDoc} setDoc={setCurDoc} />}
    </div>
  );
};

export default observer(Main);
// export default Main;
