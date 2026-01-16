import React, { useContext, useMemo, useState, useCallback, useEffect, useRef } from "react";
import qs from "qs";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Context, Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";

import { Modal, ModalProps, message } from "antd";
import AzLoading from "components/az/loading";
// import AzSvg from "components/az/svg";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";
import PairsDropDown from "../../pairsDropDown";
import { getBalance, getDealPairInfo, get_etfDealPairList, post_etfAtone, post_etfApply } from "@/api/old/redemption";
import AppInputNumber from "components/app/input/number";
import { IEtfDealPairItemProps } from "@/store/market";

export enum AppModalSubscribeRedeemModalTypeEnum {
  subscribe = "subscribe",
  redeem = "redeem",
}

const ModalTypeEnum = AppModalSubscribeRedeemModalTypeEnum;

export interface AppModalSubscribeRedeemProps extends ModalProps {
  open?: boolean;
  modalType?: AppModalSubscribeRedeemModalTypeEnum;
  currency?: string;
}

interface Props extends AppModalSubscribeRedeemProps {
  updateProps: (obj: Omit<AppModalSubscribeRedeemProps, "updateProps">) => void;
}

interface IDealPairInfo extends ObjAny {
  dayBuyLimitPersonal: number;
  dayBuyLimitGlobal: number;
  feeRateBuy: number;
  buyMinPrice: number;
  dayRedeemLimitPersonal: number;
  dayRedeemLimitGlobal: number;
  feeRateRedeem: number;
  thresholdNetPrice: number;
  redeemMinPrice: number;
}
interface IBalanceInfo extends ObjAny {
  buyPersonal: number;
  buyGlobal: number;
  sellPersonal: number;
  sellGlobal: number;
}

