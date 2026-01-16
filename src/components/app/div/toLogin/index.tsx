import React, { useContext, useEffect, useMemo, useState } from "react";
import cx from "classnames";

import { Hooks, Util, Context } from "@az/base";
const { useTranslation } = Hooks;
const { getUrl } = Util;

import styles from "./index.module.scss";

// interface Props extends React.HTMLAttributes<HTMLDivElement> {
//   label?: string;
// }

const AppDivToLogin: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
  const t = useTranslation();
  const [appState, appDispatch] = useContext<any>(Context.AzContext);

  const onConnectClick = () => {
    appDispatch({
      payload: {
        showWalletModal: true,
        fromPage: "SPOT",
      },
    });
  };

  const [urlObj, setUrlObj] = useState({ login: "", register: "" });
  useEffect(() => {
    const query = "?backurl=" + encodeURIComponent(location.href);
    setUrlObj({
      login: getUrl("/accounts/login" + query),
      register: getUrl("/accounts/register" + query),
    });
  }, []);

  useEffect(() => {
    const linkBtn = document.getElementById("connectWalletLink1");
    if (linkBtn) {
      linkBtn.onclick = onConnectClick;
    }
  }, []);

  const htmlStr = useMemo(() => {
    const arg0 = `<a style="var(--az-color-primary)" id="connectWalletLink1">${t("wallet.connect")}</a>`;
    const arg1 = `<a style="var(--az-color-primary)" href="${urlObj.register}">${t("trade.registerLowerCase")}</a>`;

    return t("trade.loginOrRegister1", [arg0]);
  }, [urlObj]);

  return (
    <div className={cx(styles.main, className)} {...rest}>
      <span dangerouslySetInnerHTML={{ __html: htmlStr }}></span>
    </div>
  );
};

export default AppDivToLogin;
