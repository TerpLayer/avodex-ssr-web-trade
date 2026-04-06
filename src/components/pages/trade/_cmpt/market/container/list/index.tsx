import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import cx from "classnames";
import UseTickerChangeRate from "@az/UseTickerChangeRate";
import { Hooks, Util } from "@az/base";
import store from "store";
import { getOneByThreeStatus, getUpDownCls, routerPush } from "utils/method";
import useUpDownClassTicker from "hooks/useUpDownClassTicker";
import useFormatBigNumber from "hooks/useFormatBigNumber";
import { post_searchMarketTraceClick } from "api/v4/app";

import AzFontScale from "components/az/fontScale";
import CMPT_Star from "../star";

import styles from "./index.module.scss";

import { TickerProps } from "store/trade";
import { LeverSymbolProps, EtfProps, TypeEnum } from "store/market";
import { TabCfgProps } from "../../tabs";
import indentFormat from "@/hooks/indentFormat";

const { useTranslation } = Hooks;
const { Big } = Util;

interface Props extends HTMLAttributes<HTMLDivElement> {
  // startIndex?: number;
  // index?: number;
  ticker: TickerProps;
  isShowVolume: boolean;
  isSearch?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const Main: React.FC<Props> = ({ className, ticker: originTicker, isShowVolume, isSearch, disabled, onClick, ...rest }) => {
  const t = useTranslation();
  const router = useRouter();
  const { name, leverConfigObj, config, etfConfigObj, symbolStList } = store.market;
  const { setSearchHistory } = store.trade;

  const { ticker } = UseTickerChangeRate({ originTicker });

  const isSt = useMemo(() => {
    if (!config) return false;
    const symbol = config[ticker.s];
    if (!symbol) return false;
    return symbolStList.includes(symbol.id);
  }, [ticker, config, symbolStList]);
  const isNft = useMemo(() => {
    if (!config) return false;
    const cfg = config[ticker.s];
    if (!cfg) return false;
    return cfg.type === "nft";
  }, [config]);

  const volumePrecision = useMemo(() => {
    if (!config) return undefined;
    const cfg = config[ticker.s];
    if (!cfg) return undefined;
    return cfg.quantityPrecision && cfg.quantityPrecision >= 0 ? cfg.quantityPrecision : 0;
  }, [ticker, config]);
  const volume = useFormatBigNumber(ticker ? ticker.q || 0 : 0, volumePrecision);

  const coinQuantity = useMemo<string>(() => {
    return store.currency.getCurrencyDisplayName(ticker.s.split("_")[0]);
  }, [config, ticker]);
  const coinPrice = useMemo<string>(() => {
    return store.currency.getCurrencyDisplayName(ticker.s.split("_")[1]);
  }, [ticker]);
  const leverDoc = useMemo<WithUndefined<LeverSymbolProps>>(() => {
    if (!leverConfigObj) return;
    return leverConfigObj[ticker.s];
  }, [ticker, leverConfigObj]);

  const etfDoc = useMemo<WithUndefined<EtfProps>>(() => {
    if (!etfConfigObj) {
      return;
    }
    return etfConfigObj[ticker.s];
  }, [ticker, etfConfigObj]);

  const priceCls = useUpDownClassTicker(ticker);
  const priceLab = useMemo(() => {
    let precision = 2;
    if (config && config[ticker.s] && config[ticker.s].pricePrecision && config[ticker.s].pricePrecision >= 0) precision = config[ticker.s].pricePrecision;
    return Big(ticker.c || 0).toFixedCy(precision);
  }, [ticker, config]);

  const rateLab = useMemo<string>(() => {
    const rate = ticker.cr || "0";

    const sign = getOneByThreeStatus({ gt: "+", eq: "", lt: "" }, rate);
    const val = Big(rate).times(100).toFixed(2);

    return sign + val + "%";
  }, [ticker]);

  const handleClick = () => {
    if (disabled) return;
    // 切换交易对时清空净值
    store.market.updateState({ netWorth: "" });
    routerPush(router, { symbol: ticker.s });
    onClick && onClick();

    isSearch &&
      setSearchHistory({
        symbol: ticker.s,
        isLever: !!leverDoc,
        tag: (() => {
          if (leverDoc) return leverDoc.maxLeverage + "X";
        })(),
      });

    isSearch &&
      post_searchMarketTraceClick({
        data: {
          type: 1,
          marketName: ticker.s,
        },
      });
  };
  const handleClickTag = (e, isLever) => {
    e && e.stopPropagation();
    routerPush(router, { symbol: ticker.s, isLever });

    isSearch &&
      post_searchMarketTraceClick({
        data: {
          type: isLever ? 4 : 1,
          marketName: ticker.s,
        },
      });
  };

  return (
    <div onClick={handleClick} className={cx(styles.main, { [styles.atv]: name === ticker.s }, className)} {...rest}>
      <div className={styles.name}>
        <CMPT_Star symbol={ticker.s} />
        <div className={styles.nameDiv}>
          <div>
            <b>{coinQuantity}</b>
            <span>{"/" + coinPrice}</span>
            {isSt && <span className={cx(styles.tag, styles.st)}>ST</span>}
            {/* {!!leverDoc && (
              <button onClick={(e) => handleClickTag(e, true)} className={cx("btnTxt", styles.tag)}>
                {leverDoc.maxLeverage + "X"}
              </button>
            )} */}
            {/* {!!etfDoc && (
              <button
                onClick={(e) => handleClickTag(e, false)}
                className={cx("btnTxt", styles.tag, etfDoc.direction === "LONG" && styles.etf_long, etfDoc.direction === "SHORT" && styles.etf_short)}
              >
                {`${etfDoc.maxLeverage}X`}
              </button>
            )} */}
            {/* {isNft && <div className={styles.tag}>{t("trade.softnote")}</div>} */}
          </div>
        </div>
      </div>
      <AzFontScale className={cx(styles.price, priceCls)}>{indentFormat(priceLab)}</AzFontScale>
      <AzFontScale>{volume}</AzFontScale>
      <AzFontScale className={cx(styles.rate, getUpDownCls(ticker.cr))}>{rateLab}</AzFontScale>
    </div>
  );
};

export default observer(Main);
