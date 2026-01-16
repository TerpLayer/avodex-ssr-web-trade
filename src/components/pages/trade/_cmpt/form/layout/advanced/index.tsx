import React, { HTMLAttributes, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { getUrl } = Util;
import store from "store";

// import AzTabs from "components/az/tabs";
import EtfBtns from "@/components/pages/trade/_cmpt/form/etfBtns";
import MarketTypeTab from "../../marketTypeTab";
import Fee from "../../_cmpt/fee";
import TradeLimit from "../../_cmpt/tradeLimit";
import TradeMarket from "../../_cmpt/tradeMarket";
import TradeStopLimit from "../../_cmpt/tradeStopLimit";
import TradeTrailingStop from "../../_cmpt/tradeTrailingStop";
import TradeNft from "../../_cmpt/tradeNft";
import TradeTypeTab from "../../_cmpt/tradeTypeTab";

import styles from "./index.module.scss";

import { TradeSideEnum } from "store/trade";
import { OptionProps } from "../../index";
import { TradeTypeEnum } from "store/trade";

interface Props extends OptionProps, HTMLAttributes<HTMLDivElement> {}

const Main: React.FC<Props> = ({ hasFutures, hasEtf, tradeType, setTradeType }) => {
  const t = useTranslation();
  const { name, isNft } = store.market;

  const [tradeSide, setTradeSide] = useState(TradeSideEnum.buy);

  return (
    <div className={styles.main}>
      {/* <MarketTypeTab /> */}
      <div className={styles.body}>
        <div className={styles.navBtns}>
          <button className={cx("btnTxt", { [styles.navBtns_buy]: tradeSide === TradeSideEnum.buy })} onClick={() => setTradeSide(TradeSideEnum.buy)}>
            {t("trade.buy")}
          </button>
          <button className={cx("btnTxt", { [styles.navBtns_sell]: tradeSide === TradeSideEnum.sell })} onClick={() => setTradeSide(TradeSideEnum.sell)}>
            {t("trade.sell")}
          </button>
        </div>
        <TradeTypeTab tradeType={tradeType} setTradeType={setTradeType} />

        {isNft ? (
          <TradeNft tradeSide={tradeSide} />
        ) : (
          <>
            {tradeType === TradeTypeEnum.limit && <TradeLimit tradeSide={tradeSide} />}
            {tradeType === TradeTypeEnum.market && <TradeMarket tradeSide={tradeSide} />}
            {tradeType === TradeTypeEnum.stopLimit && <TradeStopLimit tradeSide={tradeSide} />}
            {tradeType === TradeTypeEnum.trailingStop && <TradeTrailingStop tradeSide={tradeSide} />}
          </>
        )}

        {/* <div className={styles.links}>
          <Fee className={styles.link} />

          {hasFutures && (
            <>
              <span></span>
              <a href={getUrl("/futures/trade/" + name)} className={cx("linkClear", styles.link)}>
                {t("trade.futures")}
              </a>
            </>
          )}
        </div> */}

        {/* {hasEtf && <EtfBtns className={styles.etfBtns} />} */}
      </div>
    </div>
  );
};

export default observer(Main);
