import React, { HTMLAttributes, useContext, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util, Context } from "@az/base";
import store from "store";

import styles from "./index.module.scss";

import { LayoutEnum } from "store/app";

const { useTranslation } = Hooks;
const { getUrl } = Util;

interface Props extends HTMLAttributes<HTMLDivElement> {
  isBuy?: boolean;
}

const Main: React.FC<Props> = ({ isBuy }) => {
  const t = useTranslation();
  const { isH5, layout } = store.app;

  const [appState, appDispatch] = useContext<any>(Context.AzContext);

  const isTwo = useMemo(() => {
    return isH5 || layout === LayoutEnum.advanced;
  }, [isH5, layout]);

  const BtnLogin = (
    <button
      className={cx("btnTxt", styles.btnLogin)}
      onClick={() => {
        const query = "?backurl=" + encodeURIComponent(location.href);
        // location.href = getUrl("/accounts/login" + query);
        appDispatch({
          payload: {
            showWalletModal: true,
            fromPage: "SPOT",
          },
        });
      }}
    >
      {t("wallet.connect")}
    </button>
  );
  const BtnRegister = (
    <button
      className={cx("btnTxt", styles.btnRegister)}
      onClick={() => {
        const query = "?backurl=" + encodeURIComponent(location.href);
        location.href = getUrl("/accounts/register" + query);
      }}
    >
      {t("trade.registerNow")}
    </button>
  );

  // if (!isTwo) {
  //   return isBuy ? BtnLogin : BtnRegister;
  // }

  return (
    <div className={cx(styles.main)}>
      {/* {BtnRegister} */}
      {BtnLogin}
    </div>
  );
};

export default observer(Main);
// export default Main;
