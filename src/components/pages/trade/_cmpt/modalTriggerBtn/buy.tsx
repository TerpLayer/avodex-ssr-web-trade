import React, { HTMLAttributes, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util, LoginPromptButton } from "@az/base";
import store from "store";
import { $g } from "utils/statistics";

import AzSvg from "components/az/svg";

const { useTranslation } = Hooks;
const { getUrl } = Util;

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, "title"> {
  isIcon?: boolean;
  currency?: string;
}

const Buy: React.FC<Props> = ({ className, children, isIcon, currency }) => {
  const t = useTranslation();
  // const router = useRouter();
  const { isLogin } = store.user;
  const { currencyObj } = store.currency;

  const handleClick = useCallback(() => {
    if (!isLogin) return;
    $g("WEB_Trade_Withdraw_click");
    // const { isEtf } = store.market;
    // let coin = "";
    // if (isEtf) {
    //   coin = "usdt";
    // } else {
    //   coin = currency || store.market.name.split("_")[0];
    // }
    // let path = "/accounts/assets/wallet/withdraw?currency=";
    // if (currencyObj && currencyObj[coin] && currencyObj[coin].type === "NFT") {
    //   path = "/accounts/assets/wallet/withdraw-softnote?currency=";
    // }
    // location.href = getUrl(path + coin);
    (window as any).appDispatch({
      payload: {
        showDepositAndWithDrawModal: true,
        currentActionType: "withdraw",
        showAccountCard: false,
        fromPage: "SPOT",
      },
    });
  }, [isLogin]);

  return (
    <LoginPromptButton className={cx("btnTxt", className)} onClick={handleClick}>
      {children || (isIcon ? <AzSvg icon={"deposit"} /> : t("trade.withdraw"))}
    </LoginPromptButton>
  );
};

export default observer(Buy);
