import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";

import { Dropdown, MenuProps, Modal, ModalProps } from "antd";
import AppDropdown from "components/app/dropdown";
import AzLoading from "components/az/loading";
// import AzSvg from "components/az/svg";
import ModalAlert from "components/antd/modal/alert";
import SvgClose from "assets/icon-svg/close2.svg";
import SvgIcon from "@az/SvgIcon";

import styles from "./index.module.scss";
import { get_accountOverview, post_loan, post_repayLoan } from "@/api/old/lever";
import AppInputNumber from "components/app/input/number";
export enum AppModalBorrowRepayModalTypeEnum {
  borrow = "borrow",
  repay = "repay",
}

const ModalTypeEnum = AppModalBorrowRepayModalTypeEnum;

interface IAccountMarketProps extends ObjAny {
  buyCoin: ObjAny;
  liquidationPrice: string;
  marketId: number;
  marketName: string;
  sellCoin: ObjAny;
}
export interface AppModalBorrowRepayProps extends ModalProps {
  open?: boolean;
  modalType?: AppModalBorrowRepayModalTypeEnum;
}

interface Props extends AppModalBorrowRepayProps {
  updateProps: (obj: Omit<AppModalBorrowRepayProps, "updateProps">) => void;
}

const AppModalBorrowRepay: React.FC<Props> = ({ open = false, modalType = ModalTypeEnum.borrow, updateProps, ...rest }) => {
  const t = useTranslation();

  const refIsFirstOpen = useRef(true);
  const { leverConfigAry, formatName, name, config } = store.market;
  const newLeverConfigAry = leverConfigAry?.map((item) => ({
    ...item,
    marketName: item.marketName,
    name: formatName(item.marketName),
  }));

  const defaultSelectMarket = useMemo(() => {
    return newLeverConfigAry?.find((item) => item.marketName === name)?.marketName || "";
  }, [newLeverConfigAry, name]);

  const [selectMarket, setSelectMarket] = useState("");
  // 下拉币种数据
  const [tokenData, setTokenData] = useState<string[]>([]);
  const [selectCoin, setSelectCoin] = useState("");
  const [accountMarketData, setAccountMarketData] = useState<IAccountMarketProps | null>(null);
  const [amount, setAmount] = useState<string | number>("");
  const init = useCallback(() => {
    //do something init
  }, []);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (refIsFirstOpen.current) init();
      setSelectMarket(defaultSelectMarket);
      refIsFirstOpen.current = false;
    } else {
      //...
    }
  }, [open]);

  // 切换Tab 数据清空
  useEffect(() => {
    setAccountMarketData(null);
    setAmount("");
  }, [modalType]);

  const marketItems = useMemo(() => {
    return leverConfigAry?.map((item) => ({
      key: item.marketName,
      label: formatName(item.marketName),
    }));
  }, [leverConfigAry]);

  const tokenItems: MenuProps["items"] = useMemo(
    () =>
      tokenData.map((item) => ({
        key: item,
        label: <a onClick={() => handlerTokenClick(item)}>{item.toLocaleUpperCaseCurrency()}</a>,
      })),
    [tokenData]
  );

  const handlerClick = (marketName) => {
    setSelectMarket(marketName);
  };

  const handlerTokenClick = (item: string) => {
    setSelectCoin(item);
    setAmount("");
  };

  useEffect(() => {
    setTokenData(selectMarket.toLocaleUpperCaseCurrency().split("_"));
    console.log(selectMarket, "selectMarket");
    if (selectMarket) {
      setLoading(true);
      get_accountOverview(selectMarket)
        .then((res) => {
          setAccountMarketData(res);
          setSelectCoin(selectMarket.toLocaleUpperCaseCurrency().split("_")[0]);
        })
        .catch(() => {
          setAccountMarketData(null);
          setSelectCoin("");
        })
        .finally(() => {
          setLoading(false);
          setAmount("");
        });
    }
  }, [selectMarket, modalType]);

  const dailyInterestRate = useMemo(() => {
    const rate = leverConfigAry?.find((item) => item.marketName === selectMarket)?.dailyInterestRate || 0;
    return Big(rate).times(100).toFixedMaxCy(8);
  }, [selectMarket, leverConfigAry]);

  const selectCoinObj = useMemo(() => {
    if (accountMarketData && selectCoin) {
      if (accountMarketData.sellCoin.coinName === selectCoin.toLocaleLowerCaseCurrency()) return accountMarketData.sellCoin;
      if (accountMarketData?.buyCoin.coinName === selectCoin.toLocaleLowerCaseCurrency()) return accountMarketData.buyCoin;
    }
    return null;
  }, [accountMarketData, selectCoin]);

  const maxBorrowed = useCallback(() => {
    const data = Big(selectCoinObj?.canLoanAmount || 0).toFixedMax(8);
    setAmount(data);
  }, [selectCoinObj]);

  const currentConfig = useMemo(() => {
    if (!selectMarket || !config) return null;
    return config[selectMarket];
  }, [selectMarket, config]);

  const currencyObjPoint = useMemo(() => {
    if (!selectCoin || !currentConfig) return 0;
    const coinQuantity = selectMarket.split("_")[0]; // 卖方币
    if (selectCoin.toLocaleLowerCaseCurrency() === coinQuantity) {
      return currentConfig.quantityPrecision && currentConfig.quantityPrecision >= 0 ? currentConfig.quantityPrecision : 0;
    } else {
      return currentConfig.pricePrecision && currentConfig.pricePrecision >= 0 ? currentConfig.pricePrecision : 0;
    }
  }, [currentConfig, selectCoin]);

  const handleInputAmount = (val) => {
    setAmount(val);
  };

  const onSubmit = () => {
    const arg = {
      market: selectMarket,
      coin: selectCoin.toLocaleLowerCaseCurrency(),
      amount: amount,
      trace: Date.now(),
    };
    setLoading(true);
    const postMethods = modalType === ModalTypeEnum.borrow ? post_loan : post_repayLoan;
    postMethods(arg, {
      isResFull: true,
      errorPop: true,
      successPop: true,
    })
      .then(() => {
        setAmount("");
        updateProps({ open: false });
        setSelectMarket("");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const contentNode = () => {
    return modalType === ModalTypeEnum.borrow ? (
      <div className={cx(styles.alertContent)}>
        <div>
          {" "}
          {t("trade.amount")} : {amount} {selectCoinLabel}
        </div>
        <div>
          {t("trade.dailyRate")} : {dailyInterestRate}%
        </div>
        <div>{t("trade.continue")}</div>
      </div>
    ) : (
      <div className={cx(styles.alertContent)}>
        <div>
          {" "}
          {t("trade.repayAmount")} : {amount} {selectCoinLabel}
        </div>
        <div>{t("trade.continue")}</div>
      </div>
    );
  };

  const hanlderOk = () => {
    if (!amount) return;
    ModalAlert.confirm({
      content: contentNode(),
      onOk: (close) => {
        close();
        onSubmit();
      },
    });
  };
  const onCancel = () => {
    if (!loading) {
      updateProps({ open: false });
      setSelectMarket("");
    }
    setLoading(false);
  };

  const tradeAmount = useMemo(() => {
    return Big(selectCoinObj?.tradeAmount || 0).toFixedMaxCy(8);
  }, [selectCoinObj]);

  const selectCoinLabel = useMemo(() => {
    return selectCoin.toLocaleUpperCaseCurrency();
  }, [selectCoin]);

  const allLoanAmount = useMemo(() => {
    if (!selectCoinObj) return 0;
    const { hasLoanAmount, interestAmount } = selectCoinObj;
    return Big(hasLoanAmount || 0)
      .plus(interestAmount || 0)
      .toFixedMaxCy(8);
  }, [selectCoinObj]);

  const canRepayLoanAmount = useMemo(() => {
    if (!selectCoinObj) return 0;
    const { canRepayLoanAmount } = selectCoinObj;
    return Big(canRepayLoanAmount || 0).toFixedMax(8);
  }, [selectCoinObj]);

  const handleAllRepayAmount = () => {
    setAmount(canRepayLoanAmount);
  };

  const maxCanLoanAmount = useMemo(() => {
    if (!selectCoinObj) return "0";
    return Big(selectCoinObj.canLoanAmount || 0).toFixedMax(8);
  }, [selectCoinObj]);

  const maxCanRepayLoanAmount = useMemo(() => {
    if (!selectCoinObj) return "0";
    return Big(selectCoinObj.canRepayLoanAmount || 0).toFixedMax(8);
  }, [selectCoinObj]);

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
      onCancel={onCancel}
      onOk={hanlderOk}
      className={styles.relative}
      {...rest}
    >
      <div className={styles.main}>
        <div className={styles.label}>{t("trade.marginMarket")}</div>
        <AppDropdown value={selectMarket} items={marketItems} onChange={handlerClick} />
        <div className={styles.label}> {t("trade.coin")}</div>
        <Dropdown
          placement={"bottomLeft"}
          destroyPopupOnHide={false}
          className={cx(styles.pairsDropDown)}
          trigger={["click"]}
          menu={{
            items: tokenItems,
            selectedKeys: selectCoin ? [selectCoin] : [],
          }}
        >
          <button className={cx("btnTxt btnDrop", { [styles.flexEnd]: !selectCoin })} onClick={(e) => e.preventDefault()}>
            {selectCoin.toLocaleUpperCaseCurrency()}
          </button>
        </Dropdown>

        {modalType === ModalTypeEnum.borrow && (
          <>
            <div className={styles.label}>
              {t("trade.dailyRate")}
              <span className={styles.labelRight}> {dailyInterestRate}%</span>
            </div>
            <div className={styles.label}>
              {t("trade.borrowed")}
              <span className={styles.labelRight}>
                {selectCoinObj?.hasLoanAmount}
                <> {selectCoin.toLocaleUpperCaseCurrency()}</>
              </span>
            </div>
            <div className={cx(styles.label, styles.mbt20)}>
              {t("trade.maxBorrowed")}
              <span className={styles.labelRight}>
                {maxCanLoanAmount}
                <> {selectCoinLabel}</>
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.amount")}
              <span className={"text-right"}>
                {t("trade.maxCanLoan")}:<span className={styles.labelRight}> {maxCanLoanAmount}</span>
                <> {selectCoinLabel}</>
              </span>
            </div>
            <AppInputNumber
              className={cx(styles.textLeft)}
              suffix={
                <span onClick={maxBorrowed} className={cx(styles.active)}>
                  {t("trade.all")}
                </span>
              }
              value={amount}
              placeholder={t("trade.plsInBorrowAmount")}
              onInput={handleInputAmount}
              disabled={loading}
              noBtns={true}
              point={currencyObjPoint}
              isStepPoint={true}
              max={Number(maxCanLoanAmount)}
            />
          </>
        )}
        {modalType === ModalTypeEnum.repay && (
          <>
            <div className={styles.label}>
              {t("trade.availableAsset")}
              <span className={styles.labelRight}>
                {tradeAmount}
                <> {selectCoinLabel}</>
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.interest")}
              <span className={styles.labelRight}>
                {selectCoinObj?.interestAmount}
                <> {selectCoinLabel}</>
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.borrowed")}
              <span className={styles.labelRight}>
                {selectCoinObj?.hasLoanAmount}
                <> {selectCoinLabel}</>
              </span>
            </div>
            <div className={cx(styles.label, styles.mbt20)}>
              {t("trade.allBorrow")}
              <span className={styles.labelRight}>
                {allLoanAmount}
                <> {selectCoinLabel}</>
              </span>
            </div>
            <div className={styles.label}>
              {t("trade.repayAmount")}
              <span className={"text-right"}>
                {t("trade.maxCanRepay")} :<span className={styles.labelRight}>&nbsp; {selectCoinObj?.canRepayLoanAmount}</span>
                <> {selectCoinLabel}</>
              </span>
            </div>
            <AppInputNumber
              className={cx(styles.textLeft)}
              suffix={
                <span onClick={handleAllRepayAmount} className={cx(styles.active)}>
                  {t("trade.all")}
                </span>
              }
              value={amount}
              placeholder={t("trade.plsInRepayNum")}
              onInput={handleInputAmount}
              disabled={loading}
              noBtns={true}
              point={8}
              isStepPoint={true}
              max={Number(maxCanRepayLoanAmount)}
            />
          </>
        )}
      </div>
      {loading && <AzLoading className={styles.loading} />}
    </Modal>
  );
};

export default observer(AppModalBorrowRepay);
