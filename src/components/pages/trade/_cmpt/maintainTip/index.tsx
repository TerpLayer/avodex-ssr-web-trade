import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { Hooks, Util } from "@az/base";
// const { useTranslation } = Hooks;
// const { getUrl, Big } = Util;
import store from "store";
import { get_maintainTips } from "api/old/app";

import AzSvg from "components/az/svg";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  // const t = useTranslation();
  // const [appState] = useContext(Context.AzContext);
  const { clientSideReady } = store.app;
  const { isLever } = store.market;
  const { isMaintainTip } = store.trade;

  const [spotTip, setSpotTip] = useState<any>(undefined);
  const [leverTip, setLeverTip] = useState<any>(undefined);
  const tip = useMemo(() => (isLever ? leverTip : spotTip), [isLever, spotTip, leverTip]);

  const apiReqMaintainTips = useCallback((module: string) => {
    //业务模块：1.现货、2.杠杆、3.ETF、4.ETF指数、5.U本位合约、6.币本位合约、7.全币种合约
    get_maintainTips({
      params: { module },
    }).then((data) => {
      // data = {
      //   title: "标题",
      //   content: "content",
      // };
      if (module === "1") {
        if (data && (data.title || data.content)) {
          setSpotTip(data);
        } else {
          setSpotTip(null);
        }
      } else if (module === "2") {
        if (data && (data.title || data.content)) {
          setLeverTip(data);
        } else {
          setLeverTip(null);
        }
      }
    });
  }, []);
  const handleClick = useCallback(() => {
    isLever ? setLeverTip(null) : setSpotTip(null);
  }, [isLever]);

  useEffect(() => {
    if (!clientSideReady) return;
    if (!isLever) {
      if (spotTip === undefined) apiReqMaintainTips("1");
    } else {
      if (leverTip === undefined) apiReqMaintainTips("2");
    }
  }, [clientSideReady, isLever]);
  useEffect(() => {
    // console.log("isLever, spotTip, leverTip", {isLever, spotTip, leverTip});
    if (!isLever && spotTip) {
      store.trade.updateState({ isMaintainTip: true });
    } else if (isLever && leverTip) {
      store.trade.updateState({ isMaintainTip: true });
    } else {
      store.trade.updateState({ isMaintainTip: false });
    }
  }, [isLever, spotTip, leverTip]);

  if (!isMaintainTip || !tip) return <></>;

  return (
    <div className={cx(styles.main, className)}>
      <AzSvg icon={"info"} />
      <div>
        {!!tip.title && tip.title}
        {!!(tip.title && tip.content) && " "}
        {!!tip.content && tip.content}
      </div>
      <button className={"btnTxt btnHover"} onClick={handleClick}>
        <AzSvg icon={"close"} />
      </button>
    </div>
  );
};

export default observer(Main);
// export default Main;
