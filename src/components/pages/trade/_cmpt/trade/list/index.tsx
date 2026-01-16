import React, { HTMLAttributes, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Util } from "@az/base";
// const { useTranslation } = Hooks;
const { moment } = Util;
import store from "store";
import { getUpDownCls, thousands, filterBigNumThousands } from "utils/method";

import AzFontScale from "components/az/fontScale";

import styles from "./index.module.scss";

import { TradeRecentProps } from "store/trade";
import indentFormat from "@/hooks/indentFormat";

interface Props extends HTMLAttributes<HTMLDivElement> {
  // startIndex?: number;
  // index?: number;
  doc: TradeRecentProps;
}

const Main: React.FC<Props> = ({ className, doc, ...rest }) => {
  // const router = useRouter();

  // const { currentConfig } = store.market;

  const docFormat = useMemo(() => {
    return {
      timeLab: moment(doc.t).format("HH:mm:ss"),
      priceCls: getUpDownCls(doc.b ? -1 : 1),
      priceLab: indentFormat(doc.p),
      amountLab: indentFormat(filterBigNumThousands(doc.q)),
      // priceLab: filterBigNumThousands(doc.p, currentConfig.pricePrecision),
      // amountLab: filterBigNumThousands(doc.q, currentConfig.quantityPrecision),
    };
  }, [doc, store.app.isNumberIndent]);
  // }, [doc, currentConfig]);

  const handleClick = useCallback(() => {
    store.trade.updateState({
      tradeRecentOnce: {
        ...doc,
        isClick: true,
      },
    });
  }, [doc]);

  return (
    <div onClick={handleClick} className={cx(styles.main, className)} {...rest}>
      <AzFontScale>{docFormat.timeLab}</AzFontScale>
      <AzFontScale className={docFormat.priceCls}>{docFormat.priceLab}</AzFontScale>
      <AzFontScale>{docFormat.amountLab}</AzFontScale>
    </div>
  );
};

export default observer(Main);
