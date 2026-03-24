import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";

import useCoinMemo from "components/pages/trade/_hook/useCoinMemo";
import useBalancesAvailable from "components/pages/trade/_hook/useBalancesAvailable";
import useLeverAccount from "components/pages/trade/_hook/useLeverAccount";
import Buy from "components/pages/trade/_cmpt/modalTriggerBtn/buy";
import Transfer from "components/pages/trade/_cmpt/modalTriggerBtn/transfer";
import Deposit from "components/pages/trade/_cmpt/modalTriggerBtn/deposit";
import Borrow from "components/pages/trade/_cmpt/modalTriggerBtn/borrow";
import Repay from "components/pages/trade/_cmpt/modalTriggerBtn/repay";
import Subscribe from "components/pages/trade/_cmpt/modalTriggerBtn/subscribe";
import Redeem from "components/pages/trade/_cmpt/modalTriggerBtn/redeem";
import LiquidationRate from "components/pages/trade/_cmpt/liquidation/rate";
import LiquidationPrice from "components/pages/trade/_cmpt/liquidation/price";
import LiquidationPriceRate from "components/pages/trade/_cmpt/liquidation/priceRate";

import styles from "./index.module.scss";

import { LayoutEnum } from "store/app";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  const { isLogin } = store.user;
  const { layout, isH5 } = store.app;
  const { isLever, isEtf } = store.market;

  const { coinQuantityUpperCase, coinPriceUpperCase } = useCoinMemo();
  const { balancesQuantityAvailableLabel, balancesPriceAvailableLabel } = useBalancesAvailable();
  const { positionQuantityLabel, positionPriceLabel } = useLeverAccount();

  if (!isLogin) return <></>;

  return (
    <div className={cx(styles.main, className)}>
      <div className={styles.title}>{t("trade.assets")}</div>
      <div className={styles.ul}>
        {!isLever ? (
          <>
            <div>
              <div>{coinQuantityUpperCase + " " + t("trade.available")}:</div>
              <div>{balancesQuantityAvailableLabel}</div>
            </div>
            <div>
              <div>{coinPriceUpperCase + " " + t("trade.available")}:</div>
              <div>{balancesPriceAvailableLabel}</div>
            </div>
          </>
        ) : (
          <>
            <LiquidationRate />
            <LiquidationPrice />
            <LiquidationPriceRate />
            <div>
              <div>{t("trade.position") + `(${coinQuantityUpperCase})`}:</div>
              <div>{positionQuantityLabel}</div>
            </div>
            <div>
              <div>{t("trade.position") + `(${coinPriceUpperCase})`}:</div>
              <div>{positionPriceLabel}</div>
            </div>
          </>
        )}
      </div>
      <div className={styles.btnDiv}>
        {
          // isEtf ? (
          //   <>
          //     <Subscribe />
          //     <span></span>
          //     <Redeem />
          //   </>
          // ) :
          isLever && (layout === LayoutEnum.advanced || isH5) ? (
            <>
              <Borrow />
              <span></span>
              <Repay />
              <span></span>
              <Transfer />
            </>
          ) : (
            <>
              <Deposit />
              <span></span>
              <Transfer />
              <span></span>
              <Buy />
            </>
          )
        }
      </div>
    </div>
  );
};

export default observer(Main);
// export default Main;
