import React, { HTMLAttributes, useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util, Context } from "@az/base";
import store from "store";
import { $g } from "utils/statistics";

import AzSvg from "components/az/svg";
import ModalAlert from "components/antd/modal/alert";
import Transfer from "components/pages/trade/_cmpt/modalTriggerBtn/transfer";
const { useTranslation } = Hooks;
const { getUrl } = Util;
const { AzContext } = Context;
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import IconTransfer from "./icon/transfer";
import IconDeposit from "./icon/deposit";
import IconBuy from "./icon/buy";
import styles from "./index.module.scss";
import { message } from "antd";

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, "title"> {
  currency?: string;
}

const Deposit: React.FC<Props> = ({ className, currency }) => {
  const t = useTranslation();
  const [appState, appDispatch] = useContext(AzContext);
  const { walletStatus } = appState;

  // const router = useRouter();
  const { isLogin } = store.user;
  const { currencyObj } = store.currency;
  const azContext = useContext(AzContext);

  const handleClick = useCallback(() => {
    // if (!isLogin) return;

    if (currencyObj && currency && currencyObj[currency].type === "NFT") {
      location.href = "/wallet/account/common/deposit/softnote?currency=" + currency;
      return;
    }

    const modal = ModalAlert({
      className: styles.modal,
      title: t("trade.addAvailableBalance"),
      width: 640,
      footer: <></>,
      closable: true,
      closeIcon: (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12.1562" r="12" fill="var(--az-colorv2-bg-surface)" />
          <path
            d="M15.3459 16.4582C15.6099 16.7222 16.0379 16.7222 16.3019 16.4582C16.5659 16.1942 16.5659 15.7662 16.3019 15.5022L12.956 12.1563L16.302 8.81026C16.566 8.54627 16.566 8.11825 16.302 7.85426C16.038 7.59027 15.61 7.59027 15.346 7.85426L12 11.2003L8.65398 7.85424C8.38999 7.59025 7.96198 7.59025 7.69799 7.85424C7.434 8.11824 7.434 8.54625 7.69799 8.81024L11.044 12.1563L7.69809 15.5023C7.4341 15.7662 7.4341 16.1943 7.69809 16.4583C7.96208 16.7222 8.39009 16.7222 8.65408 16.4583L12 13.1123L15.3459 16.4582Z"
            fill="var(--az-colorv2-text-secondary)"
          />
        </svg>
      ),
      content: (
        <div className={styles.modalContent}>
          <AzContext.Provider value={azContext}>
            <Transfer currency={currency} onClick={() => modal.destroy()}>
              <div>
                <IconTransfer />
              </div>
              <div>
                <p>{t("trade.transfer")}</p>
                <div>{t("trade.transferTips")}</div>
              </div>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1.99965 13.0001L1.99951 11.0002H18.1714L14.2217 7.05044L15.6359 5.63623L21.9999 12.0002L15.6359 18.3642L14.2217 16.9499L18.1715 13.0002L1.99965 13.0001Z"
                    fill="var(--az-colorv2-brand-primary)"
                  />
                </svg>
              </div>
            </Transfer>
          </AzContext.Provider>
          <a
            onClick={() => {
              modal.destroy();
              (window as any).appDispatch({
                payload: {
                  showDepositAndWithDrawModal: true,
                  currentActionType: "deposit",
                  showAccountCard: false,
                  fromPage: "SPOT",
                },
              });
            }}
          >
            <div>
              <IconDeposit />
            </div>
            <div>
              <p>{t("trade.deposit")}</p>
              <div>{t("trade.depositTips")}</div>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M1.99965 13.0001L1.99951 11.0002H18.1714L14.2217 7.05044L15.6359 5.63623L21.9999 12.0002L15.6359 18.3642L14.2217 16.9499L18.1715 13.0002L1.99965 13.0001Z"
                  fill="var(--az-colorv2-brand-primary)"
                />
              </svg>
            </div>
          </a>
          {/* <a href={getUrl("/otc/index")}>
            <div>
              <IconBuy />
            </div>
            <div>
              <p>{t("trade.buyOtc")}</p>
              <div>{t("trade.buyTips")}</div>
            </div>
            <div>
              <span>➔</span>
            </div>
          </a> */}
        </div>
      ),
    });
  }, [azContext, isLogin, currency, currencyObj]);

  const handleClick2 = () => {
    (window as any).appDispatch({
      payload: {
        showDepositAndWithDrawModal: true,
        currentActionType: "deposit",
        showAccountCard: false,
        fromPage: "SPOT",
      },
    });
  };

  return (
    <button className={cx("btnTxt", className)} onClick={handleClick2}>
      <AzSvg icon={"add"} />
    </button>
  );
};

export default observer(Deposit);
