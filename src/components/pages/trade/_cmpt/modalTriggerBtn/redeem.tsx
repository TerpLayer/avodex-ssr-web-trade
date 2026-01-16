import React, { HTMLAttributes, useCallback } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
import store from "store";

import AzSvg from "components/az/svg";

import { AppModalSubscribeRedeemModalTypeEnum, AppModalSubscribeRedeemProps } from "components/app/modal/subscribeRedeem";

const { useTranslation } = Hooks;
// const { getUrl } = Util;

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, "title">, AppModalSubscribeRedeemProps {
  isIcon?: boolean;
}

const Redeem: React.FC<Props> = ({ className, children, isIcon, currency }) => {
  const t = useTranslation();
  // const router = useRouter();
  const { isLogin } = store.user;

  const handleClick = useCallback(() => {
    if (!isLogin) return;
    store.trade.updateState({
      modalSubscribeRedeem: {
        open: true,
        modalType: AppModalSubscribeRedeemModalTypeEnum.redeem,
        currency,
      } as AppModalSubscribeRedeemProps,
    });
  }, [isLogin]);

  return (
    <button className={cx("btnTxt", className)} onClick={handleClick}>
      {children || (isIcon ? <AzSvg icon={"add"} /> : t("trade.redeem"))}
    </button>
  );
};

export default observer(Redeem);
