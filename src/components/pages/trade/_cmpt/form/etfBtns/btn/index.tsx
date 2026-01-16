import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { useRouter } from "next/router";
import { Util } from "@az/base";
import UseTickerChangeRate from "@az/UseTickerChangeRate";
// const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";
import { getUpDownCls, getOneByThreeStatus } from "utils/method";

import { EtfProps } from "store/market";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  doc: EtfProps;
}

const Main: React.FC<Props> = ({ className, doc, ...rest }) => {
  // const t = useTranslation();
  // const router = useRouter();
  const { getTicker } = UseTickerChangeRate();
  const { tickers } = store.trade;
  const ticker = useMemo(() => {
    const item = getTicker(tickers.find((obj) => obj.s === doc.symbol));
    return item || { s: doc.symbol };
  }, [doc, tickers, getTicker]);
  const rateLab = useMemo<string>(() => {
    const rate = ticker.cr || "0";

    const sign = getOneByThreeStatus({ gt: "+", eq: "", lt: "" }, rate);
    const val = Big(rate).times(100).toFixed(2);

    return sign + val + "%";
  }, [ticker]);

  return (
    <button className={cx("btnTxt", className, styles.main)} {...rest}>
      <div className={styles.etf_box}>
        <span>{store.currency.getCurrencyDisplayName(doc.symbol.split("_")[0])}</span>&nbsp;
        <span className={getUpDownCls(ticker.cr)}>{rateLab}</span>
      </div>
    </button>
  );
};

export default observer(Main);
