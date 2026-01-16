import React, { HTMLAttributes, useCallback, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
// import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";

// import AzSvg from "@/components/az/svg";
import AppDivNoData from "components/app/div/noData";
import CMPT_btnPair from "../../_cmpt/btnPair";

import styles_h5 from "../../h5.module.scss";
// import styles from "./h5.module.scss";

import { BalancesLeverExtendProps } from "./index";

interface Props extends HTMLAttributes<HTMLDivElement> {
  items?: BalancesLeverExtendProps[];
  disabled?: boolean;
}

const Main: React.FC<Props> = ({ items, disabled }) => {
  const t = useTranslation();
  const { convertCurrency } = store.balances;

  return (
    <div className={styles_h5.main}>
      {items && (
        <div className={styles_h5.content}>
          {!items.length ? (
            <AppDivNoData />
          ) : (
            items.map((doc) => {
              return (
                <div key={doc.symbol} className={styles_h5.card}>
                  <div className={styles_h5.cardNav}>
                    <CMPT_btnPair disabled={disabled} symbol={doc.symbol} />
                  </div>
                  <div className={styles_h5.cardNavSub}>{doc._sell_token}</div>
                  <div className={styles_h5.cardUl}>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.availableAsset")}</div>
                      <div>{doc._sell_available}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.borrow")}</div>
                      <div>{doc._sell_borrow}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.freeze")}</div>
                      <div>{doc._sell_freeze}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.interest")}</div>
                      <div>{doc._sell_interest}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.equity")}</div>
                      <div>
                        <span>{doc._sell_equity}</span>
                        <small>{doc._sell_equity_convert}</small>
                      </div>
                    </div>
                  </div>
                  <div className={styles_h5.cardNavSub}>{doc._buy_token}</div>
                  <div className={styles_h5.cardUl}>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.availableAsset")}</div>
                      <div>{doc._buy_available}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.borrow")}</div>
                      <div>{doc._buy_borrow}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.freeze")}</div>
                      <div>{doc._buy_freeze}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.interest")}</div>
                      <div>{doc._buy_interest}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.equity")}</div>
                      <div>
                        <span>{doc._buy_equity}</span>
                        <small>{doc._buy_equity_convert}</small>
                      </div>
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
