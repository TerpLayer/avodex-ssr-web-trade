import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment } = Util;
// import store from "store";

import { Checkbox, Dropdown, MenuProps, Tooltip } from "antd";
import AzSvg from "@/components/az/svg";
import AppDivNoData from "components/app/div/noData";
import MoreOrderTip from "../_cmpt/moreOrderTip";
import CMPT_btnPair from "../_cmpt/btnPair";
import CMPT_filter from "../_cmpt/filter";
import CMPT_dateSelectMobile from "../_cmpt/dateSelectMobile";

import styles_h5 from "../h5.module.scss";
import styles from "./h5.module.scss";

import { OrderTradeExtendProps } from "./index";
import { TradeSideEnum } from "store/trade";

interface Props extends HTMLAttributes<HTMLDivElement> {
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  handleRefresh: () => void;
  side: "" | TradeSideEnum;
  setSide: (arg: "" | TradeSideEnum) => void;
  startTime: number;
  setStartTime: (arg: number) => void;
  endTime: number;
  setEndTime: (arg: number) => void;
  resetTime: () => void;
  items?: OrderTradeExtendProps[];
  disabled?: boolean;
}

const Main: React.FC<Props> = ({
  isHideOtherPairs,
  setHideOtherPairs,
  handleRefresh,
  side,
  setSide,
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

  const [selfStartTime, setSelfStartTime] = useState(startTime);
  const [selfEndTime, setSelfEndTime] = useState(endTime);

  const handleDrawerOpen = useCallback(() => {
    setSelfSide(side);
    setSelfStartTime(startTime);
    setSelfEndTime(endTime);
  }, [side, startTime, endTime]);
  const handleDrawerReset = useCallback(() => {
    setSide("");
    resetTime();
  }, []);
  const handleDrawerSearch = useCallback(() => {
    if (selfSide === side && selfStartTime === startTime && selfEndTime === endTime) return handleRefresh();
    setSide(selfSide);
    setStartTime(selfStartTime);
    setEndTime(selfEndTime);
  }, [handleRefresh, selfSide, selfStartTime, selfEndTime]);

  return (
    <div className={styles_h5.main}>
      <div className={styles_h5.nav}>
        <Checkbox className={styles_h5.checkbox} checked={isHideOtherPairs} onChange={(e) => setHideOtherPairs(e.target.checked)}>
          {t("trade.hideOtherSymbol")}
        </Checkbox>

        <div className={styles_h5.opts}>
          <CMPT_filter onOpen={handleDrawerOpen} onReset={handleDrawerReset} onSearch={handleDrawerSearch}>
            <CMPT_dateSelectMobile startTime={selfStartTime} setStartTime={setSelfStartTime} endTime={selfEndTime} setEndTime={setSelfEndTime} />
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
          </CMPT_filter>
        </div>
      </div>

      {items && (
        <div className={styles_h5.content}>
          <MoreOrderTip style={{ paddingInlineStart: 0, paddingInlineEnd: 0 }} />
          {!items.length ? (
            <AppDivNoData />
          ) : (
            items.map((doc) => {
              return (
                <div key={doc.tradeId} className={styles_h5.card}>
                  <div className={styles_h5.cardNav}>
                    <CMPT_btnPair disabled={disabled} symbol={doc.symbol} />
                  </div>

                  <div className={styles_h5.cardUl}>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.time")}</div>
                      <div>{doc._time}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.direction")}</div>
                      <div className={doc._sideCls}>{doc._side}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.price")}</div>
                      <div>{doc._price}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.executed")}</div>
                      <div>{doc._executed}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.openOrderTotal")}</div>
                      <div>{doc._total}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.fee")}</div>
                      <div>
                        {!doc._feeTip ? (
                          doc._fee
                        ) : (
                          <Tooltip placement="topLeft" title={doc._feeTip}>
                            <span className={cx(styles.tipStr)}>{doc._fee}</span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>
                        <span>{t("trade.makerTaker")}</span>
                        {/*<Tooltip*/}
                        {/*  placement="topRight"*/}
                        {/*  // overlayStyle={{ maxWidth: "500px" }}*/}
                        {/*  title={*/}
                        {/*    <div>*/}
                        {/*      <b>{t("trade.whatIsMaker")}</b>*/}
                        {/*      <div>{t("trade.makerExplain")}</div>*/}
                        {/*      <b>{t("trade.whatIsTaker")}</b>*/}
                        {/*      <div>{t("trade.takerExplain")}</div>*/}
                        {/*    </div>*/}
                        {/*  }*/}
                        {/*>*/}
                        {/*  <span className={"btnTxt"}>*/}
                        {/*    <AzSvg icon={"faq"} />*/}
                        {/*  </span>*/}
                        {/*</Tooltip>*/}
                      </div>
                      <div>{doc._role}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default observer(Main);
// export default Main;
