import React, { HTMLAttributes, useCallback } from "react";
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

// 充值
const Deposit: React.FC<Props> = ({ className, children, isIcon, currency }) => {
  const t = useTranslation();
  // const router = useRouter();
  const { isLogin } = store.user;
  const { currencyObj } = store.currency;

  const handleClick = useCallback(() => {
    $g("WEB_Trade_Deposit_click");
    if (!isLogin) return;
    // const { isEtf } = store.market;
    // let coin = "";
    // if (isEtf) {
    //   coin = "usdt";
    // } else {
    //   coin = currency || store.market.name.split("_")[0];
    // }
    // let path = "/accounts/assets/wallet/deposit?currency=";
    // if (currencyObj && currencyObj[coin] && currencyObj[coin].type === "NFT") {
    //   path = "/accounts/assets/wallet/deposit-softnote?currency=";
    // }
    // location.href = getUrl(path + coin);

    (window as any).appDispatch({
      payload: {
        showDepositAndWithDrawModal: true,
        currentActionType: "deposit",
        showAccountCard: false,
        fromPage: "SPOT",
      },
    });
  }, [isLogin, currency]);

  return (
    <LoginPromptButton className={cx("btnTxt", className)} onClick={handleClick}>
      {children || (isIcon ? <AzSvg icon={"deposit"} /> : t("trade.deposit"))}
    </LoginPromptButton>
  );
};

export default observer(Deposit);
