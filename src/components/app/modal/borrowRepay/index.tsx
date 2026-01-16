import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";
import { get_leverBalance } from "api/v4/balance";
import { post_leverOrder } from "api/v4/order";

import { Modal, ModalProps } from "antd";
import AppDropdown, { AppDropdownItemProps } from "components/app/dropdown";
import AzLoading from "components/az/loading";
import AzSvg from "components/az/svg";
import AppInputNumber from "components/app/input/number";
import ModalAlert from "components/antd/modal/alert";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";

import { BalancesLeverCurrencyProps, BalancesLeverProps } from "@/store/balances";
import { LeverSymbolProps } from "@/store/market";
import Storage from "@/utils/storage";
export enum AppModalBorrowRepayModalTypeEnum {
  borrow = "borrow",
  repay = "repay",
}

const ModalTypeEnum = AppModalBorrowRepayModalTypeEnum;

export interface AppModalBorrowRepayProps extends ModalProps {
  open?: boolean;
  modalType?: AppModalBorrowRepayModalTypeEnum;
}

interface Props extends AppModalBorrowRepayProps {
  updateProps: (obj: Omit<AppModalBorrowRepayProps, "updateProps">) => void;
}

const AppModalBorrowRepay: React.FC<Props> = ({ open = false, modalType = ModalTypeEnum.borrow, updateProps, ...rest }) => {
  const t = useTranslation();
  const { leverConfigAry, formatName, name, config } = store.market;
  const { currencyObj, getCurrencyDisplayName } = store.currency;

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectSymbol, setSelectSymbol] = useState("");
  const [selectCurrency, setSelectCurrency] = useState("");
  const [selectBalance, setSelectBalance] = useState<BalancesLeverProps | undefined>();

  const isBorrow = useMemo(() => modalType === ModalTypeEnum.borrow, [modalType]);
  const symbolConfig = useMemo(() => {
    if (!selectSymbol || !config) return {};
    return config[selectSymbol] || {};
  }, [config, selectSymbol]); //当前选择市场，现货市场配置
  const selectSymbolConfig: Partial<LeverSymbolProps> = useMemo(() => {
    if (!leverConfigAry || !selectSymbol) return {};
    return leverConfigAry.find((obj) => obj.symbol === selectSymbol) || {};
  }, [leverConfigAry, selectSymbol]); //当前选择市场，杠杆市场配置
  const isCurrencyBase = useMemo(() => {
    if (!selectSymbol || !selectCurrency) return false;
    return selectSymbol.split("_")[0] === selectCurrency;
  }, [selectSymbol, selectCurrency]); //是否是卖方币
  const selectCurrencyBalance = useMemo<Partial<BalancesLeverCurrencyProps>>(() => {
    if (!selectBalance) return {};
    return selectBalance[isCurrencyBase ? "base" : "quote"];
  }, [selectBalance, isCurrencyBase]);
  const currencyPointCurrency = useMemo(() => {
    if (!currencyObj || !currencyObj[selectCurrency]) return 0;
    return currencyObj[selectCurrency].maxPrecision >= 0 ? currencyObj[selectCurrency].maxPrecision : 0;
  }, [currencyObj, selectCurrency]); //当前选择币种，币种精度
  const currencyPointMarket = useMemo(() => {
    const attr = isCurrencyBase ? "quantityPrecision" : "pricePrecision";
    return symbolConfig[attr] && symbolConfig[attr] >= 0 ? symbolConfig[attr] : 0;
  }, [symbolConfig, isCurrencyBase]); //当前选择币种，市场精度
  const currencyPoint = useMemo(() => {
    return isBorrow ? currencyPointMarket : currencyPointCurrency;
  }, [isBorrow, currencyPointCurrency, currencyPointMarket]); //当前选择币种，市场精度

  const selectCurrencyMaxLoanAmount = useMemo(() => {
    return selectSymbolConfig[isCurrencyBase ? "maxLoanAmountSell" : "maxLoanAmountBuy"] || "0";
  }, [selectSymbolConfig, isCurrencyBase]); //当前杠杆市场，选择币种，最大借贷数量
  const maxLoanAmount = useMemo(() => {
    //min(市场币种最大借贷数量，用户可借)
    //可借 = 本金*(杠杆倍数-1)-已借
    let maxNum = Big(selectCurrencyBalance.capitalAmount || 0)
      .times(Big(selectSymbolConfig.maxLeverage || 0).minus(1))
      .minus(selectCurrencyBalance.loanAmount || 0)
      .toFixed();
    +maxNum < 0 && (maxNum = "0");
    +maxNum > +selectCurrencyMaxLoanAmount && (maxNum = selectCurrencyMaxLoanAmount);
    return Big(maxNum).toFixed(currencyPoint);
  }, [selectCurrencyBalance, selectSymbolConfig, currencyPoint, selectCurrencyMaxLoanAmount]); //最大借款数量
  const maxRepayAmount = useMemo(() => {
    //min(可用, (借款+利息))
    const availableAmount = selectCurrencyBalance.availableAmount || "0";
    const loan = Big(selectCurrencyBalance.loanAmount || 0)
      .plus(selectCurrencyBalance.interestAmount || 0)
      .toFixed();
    const min = +loan > +availableAmount ? availableAmount : loan;
    return Big(min).toFixed(currencyPoint);
  }, [selectCurrencyBalance, currencyPoint]); //最大还款数量
  const maxAmount = useMemo(() => {
    if (isBorrow) {
      //本金*(杠杆倍数-1)-已借
      return +maxLoanAmount >= 0 ? maxLoanAmount : "0";
    } else {
      return +maxRepayAmount >= 0 ? maxRepayAmount : "0";
    }
  }, [isBorrow, maxLoanAmount, maxRepayAmount]);

  const selectCurrencyLab = useMemo(() => {
    if (!selectCurrency) return "";
    return getCurrencyDisplayName(selectCurrency);
  }, [getCurrencyDisplayName, selectCurrency]); //label 当前币种
  const dailyInterestRateLab = useMemo(() => {
    if (!selectSymbolConfig.dailyInterestRate) return "--%";
    return Big(selectSymbolConfig.dailyInterestRate).times(100).toFixedMin(2) + "%";
  }, [selectSymbolConfig]); //label 日利率
  const loanAmountLab = useMemo(() => {
    let loanAmount = "--";
    if (selectCurrencyBalance.loanAmount) {
      loanAmount = Big(selectCurrencyBalance.loanAmount).toFixed(currencyPoint);
    }
    return loanAmount + " " + selectCurrencyLab;
  }, [selectCurrencyBalance, currencyPoint, selectCurrencyLab]); //label 已借
  const availableAmountLab = useMemo(() => {
    let availableAmount = "--";
    if (selectCurrencyBalance.availableAmount) {
      availableAmount = Big(selectCurrencyBalance.availableAmount).toFixed(currencyPoint);
    }
    return availableAmount + " " + selectCurrencyLab;
  }, [selectCurrencyBalance, currencyPoint]); //label 可用
  const interestAmountLab = useMemo(() => {
    let interestAmount = "--";
    if (selectCurrencyBalance.interestAmount) {
      interestAmount = Big(selectCurrencyBalance.interestAmount).toFixed(currencyPoint);
    }
    return interestAmount + " " + selectCurrencyLab;
  }, [selectCurrencyBalance, currencyPoint]); //label 利息
  const allLoanAmountLab = useMemo(() => {
    //全部借款=利息+已借
    let allLoanAmount = "--";
    if (selectCurrencyBalance.interestAmount || selectCurrencyBalance.loanAmount) {
      allLoanAmount = Big(selectCurrencyBalance.interestAmount || 0)
        .plus(selectCurrencyBalance.loanAmount || 0)
        .toFixed(currencyPoint);
    }
    return allLoanAmount + " " + selectCurrencyLab;
  }, [selectCurrencyBalance, currencyPoint]); //label 全部借款

  const itemsSymbol = useMemo(() => {
    if (!leverConfigAry) return [];
    const ary: AppDropdownItemProps[] = [];

    leverConfigAry.map((obj) => {
      ary.push({
        key: obj.symbol,
        label: formatName(obj.symbol),
      });
    });

    return ary;
  }, [leverConfigAry, formatName]);
  const itemsCurrency = useMemo(() => {
    if (!selectSymbol) return [];
    const ary: AppDropdownItemProps[] = [];

    selectSymbol.split("_").map((str) => {
      ary.push({
        key: str,
        label: getCurrencyDisplayName(str),
      });
    });

    return ary;
  }, [selectSymbol, getCurrencyDisplayName]);

  const isConfirmDisabled = useMemo(() => {
    if (loading || !+amount) return true;
    return false;
  }, [loading, amount]);

  const handleGetCurrentLeverBalance = useCallback(() => {
    setLoading(true);
    get_leverBalance({
      params: { symbol: selectSymbol },
      errorPop: true,
    })
      .then((data: BalancesLeverProps) => {
        setSelectBalance(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectSymbol]);
  const handleConfirmBorrow = useCallback(() => {
    ModalAlert({
      title: t("trade.continue"),
      okText: t("confirm"),
      closable: true,
      closeIcon: <SvgIcon className={"svgIcon"} src={SvgClose} />,
      content: (
        <div className={styles.orderConfirm}>
          <div>
            <div>
              <div>{t("trade.amount")}</div>
              <div>{amount + " " + selectCurrencyLab}</div>
            </div>
            <div>
              <div>{t("trade.dailyRate")}</div>
              <div>{dailyInterestRateLab}</div>
            </div>
          </div>
        </div>
      ),
      onOk: () => {
        setLoading(true);
        post_leverOrder({
          data: {
            type: "LOAN",
            marketName: selectSymbol,
            coinName: selectCurrency,
            amount,
          },
          errorPop: true,
          successPop: true,
        })
          .then((data: BalancesLeverProps) => {
            updateProps({ open: false });
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }, [updateProps, selectSymbol, selectCurrency, amount, selectCurrencyLab, dailyInterestRateLab]);
  const handleConfirmRepay = useCallback(() => {
    ModalAlert({
      title: t("trade.continue"),
      okText: t("confirm"),
      closable: true,
      closeIcon: <SvgIcon className={"svgIcon"} src={SvgClose} />,
      content: (
        <div className={styles.orderConfirm}>
          <div>
            <div>
              <div>{t("trade.repayAmount")}</div>
              <div>{amount + " " + selectCurrencyLab}</div>
            </div>
          </div>
        </div>
      ),
      onOk: () => {
        setLoading(true);
        post_leverOrder({
          data: {
            type: "REPAY",
            marketName: selectSymbol,
            coinName: selectCurrency,
            amount,
          },
          errorPop: true,
          successPop: true,
        })
          .then((data: BalancesLeverProps) => {
            updateProps({ open: false });
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }, [updateProps, selectSymbol, selectCurrency, amount, selectCurrencyLab]);
  const handleConfirm = useCallback(() => {
    isBorrow ? handleConfirmBorrow() : handleConfirmRepay();
  }, [isBorrow, handleConfirmBorrow, handleConfirmRepay]);

  useEffect(() => {
    if (!selectSymbol) return setSelectCurrency("");
    setSelectCurrency(selectSymbol.split("_")[0]);
    handleGetCurrentLeverBalance();

    return () => {
      setSelectBalance(undefined);
      setAmount("");
    };
  }, [modalType, selectSymbol]);
  useEffect(() => {
    setAmount("");
  }, [selectCurrency]);
  useEffect(() => {
    if (open) {
      setSelectSymbol(name);
    } else {
      setSelectSymbol("");
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title={
        <div className={styles.nav}>
          <button
            className={cx("btnTxt", { [styles.navAtv]: modalType === ModalTypeEnum.borrow })}
            disabled={loading}
            onClick={() => updateProps({ modalType: ModalTypeEnum.borrow })}
          >
            {t("trade.borrow")}
          </button>
          <button
            className={cx("btnTxt", { [styles.navAtv]: modalType === ModalTypeEnum.repay })}
            disabled={loading}
            onClick={() => updateProps({ modalType: ModalTypeEnum.repay })}
          >
            {t("trade.repay")}
          </button>
        </div>
      }
      width={440}
      centered
      closeIcon={<SvgIcon className={"svgIcon"} src={SvgClose} />}
      onCancel={() => !loading && updateProps({ open: false })}
      okButtonProps={{ disabled: isConfirmDisabled }}
      onOk={handleConfirm}
      {...rest}
    >
      <div className={styles.main}>
        <div className={styles.label}>{t("trade.marginMarket")}</div>
        <AppDropdown value={selectSymbol} items={itemsSymbol} onChange={setSelectSymbol} />
        <div className={styles.label}> {t("trade.coin")}</div>
        <AppDropdown value={selectCurrency} items={itemsCurrency} onChange={setSelectCurrency} />

        {modalType === ModalTypeEnum.borrow && (
          <>
            <div className={styles.label}>
              {t("trade.dailyRate")}
              <span className={styles.labelRight}>{dailyInterestRateLab}</span>
            </div>
            <div className={styles.label}>
              {t("trade.borrowed")}
              <span className={styles.labelRight}>{loanAmountLab}</span>
            </div>
            <div className={cx(styles.label, styles.mbt20)}>
              {t("trade.maxBorrowed")}
              <span className={styles.labelRight}>{maxLoanAmount + " " + selectCurrencyLab}</span>
            </div>
            <div className={styles.label}>
              {t("trade.amount")}
              <span className={"text-right"}>
                {t("trade.maxCanLoan")}: <span className={styles.labelRight}>{maxAmount}</span>
                <> {selectCurrencyLab}</>
              </span>
            </div>
            <AppInputNumber
              className={cx(styles.textLeft)}
              suffix={
                <span onClick={() => setAmount(maxAmount)} className={cx(styles.active)}>
                  {t("trade.all")}
                </span>
              }
              value={amount}
              placeholder={t("trade.plsInBorrowAmount")}
              onInput={setAmount}
              disabled={loading}
              noBtns={true}
              point={currencyPoint}
              isStepPoint={true}
              max={+maxAmount}
            />
          </>
        )}
        {modalType === ModalTypeEnum.repay && (
          <>
            <div className={styles.label}>
              {t("trade.availableAsset")}
              <span className={styles.labelRight}>{availableAmountLab}</span>
            </div>
            <div className={styles.label}>
              {t("trade.interest")}
              <span className={styles.labelRight}>{interestAmountLab}</span>
            </div>
            <div className={styles.label}>
              {t("trade.borrowed")}
              <span className={styles.labelRight}>{loanAmountLab}</span>
            </div>
            <div className={cx(styles.label, styles.mbt20)}>
              {t("trade.allBorrow")}
              <span className={styles.labelRight}>{allLoanAmountLab}</span>
            </div>
            <div className={styles.label}>
              {t("trade.repayAmount")}
              <span className={"text-right"}>
                {t("trade.maxCanRepay")}: <span className={styles.labelRight}>{maxAmount}</span>
                <> {selectCurrencyLab}</>
              </span>
            </div>
            <AppInputNumber
              className={cx(styles.textLeft)}
              suffix={
                <span onClick={() => setAmount(maxAmount)} className={cx(styles.active)}>
                  {t("trade.all")}
                </span>
              }
              value={amount}
              placeholder={t("trade.plsInRepayNum")}
              onInput={setAmount}
              disabled={loading}
              noBtns={true}
              point={currencyPoint}
              isStepPoint={true}
              max={+maxAmount}
            />
          </>
        )}
      </div>
      {loading && <AzLoading />}
    </Modal>
  );
};

export default observer(AppModalBorrowRepay);
