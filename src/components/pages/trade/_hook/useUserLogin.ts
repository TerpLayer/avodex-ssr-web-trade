import { useCallback, useEffect, useMemo } from "react";
// import { observer } from "mobx-react-lite";
import { Util } from "@az/base";
import store from "store";
import SocketPrivate from "utils/socket/private";
// import SocketLever from "utils/socket/lever";
import { get_balances } from "api/v4/balance";

// import useTimeout from "hooks/useTimeout";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";

import { BalancesProps, OpenOrderProps, WsBalanceProps, WsOrderProps } from "store/balances";
import { TradeOrderStateEnum } from "store/trade";

const { Big } = Util;

const useUserLogin = () => {
  const { name, type, isLever, currentNftCoin, getLeverMarketConfig } = store.market;
  // const { currencyQuantity, currencyPrice, wsBalance, getAccountOverview, getOpenOrder, getNftPosition, getCurrentLeverBalance } = store.balances;
  const { getOpenOrder, getNftPosition, getCurrentLeverBalance } = store.balances;
  // const { isLogin, token, leverWsUserKey, getTokenUserKey } = store.user;
  const { isLogin, token } = store.user;

  const apiReqBalanceSpotArg = useMemo(() => {
    return {
      fn: get_balances,
      config: {
        params: {
          currencies: name.replace("_", ","),
        },
      },
      success: (data) => {
        const assets: BalancesProps[] = data.assets;
        name.split("_").map((currency, index) => {
          const doc = assets.find((obj) => obj.currency === currency);
          store.balances.updateState({
            [index ? "currencyPrice" : "currencyQuantity"]: doc || null,
          });
        });
        // console.log("store.balances", store.balances);
      },
    };
  }, [name]);
  const apiReqBalanceSpot = useAxiosCancelFun(apiReqBalanceSpotArg);

  /*
  const apiReqBalanceLeverArg = useMemo(() => {
    return {
      fn: get_leverBalance,
      config: {
        params: {
          symbol: name,
        },
      },
      success: (data) => {
        store.balances.updateState({
          currencyQuantity: data.base || null,
          currencyPrice: data.quote || null,
        });
        // console.log("store.balances", store.balances);
      },
    };
  }, [name]);
  const apiReqBalanceLever = useAxiosCancelFun(apiReqBalanceLeverArg);

  const [apiReqLeverMarketConfig, apiReqLeverMarketConfigClear] = useTimeout(getLeverMarketConfig, { ms: 5000, isLoop: true });
  const apiReqLeverAccountOverviewFn = useCallback(() => {
    return getAccountOverview(name);
  }, [name]);
  const [apiReqLeverAccountOverview, apiReqLeverAccountOverviewClear] = useTimeout(apiReqLeverAccountOverviewFn, { ms: 5000, isLoop: true, isInitExec: true });
   */

  // const [apiReqCurrentLeverBalance, apiReqCurrentLeverBalanceClear] = useTimeout(getCurrentLeverBalance, { ms: 5000, isLoop: true, isInitExec: true });

  const wsCbBalance = useCallback(
    (data: WsBalanceProps) => {
      console.log("wsCbBalance===", data, store.market.type, store.market.name);
      store.balances.updateState({ wsBalance: data });

      if ((data.s && data.s !== store.market.name) || data.z !== store.market.type) return;
      const ary = store.market.name.split("_");
      if (!ary.includes(data.c)) return;

      if (data.c === store.market.currentNftCoin) getNftPosition();

      const availableAmount = Big(data.b || 0)
        .minus(data.f || 0)
        .toFixed();
      const mergeObj = {
        availableAmount,
        totalAmount: data.b,
        frozenAmount: data.f,
      };

      if (ary[0] === data.c) {
        store.balances.updateState({
          currencyQuantity: {
            ...(store.balances.currencyQuantity || { currency: ary[0] }),
            ...mergeObj,
          },
        });
      } else {
        store.balances.updateState({
          currencyPrice: {
            ...(store.balances.currencyPrice || { currency: ary[1] }),
            ...mergeObj,
          },
        });
      }
      // console.log("store.balances", store.balances);
    },
    // [type, name, currencyQuantity, currencyPrice]
    []
  );
  /*变化太快可能不渲染
  useEffect(() => {
    if (!wsBalance) return;
    console.log("wsCbBalance useEffect===", wsBalance, type, name);
    if (wsBalance.z !== type) return;
    const ary = name.split("_");
    if (!ary.includes(wsBalance.c)) return;
    const availableAmount = Big(wsBalance.b || 0)
      .minus(wsBalance.f || 0)
      .toFixed();

    if (ary[0] === wsBalance.c) {
      store.balances.updateState({
        currencyQuantity: {
          ...(currencyQuantity || { currency: ary[0] }),
          availableAmount,
        },
      });
    } else {
      store.balances.updateState({
        currencyPrice: {
          ...(currencyPrice || { currency: ary[1] }),
          availableAmount,
        },
      });
    }
  }, [wsBalance]);
   */
  const wsCbOrder = useCallback((data: WsOrderProps) => {
    console.log("wsCbOrder=", data);
    console.log("type=", store.market.type);
    console.log("openOrder=", store.balances.openOrder);
    // getOpenOrder();

    if (data.bt === store.market.type) {
      const openOrder = store.balances.openOrder ? [...store.balances.openOrder] : [];
      if (data.st === TradeOrderStateEnum.NEW || data.st === TradeOrderStateEnum.PLACED) {
        const index = openOrder.findIndex((obj) => obj.orderId === data.i);
        if (index < 0) {
          openOrder.unshift(getOrderObj(data));
        } else {
          openOrder[index] = { ...openOrder[index], ...getOrderObj(data) };
        }
      } else if (data.st === TradeOrderStateEnum.PARTIALLY_FILLED) {
        const index = openOrder.findIndex((obj) => obj.orderId === data.i);
        if (index < 0) {
          openOrder.unshift(getOrderObj(data));
        } else {
          openOrder[index] = { ...openOrder[index], ...getOrderObj(data) };
        }
        // const doc = openOrder.find((obj) => obj.orderId === data.i);
        // if (doc) {
        //   doc.tradeBase = data.eq;
        // } else {
        //   openOrder.unshift(getOrderObj(data));
        // }
      } else {
        const index = openOrder.findIndex((obj) => obj.orderId === data.i);
        if (index >= 0) {
          openOrder.splice(index, 1);
        }
      }

      console.log("openOrder todo", openOrder);
      store.balances.updateState({ openOrder });
    }

    store.balances.updateState({ wsOrder: data });

    function getOrderObj(data): OpenOrderProps {
      return {
        symbol: data.s,
        orderId: data.i, //订单号
        time: data.ct,
        updatedTime: data.t,
        type: data.tp, //交易类型
        side: data.sd, //交易方向
        price: data.p,
        origQty: data.oq, //原始数量
        origQuoteQty: data.oqq, //原始金额
        tradeBase: data.eq, //成交数量
      };
    }
  }, []);

  useEffect(() => {
    store.balances.updateState({
      currencyQuantity: undefined,
      currencyPrice: undefined,
      currentLeverBalance: undefined,
      // leverAccountOverview: undefined,
    });
  }, [name, type]);
  useEffect(() => {
    if (!isLogin) return;
    if (!isLever) {
      apiReqBalanceSpot();
    } else {
      getCurrentLeverBalance();
      // apiReqCurrentLeverBalance();
      // apiReqBalanceLever();
      // apiReqLeverMarketConfig();
      // apiReqLeverAccountOverview();
      // !leverWsUserKey && getTokenUserKey();
    }

    return () => {
      if (isLever) {
        // apiReqCurrentLeverBalanceClear();
        // apiReqLeverMarketConfigClear();
        // apiReqLeverAccountOverviewClear();
      }
    };
  }, [isLogin, name, isLever]);
  useEffect(() => {
    if (!isLogin) return;
    const wsMsg_balance = { topic: "balance", event: "balance" };
    const wsMsg_order = { topic: "order", event: "order" };
    SocketPrivate.addChannel(wsMsg_balance, wsCbBalance);
    SocketPrivate.addChannel(wsMsg_order, wsCbOrder);

    return () => {
      SocketPrivate.removeChannel(wsMsg_balance);
      SocketPrivate.removeChannel(wsMsg_order);
      store.balances.updateState({ wsOrder: undefined });
      store.balances.updateState({ wsBalance: undefined });
    };
  }, [isLogin]);
  useEffect(() => {
    if (!isLogin || !isLever) return;
    const wsMsg_lever = { topic: "lever", event: "lever_balance" };
    SocketPrivate.addChannel(wsMsg_lever, (data: WsBalanceProps) => {
      if (!store.market.isLever || store.market.name !== data.s) return;
      if (!store.balances.currentLeverBalance) return store.balances.getCurrentLeverBalance();

      const isPrice = data.s.split("_")[1] === data.c;
      const availableAmount = Big(data.b || 0)
        .minus(data.f || 0)
        .toFixed();

      const currentLeverBalance = { ...store.balances.currentLeverBalance };
      currentLeverBalance[isPrice ? "quote" : "base"].totalAmount = data.b;
      currentLeverBalance[isPrice ? "quote" : "base"].availableAmount = availableAmount;
      currentLeverBalance[isPrice ? "quote" : "base"].frozenAmount = data.f;
      data.i && (currentLeverBalance[isPrice ? "quote" : "base"].interestAmount = data.i);
      data.p && (currentLeverBalance[isPrice ? "quote" : "base"].capitalAmount = data.p);
      data.l && (currentLeverBalance[isPrice ? "quote" : "base"].loanAmount = data.l);

      store.balances.updateState({ currentLeverBalance });
    });

    return () => {
      SocketPrivate.removeChannel(wsMsg_lever);
    };
  }, [isLogin, isLever]);
  /*
  useEffect(() => {
    if (!isLogin || !leverWsUserKey) return;
    if (!isLever) return SocketLever.close();

    const msg = { channel: `liquidationRate`, marketName: name };
    SocketLever.addChannel(msg, (leverWsLiquidationRate) => {
      store.trade.updateState({ leverWsLiquidationRate });
    });

    return () => {
      SocketLever.removeChannel(msg);
      store.trade.updateState({ leverWsLiquidationRate: undefined });
    };
  }, [isLogin, leverWsUserKey, isLever, name]);
   */
  useEffect(() => {
    if (!isLogin) return;
    getOpenOrder();

    return () => {
      store.balances.updateState({ openOrder: undefined });
    };
  }, [isLogin, type]);

  useEffect(() => {
    if (!isLogin || !currentNftCoin) return;
    getNftPosition();

    return () => {
      store.balances.updateState({ nftPosition: undefined });
    };
  }, [isLogin, currentNftCoin]);
};

export default useUserLogin;
