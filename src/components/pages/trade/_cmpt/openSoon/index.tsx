import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
// import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment } = Util;
import store from "store";

import styles from "./index.module.scss";
import SvgIcon from "@az/SvgIcon";

const Main: React.FC = () => {
  const t = useTranslation();
  const { time } = store.app;
  const { currentConfig } = store.market;

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
