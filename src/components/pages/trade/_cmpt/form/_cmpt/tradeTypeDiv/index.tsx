import React, { HTMLAttributes } from "react";
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
}

const Main: React.FC<Props> = ({ tradeType, setTradeType, className, children }) => {
  const t = useTranslation();
  const { isNft } = store.market;

  return (
    <div className={cx(styles.main, className)}>
      <div>
        <button className={cx("btnTxt btnHover", { [styles.atv]: tradeType === TradeTypeEnum.limit })} onClick={() => setTradeType(TradeTypeEnum.limit)}>
          {t("trade.limit")}
        </button>
        {!isNft && (
          <>
            <button className={cx("btnTxt btnHover", { [styles.atv]: tradeType === TradeTypeEnum.market })} onClick={() => setTradeType(TradeTypeEnum.market)}>
              {t("trade.market")}
            </button>

            {/* <TradeTypeMore tradeType={tradeType} setTradeType={setTradeType} /> */}
          </>
        )}
      </div>
      <AzScrollArrow resetEffect={children} className={styles.rightDiv}>
        <div className={styles.option}>{children}</div>
      </AzScrollArrow>
    </div>
  );
};

export default observer(Main);
// export default Main;
