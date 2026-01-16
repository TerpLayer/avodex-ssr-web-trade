import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// const { getUrl, Big } = Util;
import store from "store";

// import { Transfer, Borrow, Repay } from "components/pages/trade/_cmpt/modalTriggerBtn";
import Transfer from "components/pages/trade/_cmpt/modalTriggerBtn/transfer";
import Borrow from "components/pages/trade/_cmpt/modalTriggerBtn/borrow";
import Repay from "components/pages/trade/_cmpt/modalTriggerBtn/repay";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();

  const { isLever } = store.market;
  const { isLogin } = store.user;

  if (!isLever) return <></>;

  return (
    <div className={cx(styles.main, { [styles.login]: isLogin }, className)}>
      <span>{t("trade.leverTradeStep")}:&nbsp;</span>
      <span>
        <span>1.</span>
        <Transfer />
        <span>&nbsp;&gt;&nbsp;</span>
        <span>2.</span>
        <Borrow />
        <span>/{t("trade.trade")}&nbsp;&gt;&nbsp;</span>
        <span>3.</span>
        <Repay />
        <span>/{t("trade.trade")}</span>
      </span>
    </div>
  );
};

export default observer(Main);
// export default Main;
