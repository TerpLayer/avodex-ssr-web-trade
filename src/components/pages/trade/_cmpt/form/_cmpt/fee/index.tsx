import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
const { Big, getUrl } = Util;
import { Popover, Switch } from "antd";
import { get_balances } from "api/v4/balance";
import { post_tradeDeductionFee } from "api/v4/account";
import { routerPush } from "utils/method";

import styles from "./index.module.scss";
import { BalancesProps } from "@/store/balances";
import { useRouter } from "next/router";
import AntdModalAlertInfo from "@/components/antd/modal/alertInfo";
// import AzSvg from "@/components/az/svg";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  const router = useRouter();
  const { isLogin, userVipInfo, tradeDeductionFee } = store.user;

  const [xtAvailable, setXtAvailable] = useState("0");
  const [loadingSwitch, setLoadingSwitch] = useState(false);

  const vipInfoLab = useMemo(() => {
    if (!userVipInfo) return {};
    const taker = Big(userVipInfo.spotTakerFeeRate || 0)
      .times(100)
      .toFixed(4);
    const maker = Big(userVipInfo.spotMakerFeeRate || 0)
      .times(100)
      .toFixed(4);

    const discountRate = tradeDeductionFee && tradeDeductionFee.discountRate ? +tradeDeductionFee.discountRate : 0;

    if (!tradeDeductionFee || !tradeDeductionFee.deductEnable || !discountRate)
      return {
        taker: <>{taker + "%"}</>,
        maker: <>{maker + "%"}</>,
      };

    const takerDeduction = Big(1).minus(discountRate).times(taker).toFixed(4);
    const makerDeduction = Big(1).minus(discountRate).times(maker).toFixed(4);

    return {
      taker: (
        <>
          <span>{takerDeduction + "%"}</span>&nbsp;<del>{taker + "%"}</del>
        </>
      ),
      maker: (
        <>
          <span>{makerDeduction + "%"}</span>&nbsp;<del>{maker + "%"}</del>
        </>
      ),
    };
  }, [userVipInfo, tradeDeductionFee]);
  const deductionLab = useMemo(() => {
    if (!tradeDeductionFee || !tradeDeductionFee.discountRate) return "";
    return Big(tradeDeductionFee.discountRate).times(100).toFixed() + "%";
  }, [tradeDeductionFee]);

  const CancelFunRef = useRef<any>(null);
  const getBalance = useCallback(() => {
    if (!store.user.isLogin) return;
    CancelFunRef.current && CancelFunRef.current();
    get_balances({
      params: {
        currencies: "az",
      },
      cancelFun: (c) => (CancelFunRef.current = c),
    })
      .then((data) => {
        const assets: BalancesProps[] = data.assets;
        const doc = assets.find((obj) => obj.currency === "az");
        if (doc) setXtAvailable(doc.availableAmount);
        else setXtAvailable("0");
      })
      .catch(() => {
        //empty
      })
      .finally(() => {
        CancelFunRef.current = null;
      });
  }, []);

  const postTradeDeductionFee = useCallback(() => {
    if (!store.user.tradeDeductionFee) return;

    setLoadingSwitch(true);
    const data = {
      deductEnable: !store.user.tradeDeductionFee.deductEnable,
    };
    post_tradeDeductionFee({
      data,
      errPop: true,
      successPop: true,
    })
      .then(() => {
        if (store.user.tradeDeductionFee)
          store.user.updateState({
            tradeDeductionFee: {
              ...store.user.tradeDeductionFee,
              ...data,
            },
          });
      })
      .finally(() => {
        setLoadingSwitch(false);
      });
  }, []);
  const handleDeductEnableChange = useCallback(() => {
    if (!store.user.tradeDeductionFee) return;
    if (!store.user.tradeDeductionFee.deductEnable) return postTradeDeductionFee();

    AntdModalAlertInfo({
      zIndex: 1500,
      isConfirm: true,
      content: t("trade.azDeductionFeeCloseTip"),
      onOk: () => {
        postTradeDeductionFee();
      },
    });
  }, [postTradeDeductionFee]);

  const handleOpenChange = useCallback(
    (open) => {
      if (!open || !tradeDeductionFee) return;
      getBalance();
    },
    [getBalance, tradeDeductionFee]
  );
  const handleClickBuy = useCallback(() => {
    routerPush(router, { symbol: "xt_usdt" });
  }, []);

  useEffect(() => {
    if (!isLogin) return;
    !userVipInfo && store.user.getUserVipInfo();
    !tradeDeductionFee && store.user.getTradeDeductionFee();
    getBalance();

    return () => {
      CancelFunRef.current && CancelFunRef.current();
    };
  }, [isLogin]);

  if (!isLogin || (!userVipInfo && !tradeDeductionFee))
    return (
      <a href={getUrl("/rate")} className={cx("linkClear", className)}>
        {t("trade.feeRate")}
      </a>
    );

  return (
    <Popover
      overlayClassName={styles.popover}
      content={
        <div className={styles.content}>
          {!!userVipInfo && (
            <div className={styles.ul}>
              <div>
                <div>
                  <span>{t("trade.yourVipLevel")}:</span>
                  <span className={styles.vip}>{userVipInfo.vipLevelName}</span>
                </div>
              </div>
              <div>
                <div>Taker:</div>
                <div>{vipInfoLab.taker}</div>
              </div>
              <div>
                <div>Maker:</div>
                <div>{vipInfoLab.maker}</div>
              </div>
            </div>
          )}

          {!!(userVipInfo && tradeDeductionFee) && <div className={styles.splitLine}></div>}

          {!!tradeDeductionFee && (
            <div className={styles.ul}>
              <div>
                <div className={styles.txtMain}>{t("trade.azDeductionFeeTip", [deductionLab])}</div>
                <div>
                  <Switch size="small" loading={loadingSwitch} checked={!!tradeDeductionFee.deductEnable} onChange={handleDeductEnableChange} />
                </div>
              </div>
              <div>
                <div>
                  <span>{t("trade.avbl") + " AZ " + xtAvailable}</span>
                  <button className={cx("btnTxt", styles.vip)} onClick={handleClickBuy}>
                    {t("trade.buyNow") + " >"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      }
      title={
        <div className={styles.title}>
          <span>{t("trade.feeRate")}</span>
          <a href={getUrl("/vip")} className={cx(styles.link)}></a>
        </div>
      }
      onOpenChange={handleOpenChange}
    >
      <button className={cx("btnTxt", className, styles.trigger)}>{t("trade.feeRate")}</button>
    </Popover>
  );
};

export default observer(Main);
// export default Main;
