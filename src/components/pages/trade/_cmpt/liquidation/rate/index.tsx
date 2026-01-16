import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";
import { Tooltip } from "antd";

import styles from "./index.module.scss";
import AzDashboard from "components/az/dashboard";
import useLeverAccount from "components/pages/trade/_hook/useLeverAccount";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  const { currentLeverConfig } = store.market;

  const { liquidationRate } = useLeverAccount();

  const liquidationRateMarketLab = useMemo(() => {
    return Big(currentLeverConfig.liquidationRate || 0)
      .times(100)
      .toFixed();
  }, [currentLeverConfig]); //当前市场风险率

  const percent = useMemo(() => {
    const liquidationRateNum = +liquidationRate;
    if (!liquidationRateNum) return 0;
    if (liquidationRateNum >= 2) return 0;
    if (liquidationRateNum >= 1.5) return (1 - (liquidationRateNum - 1.5) / 0.5) * 0.33;

    const liquidationRateMarketNum = +(currentLeverConfig.liquidationRate || 0);
    if (!liquidationRateMarketNum) return 0;
    if (liquidationRateNum <= liquidationRateMarketNum) return 1;

    const tipsRateNum = +(currentLeverConfig.tipsRate || 0);
    if (tipsRateNum && tipsRateNum > liquidationRateMarketNum && tipsRateNum < 1.5) {
      if (liquidationRateNum >= tipsRateNum) {
        return (1 - (liquidationRateNum - tipsRateNum) / (1.5 - tipsRateNum)) * 0.33 + 0.33;
      } else {
        return (1 - (liquidationRateNum - liquidationRateMarketNum) / (tipsRateNum - liquidationRateMarketNum)) * 0.33 + 0.66;
      }
    } else {
      return (1 - (liquidationRateNum - liquidationRateMarketNum) / (1.5 - liquidationRateMarketNum)) * 0.66 + 0.33;
    }
  }, [currentLeverConfig, liquidationRate]);

  const liquidationRateLab = useMemo(() => {
    if (!+liquidationRate) return "--";
    if (!percent || +liquidationRate > 1.5) return t("trade.noRisk");
    return (
      Big(liquidationRate || 0)
        .times(100)
        .toFixed(2) + "%"
    );
  }, [liquidationRate, percent]);

  return (
    <div className={cx(styles.main, className)}>
      <Tooltip placement="top" title={t("trade.liquidationRiskTip", [liquidationRateMarketLab])}>
        <div>
          <span>{t("trade.riskRate")}</span>:
        </div>
      </Tooltip>
      <div>
        <AzDashboard percent={percent} />
        <span>{liquidationRateLab}</span>
        {/*{!+liquidationRate ? (*/}
        {/*  <span>--</span>*/}
        {/*) : (*/}
        {/*  <>*/}
        {/*    <AzDashboard percent={percent} />*/}
        {/*    <span>{liquidationRateLab}</span>*/}
        {/*  </>*/}
        {/*)}*/}
      </div>
    </div>
  );
};

export default observer(Main);
// export default Main;
