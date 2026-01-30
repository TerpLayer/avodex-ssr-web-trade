import React, { HTMLAttributes, useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Context, LoginPromptButton } from "@az/base";
import store from "store";
import { $g } from "utils/statistics";

import AzSvg from "components/az/svg";

import { AppModalTransferProps, AccountEnum } from "@az/Transfer";
// import { AccountEnum } from "store/balances";

const { useTranslation } = Hooks;
// const { getUrl } = Util;

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, "title">, AppModalTransferProps {
  isIcon?: boolean;
  onClick?: () => void; //点击回调
}

const Transfer: React.FC<Props> = ({ className, children, isIcon, onClick, currency }) => {
  const t = useTranslation();
  // const router = useRouter();
  const { name, isLever } = store.market;
  const { isLogin } = store.user;

  const handleClick = useCallback(() => {
    onClick && onClick();
    if (!isLogin) return;

    // const obj: AppModalTransferProps = !isLever
    //   ? {
    //       // accountFrom: AccountEnum.spot,
    //       accountTo: AccountEnum.spot,
    //       currency,
    //     }
    //   : {
    //       // accountFrom: AccountEnum.spot,
    //       accountTo: AccountEnum.lever,
    //       currency,
    //       leverSymbol: name,
    //     };

    // /*
    // const obj: AppModalTransferProps = {
    //   // accountFrom: AccountEnum.spot,
    //   // accountTo: AccountEnum.futures_c,
    //   currency,
    //   leverSymbol: name,
    // };
    //  */

    // store.trade.updateState({
    //   modalTransfer: {
    //     open: true,
    //     ...obj,
    //   },
    // });
    $g("WEB_Trade_Transfer_click");
    (window as any).appDispatch({
      payload: {
        showDepositAndWithDrawModal: true,
        currentActionType: "transfer",
        showAccountCard: false,
        fromPage: "SPOT",
      },
    });
  }, [isLogin, isLever, currency, name]);

  return (
    <LoginPromptButton className={cx("btnTxt", className)} onClick={handleClick}>
      {children || (isIcon ? <AzSvg icon={"transfer"} /> : t("trade.transfer"))}
    </LoginPromptButton>
  );
};

export default observer(Transfer);
