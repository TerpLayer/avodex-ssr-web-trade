import React, { HTMLAttributes, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import cx from "classnames";
// import { Hooks } from "@az/base";
// const { useTranslation } = Hooks;
import store from "store";
import { routerPush } from "utils/method";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  symbol: string;
  disabled?: boolean;
}

const Main: React.FC<Props> = ({ className, symbol, disabled }) => {
  const router = useRouter();
  const { isLever, formatName } = store.market;

  const handleClick = useCallback(() => {
    routerPush(router, { symbol, isLever });
  }, [symbol, isLever]);

  return (
    <button disabled={disabled} className={cx("btnTxt", styles.main, className)} onClick={handleClick}>
      {formatName(symbol)}
    </button>
  );
};

export default observer(Main);
// export default Main;
