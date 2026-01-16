import React, { PropsWithChildren, useState } from "react";
import { observer } from "mobx-react-lite";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import cx from "classnames";
import store from "store";
import { getChildrenSlot } from "utils/method";

import AzTabs from "components/az/tabs";

import styles from "./index.module.scss";

import { LayoutH5ActiveKeyEnum } from "store/trade";

const Main: React.FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslation();
  const slots = getChildrenSlot(children);

  const { layoutH5ActiveKey } = store.trade;

  // const [mainDataKey, setMainDataKey] = useState("chart");

  return (
    <div className={styles.main}>
      <div className={styles.header}>{slots.header}</div>
      <div className={styles.mainData}>
        <AzTabs
          activeKey={layoutH5ActiveKey}
          onChange={(key) => store.trade.updateState({ layoutH5ActiveKey: key as LayoutH5ActiveKeyEnum })}
          items={[
            { key: LayoutH5ActiveKeyEnum.chart, label: t("trade.chart") },
            { key: LayoutH5ActiveKeyEnum.order, label: t("trade.orders") },
            { key: LayoutH5ActiveKeyEnum.trade, label: t("trade.trades") },
          ]}
        />
        <div className={styles.mainDataContent}>
          <div className={cx({ [styles.mainDataContentVisible]: layoutH5ActiveKey === LayoutH5ActiveKeyEnum.chart })}>{slots.kline}</div>
          <div className={cx({ [styles.mainDataContentVisible]: layoutH5ActiveKey === LayoutH5ActiveKeyEnum.order })}>{slots.order}</div>
          <div className={cx({ [styles.mainDataContentVisible]: layoutH5ActiveKey === LayoutH5ActiveKeyEnum.trade })}>{slots.trade}</div>
        </div>
      </div>
      <div className={styles.history}>{slots.history}</div>
      {slots.form}
    </div>
  );
};

export default observer(Main);
// export default Main;
