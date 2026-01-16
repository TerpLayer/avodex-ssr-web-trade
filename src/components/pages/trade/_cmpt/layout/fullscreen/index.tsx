import React, { PropsWithChildren } from "react";
// import { observer } from "mobx-react-lite";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import cx from "classnames";
// import store from "store";
import { getChildrenSlot } from "utils/method";

import AzTabs from "components/az/tabs";

import styles_fullscreen from "./index.module.scss";

const Main: React.FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslation();
  const slots = getChildrenSlot(children);

  return (
    <>
      <div className={styles_fullscreen.container}>
        <div className={styles_fullscreen.leftCon}>
          <div className={styles_fullscreen.kline}>{slots.kline}</div>
          <div className={styles_fullscreen.history}>{slots.history}</div>
        </div>
        <div className={styles_fullscreen.rightCon}>
          <div className={styles_fullscreen.rightConTop}>
            <div className={styles_fullscreen.order}>
              <AzTabs items={[{ key: "order", label: t("trade.orders") }]} />
              {slots.order}
            </div>
            <div className={styles_fullscreen.rightConTopEmpty}></div>
            <div className={styles_fullscreen.trade}>
              <AzTabs items={[{ key: "trade", label: t("trade.trades") }]} />
              {slots.trade}
            </div>
            {slots.suspended}
          </div>
          <div className={styles_fullscreen.form}>{slots.form}</div>
        </div>
      </div>
      {/*<div className={styles_fullscreen.market}>{slots.market}</div>*/}
    </>
  );
};

// export default observer(Main);
export default Main;
