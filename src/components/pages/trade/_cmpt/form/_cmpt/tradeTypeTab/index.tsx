import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import AzScrollArrow from "components/az/scroll/arrow";
import TradeTypeMore from "components/pages/trade/_cmpt/form/_cmpt/tradeTypeMore";

import styles from "./index.module.scss";

import { TradeTypeEnum } from "@/store/trade";

interface Props extends HTMLAttributes<HTMLDivElement> {
  tradeType: TradeTypeEnum;
  setTradeType: (arg: TradeTypeEnum) => void;
  resetEffect?: any;
}

const Main: React.FC<Props> = ({ tradeType, setTradeType, resetEffect, className, children }) => {
  const t = useTranslation();
  const { isNft } = store.market;

  const isTypeMore = useMemo(() => {
    if (!tradeType || [TradeTypeEnum.limit, TradeTypeEnum.market].includes(tradeType)) return false;

    return true;
  }, [tradeType]);

  return (
    <div className={cx(styles.main, className)}>
      <AzScrollArrow resetEffect={resetEffect} className={styles.leftDiv}>
        <button
          className={cx("btnTxt", styles.btn, { [styles.only]: isNft, [styles.atv]: tradeType === TradeTypeEnum.limit })}
          onClick={() => setTradeType(TradeTypeEnum.limit)}
        >
          {t("trade.limit")}
        </button>
        {!isNft && (
          <>
            <button
              className={cx("btnTxt", styles.btn, { [styles.atv]: tradeType === TradeTypeEnum.market })}
              onClick={() => setTradeType(TradeTypeEnum.market)}
            >
              {t("trade.market")}
            </button>

            {/* <TradeTypeMore tradeType={tradeType} setTradeType={setTradeType} isTab={true} className={cx(styles.btn, { [styles.atv]: isTypeMore })} /> */}
          </>
        )}
      </AzScrollArrow>

      <div>{children}</div>
    </div>
  );
};

export default observer(Main);
// export default Main;
