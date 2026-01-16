import React, { HTMLAttributes, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment, Big } = Util;
import store from "store";
import ImgIcon404 from "assets/img/icon404.png";
import { get_currencyInfo } from "api/v4/price";
import useAxiosCancelFun from "@/hooks/useAxiosCancelFun";
import { thousands } from "@/utils/method";
import AzLoading from "@/components/az/loading";
import SvgIcon from "@az/SvgIcon";
import svgSearch from "@/assets/icon-svg/search2.svg";
import svgLink from "@/assets/icon-svg/link.svg";
import svgPaper from "@/assets/icon-svg/paper.svg";
import AzScrollBarY from "components/az/scroll/barY";

import stylesView from "../index.module.scss";
import styles from "./index.module.scss";

import { CurrencyProps } from "@/store/currency";
import usePriceCurrencyConvertCb from "@/hooks/usePriceCurrencyConvertCb";

interface CoinGeckoProps {
  image: string;
  currencyFullName: string;
  marketRank: number; //市值排名
  marketCap: string; //市值
  marketAdvantage: string; //市值优势
  volDivMarket: string; //流通量/总市值
  totalSupply: string; //总供应量
  maxSupply: string; //最大供应量
  fullyDilutedValuation: string; //完全摊薄估值
  highAllTime: string; //历史最高价
  lowAllTime: string; //历史最低价
  desc: string; //简介
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  const { name, isEtf } = store.market;
  const { currencyObj, currencyInfo } = store.currency;
  const { convertCurrency, convertCurrencyCfg } = store.balances;

  const getPriceCurrencyConvertCb = usePriceCurrencyConvertCb();

  const coin = useMemo(() => {
    return name.split("_")[0];
  }, [name]);
  const coinCfg = useMemo(() => {
    if (currencyObj && currencyObj[coin]) return currencyObj[coin];
    return {
      currency: coin,
      displayName: coin.toUpperCaseCurrency(),
    } as CurrencyProps;
  }, [coin, currencyObj]);

  const [coinGecko, setCoinGecko] = useState<CoinGeckoProps | null | undefined>();
  const apiReqArg = useMemo(() => {
    return {
      fn: (arg) => get_currencyInfo(coin, arg),
      config: {
        params: {
          vsCurrency: convertCurrency,
        },
      },
      success: (data) => setCoinGecko(data),
      error: () => setCoinGecko(null),
    };
  }, [coin, convertCurrency]);
  const apiReq = useAxiosCancelFun(apiReqArg);

  useEffect(() => {
    apiReq();

    return () => {
      setCoinGecko(undefined);
    };
  }, [coin, convertCurrency]);

  const mergeObj = useMemo(() => {
    if (currencyInfo === undefined || coinGecko === undefined) return;
    const objInfo = (currencyInfo || {}) as CurrencyProps;
    const objGecko = (coinGecko || {}) as CoinGeckoProps;

    return {
      logo: coinCfg.logo || objGecko.image || objInfo.logo || ImgIcon404,
      fullName: coinCfg.fullName || objGecko.currencyFullName || objInfo.fullName,
      marketRank: objGecko.marketRank,
      marketCap: objGecko.marketCap ? convertCurrencyCfg?.note + thousands(objGecko.marketCap) : objGecko.marketCap,
      marketAdvantage: objGecko.marketAdvantage,
      volDivMarket: objGecko.volDivMarket,
      totalSupply: (() => {
        const totalSupply = objGecko.totalSupply || objInfo.totalSupply;
        if (totalSupply) return thousands(totalSupply) + " " + coinCfg.displayName;
      })(),
      maxSupply: (() => {
        const maxSupply = objGecko.maxSupply || objInfo.circulatingSupply;
        if (maxSupply) return thousands(maxSupply) + " " + coinCfg.displayName;
      })(),
      fullyDilutedValuation: objGecko.fullyDilutedValuation
        ? convertCurrencyCfg?.note + thousands(objGecko.fullyDilutedValuation)
        : objGecko.fullyDilutedValuation,
      highAllTime: getValWithNote(objGecko.highAllTime),
      lowAllTime: getValWithNote(objGecko.lowAllTime),
      fundingPrice: objInfo.fundingPrice
        ? getValWithNote(getPriceCurrencyConvertCb({ value: objInfo.fundingPrice, coin: "usdt", unit: false, thousands: false }))
        : objInfo.fundingPrice,
      publishTime: objInfo.publishTime ? moment(objInfo.publishTime).format("YYYY-MM-DD") : objInfo.publishTime,
      //
      websiteLink: objInfo.websiteLink, //官网
      whitePaperLink: objInfo.whitePaperLink, //白皮书
      blockLink: objInfo.blockLink, //区块浏览器
      //
      introduction: objGecko.desc || objInfo.introduction,
    };

    function getValWithNote(val) {
      if (!val) return val;
      return convertCurrencyCfg?.note + thousands(val);
    }
  }, [currencyInfo, coinGecko, convertCurrencyCfg, coinCfg, getPriceCurrencyConvertCb]);

