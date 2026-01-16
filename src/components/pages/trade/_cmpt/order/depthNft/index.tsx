import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import qs from "qs";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
import store from "store";
import Socket from "utils/socket/public";
import Storage from "utils/storage";
import { get_depth } from "api/v4/market";
// import { post_etfNetWorth } from "api/old/exapi/redemption";

import useTimeout from "hooks/useTimeout";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";
import AzFontScale from "components/az/fontScale";
import AzLoading from "components/az/loading";
import AzScrollLay from "components/az/scroll/lay";
import AzScrollWindow from "components/az/scroll/window";
import DepthTotalUnitSwitch from "components/pages/trade/_cmpt/order/_cmpt/depthTotalUnitSwitch";
import useRecord from "hooks/useRecord";

import CMPT_Option from "../option";
import CMPT_List from "../list";
import CMPT_Recent from "../recent";

import styles from "./index.module.scss";

import { BreakpointEnum, LayoutEnum } from "store/app";
import { DepthAryProps, LayoutAdvancedActiveKeyEnum, LayoutH5ActiveKeyEnum } from "store/trade";
import { LayEnum } from "../index";
// const { AzContext } = Context;
const { useTranslation } = Hooks;
const { Big } = Util;

interface WsDepthProps {
  s: string; //交易对
  a?: Array<Array<string>>; //卖盘数组
  b?: Array<Array<string>>; //买盘数组
  fi: number; //firstUpdateId 等于上一次推送的lastUpdateId + 1
  i: number; //lastUpdateId
}
interface apiDepthProps {
  asks: Array<Array<string>>; //卖盘数组
  bids: Array<Array<string>>; //买盘数组
  lastUpdateId: number; //lastUpdateId
  timestamp: number; //时间戳
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  lay: LayEnum;
  setLay: (arg: LayEnum) => void;
}

const WindowUl: React.FC<any> = ({ startIndex = 0, record, depthType, maxAmount, openOrderObj, isOnly }) => {
  // console.log("record===", record);
  return record.map((item, index) => {
    return (
      <CMPT_List
        key={`${item[4]}`}
        style={isOnly ? { position: "absolute", top: (startIndex + index) * 20 + "px" } : undefined}
        ary={item}
        depthType={depthType}
        maxAmount={maxAmount}
        openOrderObj={openOrderObj}
      />
    );
  });
};

