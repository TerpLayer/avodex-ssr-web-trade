import { useCallback, useEffect } from "react";
// import { observer } from "mobx-react-lite";
import store from "store";
import SocketPrivate from "utils/socket/private";

import { EntrustOrderProps, EntrustOrderStateEnum, WsEntrustOrderProps } from "store/entrustOrder";

const useEntrustOrder = () => {
  const { isLever } = store.market;
  const { isLogin, token } = store.user;
  const { getOpenEntrustOrder } = store.entrustOrder;

  useEffect(() => {
    if (!isLogin) return;
    getOpenEntrustOrder();

    return () => {
      store.entrustOrder.updateState({ openEntrustOrder: undefined });
    };
  }, [isLogin, isLever]);

  //ws
  const wsCbCurOrder = useCallback((data: WsEntrustOrderProps) => {
    console.log("ws entrust_order:", data);

    if (data.bt === store.market.type) {
      const openEntrustOrder = store.entrustOrder.openEntrustOrder ? [...store.entrustOrder.openEntrustOrder] : [];
      const index = openEntrustOrder.findIndex((obj) => obj.id === data.i);

      if (data.st === EntrustOrderStateEnum.NEW) {
        if (index < 0) {
          openEntrustOrder.unshift(getOrderObj(data));
        } else {
          openEntrustOrder[index] = { ...openEntrustOrder[index], ...getOrderObj(data) };
        }
      } else {
        if (index >= 0) openEntrustOrder.splice(index, 1);
      }

      console.log("openEntrustOrder todo", openEntrustOrder);
      store.entrustOrder.updateState({ openEntrustOrder });
    }

    store.entrustOrder.updateState({ wsEntrustOrder: data });

    function getOrderObj(data: WsEntrustOrderProps): EntrustOrderProps {
      const obj: EntrustOrderProps = {
        id: data.i, //订单ID
        symbol: data.s,
        side: data.sd, //订单方向[1=买(BUY);2=卖(SELL)]
        type: data.tp, //订单类型[3=止盈止损;4=跟踪委托]
        bizType: data.bt, //业务类型
        price: data.p || "", //委托价格，止盈止损使用
        quantity: data.qt, //数量
        quoteQty: data.qty, //金额，跟踪委托买入时输入
        triggerPrice: data.tgp || "", //触发价格
        createdTime: data.ct, //创建时间
        updatedTime: data.t, //创建时间
        state: data.st, //订单状态
      };
      data.acp && (obj.activePrice = data.acp);
      data.ast && (obj.activeState = data.ast);
      data.tr && (obj.turnRate = data.tr);
      data.pd && (obj.priceDiff = data.pd);
      data.cp && (obj.currentPrice = data.cp);

      return obj;
    }
  }, []);
  useEffect(() => {
    if (!isLogin) return;

    const wsMsg_order = { topic: "order", event: "entrust_order" };

    SocketPrivate.addChannel(wsMsg_order, wsCbCurOrder);

    return () => {
      SocketPrivate.removeChannel(wsMsg_order);
      store.entrustOrder.updateState({ wsEntrustOrder: undefined });
    };
  }, [isLogin]);
};

export default useEntrustOrder;
