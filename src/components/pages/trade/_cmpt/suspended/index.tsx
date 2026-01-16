import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Context, Hooks } from "@az/base";
const { useTranslation } = Hooks;
import cx from "classnames";
import store from "store";

import styles from "./index.module.scss";

const ImgSuspended = {
  light: require("assets/img/suspended-light.png"),
  dark: require("assets/img/suspended-dark.png"),
};

const Main: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
  const t = useTranslation();
  const [appState] = React.useContext(Context.AzContext);

  const { name } = store.market;
  const marketName = useMemo(() => {
    return store.market.formatName(name);
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  if (store.market.currentConfig.tradingEnabled !== false) return <></>;

  return (
    <div className={cx(styles.main, className)} {...rest}>
      {/*eslint-disable-next-line  @next/next/no-img-element*/}
      <img src={ImgSuspended[appState.theme]} alt={"suspended icon"} />
      <p>{marketName}</p>
      <div>{t("trade.suspended")}</div>
    </div>
  );
};

export default observer(Main);
