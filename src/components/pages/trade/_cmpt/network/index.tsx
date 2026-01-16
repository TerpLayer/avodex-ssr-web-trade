import React, { HTMLAttributes, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import store from "store";
import Signal from "@/components/app/div/signal";
import Socket from "utils/socket/public";

import styles from "./index.module.scss";

enum NetworkStatusEnum {
  connecting = "connecting", //连接中
  stable = "stable", //网络连接稳定
  reconnecting = "reconnecting", //重连中
  error = "error", //网络异常
}

enum AtvColorEnum {
  green = "#17C186",
  yellow = "#EE1472",
  red = "#FD5760",
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  // const {isLogin} = store.user;

  const [status, setStatus] = useState<NetworkStatusEnum>(NetworkStatusEnum.connecting);
  const [ts, setTs] = useState<number>(0);

  const parseObj = useMemo(() => {
    const labelObj = {
      [NetworkStatusEnum.connecting]: t("trade.connecting") + "...",
      [NetworkStatusEnum.stable]: t("trade.stable"),
      [NetworkStatusEnum.reconnecting]: t("trade.reconnecting") + "...",
      [NetworkStatusEnum.error]: t("trade.error"),
    };

    let value: number, label: string, color: string | undefined;

    if (status === NetworkStatusEnum.connecting) {
      label = labelObj[NetworkStatusEnum.connecting];
      value = 0;
      color = AtvColorEnum.green;
    } else if (status === NetworkStatusEnum.stable) {
      label = labelObj[NetworkStatusEnum.stable];
      if (ts < 300) {
        value = 100;
        color = AtvColorEnum.green;
      } else if (ts <= 1000) {
        value = 75;
        color = AtvColorEnum.yellow;
      } else {
        value = 50;
        color = AtvColorEnum.red;
      }
    } else if (status === NetworkStatusEnum.reconnecting) {
      label = labelObj[NetworkStatusEnum.reconnecting];
      value = 0;
      color = AtvColorEnum.yellow;
    } else {
      label = labelObj[NetworkStatusEnum.error];
      value = 0;
      color = undefined;
    }

    return { value, label, color };
  }, [status, ts]);

  useEffect(() => {
    Socket.stateCb = ({ connectCounts, readyState, ts, desc }) => {
      console.log("Socket.stateCb = ", { connectCounts, readyState, ts, desc });
      setTs(ts);
      if (readyState == 0) {
        setStatus(connectCounts > 1 ? NetworkStatusEnum.reconnecting : NetworkStatusEnum.connecting);
      } else if (readyState == 1) {
        setStatus(NetworkStatusEnum.stable);
      } else {
        setStatus(NetworkStatusEnum.error);
      }
    };
    Socket._emit();

    return () => {
      Socket.stateCb = undefined;
    };
  }, []);

  return (
    <div className={cx(styles.main, className)}>
      {parseObj.value > 0 && <Signal value={parseObj.value} atvColor={parseObj.color} />}
      <span style={{ color: parseObj.color }}>{parseObj.label}</span>
    </div>
  );
};

export default observer(Main);
// export default Main;
