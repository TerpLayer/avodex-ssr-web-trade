import React, { HTMLAttributes, useCallback, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import store from "store";

import { Checkbox, Dropdown, MenuProps } from "antd";
import AzSvg from "@/components/az/svg";
import AppDivNoData from "components/app/div/noData";
import CMPT_btnPair from "components/pages/trade/_cmpt/history/_cmpt/btnPair";
import CMPT_filter from "components/pages/trade/_cmpt/history/_cmpt/filter";

import styles_h5 from "components/pages/trade/_cmpt/history/h5.module.scss";
import styles from "./h5.module.scss";

import { OpenEntrustOrderExtendProps } from "./index";
import { TradeSideEnum } from "store/trade";

interface Props extends HTMLAttributes<HTMLDivElement> {
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  handleCancelOne: (arg: string) => void;
  handleRefresh: () => void;
  side: "" | TradeSideEnum;
  setSide: (arg: "" | TradeSideEnum) => void;
  items?: OpenEntrustOrderExtendProps[];
  disabled?: boolean;
}

const Main: React.FC<Props> = ({ isHideOtherPairs, setHideOtherPairs, handleCancelOne, handleRefresh, side, setSide, items, disabled }) => {
  const t = useTranslation();

  const hasItem = useMemo(() => {
    return !!(items && items.length);
  }, [items]);

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

  const handleDrawerOpen = useCallback(() => {
    // console.log("handleDrawerOpen===", side);
    setSelfSide(side);
  }, [side]);
  const handleDrawerReset = useCallback(() => {
    setSide("");
    handleRefresh();
  }, []);
  const handleDrawerSearch = useCallback(() => {
    // console.log("handleDrawerSearch===", selfSide);
    setSide(selfSide);
    handleRefresh();
  }, [selfSide]);

  return (
    <div className={cx(styles_h5.main, styles.main)}>
      <div className={styles_h5.nav}>
        <Checkbox className={styles_h5.checkbox} checked={isHideOtherPairs} onChange={(e) => setHideOtherPairs(e.target.checked)}>
          {t("trade.hideOtherSymbol")}
        </Checkbox>

        <div className={styles_h5.opts}>
          <CMPT_filter onOpen={handleDrawerOpen} onReset={handleDrawerReset} onSearch={handleDrawerSearch}>
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
          {!items.length ? (
            <AppDivNoData />
          ) : (
            items.map((doc) => {
              return (
                <div key={doc.id} className={styles_h5.card}>
                  <div className={styles_h5.cardNav}>
                    <CMPT_btnPair disabled={disabled} symbol={doc.symbol} />

                    <div>
                      <button disabled={disabled} className={"btnTxt"} onClick={() => handleCancelOne(doc.id)}>
                        <AzSvg icon="delete" />
                      </button>
                    </div>
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
                      <div>{t("trade.amount")}</div>
                      <div>{doc._amount}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.turnRate")}</div>
                      <div>{doc._turnRate}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.triggerPrice2")}</div>
                      <div>{doc._triggerPrice}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.activePrice")}</div>
                      <div>{doc._activePrice}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.status")}</div>
                      <div>{doc._state}</div>
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
