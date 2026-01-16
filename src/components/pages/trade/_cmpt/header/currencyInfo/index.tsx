import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment, getUrl, Big } = Util;
import store from "store";
import { get_currencyCgSupported } from "api/v4/price";
import { point2Percent } from "utils/method";
import ImgIcon404 from "@/assets/img/icon404.png";

import { message } from "antd";
import AzSvg from "components/az/svg";
import Storage from "utils/storage";

import styles from "./index.module.scss";

import { LayoutEnum } from "store/app";

const Main: React.FC = () => {
  const t = useTranslation();
  const { layout } = store.app;
  const { name, isEtf, etfConfigObj, netWorth } = store.market;
  const { getCurrencyDisplayName } = store.currency;
  // const { currencyInfo } = store.currency;
  const curEtfCurrency = useMemo(() => {
    return etfConfigObj?.[name];
  }, [name, etfConfigObj]);
  const coinBuyLab = useMemo(() => {
    return getCurrencyDisplayName(name.split("_")[1]);
  }, [name, getCurrencyDisplayName]);

  const currencyInfo = useMemo<ObjAny>(() => {
    return store.currency.currencyInfo || { currency: name.split("_")[0] };
  }, [name, store.currency.currencyInfo]);

  const publishTime = useMemo(() => {
    if (!currencyInfo) return;
    const { publishTime } = currencyInfo;
    return publishTime ? moment(publishTime).formatMs() : "--";
  }, [currencyInfo]);
  const isClassic = useMemo(() => {
    return false;
    // return layout === LayoutEnum.classic;
  }, [layout]);

  const refTrigger = useRef<HTMLDivElement>(null);
  const refContent = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const onMouseDown = useCallback((e) => {
    console.log("doc mousedown======", e);
    if (refTrigger.current && refTrigger.current.contains(e.target)) return;
    if (refContent.current && refContent.current.contains(e.target)) return;
    setVisible(false);
    document.removeEventListener("mousedown", onMouseDown);
  }, []);
  const onClick = useCallback(() => {
    const visible = refContent.current && refContent.current.classList.contains(styles.visible);
    console.log("clicked======", visible);
    if (!visible) {
      setVisible(true);
      document.addEventListener("mousedown", onMouseDown);
    } else {
      setVisible(false);
      document.removeEventListener("mousedown", onMouseDown);
    }
  }, []);

  const refCgSupported = useRef<WithUndefined<boolean>>();
  const handleClickMore = useCallback(() => {
    if (!currencyInfo) return;
    if (refCgSupported.current === undefined) {
      get_currencyCgSupported(currencyInfo?.currency)
        .then((data) => {
          refCgSupported.current = !!data;
          // todo();
        })
        .finally(todo);
    } else {
      todo();
    }

    function todo() {
      if (refCgSupported.current && !store.market.isEtf) {
        location.href = getUrl("/price/" + currencyInfo?.currency);
      } else {
        // message.warn(t("price.currencyCgNotSupport"));
        onClick();
      }
    }
  }, [store.market.isEtf, currencyInfo]);
  useEffect(() => {
    refCgSupported.current = undefined;
  }, [currencyInfo]);

  useEffect(() => {
    if (isClassic || !refTrigger.current) return;
    refTrigger.current.addEventListener("click", handleClickMore);
    return () => {
      console.log("useEffect clear");
      setVisible(false);
      if (refTrigger.current) refTrigger.current.removeEventListener("click", handleClickMore);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isClassic, currencyInfo]);

  if (!currencyInfo) return <></>;

  return (
    <div className={cx(styles.main, { [styles.hover]: isClassic })}>
      <div ref={refTrigger} className={styles.target}>
        {/*<AzSvg icon="info" />*/}
        {<h2>{currencyInfo.fullName || getCurrencyDisplayName(currencyInfo.currency)}</h2>}
      </div>
      <div ref={refContent} className={cx(styles.content, { [styles.visible]: visible })}>
        {isEtf ? (
          <div className={styles.etf_currency_detail}>
            <div className={styles.etf_currency_hd}>
              <h2>
                <img src={curEtfCurrency?.logo || ImgIcon404} alt="" />
                {getCurrencyDisplayName(currencyInfo.currency)}（{curEtfCurrency?.direction === "LONG" ? t("market.etf.kanduo") : t("market.etf.kankong")}
                {curEtfCurrency?.baseCurrency.toUpperCase()}({t("market.etf.leverNum", { amount: curEtfCurrency?.maxLeverage })})）
              </h2>
            </div>
            <div className={styles.etf_currency_bd}>
              <div className={styles.etf_currency_item}>
                <span>{t("market.etf.trackTarget")}</span>
                <i>{curEtfCurrency?.baseCurrency.toUpperCase()}</i>
              </div>
              <div className={styles.etf_currency_item}>
                <span>{t("market.etf.manageRate")}</span>
                <i>{curEtfCurrency?.managementRate ? `${point2Percent(curEtfCurrency.managementRate)}%` : null}</i>
              </div>
              <div className={styles.etf_currency_item}>
                <span>{t("market.etf.initVal")}</span>
                <i>{curEtfCurrency?.initialNetWorth + " " + coinBuyLab}</i>
              </div>
              <div className={styles.etf_currency_item}>
                <span>{t("market.etf.lastVal")}</span>
                <i>{(netWorth || "--") + " " + coinBuyLab}</i>
              </div>
              <div className={styles.etf_currency_item}>
                <span>{t("trade.margin")}</span>
                <i>{curEtfCurrency?.maxLeverage}X</i>
              </div>
              <div className={styles.etf_currency_desc}>
                <p>{curEtfCurrency?.instruction}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.contentHead}>
              <p>
                <b>{getCurrencyDisplayName(currencyInfo.currency)}</b>
                <span>{currencyInfo.fullName}</span>
              </p>
              {/*<a href={getUrl("/price/" + currencyInfo.currency)}>&gt;</a>*/}
              {/*<a onClick={handleClickMore}>&gt;</a>*/}
            </div>
            <div className={styles.contentBody}>
              <div>
                <p>{t("trade.issueTime")}</p>
                <div>
                  <p>{publishTime}</p>
                </div>
              </div>
              <div>
                <p>{t("trade.totalSupply")}</p>
                <div>
                  <p>{currencyInfo.totalSupply || currencyInfo.totalSupply === 0 ? currencyInfo.totalSupply : "--"}</p>
                </div>
              </div>
              <div>
                <p>{t("trade.totalCirculation")}</p>
                <div>
                  <p>{currencyInfo.circulatingSupply || currencyInfo.circulatingSupply === 0 ? currencyInfo.circulatingSupply : "--"}</p>
                </div>
              </div>
              <div>
                <p>{t("trade.crowdfundingPrice")}</p>
                <div>
                  <p>{currencyInfo.fundingPrice || currencyInfo.fundingPrice === 0 ? currencyInfo.fundingPrice : "--"}</p>
                </div>
              </div>
              <div>
                <p>{t("trade.whitePaper")}</p>
                <div>
                  <a href={currencyInfo.whitePaperLink} target="_blank" rel="noreferrer">
                    {currencyInfo.whitePaperLink || "--"}
                  </a>
                </div>
              </div>
              <div>
                <p>{t("trade.website")}</p>
                <div>
                  <a href={currencyInfo.websiteLink} target="_blank" rel="noreferrer">
                    {currencyInfo.websiteLink || "--"}
                  </a>
                </div>
              </div>
              <div>
                <p>{t("trade.blockQuery")}</p>
                <div>
                  <a href={currencyInfo.blockLink} target="_blank" rel="noreferrer">
                    {currencyInfo.blockLink || "--"}
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default observer(Main);
