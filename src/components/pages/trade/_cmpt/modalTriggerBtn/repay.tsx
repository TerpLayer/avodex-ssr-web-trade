import React, { HTMLAttributes, useCallback } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
import store from "store";

import AzSvg from "components/az/svg";

import { AppModalBorrowRepayModalTypeEnum, AppModalBorrowRepayProps } from "components/app/modal/borrowRepay";

const { useTranslation } = Hooks;
// const { getUrl } = Util;

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, "title">, AppModalBorrowRepayProps {
  isIcon?: boolean;
}

const Repay: React.FC<Props> = ({ className, children, isIcon }) => {
  const t = useTranslation();
  // const router = useRouter();
  const { isLogin } = store.user;

  const handleClick = useCallback(() => {
    if (!isLogin) return;
    store.trade.updateState({
      modalBorrowRepay: {
        open: true,
        modalType: AppModalBorrowRepayModalTypeEnum.repay,
      } as AppModalBorrowRepayProps,
    });
  }, [isLogin]);

  return (
    <button className={cx("btnTxt", className)} onClick={handleClick}>
      {children || (isIcon ? <AzSvg icon={"add"} /> : t("trade.repay"))}
    </button>
  );
};

export default observer(Repay);
