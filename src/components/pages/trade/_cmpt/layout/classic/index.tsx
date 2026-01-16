import React, { PropsWithChildren } from "react";
// import { observer } from "mobx-react-lite";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import cx from "classnames";
// import store from "store";
import { getChildrenSlot } from "utils/method";

import AzTabs from "components/az/tabs";

import styles_classic from "./index.module.scss";

const Main: React.FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslation();
  const slots = getChildrenSlot(children);

  return (
    <>
      <div className={styles_classic.container}>
        <div className={styles_classic.market}>{slots.market}</div>
        <div className={styles_classic.kline2form}>
          <div className={styles_classic.kline}>{slots.kline}</div>
          <div className={styles_classic.form}>{slots.form}</div>
        </div>
        <div className={styles_classic.order2trade}>
          <div className={styles_classic.order}>
            <AzTabs items={[{ key: "order", label: t("trade.orders") }]} />
            {slots.order}
          </div>
          <div className={styles_classic.trade}>
            <AzTabs items={[{ key: "trade", label: t("trade.trades") }]} />
            {slots.trade}
          </div>
          {slots.suspended}
        </div>
      </div>
      <div className={styles_classic.history}>{slots.history}</div>
    </>
  );
};

// export default observer(Main);
export default Main;
