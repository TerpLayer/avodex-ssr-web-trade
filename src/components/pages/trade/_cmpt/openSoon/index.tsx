import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
// import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment } = Util;
import store from "store";

import styles from "./index.module.scss";
import SvgIcon from "@az/SvgIcon";
import AVO from "@/assets/img/avo.png";

const AVO_USDT_OPEN_PRICE = "0.1500";

const Main: React.FC = () => {
  const t = useTranslation();
  const { time } = store.app;
  const { currentConfig, name } = store.market;
  const isAvoUsdt = name === "avo_usdt";

  const [dateNow, setDateNow] = useState(Date.now());
  const timeObj = useMemo(() => {
    const openTime = +(currentConfig.nextStateTime || 0) || 0;
    const serverTime = time.server + (dateNow - time.local);
    let dest = Math.round((openTime - serverTime) / 1000);
    if (dest < 0) {
      dest = 0;
      currentConfig.nextStateTime && typeof location !== undefined && location.reload();
    }

    return {
      day: Math.floor(dest / (24 * 60 * 60)),
      hour: Math.floor((dest % (24 * 60 * 60)) / (60 * 60)),
      minute: Math.floor((dest % (60 * 60)) / 60),
      second: Math.floor((dest % 60) / 1),
    };
  }, [dateNow, currentConfig, time]);

  const destTimeFormat = useMemo(() => {
    return moment(currentConfig.nextStateTime || 0).format("YYYY-MM-DD HH:mm:ss");
  }, [currentConfig]);

  const getStr = useCallback((val: number) => {
    if (val > 9) return val + "";
    return "0" + val;
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDateNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (isAvoUsdt) {
    const d = getStr(timeObj.day);
    const h = getStr(timeObj.hour);
    const m = getStr(timeObj.minute);
    const s = getStr(timeObj.second);
    return (
      <div className={styles.avoCountdown}>
        <div className={styles.avoInner}>
          <div className={styles.avoIcon}>
            <img src={AVO} alt="AVO" />
          </div>
          <div className={styles.avoPairLabel}>AVO / USDT</div>
          <div className={styles.avoPairSub}>{t("trade.avo.subtitle")}</div>
          <div className={styles.avoPriceBox}>
            <span className={styles.avoPriceLabel}>{t("trade.avo.openPrice")}</span>
            <span className={styles.avoPriceVal}>${AVO_USDT_OPEN_PRICE}</span>
          </div>
          <div className={styles.avoCountdownTitle}>{t("trade.avo.countdown")}</div>
          <div className={styles.avoTimer}>
            <div className={styles.timeDigit}>
              <span>{d}</span>
              <span className={styles.timeUnit}>{t("trade.day")}</span>
            </div>
            <div className={styles.timeSep}>:</div>
            <div className={styles.timeDigit}>
              <span>{h}</span>
              <span className={styles.timeUnit}>{t("trade.hour(s)")}</span>
            </div>
            <div className={styles.timeSep}>:</div>
            <div className={styles.timeDigit}>
              <span>{m}</span>
              <span className={styles.timeUnit}>{t("trade.minute(s)")}</span>
            </div>
            <div className={styles.timeSep}>:</div>
            <div className={styles.timeDigit}>
              <span>{s}</span>
              <span className={styles.timeUnit}>{t("trade.second(s)")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (true)
    return (
      <div className={styles.coming}>
        <SvgIcon src={require("@/assets/icon-svg/coming.svg")} />
        {t("coming.soon")}
      </div>
    );

  return (
    <div className={styles.main}>
      <p>{t("trade.openingSoon")}</p>
      <div>
        <div>{getStr(timeObj.day)}</div>
        <span>{t("trade.day")}</span>
        <div>{getStr(timeObj.hour)}</div>
        <span>{t("trade.hour(s)")}</span>
        <div>{getStr(timeObj.minute)}</div>
        <span>{t("trade.minute(s)")}</span>
        <div>{getStr(timeObj.second)}</div>
      </div>
      <span>{t("trade.openingTime") + " " + destTimeFormat}</span>
    </div>
  );
};

export default observer(Main);
