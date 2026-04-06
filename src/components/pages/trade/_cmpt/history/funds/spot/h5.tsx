import React, { HTMLAttributes, useCallback, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
// import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";

// import AzSvg from "@/components/az/svg";
import AppDivNoData from "components/app/div/noData";
import CurrencyMarketDropdown from "../../_cmpt/currencyMarketDropdown";

import styles_h5 from "../../h5.module.scss";
// import styles from "./h5.module.scss";

import { BalancesExtendProps } from "./index";

interface Props extends HTMLAttributes<HTMLDivElement> {
  items?: BalancesExtendProps[];
}

const Main: React.FC<Props> = ({ items }) => {
  const t = useTranslation();
  const { convertCurrency } = store.balances;
  const { getCurrencyDisplayName } = store.currency;

  return (
    <div className={styles_h5.main}>
      {items && (
        <div className={styles_h5.content}>
          {!items.length ? (
            <AppDivNoData />
          ) : (
            items.map((doc) => {
              return (
                <div key={doc.currency} className={styles_h5.card}>
                  <div className={styles_h5.cardNav}>
                    <CurrencyMarketDropdown currency={doc.currency} />
                  </div>

                  <div className={styles_h5.cardUl}>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.totalFund")}</div>
                      <div>{doc._total}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.availableAsset")}</div>
                      <div>{doc._available}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.freeze")}</div>
                      <div>{doc._freeze}</div>
                    </div>
                    <div className={styles_h5.cardLi}>
                      <div>{t("trade.totalAsset0", [getCurrencyDisplayName(convertCurrency)])}</div>
                      <div>{doc._totalAsset}</div>
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
