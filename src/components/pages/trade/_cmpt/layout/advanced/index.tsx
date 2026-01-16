import React, { PropsWithChildren, useState } from "react";
import { observer } from "mobx-react-lite";
import { Hooks } from "@az/base";
import cx from "classnames";
import store from "store";
import { getChildrenSlot } from "utils/method";

import AzTabs from "components/az/tabs";

import styles_advanced from "./index.module.scss";

import { BreakpointEnum } from "store/app";
import { LayoutAdvancedActiveKeyEnum } from "store/trade";

const { useTranslation } = Hooks;

const Main: React.FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslation();
  const slots = getChildrenSlot(children);

  const { layoutAdvancedActiveKey } = store.trade;

  // const [order2tradeActiveKey, setOrder2tradeActiveKey] = useState("order");

  return (
    <>
      <div className={styles_advanced.container}>
        <div className={styles_advanced.leftCon}>
          <div className={styles_advanced.leftConTop}>
            <div className={styles_advanced.kline}>{slots.kline}</div>
            <div className={styles_advanced.leftConTopEmpty}></div>
            <div className={styles_advanced.order2trade}>
              <div className={cx(styles_advanced.order2tradeDiv)}>
                <AzTabs
                  activeKey={layoutAdvancedActiveKey}
                  onChange={(key) => store.trade.updateState({ layoutAdvancedActiveKey: key as LayoutAdvancedActiveKeyEnum })}
                  items={[
                    { key: LayoutAdvancedActiveKeyEnum.order, label: t("trade.orders") },
                    { key: LayoutAdvancedActiveKeyEnum.trade, label: t("trade.trades") },
                  ]}
                />
                <div className={cx({ [styles_advanced.order2tradeDivVisible]: layoutAdvancedActiveKey === LayoutAdvancedActiveKeyEnum.order })}>
                  {slots.order}
                </div>
                <div className={cx({ [styles_advanced.order2tradeDivVisible]: layoutAdvancedActiveKey === LayoutAdvancedActiveKeyEnum.trade })}>
                  {slots.trade}
                </div>
              </div>
              {/*
              {store.app.breakpoint === BreakpointEnum.xl && (
                <>
                  <div className={styles_advanced.order}>
                    <AzTabs items={[{ key: LayoutAdvancedActiveKeyEnum.order, label: t("trade.orders") }]} />
                    {slots.order}
                  </div>
                  <div className={styles_advanced.order2tradeEmpty}></div>
                  <div className={styles_advanced.trade}>
                    <AzTabs items={[{ key: LayoutAdvancedActiveKeyEnum.trade, label: t("trade.trades") }]} />
                    {slots.trade}
                  </div>
                </>
              )}

              {store.app.breakpoint !== BreakpointEnum.xl && (
                <div className={cx(styles_advanced.order2tradeDiv)}>
                  <AzTabs
                    activeKey={layoutAdvancedActiveKey}
                    onChange={(key) => store.trade.updateState({ layoutAdvancedActiveKey: key as LayoutAdvancedActiveKeyEnum })}
                    items={[
                      { key: LayoutAdvancedActiveKeyEnum.order, label: t("trade.orders") },
                      { key: LayoutAdvancedActiveKeyEnum.trade, label: t("trade.trades") },
                    ]}
                  />
                  <div className={cx({ [styles_advanced.order2tradeDivVisible]: layoutAdvancedActiveKey === LayoutAdvancedActiveKeyEnum.order })}>
                    {slots.order}
                  </div>
                  <div className={cx({ [styles_advanced.order2tradeDivVisible]: layoutAdvancedActiveKey === LayoutAdvancedActiveKeyEnum.trade })}>
                    {slots.trade}
                  </div>
                </div>
              )}
              */}

              {slots.suspended}
            </div>
          </div>
          <div className={styles_advanced.history}>{slots.history}</div>
        </div>
        <div className={styles_advanced.form2asset}>
          {slots.form}
          {slots.ad}
          {slots.asset}
        </div>
      </div>
      {/*<div className={styles_advanced.market}>{slots.market}</div>*/}
    </>
  );
};

export default observer(Main);
// export default Main;
