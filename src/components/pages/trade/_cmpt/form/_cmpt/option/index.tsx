import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { Hooks } from "@az/base";
import store from "store";

import Add from "components/pages/trade/_cmpt/modalTriggerBtn/add";
import Transfer from "components/pages/trade/_cmpt/modalTriggerBtn/transfer";
// import Deposit from "components/pages/trade/_cmpt/modalTriggerBtn/deposit";
import Subscribe from "components/pages/trade/_cmpt/modalTriggerBtn/subscribe";
// import Redeem from "components/pages/trade/_cmpt/modalTriggerBtn/redeem";

import styles from "./index.module.scss";

// import { LayoutEnum } from "store/app";
import { TradeSideEnum } from "store/trade";

// const { useTranslation } = Hooks;

interface Props extends HTMLAttributes<HTMLDivElement> {
  tradeSide: TradeSideEnum;
  currency: string;
}

const Main: React.FC<Props> = ({ className, tradeSide, currency }) => {
  // const t = useTranslation();
  // const router = useRouter();
  // const { layout } = store.app;
  const { isLever, isEtf } = store.market;
  const { isLogin } = store.user;

  // const isClassic = useMemo(() => layout === LayoutEnum.classic, [layout]);
  // const isAdvanced = useMemo(() => layout === LayoutEnum.advanced, [layout]);
  // const isFullscreen = useMemo(() => layout === LayoutEnum.fullscreen, [layout]);

  if (!isLogin) return <></>;

  return (
    <div className={cx(styles.main, className)}>
      <Add currency={currency} />
    </div>
  );

  // const elSpot = (
  //   <>
  //     <Deposit isIcon={isAdvanced} currency={currency} />
  //     {!isAdvanced && <span></span>}
  //     <Transfer isIcon={isAdvanced} currency={currency} />
  //   </>
  // );
  const elSpot = (
    <Transfer isIcon={true} currency={currency} />
    // <>
    //   <Deposit isIcon={!isClassic} currency={currency} />
    //   {isClassic && <span></span>}
    //   <Transfer isIcon={!isClassic} currency={currency} />
    // </>
  );

  // const elLever = (
  //   <>
  //     <Transfer isIcon={isAdvanced} currency={currency} />
  //   </>
  // );
  const elLever = (
    <Transfer isIcon={true} currency={currency} />
    // <>
    //   <Transfer isIcon={!isClassic} currency={currency} />
    // </>
  );

  // const elEtf =
  //   tradeSide === TradeSideEnum.buy ? (
  //     elSpot
  //   ) : !isAdvanced ? (
  //     <>
  //       <Subscribe isIcon={false} currency={currency} />
  //       {!isAdvanced && <span></span>}
  //       <Redeem isIcon={false} currency={currency} />
  //     </>
  //   ) : (
  //     <>
  //       <Subscribe isIcon={true} currency={currency} />
  //     </>
  //   );
  // const elEtf =
  //   tradeSide === TradeSideEnum.buy ? (
  //     elSpot
  //   ) : isClassic ? (
  //     <>
  //       <Subscribe isIcon={false} currency={currency} />
  //       <span></span>
  //       <Redeem isIcon={false} currency={currency} />
  //     </>
  //   ) : (
  //     <>
  //       <Subscribe isIcon={true} currency={currency} />
  //     </>
  //   );
  const elEtf = tradeSide === TradeSideEnum.buy ? elSpot : <Subscribe isIcon={true} currency={currency} />;

  return (
    <div className={cx(styles.main, className)}>
      {!isLever && !isEtf && elSpot}
      {isLever && elLever}
      {isEtf && elEtf}
    </div>
  );
};

export default observer(Main);
