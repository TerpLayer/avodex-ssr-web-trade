import Nav from "@az/NavFlex";
import { Request } from "@az/base";
import { record } from "@az/acc";
// import { get_currencyInfoOne } from "api/server/balance";
import { get_symbol, get_builder_symbol } from "api/server/market";
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
  const defaultMarket = process.env.NEXT_PUBLIC_DEFAULT_MARKET || "hive_usdt";

  if (!symbol || typeof symbol !== "string") {
    return {
      redirect: {
        destination: `/${locale}/trade/${defaultMarket}`,
        permanent: false,
      },
    };
  }

  global.builderSymbols = global.builderSymbols || { symbols: [] };
  console.log(symbol + " global.builderSymbols.version", global.builderSymbols.version);

  const symbolRet = await Request.AzAxios.asyncAwait(process.env.NEXT_PUBLIC_BUILDER_CODE ? get_builder_symbol : get_symbol, {
    params: { version: global.builderSymbols.version },
    headers: { "Accept-Encoding": "identity" },
  });

  if (!symbolRet.err && symbolRet.data && symbolRet.data.version !== global.builderSymbols.version) {
    global.builderSymbols = symbolRet.data;
    console.log(symbol + " global.builderSymbols.version-new", global.builderSymbols.version);
  }

  const currentSymbolConfig = global.builderSymbols.symbols.find((obj) => obj.symbol === symbol);
  if (symbol !== defaultMarket && (!currentSymbolConfig || currentSymbolConfig.displayLevel === "NONE")) {
    try {
      const logArg = {
        t: "trade",
        filePath: "/pages/trade/[symbol].tsx",
        msg: "symbol not found",
        symbol,
        currentSymbolConfig,
        version: global.builderSymbols.version,
      };
      record(logArg);
      console.log(logArg);
    } catch (e) {
      console.error(e);
    }

    return {
      redirect: {
        destination: `/${locale}/trade/${defaultMarket}`,
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
