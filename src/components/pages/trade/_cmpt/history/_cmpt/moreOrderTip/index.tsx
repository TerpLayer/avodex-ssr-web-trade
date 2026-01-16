import React, { HTMLAttributes, useCallback } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { getUrl } = Util;
import store from "store";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  type?: string;
  // attr?: any;
}

const Main: React.FC<Props> = ({ type, className, ...rest }) => {
  const t = useTranslation();
  const { isLogin } = store.user;
  const { isLever } = store.market;

  const handleClick = useCallback(() => {
    if (!isLogin) return;
    const spotUrl = (() => {
      if (type === "order") return getUrl("/accounts/assets/wallet/spot-order?t=orderHistory");
      return getUrl("/accounts/assets/wallet/spot-order?t=tradeHistory");
    })();
    const leverUrl = (() => {
      if (type === "order") return getUrl("/orders/margin/tradeorder");
      return getUrl("/orders/margin/usertrade");
    })();

    location.href = isLever ? leverUrl : spotUrl;
  }, [isLogin, isLever]);

  return (
    <div className={cx(styles.main, className)} {...rest}>
      <span>{"*" + t("trade.most100")}</span>
      <button className={cx("btnTxt")} onClick={handleClick}>
        {t("trade.allOrder")}
      </button>
    </div>
  );
};

export default observer(Main);
// export default Main;
