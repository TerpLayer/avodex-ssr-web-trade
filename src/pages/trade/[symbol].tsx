import Nav from "@az/NavFlex";
import { Request } from "@az/base";
import { record } from "@az/acc";
// import { get_currencyInfoOne } from "api/server/balance";
import { get_symbol } from "api/server/market";
import Main from "components/pages/trade";
import { GetStaticPaths, GetStaticProps } from "next";
import React, { useEffect } from "react";
import store from "store";
import getCommonStaticProps, { type CommonPageProps } from "@az/ssg";
import { $g } from "utils/statistics";
import styles from "./index.module.scss";

interface Props extends CommonPageProps {
  symbol: string;
  currencyInfo?: any;
}

const TradePage: React.FC<Props> = ({ symbol, currencyInfo }) => {
  store.market.updateStateOnce({ name: symbol });
  store.currency.updateStateOnce({ currencyInfo: currencyInfo });

  useEffect(() => {
    $g("WEB_Trade_view");
  }, []);

  return (
    <div className={styles.page}>
      <Nav showTheme={true} from="spot" />
      <Main />
    </div>
  );
};

export default TradePage;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: { symbol: string } }[] = [];
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params: { symbol = "" } = {}, locale } = context;

  if (!symbol || typeof symbol !== "string") {
    return {
      redirect: {
        destination: `/${locale}/trade/btc_usdt`,
        permanent: false,
      },
    };
  }

  global.xtSymbols = global.xtSymbols || { symbols: [] };
  console.log(symbol + " global.xtSymbols.version", global.xtSymbols.version);

  const symbolRet = await Request.AzAxios.asyncAwait(get_symbol, {
    params: { version: global.xtSymbols.version },
    headers: { "Accept-Encoding": "identity" },
  });

  if (!symbolRet.err && symbolRet.data && symbolRet.data.version !== global.xtSymbols.version) {
    global.xtSymbols = symbolRet.data;
    console.log(symbol + " global.xtSymbols.version-new", global.xtSymbols.version);
  }

  const currentSymbolConfig = global.xtSymbols.symbols.find((obj) => obj.symbol === symbol);
  if (symbol !== "btc_usdt" && (!currentSymbolConfig || currentSymbolConfig.displayLevel === "NONE")) {
    try {
      const logArg = {
        t: "trade",
        filePath: "/pages/trade/[symbol].tsx",
        msg: "symbol not found",
        symbol,
        currentSymbolConfig,
        version: global.xtSymbols.version,
      };
      record(logArg);
      console.log(logArg);
    } catch (e) {
      console.error(e);
    }

    return {
      redirect: {
        destination: `/${locale}/trade/btc_usdt`,
        permanent: false,
      },
      revalidate: 60,
    };
  }

  //获取币种介绍列表
  const currencyInfo = null;
  // const currency = symbol.split("_")[0];
  // const currencyInfoRet = await Request.AzAxios.asyncAwait(get_currencyInfoOne, currency);
  // if (!currencyInfoRet.err && currencyInfoRet.data) {
  //   currencyInfo = currencyInfoRet.data;
  // }

  return getCommonStaticProps(context, `/trade/${symbol}`, { symbol, symbolId: symbol, currencyInfo });
};
