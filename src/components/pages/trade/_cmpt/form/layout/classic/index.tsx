import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { getUrl } = Util;
import store from "store";

// import { Borrow, Repay } from "components/pages/trade/_cmpt/modalTriggerBtn";
import Borrow from "components/pages/trade/_cmpt/modalTriggerBtn/borrow";
import Repay from "components/pages/trade/_cmpt/modalTriggerBtn/repay";
import LiquidationRate from "components/pages/trade/_cmpt/liquidation/rate";
import LiquidationPrice from "components/pages/trade/_cmpt/liquidation/price";
import MarketTypeTab from "../../marketTypeTab";
import EtfBtns from "../../etfBtns";
import Fee from "../../_cmpt/fee";
import TradeLimit from "../../_cmpt/tradeLimit";
import TradeMarket from "../../_cmpt/tradeMarket";
import TradeStopLimit from "../../_cmpt/tradeStopLimit";
import TradeTrailingStop from "../../_cmpt/tradeTrailingStop";
import TradeNft from "../../_cmpt/tradeNft";
import TradeTypeDiv from "../../_cmpt/tradeTypeDiv";

import styles from "./index.module.scss";

import { LayoutEnum } from "store/app";
import { TradeSideEnum, TradeTypeEnum } from "store/trade";
import { OptionProps } from "../../index";

interface Props extends OptionProps, HTMLAttributes<HTMLDivElement> {}

const Main: React.FC<Props> = ({ hasFutures, hasEtf, tradeType, setTradeType }) => {
  const t = useTranslation();

  const { layout } = store.app;
  const { name, isLever, isNft } = store.market;
  const { isLogin } = store.user;

  return (
    <div className={styles.main}>
      <MarketTypeTab>
        {/* <div className={styles.tabOption}>
          {hasFutures && (
            <a href={getUrl("/futures/trade/" + name)} className={cx("linkClear", styles.link)}>
              {t("trade.futures")}
            </a>
          )}
          {hasFutures && hasEtf && <span className={styles.split}></span>}
          {hasEtf && <EtfBtns />}
        </div> */}
      </MarketTypeTab>

      <TradeTypeDiv tradeType={tradeType} setTradeType={setTradeType}>
        {isLever && isLogin && (
          <>
            <LiquidationRate />
            <LiquidationPrice style={{ marginInlineStart: "8px" }} />
            <span></span>
            <Borrow />
            {layout !== LayoutEnum.fullscreen && <Repay />}
            <span></span>
          </>
        )}
        {/*<a href={getUrl("/rate")} className={cx("linkClear", styles.link)}>*/}
        {/*  {t("trade.fee")}*/}
        {/*</a>*/}
        {/* <Fee className={styles.link} /> */}
      </TradeTypeDiv>

      <div className={styles.content}>
        {isNft ? (
          <>
            <TradeNft tradeSide={TradeSideEnum.buy} />
            <TradeNft tradeSide={TradeSideEnum.sell} />
          </>
        ) : (
          <>
            {tradeType === TradeTypeEnum.limit && (
              <>
                <TradeLimit tradeSide={TradeSideEnum.buy} />
                <TradeLimit tradeSide={TradeSideEnum.sell} />
              </>
            )}
            {tradeType === TradeTypeEnum.market && (
              <>
                <TradeMarket tradeSide={TradeSideEnum.buy} />
                <TradeMarket tradeSide={TradeSideEnum.sell} />
              </>
            )}
            {tradeType === TradeTypeEnum.stopLimit && (
              <>
                <TradeStopLimit tradeSide={TradeSideEnum.buy} />
                <TradeStopLimit tradeSide={TradeSideEnum.sell} />
              </>
            )}
            {tradeType === TradeTypeEnum.trailingStop && (
              <>
                <TradeTrailingStop tradeSide={TradeSideEnum.buy} />
                <TradeTrailingStop tradeSide={TradeSideEnum.sell} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default observer(Main);
