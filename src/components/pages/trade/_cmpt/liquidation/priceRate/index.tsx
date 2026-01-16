import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
// const { Big } = Util;
// import store from "store";

import useLeverAccount from "components/pages/trade/_hook/useLeverAccount";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className, ...rest }) => {
  const t = useTranslation();

  const { toLiquidationPriceLab } = useLeverAccount();

  return (
    <div className={cx(styles.main, className)} {...rest}>
      <div>
        <span>{t("trade.toLiqPrice")}</span>:
      </div>
      <div>{toLiquidationPriceLab}</div>
    </div>
  );
};

export default observer(Main);
// export default Main;
