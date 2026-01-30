import { useCallback, useEffect, useMemo } from "react";
// import { observer } from "mobx-react-lite";
import store from "store";
import SocketPrivate from "utils/socket/private";

import { CopyTradeCurOrderProps, CopyTradeWsOrderProps } from "store/copyTrade";

const useCopyTrade = () => {
  const { isLever } = store.market;
  const { isLogin, token } = store.user;
  const { userStatus, curOrder, getCopyTradeUserStatus, getCurOrder } = store.copyTrade;

  // console.log("userStatus ========== ", userStatus);

  useEffect(() => {
    //获取用户身份
    if (!isLogin) return;
    // getCopyTradeUserStatus();
  }, [isLogin]);
  useEffect(() => {
    //获取当前跟单或带单列表
    if (!userStatus) return;
    getCurOrder();
  }, [userStatus]);

  //ws
  const wsCbCurOrder = useCallback((data: CopyTradeWsOrderProps) => {
    if (!store.copyTrade.curOrder) {
      if (data.w) {
        const curOrder = getCurOrderObj();
        if (curOrder.buySize && curOrder.buyPrice) {
          store.copyTrade.curOrder = [curOrder as CopyTradeCurOrderProps];
        }
      }
      // if (data.w) store.copyTrade.curOrder = [getCurOrderObj()];
      return;
    }

    const index = store.copyTrade.curOrder.findIndex((obj) => obj.orderId == data.i);
    if (data.w) {
      const curOrder = getCurOrderObj();
      if (index < 0) {
        if (curOrder.buySize && curOrder.buyPrice) {
          store.copyTrade.curOrder = [curOrder as CopyTradeCurOrderProps, ...store.copyTrade.curOrder];
        }
        // store.copyTrade.curOrder = [getCurOrderObj(), ...store.copyTrade.curOrder];
      } else {
        const newCurOrder = [...store.copyTrade.curOrder];
        newCurOrder[index] = { ...newCurOrder[index], ...curOrder };
        store.copyTrade.curOrder = newCurOrder;
      }
    } else {
      if (index < 0) {
        //empty
      } else {
        const newCurOrder = [...store.copyTrade.curOrder];
        newCurOrder.splice(index, 1);
        store.copyTrade.curOrder = newCurOrder;
      }
    }

    function getCurOrderObj() {
      const obj: {
        orderId: string; //订单id
        symbol: string; //市场
        buySize?: string | number; //买入数量
        sellSize?: string | number; //卖出数量
        buyPrice?: string | number; //买入价格
        buyTime?: number; //买入时间
        triggerProfitPrice?: string | number; //止盈
        triggerStopPrice?: string | number; //止损
        leaderOrderId?: string; //带单订单id
        leaderNickname?: string; //带单员昵称
        leaderAvatar?: string; //带单员头像链接
      } = {
        orderId: data.i,
        symbol: data.s,
      };
      data.bs && (obj.buySize = data.bs);
      data.ss && (obj.sellSize = data.ss);
      data.bp && (obj.buyPrice = data.bp);
      data.bt && (obj.buyTime = data.bt);
      (data.tp || data.tp === "") && (obj.triggerProfitPrice = data.tp);
      (data.ts || data.ts === "") && (obj.triggerStopPrice = data.ts);
      data.lo && (obj.leaderOrderId = data.lo);
      data.ln && (obj.leaderNickname = data.ln);
      data.la && (obj.leaderAvatar = data.la);

      return obj;

      // return {
      //   orderId: data.i,
      //   symbol: data.s,
      //   buySize: data.bs,
      //   sellSize: data.ss,
      //   buyPrice: data.bp,
      //   triggerProfitPrice: data.tp,
      //   triggerStopPrice: data.ts,
      // };
    }
  }, []);
  useEffect(() => {
    if (!isLogin || isLever || !userStatus) return;

    const event = store.copyTrade.isFollower ? "follower_order" : "leader_order";
    const wsMsg_order = { topic: "order", event };

    SocketPrivate.addChannel(wsMsg_order, wsCbCurOrder);

    return () => {
      SocketPrivate.removeChannel(wsMsg_order);
    };
  }, [isLogin, isLever, userStatus]);
};

export default useCopyTrade;
