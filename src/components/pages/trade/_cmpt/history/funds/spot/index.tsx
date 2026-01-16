import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";
// import { routerPush, thousands, upperCaseFirstLetter } from "@/utils/method";
import { get_balances } from "api/v4/balance";

// import { Dropdown, MenuProps, Tooltip } from "antd";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import usePriceCurrencyConvertCb from "hooks/usePriceCurrencyConvertCb";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
import CurrencyMarketDropdown from "../../_cmpt/currencyMarketDropdown";
import H5 from "./h5";

import styles from "./index.module.scss";

import { BalancesProps } from "store/balances";

export interface BalancesExtendProps extends BalancesProps {
  _total: string;
  _available: string;
  _freeze: string;
  _totalAsset: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  clsUl: string;
  clsLi: string;
}

const Main: React.FC<Props> = ({ className, clsUl, clsLi }) => {
  // const router = useRouter();
  const t = useTranslation();
  const { isH5 } = store.app;
  const { type } = store.market;
  const { wsBalance, convertCurrency } = store.balances;
  const { currencyObj, getCurrencyDisplayName } = store.currency;

  const getPriceCurrencyConvertCb = usePriceCurrencyConvertCb();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BalancesProps[]>();

  const getPrecision = useCallback(
    (currency) => {
      if (currencyObj && currencyObj[currency] && currencyObj[currency].maxPrecision) return currencyObj[currency].maxPrecision;
    },
    [currencyObj]
  );

  const itemsExtend = useMemo<WithUndefined<BalancesExtendProps[]>>(() => {
    if (!items || !currencyObj) return undefined;
    const ary: BalancesExtendProps[] = [];
    items.map((doc) => {
      const obj = currencyObj[doc.currency];
      if (obj && obj.isListing != 1) return;

      ary.push({
        ...doc,
        _total: Big(doc.totalAmount || 0).toFixedCy(getPrecision(doc.currency)),
        _available: Big(doc.availableAmount || 0).toFixedCy(getPrecision(doc.currency)),
        _freeze: Big(doc.frozenAmount || 0).toFixedCy(getPrecision(doc.currency)),
        _totalAsset: getPriceCurrencyConvertCb({ value: doc.totalAmount, coin: doc.currency, unit: false }),
      });
    });
    return ary;
  }, [items, currencyObj, getPrecision, getPriceCurrencyConvertCb]);

  const apiReqArg = useMemo(() => {
    return {
      fn: get_balances,
      config: {},
      success: ({ assets = [] }) => {
        (assets as BalancesProps[]).sort((a, b) => +(b.convertBtcAmount || 0) - +(a.convertBtcAmount || 0));
        setItems(assets);
      },
      callback: () => setLoading(false),
    };
  }, []);
  const apiReq = useAxiosCancelFun(apiReqArg);

  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current || (wsBalance && wsBalance.z === type)) {
      // setLoading(true);
      apiReq();
    }
    isFirst.current = false;
  }, [wsBalance]);

  return (
    <>
      {isH5 ? (
        <H5 items={itemsExtend} />
      ) : (
        <AzScrollBarY noWrap={store.app.rtl} className={cx(styles.AzScrollBarY, className)} options={{}}>
          <div className={cx(styles.main, className)}>
            <div className={styles.nav}>
              <div className={cx(clsLi, styles.li)}>
                <div>{t("trade.coin")}</div>
                <div>{t("trade.totalFund")}</div>
                <div>{t("trade.availableAsset")}</div>
                <div>{t("trade.freeze")}</div>
                <div>{t("trade.totalAsset0", [getCurrencyDisplayName(convertCurrency)])}</div>
              </div>
            </div>

            {itemsExtend && (
              <div className={cx(clsUl, styles.ul)}>
                {!itemsExtend.length ? (
                  <AppDivNoData className={styles.noData} />
                ) : (
                  itemsExtend.map((doc) => {
                    return (
                      <div key={doc.currency} className={cx(clsLi, styles.li)}>
                        <div>
                          <CurrencyMarketDropdown currency={doc.currency} />
                        </div>
                        <div>{doc._total}</div>
                        <div>{doc._available}</div>
                        <div>{doc._freeze}</div>
                        <div>{doc._totalAsset}</div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </AzScrollBarY>
      )}
      {loading && <AzLoading />}
    </>
  );
};

export default observer(Main);
// export default Main;