const AppModalSubscribeRedeem: React.FC<Props> = ({ open = false, modalType = ModalTypeEnum.subscribe, updateProps, ...rest }) => {
  const t = useTranslation();
  const [appState] = useContext<any>(Context.AzContext);
  const refIsFirstOpen = useRef(true);
  const { etfDealPairListData } = store.market;
  const { name } = store.market;
  const buyCoin = name.split("_")[1];
  const sellCoin = name.split("_")[0];
  const { currencyPrice, currencyQuantity } = store.balances;
  const { currentConfig, formatName } = store.market;

  const userId = useMemo(() => {
    return appState.userInfo?.userId || "";
  }, [appState.userInfo]);

  const etfDealPairList = useCallback(async () => {
    if (etfDealPairListData.length) return;
    get_etfDealPairList({ params: { userId } }).then((res: IEtfDealPairItemProps[]) => {
      store.market.updateState({
        etfDealPairListData: res.map((item) => ({
          ...item,
          name: formatName(item.dealPairName),
        })),
      });
    });
  }, [etfDealPairListData]);

  const init = useCallback(() => {
    //do something init
    etfDealPairList();
  }, [etfDealPairList]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (refIsFirstOpen.current) init();
      //...
      refIsFirstOpen.current = false;
      setTotal("");
      setDetailPairInfo({
        dayBuyLimitPersonal: 0,
        dayBuyLimitGlobal: 0,
        feeRateBuy: 0,
        buyMinPrice: 0,
        dayRedeemLimitPersonal: 0,
        dayRedeemLimitGlobal: 0,
        feeRateRedeem: 0,
        thresholdNetPrice: 0,
        redeemMinPrice: 0,
      });
      setNetWorth(0);
      setBalance({
        buyPersonal: 0,
        buyGlobal: 0,
        sellPersonal: 0,
        sellGlobal: 0,
      });
      getDetailSubscribe(name);
    } else {
      //...
    }
  }, [open]);

  const [detailPairInfo, setDetailPairInfo] = useState<IDealPairInfo>({
    dayBuyLimitPersonal: 0,
    dayBuyLimitGlobal: 0,
    feeRateBuy: 0,
    buyMinPrice: 0,
    dayRedeemLimitPersonal: 0,
    dayRedeemLimitGlobal: 0,
    feeRateRedeem: 0,
    thresholdNetPrice: 0,
    redeemMinPrice: 0,
  });

  const [balance, setBalance] = useState<IBalanceInfo>({
    buyPersonal: 0,
    buyGlobal: 0,
    sellPersonal: 0,
    sellGlobal: 0,
  });

  const [netWorth, setNetWorth] = useState(0);
  const [dealPairState, setDealPair] = useState(name);
  const applyFeeRate = useMemo(() => {
    if (!detailPairInfo.feeRateBuy) return "--";
    const FixedNum = String(detailPairInfo.feeRateBuy * 100).split(".")[1] ? String(detailPairInfo.feeRateBuy * 100).split(".")[1].length : 2;
    return `${Big(detailPairInfo.feeRateBuy * 100).toFixedCy(FixedNum)}%`;
  }, [detailPairInfo.feeRateBuy]);

  const atoneFeeRate = useMemo(() => {
    if (!detailPairInfo.feeRateRedeem) return "--";
    const newFeeRateRedeem = (detailPairInfo.feeRateRedeem * 100).toString();
    const FixedNum = newFeeRateRedeem.split(".")[1] ? newFeeRateRedeem.split(".")[1].length : 2;
    return `${Big(detailPairInfo.feeRateRedeem * 100).toFixedCy(FixedNum)}%`;
  }, [detailPairInfo.feeRateRedeem]);

  const canUseLab = useMemo(() => {
    if (modalType === ModalTypeEnum.subscribe) {
      if (currencyPrice?.currency === buyCoin && currentConfig.quantityPrecision) {
        return Big(currencyPrice?.availableAmount).toFixedMax(currentConfig.quantityPrecision);
      }
    } else {
      if (currencyQuantity?.currency === sellCoin && currentConfig?.quantityPrecision) {
        return Big(currencyQuantity?.availableAmount).toFixedMax(currentConfig.quantityPrecision);
      }
    }
    return 0;
  }, [buyCoin, sellCoin, currencyPrice, currencyQuantity, currentConfig.quantityPrecision, modalType]);

  const getDetailSubscribe = (dealPair: string) => {
    if (!dealPair) return;
    setDealPair(dealPair.toLocaleUpperCaseCurrency());
    getDealPairInfo({ dealPair }).then((res) => {
      if (res) setDetailPairInfo(res);
    });
    getBalance({ userId, dealPair }).then((res) => {
      setBalance(res);
    });
    // post_etfNetWorth({
    //   data: qs.stringify({ dealPair }),
    // }).then((netWorth) => {
    //   setNetWorth(netWorth);
    // });
  };
  const [total, setTotal] = useState<string | number>(""); // 申购/赎回数量
  const pointPrice = useMemo(() => {
    return currentConfig.quantityPrecision;
  }, [currentConfig.quantityPrecision]);

  const maxSubscribe = () => {
    setTotal(canUseLab);
  };

  const currentCertificatePrice = useMemo(() => {
    return etfDealPairListData.find((item) => item.dealPairName === dealPairState.toLocaleLowerCaseCurrency())?.price || 0;
  }, [dealPairState, etfDealPairListData]);

  // tab 切换
  useEffect(() => {
    setTotal("");
    setDetailPairInfo({
      dayBuyLimitPersonal: 0,
      dayBuyLimitGlobal: 0,
      feeRateBuy: 0,
      buyMinPrice: 0,
      dayRedeemLimitPersonal: 0,
      dayRedeemLimitGlobal: 0,
      feeRateRedeem: 0,
      thresholdNetPrice: 0,
      redeemMinPrice: 0,
    });
    setNetWorth(0);
    setBalance({
      buyPersonal: 0,
      buyGlobal: 0,
      sellPersonal: 0,
      sellGlobal: 0,
    });
    getDetailSubscribe(name);
  }, [modalType]);

  const numDiv = (num1, num2) => {
    let baseNum1 = 0;
    let baseNum2 = 0;
    let baseNum3 = 1;
    let baseNum4 = 1;
    if (Number(num2) === 0) {
      return 0;
    }
    try {
      baseNum1 = num1.toString().split(".")[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = num2.toString().split(".")[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum3 = Number(num1.toString().replace(".", ""));
    baseNum4 = Number(num2.toString().replace(".", ""));
    return (baseNum3 / baseNum4) * Math.pow(10, baseNum2 - baseNum1);
  };

  const handleInputTotal = (val) => {
    if (Number(val) > Number(canUseLab)) {
      setTotal(canUseLab);
      return;
    }
    setTotal(val);
  };

  const handleOk = () => {
    !loading && updateProps({ open: false });
    if (Number(netWorth) === 0) {
      message.info(t("trade.messageNetWorth"));
      return;
    }

    //申购赎回偏离率 = ABS((净值 - 最新价) / 净值)，大于阀值则不可进行申购赎回操作
    if (detailPairInfo.thresholdNetPrice && Math.abs((netWorth - currentCertificatePrice) / netWorth) > detailPairInfo.thresholdNetPrice) {
      return modalType === ModalTypeEnum.subscribe ? message.info(t("trade.subthresholdError")) : message.info(t("trade.redthresholdError"));
    }

    if (modalType === ModalTypeEnum.subscribe) {
      //限制申购数量
      if (
        Number(detailPairInfo.dayBuyLimitPersonal) - Number(balance.buyPersonal) === 0 ||
        Number(detailPairInfo.buyMinPrice) > Number(detailPairInfo.dayBuyLimitPersonal) - Number(balance.buyPersonal)
      ) {
        message.info(t("trade.noSubscription"));
        return;
      }
      if (Number(total) < Number(detailPairInfo.buyMinPrice) || Number(total) > Number(detailPairInfo.dayBuyLimitPersonal) - Number(balance.buyPersonal)) {
        message.info(t("trade.minApplyOrMaxApply", [detailPairInfo.buyMinPrice, Number(detailPairInfo.dayBuyLimitPersonal) - Number(balance.buyPersonal)]));
        return;
      }
      const paramsOption = {
        amount: total,
        dealPair: dealPairState.toLocaleLowerCaseCurrency(),
        userId,
      };
      setLoading(true);
      post_etfApply({
        data: paramsOption,
        errorPop: true,
        successPop: true,
      })
        .then(() => {
          updateProps({ open: false });
        })
        .finally(() => {
          setTotal("");
          setLoading(false);
        });
    }
    if (modalType === ModalTypeEnum.redeem) {
      //限制赎回数量
      if (
        Number(total) < numDiv(Number(detailPairInfo.redeemMinPrice), netWorth) ||
        Number(total) > numDiv(Number(detailPairInfo.dayRedeemLimitPersonal) - Number(balance.sellPersonal), netWorth)
      ) {
        message.info(
          t("trade.minRedeemOrMaxRedeem", [
            numDiv(Number(detailPairInfo.redeemMinPrice), netWorth),
            numDiv(Number(detailPairInfo.dayRedeemLimitPersonal) - Number(balance.sellPersonal), netWorth),
          ])
        );
        return;
      }
      const paramsOption = {
        amount: total,
        dealPair: dealPairState.toLocaleLowerCaseCurrency(),
        userId,
      };
      setLoading(true);
      post_etfAtone({
        data: paramsOption,
        errorPop: true,
        successPop: true,
      })
        .then(() => {
          updateProps({ open: false });
        })
        .finally(() => {
          setTotal("");
          setLoading(false);
        });
    }
  };

  const onCancel = () => {
    !loading && updateProps({ open: false });
  };

  return (
    <Modal
      open={open}
      title={
        <div className={styles.nav}>
          <button
            className={cx("btnTxt", { [styles.navAtv]: modalType === ModalTypeEnum.subscribe })}
            disabled={loading}
            onClick={() => updateProps({ modalType: ModalTypeEnum.subscribe })}
          >
            {t("trade.subscribe")}
          </button>
          <button
            className={cx("btnTxt", { [styles.navAtv]: modalType === ModalTypeEnum.redeem })}
            disabled={loading}
            onClick={() => updateProps({ modalType: ModalTypeEnum.redeem })}
          >
            {t("trade.redeem")}
          </button>
        </div>
      }
      width={440}
      centered
      closeIcon={<SvgIcon className={"svgIcon"} src={SvgClose} />}
      onOk={handleOk}
      onCancel={onCancel}
      className={styles.relative}
      {...rest}
    >
      <div className={styles.main}>
        <div className={styles.label}>{t("trade.pairs")}</div>
        {modalType === ModalTypeEnum.subscribe && (
          <>
            <PairsDropDown getDetailSubscribe={getDetailSubscribe} />
            <div className={styles.label}>
              {t("trade.applyFee")}
              <span className={styles.labelRight}>{applyFeeRate}</span>
            </div>
            <div className={styles.label}>
              {t("trade.indivdualSubAmount", [buyCoin.toLocaleUpperCaseCurrency()])}
              <span className={styles.labelRight}>
                {" "}
                {balance.buyPersonal} /{detailPairInfo.dayBuyLimitPersonal}
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.allRedAmount", [buyCoin.toLocaleUpperCaseCurrency()])}
              <span className={styles.labelRight}>
                {balance.buyGlobal} /{detailPairInfo.dayBuyLimitGlobal}
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.applyNum")}
              <span>
                {t("trade.available")}:<span className={styles.labelRight}> {canUseLab} </span>
                {buyCoin.toLocaleUpperCaseCurrency()}
              </span>
            </div>
            <AppInputNumber
              className={cx(styles.textLeft)}
              suffix={
                <span onClick={maxSubscribe} className={cx(styles.active)}>
                  {t("trade.all")}
                </span>
              }
              value={total}
              onInput={handleInputTotal}
              disabled={loading}
              noBtns={true}
              point={pointPrice}
              isStepPoint={true}
            />
          </>
        )}
        {modalType === ModalTypeEnum.redeem && (
          <>
            <PairsDropDown getDetailSubscribe={getDetailSubscribe} />
            <div className={styles.label}>
              {t("trade.redemptionfee")}
              <span className={styles.labelRight}>{atoneFeeRate}</span>
            </div>
            <div className={styles.label}>
              {t("trade.individualRedAmount", [sellCoin.toLocaleUpperCaseCurrency()])}
              <span className={styles.labelRight}>
                {balance.sellPersonal}/{detailPairInfo.dayRedeemLimitPersonal}
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.allRedAmount", [sellCoin.toLocaleUpperCaseCurrency()])}
              <span className={styles.labelRight}>
                {balance.sellGlobal} /{detailPairInfo.dayRedeemLimitGlobal}
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.redemptionAmount")}
              <span>
                {t("trade.available")}:<span className={styles.labelRight}> {canUseLab} </span>
                {sellCoin.toLocaleUpperCaseCurrency()}
              </span>
            </div>
            <AppInputNumber
              className={cx(styles.textLeft)}
              suffix={
                <span onClick={maxSubscribe} className={cx(styles.active)}>
                  {t("trade.all")}
                </span>
              }
              value={total}
              onInput={handleInputTotal}
              noBtns={true}
              point={pointPrice}
              isStepPoint={true}
            />
          </>
        )}
      </div>
      {loading && <AzLoading className={styles.loading} />}
    </Modal>
  );
};

export default observer(AppModalSubscribeRedeem);
