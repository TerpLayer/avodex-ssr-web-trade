import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "store";

import Layout_classic from "./layout/classic";
import Layout_advanced from "./layout/advanced";
import Layout_h5 from "./layout/h5";

import styles from "./index.module.scss";

import { LayoutEnum } from "store/app";
import { TradeTypeEnum } from "store/trade";

export interface OptionProps {
  hasFutures: boolean;
  hasEtf: boolean;
  tradeType: TradeTypeEnum;
  setTradeType: (arg: TradeTypeEnum) => void;
}

const Main: React.FC = () => {
  const { isH5 } = store.app;
  const { name, futuresUsdtConfigAry, etfConfig, isEtf, isNft, etfConfigObj } = store.market;

  const hasFutures = useMemo(() => {
    if (!futuresUsdtConfigAry) return false;
    const doc = futuresUsdtConfigAry.find((obj) => obj.symbol === name);
    if (!doc || !doc.isDisplay) return false;
    return true;
    // return !!futuresUsdtConfigAry.find((obj) => obj.symbol === name);
  }, [name, futuresUsdtConfigAry]);
  // const hasEtf = useMemo(() => {
  //   // return !!(etfConfig && etfConfig[name] && etfConfig[name].data && etfConfig[name].data.length);
  // }, [name, etfConfigObj]);

  const [tradeType, setTradeType] = useState<TradeTypeEnum>(TradeTypeEnum.limit);
  useEffect(() => {
    isNft && setTradeType(TradeTypeEnum.limit);
  }, [isNft]);

  if (isH5) {
    return <Layout_h5 hasFutures={hasFutures} hasEtf={!isEtf} tradeType={tradeType} setTradeType={setTradeType} />;
  }

  return (
    <>
      {store.app.layout !== LayoutEnum.advanced && (
        <Layout_classic className={styles.main} hasFutures={hasFutures} hasEtf={!isEtf} tradeType={tradeType} setTradeType={setTradeType} />
      )}
      {store.app.layout === LayoutEnum.advanced && (
        <Layout_advanced className={styles.main} hasFutures={hasFutures} hasEtf={!isEtf} tradeType={tradeType} setTradeType={setTradeType} />
      )}
    </>
  );
};

export default observer(Main);
