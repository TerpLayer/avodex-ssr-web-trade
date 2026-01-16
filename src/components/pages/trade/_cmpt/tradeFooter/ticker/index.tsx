import React, { HTMLAttributes, useState, useMemo, useEffect, useCallback, useRef, cloneElement } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";
import Storage from "utils/storage";
import { Dropdown, MenuProps } from "antd";
import { getOneByThreeStatus, getUpDownCls, routerPush, eleResizeObserver } from "utils/method";
import SvgIcon from "@az/SvgIcon";
import SvgSwitch from "assets/icon-svg/switch.svg";
import UseTickerChangeRate from "@az/UseTickerChangeRate";

import styles from "./index.module.scss";

import { TickerProps } from "store/trade";

enum TickerTypeEnum {
  hot = "hot",
  self = "self",
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  const router = useRouter();
  const { isLogin, symbolStar, getSymbolStar } = store.user;
  const { config, searchMarketHotSpot, getSearchMarketHot, formatName } = store.market;
  const { tickers } = store.trade;

  const { getTicker } = UseTickerChangeRate();

  const [tickerType, setTickerType] = useState<TickerTypeEnum>(TickerTypeEnum.hot);
  useEffect(() => {
    const footerTickerType = Storage.get("footerTickerType");
    if (isLogin && footerTickerType === TickerTypeEnum.self) {
      setTickerType(TickerTypeEnum.self);
    }
  }, [isLogin]);
  const onSetTickerType = useCallback((type: TickerTypeEnum) => {
    setTickerType(type);
    Storage.set("footerTickerType", type);
  }, []);
  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: TickerTypeEnum.hot,
        label: <a onClick={() => onSetTickerType(TickerTypeEnum.hot)}>{t("trade.topSearch")}</a>,
      },
      {
        key: TickerTypeEnum.self,
        label: <a onClick={() => onSetTickerType(TickerTypeEnum.self)}>{t("trade.favorites")}</a>,
        disabled: !isLogin,
      },
    ];
  }, [isLogin]);
  const tickerAry = useMemo(() => {
    let symbolAry;
    if (tickerType === TickerTypeEnum.hot) {
      symbolAry = searchMarketHotSpot;
    } else if (tickerType === TickerTypeEnum.self) {
      symbolAry = symbolStar;
    }

    const ary: TickerProps[] = [];

    config &&
      symbolAry.map((marketName) => {
        const doc = tickers.find((obj) => obj.s === marketName);
        if (!doc) return;
        const theMarket = config[doc.s]; //找到市场的对应配置
        if (!theMarket || theMarket.state === "DELISTED" || !/^(FULL)$/.test(theMarket.displayLevel)) return; //剔除不存在或者隐藏
        ary.push(getTicker(doc));
      });

    return ary;
  }, [config, tickers, tickerType, symbolStar, searchMarketHotSpot, getTicker]);

  useEffect(() => {
    if (tickerType === TickerTypeEnum.hot) {
      getSearchMarketHot();
    } else if (tickerType === TickerTypeEnum.self) {
      getSymbolStar();
    }
  }, [tickerType]);

  //element
  const [isAnimation, setIsAnimation] = useState<boolean>(false);
  const [animationDuration, setAnimationDuration] = useState<number>(0);
  const elContentRef = useRef<HTMLDivElement>(null);
  const elDivRef = useRef<HTMLDivElement>(null);
  const getPriceLab = useCallback(
    (ticker) => {
      let precision = 2;
      if (config && config[ticker.s] && config[ticker.s].pricePrecision && config[ticker.s].pricePrecision >= 0) precision = config[ticker.s].pricePrecision;
      return Big(ticker.c || 0).toFixedCy(precision);
    },
    [config]
  );
  const getRateLab = useCallback((ticker) => {
    const rate = ticker.cr || "0";

    const sign = getOneByThreeStatus({ gt: "+", eq: "", lt: "" }, rate);
    const val = Big(rate).times(100).toFixed(2);

    return sign + val + "%";
  }, []);
  const elDiv = useMemo(() => {
    return (
      <div ref={elDivRef} className={cx(styles.elDiv)}>
        {tickerAry.map((ticker) => (
          <button
            key={ticker.s}
            className={cx("btnTxt", styles.elDivOne)}
            onClick={() => {
              routerPush(router, { symbol: ticker.s });
            }}
          >
            <div>{formatName(ticker.s)}</div>
            <div className={cx(getUpDownCls(ticker.cr))}>{getRateLab(ticker)}</div>
            <div>{getPriceLab(ticker)}</div>
          </button>
        ))}
      </div>
    );
  }, [tickerAry, getPriceLab, getRateLab]);

  const elDivCloneRef = useRef<HTMLDivElement>(null);
  const elDivClone = useMemo(() => {
    if (!isAnimation) return <></>;
    return cloneElement(elDiv, {
      ref: elDivCloneRef,
    });
  }, [elDiv, isAnimation]);

  const onResize = useCallback(() => {
    console.log("------onResize------");
    console.log("------elContentRef.current------", elContentRef.current);
    console.log("------elDivRef.current------", elDivRef.current);

    if (!elContentRef.current || !elDivRef.current) return;
    const elContentWidth = elContentRef.current.offsetWidth;
    const elDivWidth = elDivRef.current.offsetWidth;
    setIsAnimation(elDivWidth > elContentWidth);
    setAnimationDuration(Math.round(elDivWidth / 10));
  }, []);

  useEffect(() => {
    if (elContentRef.current) eleResizeObserver(elContentRef.current, onResize);
    if (elDivRef.current) eleResizeObserver(elDivRef.current, onResize);
  }, [tickerType]);

  return (
    <div className={cx(styles.main, className)}>
      <div className={cx(styles.leftDiv)}>
        <Dropdown
          placement={"topLeft"}
          menu={{
            items: dropdownItems,
            selectable: true,
            selectedKeys: [tickerType],
          }}
        >
          <button className={cx("btnTxt", styles.switchBtn)}>
            <SvgIcon className={"svgIcon"} src={SvgSwitch} />
          </button>
        </Dropdown>
      </div>
      <div key={tickerType} ref={elContentRef} className={cx(styles.content)}>
        <div className={cx(styles.contentDiv, { [styles.animation]: isAnimation })} style={{ animationDuration: `${animationDuration}s` }}>
          <>{elDiv}</>
          <>{elDivClone}</>
        </div>
      </div>
    </div>
  );
};

export default observer(Main);
// export default Main;
