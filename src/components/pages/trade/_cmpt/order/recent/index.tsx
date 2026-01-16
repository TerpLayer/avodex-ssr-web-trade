import React, { HTMLAttributes, useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { getUrl } = Util;
import store from "store";
import { thousands } from "utils/method";

import { Tooltip } from "antd";
import AzFontScale from "components/az/fontScale";
import AzSvg from "components/az/svg";
import usePriceCurrencyConvert from "hooks/usePriceCurrencyConvert";
import useUpDownClassTicker from "hooks/useUpDownClassTicker";
import Socket from "utils/socket/public";

import styles from "./index.module.scss";
import indentFormat from "@/hooks/indentFormat";

const Main: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
  const router = useRouter();
  const t = useTranslation();

  const { name, netWorth, isEtf, isLever } = store.market;
  const { tradeRecent } = store.trade;
  const { isH5 } = store.app;

  // console.log("tradeRecent====", tradeRecent);
  // const priceCls = useUpDownClassTicker(tradeRecent, true);

  useEffect(() => {
    const msg = { event: `netAsset@${name}` };
    Socket.addChannel(msg, handleWsCallback);
    return () => {
      Socket.removeChannel(msg);
    };
  }, []);

  const handleWsCallback = (res) => {
    store.market.updateState({ netWorth: res?.n });
  };

  const tickerShadow = useMemo(() => {
    if (!tradeRecent) return;
    return {
      s: name,
      c: tradeRecent.p,
      cv: tradeRecent.b ? "1" : "-1",
    };
  }, [tradeRecent]);
  const priceCls = useUpDownClassTicker(tickerShadow);
  const priceLab = useMemo(() => {
    if (!tradeRecent) return "--";
    return thousands(tradeRecent.p);
    // return filterBigNumThousands(tradeRecent.p, currentConfig.pricePrecision);
  }, [tradeRecent]);
  // }, [tradeRecent, currentConfig]);
  const currentPriceConvert = usePriceCurrencyConvert({ value: tradeRecent ? tradeRecent.p : 0 });

  const tradeMoreUrl = useMemo(() => {
    return `/${router.locale}/trade-order/${name}` + (isLever ? "?type=margin" : "");
  }, [router.locale, name, isLever]);

  // 净值
  const NetWorth: React.FC<any> = ({}) => {
    return isEtf && !!netWorth ? (
      <Tooltip placement="top" getPopupContainer={(triggerNode: HTMLElement) => triggerNode} title={t("trade.etfNetTip")}>
        <div className={cx(styles.etfTip)}>
          <span className={styles.networth_label}>{t("trade.etfNet")}</span>
          <span>{indentFormat(netWorth)}</span>
        </div>
      </Tooltip>
    ) : null;
  };

  return (
    <div className={cx(styles.main, isH5 && styles.main_h5, className)} {...rest}>
      <AzFontScale className={styles.leftCon} isLoop={true}>
        <b className={priceCls}>{indentFormat(priceLab)}</b>
        <span className={cx(styles.arrow, priceCls)}>
          <AzSvg icon={"arrow-down"} />
        </span>
        {!isEtf && <small>{indentFormat(currentPriceConvert)}</small>}
        {!isH5 ? <NetWorth /> : null}
      </AzFontScale>
      {isH5 ? (
        <div className={styles.net_worth_h5}>
          <NetWorth />
        </div>
      ) : null}
      {/* <div className={styles.rightCon}>
        <a href={tradeMoreUrl}>{t("trade.more")}</a>
      </div> */}
    </div>
  );
};

export default observer(Main);