  return (
    <div className={cx(stylesView.main, className)}>
      {!mergeObj && <AzLoading className={styles.loading} />}
      {mergeObj && (
        <>
          <div className={cx(stylesView.head)}>
            <div className={cx(stylesView.coin)}>
              <img src={mergeObj.logo} alt="logo" />
              <span>{coinCfg.displayName}</span>
              {mergeObj.fullName && <small>{`(${mergeObj.fullName})`}</small>}
            </div>
          </div>
          <div className={cx(stylesView.body)}>
            <AzScrollBarY>
              <div className={cx(stylesView.scrollDiv)}>
                {!!mergeObj.marketRank && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("price.marketValueRank")}</div>
                    <div>{mergeObj.marketRank}</div>
                  </div>
                )}
                {!!mergeObj.marketCap && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("trade.marketValue")}</div>
                    <div>{mergeObj.marketCap}</div>
                  </div>
                )}
                {!!mergeObj.marketAdvantage && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("price.marketValAdvantage")}</div>
                    <div>{mergeObj.marketAdvantage}</div>
                  </div>
                )}
                {!!mergeObj.volDivMarket && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("price.ltlzsz")}</div>
                    <div>{mergeObj.volDivMarket}</div>
                  </div>
                )}
                {!!mergeObj.totalSupply && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("price.totalSupply")}</div>
                    <div>{mergeObj.totalSupply}</div>
                  </div>
                )}
                {!!mergeObj.maxSupply && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("trade.maxSupply")}</div>
                    <div>{mergeObj.maxSupply}</div>
                  </div>
                )}
                {!!mergeObj.fullyDilutedValuation && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("price.fullyDilutedValue")}</div>
                    <div>{mergeObj.fullyDilutedValuation}</div>
                  </div>
                )}
                {!!mergeObj.highAllTime && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("price.historyMaxPrice")}</div>
                    <div>{mergeObj.highAllTime}</div>
                  </div>
                )}
                {!!mergeObj.lowAllTime && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("price.historyMinPrice")}</div>
                    <div>{mergeObj.lowAllTime}</div>
                  </div>
                )}
                {!!mergeObj.fundingPrice && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("trade.crowdfundingPrice")}</div>
                    <div>{mergeObj.fundingPrice}</div>
                  </div>
                )}
                {!!mergeObj.publishTime && (
                  <div className={cx(stylesView.li)}>
                    <div>{t("trade.issueTime")}</div>
                    <div>{mergeObj.publishTime}</div>
                  </div>
                )}
              </div>
            </AzScrollBarY>
            <div className={cx(styles.bodyRight)}>
              {!!(mergeObj.websiteLink || mergeObj.whitePaperLink || mergeObj.blockLink) && (
                <div className={cx(stylesView.section)}>
                  <p className={cx(stylesView.scrollDiv)}>{t("trade.friendLink")}</p>
                  <div className={cx(stylesView.scrollDiv)}>
                    {!!mergeObj.websiteLink && (
                      <a href={mergeObj.websiteLink} className={cx("btnTxt", stylesView.tag)}>
                        <SvgIcon className={cx("svgIcon")} src={svgLink} />
                        <span>{t("trade.website")}</span>
                      </a>
                    )}
                    {!!mergeObj.whitePaperLink && (
                      <a href={mergeObj.whitePaperLink} className={cx("btnTxt", stylesView.tag)}>
                        <SvgIcon className={cx("svgIcon")} src={svgPaper} />
                        <span>{t("trade.whitePaper")}</span>
                      </a>
                    )}
                    {!!mergeObj.blockLink && (
                      <a href={mergeObj.blockLink} className={cx("btnTxt", stylesView.tag)}>
                        <SvgIcon className={cx("svgIcon")} src={svgSearch} />
                        <span>{t("trade.blockBrowser")}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              {!!mergeObj.introduction && (
                <div className={cx(stylesView.section, stylesView.introduction)}>
                  <p className={cx(stylesView.scrollDiv)}>{t("trade.aboutCoin", [coinCfg.displayName])}</p>
                  <AzScrollBarY>
                    <div className={cx(stylesView.scrollDiv)} dangerouslySetInnerHTML={{ __html: mergeObj.introduction }}></div>
                  </AzScrollBarY>
                </div>
              )}
            </div>
          </div>
          <div className={cx(stylesView.foot)}>{t("trade.currencyOverviewTip")}</div>
        </>
      )}
    </div>
  );
};

export default observer(Main);
// export default Main;
