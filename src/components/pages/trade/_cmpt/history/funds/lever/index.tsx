import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";
import { routerPush } from "@/utils/method";
import { get_leverBalances } from "api/v4/balance";

import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import usePriceCurrencyConvertCb from "hooks/usePriceCurrencyConvertCb";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
import CMPT_btnPair from "../../_cmpt/btnPair";
import H5 from "./h5";

import styles from "./index.module.scss";

import { BalancesLeverProps } from "store/balances";

export interface BalancesLeverExtendProps extends BalancesLeverProps {
  _pair: string;
  _sell_token: string;
  _sell_available: string;
  _sell_borrow: string;
  _sell_freeze: string;
  _sell_interest: string;
  _sell_equity: string;
  _sell_equity_convert: string;
  _buy_token: string;
  _buy_available: string;
  _buy_borrow: string;
  _buy_freeze: string;
  _buy_interest: string;
  _buy_equity: string;
  _buy_equity_convert: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  clsUl: string;
  clsLi: string;
}

const Main: React.FC<Props> = ({ className, clsUl, clsLi }) => {
  const router = useRouter();
  const t = useTranslation();
  const { isH5 } = store.app;
  const { type, formatName, isLever } = store.market;
  const { wsBalance } = store.balances;
  const { currencyObj } = store.currency;

  const getPriceCurrencyConvertCb = usePriceCurrencyConvertCb();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BalancesLeverProps[]>();

  const getPrecision = useCallback(
    (currency) => {
      if (currencyObj && currencyObj[currency] && currencyObj[currency].maxPrecision) return currencyObj[currency].maxPrecision;
    },
    [currencyObj]
  );

  const itemsExtend = useMemo<WithUndefined<BalancesLeverExtendProps[]>>(() => {
    if (!items) return undefined;
    const ary: BalancesLeverExtendProps[] = [];
    items.map((doc) => {
      const { base, quote } = doc;
      const netBase = Big(base.totalAmount || 0)
        .minus(base.loanAmount || 0)
        .minus(base.interestAmount || 0)
        .toFixed(); //卖方币，净资产=总资产-已借-利息
      const netBaseLab = Big(netBase || 0).toFixedCy(getPrecision(base.currency));
      const netQuote = Big(quote.totalAmount || 0)
        .minus(quote.loanAmount || 0)
        .minus(quote.interestAmount || 0)
        .toFixed(); //买方币，净资产=总资产-已借-利息
      const netQuoteLab = Big(netQuote || 0).toFixedCy(getPrecision(quote.currency));

      ary.push({
        ...doc,
        _pair: formatName(doc.symbol),
        _sell_token: store.currency.getCurrencyDisplayName(doc.base.currency),
        _sell_available: Big(doc.base.availableAmount || 0).toFixedCy(getPrecision(doc.base.currency)),
        _sell_borrow: Big(doc.base.loanAmount || 0).toFixedCy(getPrecision(doc.base.currency)),
        _sell_freeze: Big(doc.base.frozenAmount || 0).toFixedCy(getPrecision(doc.base.currency)),
        _sell_interest: Big(doc.base.interestAmount || 0).toFixedCy(getPrecision(doc.base.currency)),
        _sell_equity: netBaseLab,
        _sell_equity_convert: " ≈ " + getPriceCurrencyConvertCb({ value: netBase, coin: base.currency }),
        _buy_token: store.currency.getCurrencyDisplayName(doc.quote.currency),
        _buy_available: Big(doc.quote.availableAmount || 0).toFixedCy(getPrecision(doc.quote.currency)),
        _buy_borrow: Big(doc.quote.loanAmount || 0).toFixedCy(getPrecision(doc.quote.currency)),
        _buy_freeze: Big(doc.quote.frozenAmount || 0).toFixedCy(getPrecision(doc.quote.currency)),
        _buy_interest: Big(doc.quote.interestAmount || 0).toFixedCy(getPrecision(doc.quote.currency)),
        _buy_equity: netQuoteLab,
        _buy_equity_convert: " ≈ " + getPriceCurrencyConvertCb({ value: netQuote, coin: quote.currency }),
      });
    });
    return ary;
  }, [items, getPrecision, getPriceCurrencyConvertCb]);

  const apiReqArg = useMemo(() => {
    return {
      fn: get_leverBalances,
      config: {},
      success: ({ assets = [] }) => {
        (assets as BalancesLeverProps[]).sort((a, b) => +(b.btcNetAmount || 0) - +(a.btcNetAmount || 0));
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
        <H5 items={itemsExtend} disabled={loading} />
      ) : (
        <AzScrollBarY noWrap={store.app.rtl} className={cx(styles.AzScrollBarY, className)} options={{}}>
          <div className={cx(styles.main, className)}>
            <div className={styles.nav}>
              <div className={cx(clsLi, styles.li)}>
                <div>{t("trade.pair")}</div>
                <div>{t("trade.coin")}</div>
                <div>{t("trade.availableAsset")}</div>
                <div>{t("trade.borrow")}</div>
                <div>{t("trade.freeze")}</div>
                <div>{t("trade.interest")}</div>
                {/*<div>{t("trade.equityValueBTC")}</div>*/}
                <div>{t("trade.equity")}</div>
              </div>
            </div>

            {itemsExtend && (
              <div className={cx(clsUl, styles.ul)}>
                {!itemsExtend.length ? (
                  <AppDivNoData className={styles.noData} />
                ) : (
                  itemsExtend.map((doc) => {
                    return (
                      <div key={doc.symbol} className={cx(clsLi, styles.li)}>
                        <div>
                          <CMPT_btnPair disabled={loading} symbol={doc.symbol} />
                        </div>
                        <div>
                          <div>{doc._sell_token}</div>
                          <div>{doc._buy_token}</div>
                        </div>
                        <div>
                          <div>{doc._sell_available}</div>
                          <div>{doc._buy_available}</div>
                        </div>
                        <div>
                          <div>{doc._sell_borrow}</div>
                          <div>{doc._buy_borrow}</div>
                        </div>
                        <div>
                          <div>{doc._sell_freeze}</div>
                          <div>{doc._buy_freeze}</div>
                        </div>
                        <div>
                          <div>{doc._sell_interest}</div>
                          <div>{doc._buy_interest}</div>
                        </div>
                        <div className={styles.totalBtc}>
                          <div>
                            <span>{doc._sell_equity}</span>
                            <small>{doc._sell_equity_convert}</small>
                          </div>
                          <div>
                            <span>{doc._buy_equity}</span>
                            <small>{doc._buy_equity_convert}</small>
                          </div>
                          {/*<div>{Big(doc.btcNetAmount || 0).toFixedCy()}</div>*/}
                          {/*<small>{" ≈ " + getPriceCurrencyConvertCb({ value: doc.btcNetAmount, coin: "btc" })}</small>*/}
                        </div>
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