const Main: React.FC<Props> = ({ lay, setLay }) => {
  const t = useTranslation();
  const $log = useRecord("/components/pages/trade/_cmpt/order/depthNft/index.tsx");

  const { breakpoint, layout } = store.app;
  const { name, currentConfig, isEtf } = store.market;
  const { tradeRecent, depthAsks, depthBids, layoutAdvancedActiveKey, layoutH5ActiveKey, isDepthShowTotalPrice } = store.trade;
  const { openOrder } = store.balances;

  const coinSell = useMemo(() => {
    return store.currency.getCurrencyDisplayName(name.split("_")[0] || "");
  }, [name]);
  const coinBuy = useMemo(() => {
    return store.currency.getCurrencyDisplayName(name.split("_")[1] || "");
  }, [name]);
  const openOrderObj = useMemo<ObjAny>(() => {
    if (!openOrder || !openOrder.length) return {};

    const obj = {};
    openOrder.map((doc) => {
      if (doc.symbol !== name) return;
      obj[doc.orderId] = true;
    });
    return obj;
  }, [openOrder, name]); //当前挂单价格对象

  // const [lay, setLay] = useState<LayEnum>(LayEnum.ask2bid);
  const [loading, setLoading] = useState<boolean>(true);
  const setLoadingFalse = useCallback(() => setLoading(false), []);
  const [timeoutLoading, timeoutLoadingClear] = useTimeout(setLoadingFalse, { ms: 2000 });

  const isHasReady = useRef<boolean>(false); //该交易对是否有过一次正常连续情况
  const isCacheWs = useRef<boolean>(true); //是否缓存ws
  const wsCacheAry = useRef<WsDepthProps[]>([]); //ws缓存集合
  const wsLatest = useRef<WithUndefined<WsDepthProps>>(); //最新推送的ws

  const apiReqDepthArg = useMemo(() => {
    return {
      fn: get_depth,
      config: {
        params: {
          symbol: name,
          limit: 1000,
        },
      },
    };
  }, [name]);
  const apiReqDepth = useAxiosCancelFun(apiReqDepthArg);

  const mixDepthArray = useCallback((array, newArray) => {
    const retAry = [...array];
    if (!newArray || !newArray.length) return retAry;
    newArray.map((ary) => {
      const price = ary[0];
      const num = +ary[1];
      const orderid = ary[2];
      const index = retAry.findIndex((tar) => {
        if (typeof tar[2] === "string") return orderid == tar[2];
        if (typeof tar[2] === "object") return orderid == tar[2].nft;
        return false;
      });

      if (num) {
        if (index < 0) {
          retAry.push(ary);
        } else {
          retAry.splice(index, 1, ary);
        }
      } else {
        if (index < 0) {
          //无
        } else {
          retAry.splice(index, 1);
        }
      }
    });
    return retAry;
  }, []); //盘口增量数据与当前数组进行混合，返回新数组
  interface sumTotalCfgProps {
    isReverse?: boolean;
    dpPrice?: number;
    dpAmount?: number;
  }
  const sumTotal = useCallback((array: Array<Array<string>> | DepthAryProps, cfg: sumTotalCfgProps = {}) => {
    const newAry: DepthAryProps = [];

    let price = "0"; //价格
    let amount = "0"; //数量
    let totalAmount = "0"; //累计数量
    let value = "0"; //价格*数量
    let totalValue = "0"; //累计(价格*数量)
    let nft = ""; //nft订单号

    //产品 Ryan Ruan 要求切换成计价币种后精度固定6位，2024-07-30
    cfg.dpPrice = 6;

    if (!cfg.isReverse) {
      for (let i = 0; i < array.length; i++) {
        price = array[i][0] || "0";
        amount = array[i][1] || "0";
        value = Big(price).times(amount).toFixed();
        totalAmount = Big(totalAmount).plus(amount).toFixed();
        totalValue = Big(totalValue).plus(value).toFixed();

        const item = array[i][2];
        if (typeof item === "string") nft = item || "";
        else if (typeof item === "object") nft = item.nft || "";
        else nft = "";

        newAry.push([price, amount, { value, totalAmount, totalValue, nft }]);
      }
    } else {
      for (let i = array.length - 1; i >= 0; i--) {
        price = array[i][0] || "0";
        amount = array[i][1] || "0";
        value = Big(price).times(amount).toFixed();
        totalAmount = Big(totalAmount).plus(amount).toFixed();
        totalValue = Big(totalValue).plus(value).toFixed();

        const item = array[i][2];
        if (typeof item === "string") nft = item || "";
        else if (typeof item === "object") nft = item.nft || "";
        else nft = "";

        newAry.unshift([price, amount, { value, totalAmount, totalValue, nft }]);
      }
    }

    return newAry;
  }, []); //统计累计等信息，返回新数组
  const dataUpdate = useCallback((data: { asks?: Array<Array<string>>; bids?: Array<Array<string>> }, isFull?: boolean) => {
    const { asks, bids } = data;
    let retAsks, retBids;
    if (isFull) {
      retAsks = asks || [];
      retBids = bids || [];
    } else {
      retAsks = mixDepthArray(store.trade.depthAsks, asks);
      retBids = mixDepthArray(store.trade.depthBids, bids);
    }

    retAsks.sort((a, b) => b[0] - a[0]); //从大到小排序
    retBids.sort((a, b) => b[0] - a[0]); //从大到小排序

    //盘口倒挂判断
    if (retAsks.length && retBids.length && +retAsks[retAsks.length - 1][0] <= +retBids[0][0]) {
      $log({
        desc: "@Depth upside down",
        data: {
          symbol: store.market.name,
          isFull,
          // data,
          // depth: {
          //   asks: store.trade.depthAsks,
          //   bids: store.trade.depthBids,
          // },
        },
      });
      /*
      console.error("depth_upDown");
      try {
        const old_depth_upDown = Storage.get("depth_upDown") || {};
        const new_depth_upDown = {
          count: +old_depth_upDown.count + 1 || 1,
          timestamp: Date.now(),
          symbol: store.market.name,
          isFull,
          data,
          depth: {
            asks: store.trade.depthAsks,
            bids: store.trade.depthBids,
          },
        };
        Storage.set("depth_upDown", new_depth_upDown);
      } catch (e) {
        console.log(e);
      }
       */
      return true;
    }

    retAsks = sumTotal(retAsks, { isReverse: true });
    retBids = sumTotal(retBids);

    store.trade.updateState({
      depthAsks: retAsks,
      depthBids: retBids,
    });
  }, []); //数据更新
  const refRetryCount = useRef<number>(0);
  const spliceData = useCallback((data: WithUndefined<apiDepthProps>): true | undefined => {
    let index = 0;
    if (!data) return true;
    if (data && data.lastUpdateId) {
      if (!wsCacheAry.current.length) {
        wsLatest.current = {
          i: data.lastUpdateId,
          fi: data.lastUpdateId,
          s: name,
        };
        console.log("@Depth pure api data display");
      } else {
        let doc, isOK;
        for (let i = 0; i < wsCacheAry.current.length; i++) {
          doc = wsCacheAry.current[i];
          if (doc.fi - 1 === data.lastUpdateId) {
            index = i;
            isOK = true;
            break;
          }
          if (doc.i === data.lastUpdateId) {
            index = i + 1;
            isOK = true;
            break;
          }
        }
        if (!isOK) {
          $log({
            desc: "@Depth fail to splice api data with ws data",
            data: {
              name,
              // apiData: data,
              // wsCacheAry: wsCacheAry.current,
            },
          });
          // return retry();

          if (!isHasReady.current) {
            //如果从没有正常连续情况
            console.log("@Depth never success so display api data");
            isHasReady.current = true;
            dataUpdate(data, true);
          }

          return true;
        }
        console.log("@Depth data splicing successful");
      }
    }

    let asks: Array<Array<string>> = [],
      bids: Array<Array<string>> = [];
    if (data) {
      asks = data.asks;
      bids = data.bids;
    }

    for (let i = index; i < wsCacheAry.current.length; i++) {
      asks = mixDepthArray(asks, wsCacheAry.current[i].a);
      bids = mixDepthArray(bids, wsCacheAry.current[i].b);
    }

    const isErr = dataUpdate({ asks, bids }, true);
    if (isErr) return true;

    isCacheWs.current = false;
    wsCacheAry.current = [];

    refRetryCount.current = 0;
    isHasReady.current = true;
  }, []); //数据拼接
  const refRetryTimeout = useRef<number>();
  const retry = useCallback(() => {
    isCacheWs.current = true;
    // wsCacheAry.current = data ? [data] : [];
    // wsLatest.current = data;
    console.log("@Depth retry", refRetryTimeout.current);

    if (refRetryTimeout.current) return;
    refRetryCount.current = refRetryCount.current + 1;
    refRetryTimeout.current = window.setTimeout(() => {
      refRetryTimeout.current = 0;
      apiReqDepth(({ err, data, config }) => {
        console.log("@Depth retry api data", data);
        if (!(config && config.params && config.params.symbol === store.market.name)) {
          console.log("@Depth retry config.params.symbol !== name", config.params.symbol, store.market.name);
          return;
        }
        const rst = spliceData(err ? undefined : data);
        rst && retry();
      });
    }, (refRetryCount.current > 3 ? 3 : refRetryCount.current) * 200);
  }, [apiReqDepth, spliceData]);
  useEffect(() => {
    isHasReady.current = false;
    refRetryCount.current = 0;
    if (refRetryTimeout.current) {
      clearTimeout(refRetryTimeout.current);
      refRetryTimeout.current = 0;
    }
  }, [name]);

  const wsCallback = (data: WsDepthProps) => {
    // console.log("depth_update@ ws data", data);
    if (data.s !== store.market.name) {
      console.log("@Depth wsCb name !== data.s", store.market.name, data.s);
      return;
    }
    if (wsLatest.current && wsLatest.current.i !== data.fi - 1) {
      $log({
        desc: "@Depth ws data is not continuous",
        data: {
          name,
          wsLatest: wsLatest.current,
          ws: data,
        },
      });
      wsCacheAry.current = [data];
      wsLatest.current = data;
      return retry();
    }
    wsLatest.current = data;
    // console.log("wsCacheAry=", wsCacheAry.current);
    if (isCacheWs.current) return wsCacheAry.current.push(data);

    const isErr = dataUpdate({
      asks: data.a,
      bids: data.b,
    });
    if (isErr) {
      wsCacheAry.current = [data];
      wsLatest.current = data;
      return retry();
    }
  };

  const [depthMerge, setDepthMerge] = useState<string>();
  /* 
  const depthMergeFixed = useMemo<number>(() => {
    if (!depthMerge) return 0;
    const str = depthMerge.split(".")[1];
    return str ? str.length : 0;
  }, [depthMerge]);
  const depthMergeFun = useCallback(
    (depthAry, rm, isReverse) => {
      if (!depthMerge) return depthAry;
      const { quantityPrecision } = currentConfig;
      const retAry: DepthAryProps = [];
      depthAry.map((ary) => {
        const price = Big(
          Big(ary[0] || 0)
            .div(depthMerge)
            .toFixed(0, rm)
        )
          .times(depthMerge)
          .toFixed(depthMergeFixed);
        const lastRetAry = retAry[retAry.length - 1];
        if (lastRetAry) {
          if (price === lastRetAry[0]) {
            lastRetAry[1] = Big(lastRetAry[1] || 0)
              .plus(ary[1] || 0)
              .toFixed(quantityPrecision);
            // lastRetAry[2] = Big(lastRetAry[2] || 0).plus(ary[2] || 0).toFixed(quantityPrecision);
            return;
          }
        }

        retAry.push([price, Big(ary[1] || 0).toFixed(quantityPrecision)]);
      });
      // return retAry;
      return sumTotal(retAry, isReverse, quantityPrecision);
    },
    [depthMerge, depthMergeFixed, currentConfig, sumTotal]
  );
  const depthAsks = useMemo(() => {
    if (!depthAsks) return depthAsks;
    return depthMergeFun(depthAsks, 3, true);
  }, [depthMergeFun, depthAsks]);
  const depthBids = useMemo(() => {
    if (!depthBids) return depthBids;
    return depthMergeFun(depthBids, 0, false);
  }, [depthMergeFun, depthBids]);
   */
  const asksMaxAmount = useMemo<number>(() => {
    let max = 0;
    (depthAsks || []).map((item: any[]) => {
      if (item[1] - max > 0) max = +item[1];
    });
    return max;
  }, [depthAsks]); //卖方最大数量
  const bidsMaxAmount = useMemo<number>(() => {
    let max = 0;
    (depthBids || []).map((item: any[]) => {
      if (item[1] - max > 0) max = +item[1];
    });
    return max;
  }, [depthBids]); //买方最大数量

  console.log("depthAsks, depthBids =", { depthAsks, depthBids });

  const [askRecord, setAskRecord] = useState<any[]>();
  const [bidRecord, setBidRecord] = useState<any[]>();
  const maxTotalAmount = useMemo<number>(() => {
    if (lay === LayEnum.ask2bid) {
      let askTotalAmount = 0;
      if (askRecord && askRecord[0] && askRecord[0][2] && askRecord[0][2].totalAmount) askTotalAmount = +askRecord[0][2].totalAmount;
      let bidTotalAmount = 0;
      if (
        bidRecord &&
        bidRecord.length &&
        bidRecord[bidRecord.length - 1] &&
        bidRecord[bidRecord.length - 1][2] &&
        bidRecord[bidRecord.length - 1][2].totalAmount
      )
        bidTotalAmount = +bidRecord[bidRecord.length - 1][2].totalAmount;

      return Math.max(askTotalAmount, bidTotalAmount);
    }
    if (lay === LayEnum.ask) {
      if (depthAsks && depthAsks[0] && depthAsks[0][2] && depthAsks[0][2].totalAmount) return +depthAsks[0][2].totalAmount;
    }
    if (lay === LayEnum.bid) {
      if (
        depthBids &&
        depthBids.length &&
        depthBids[depthBids.length - 1] &&
        depthBids[depthBids.length - 1][2] &&
        depthBids[depthBids.length - 1][2].totalAmount
      )
        return +depthBids[depthBids.length - 1][2].totalAmount;
    }

    return 0;
  }, [lay, askRecord, bidRecord, depthAsks, depthBids]);

  useEffect(() => {
    console.log("@Depth name=", name);
    const msg = { event: `depth_update@${name}` };

    Socket.addChannel(msg, wsCallback);
    const cancelFun = apiReqDepth(({ err, data, config }) => {
      console.log("@Depth first api response", { err, data, config });
      if (store.market.name !== name) return;
      if (!(config && config.params && config.params.symbol === name)) {
        console.log("@Depth first api response config.params.symbol !== name", config.params.symbol, name);
        return;
      }
      const rst = spliceData(err ? undefined : data);
      rst && retry();
      timeoutLoading();
    });

    return () => {
      // if (cancelFun.current) {
      //   cancelFun.current();
      //   cancelFun.current = null;
      // }
      console.log("@Depth remove name=", name);
      cancelFun && cancelFun.current && cancelFun.current();
      timeoutLoadingClear();
      isCacheWs.current = true;
      wsCacheAry.current = [];
      wsLatest.current = undefined;

      setLoading(true);
      Socket.removeChannel(msg);
      store.trade.updateState({ depthAsks: undefined, depthBids: undefined });
    };
  }, [name]);
  useEffect(() => {
    if (loading && tradeRecent !== undefined && (depthAsks || depthBids)) {
      timeoutLoadingClear();
      setLoadingFalse();
    }
  }, [tradeRecent, depthAsks, depthBids]);

  // const apiReqEtfNetWorth = useCallback(() => {
  //   post_etfNetWorth({
  //     data: qs.stringify({ dealPair: name }),
  //   }).then((netWorth) => {
  //     store.market.updateState({ netWorth });
  //   });
  // }, [name]);
  // const [timeoutEtfNetWorth, timeoutEtfNetWorthClear] = useTimeout(apiReqEtfNetWorth, { ms: 5000, isLoop: true, isInitExec: true });
  // useEffect(() => {
  //   store.market.updateState({ netWorth: "" });
  // }, [name]);
  // useEffect(() => {
  //   timeoutEtfNetWorthClear();
  //   if (isEtf) {
  //     // console.log("is etf timeoutEtfNetWorth");
  //     timeoutEtfNetWorth();
  //   }
  // }, [name, isEtf]);

  const isHide = useMemo(() => {
    //isH5
    if (breakpoint === BreakpointEnum.sm) {
      if (layoutH5ActiveKey !== LayoutH5ActiveKeyEnum.order) return true;
      else return false;
    }
    //专业版布局
    if (layout === LayoutEnum.advanced) {
      if (breakpoint === BreakpointEnum.xl) return false;
      if (layoutAdvancedActiveKey !== LayoutAdvancedActiveKeyEnum.order) return true;
      else return false;
    }

    return false;
  }, [breakpoint, layoutH5ActiveKey, layout, layoutAdvancedActiveKey]);
  if (isHide) return <></>;

  return (
    <div className={styles.main}>
      <CMPT_Option atvLay={lay} onLayChange={(lay) => setLay(lay)} depthMerge={depthMerge} setDepthMerge={setDepthMerge} />
      <div className={styles.nav}>
        <AzFontScale isLoop>{t("trade.price") + (coinBuy.length < 7 ? `(${coinBuy})` : "")}</AzFontScale>
        <AzFontScale isLoop>{t("trade.amount") + (coinSell.length < 7 ? `(${isDepthShowTotalPrice ? coinBuy : coinSell})` : "")}</AzFontScale>
        {/*<AzFontScale isLoop>{t("trade.total") + (coinSell.length < 7 ? `(${coinSell})` : "")}</AzFontScale>*/}
        <DepthTotalUnitSwitch />
      </div>

      <div className={styles.content}>
        {loading && <AzLoading />}
        {!loading && (
          <>
            {lay === LayEnum.ask2bid && (
              <>
                <AzScrollLay className={cx(styles.scrollWindowAsk)} height={20} dataAry={depthAsks || []} isReverse={true} recordCb={setAskRecord}>
                  <WindowUl depthType={LayEnum.ask} maxAmount={maxTotalAmount} openOrderObj={openOrderObj} />
                </AzScrollLay>
                <CMPT_Recent />
                <AzScrollLay className={cx(styles.scrollWindowBid)} height={20} dataAry={depthBids || []} recordCb={setBidRecord}>
                  <WindowUl depthType={LayEnum.bid} maxAmount={maxTotalAmount} openOrderObj={openOrderObj} />
                </AzScrollLay>
              </>
            )}
            {lay === LayEnum.ask && (
              <>
                <AzScrollWindow className={cx(styles.scrollWindowOnlyAsk)} height={20} dataAry={depthAsks || []} isScrollBottom>
                  <WindowUl depthType={LayEnum.ask} maxAmount={maxTotalAmount} openOrderObj={openOrderObj} isOnly />
                </AzScrollWindow>
                <CMPT_Recent />
              </>
            )}
            {lay === LayEnum.bid && (
              <>
                <CMPT_Recent />
                <AzScrollWindow className={cx(styles.scrollWindowOnlyBid)} height={20} dataAry={depthBids || []}>
                  <WindowUl depthType={LayEnum.bid} maxAmount={maxTotalAmount} openOrderObj={openOrderObj} isOnly />
                </AzScrollWindow>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default observer(Main);
