import { makeAutoObservable, observable } from "mobx";
import { get_entrustOrderOpen } from "api/v4/order";
import { TradeSideEnum, TradeTypeEnum, TradeOrderStateEnum } from "store/trade";
import { TypeEnum } from "store/market";
import StoreMarket from "@/store/market";

export enum EntrustOrderStateEnum { //订单状态
  NEW = "NEW", //新建
  TRIGGERED = "TRIGGERED", //已触发
  EXPIRED = "EXPIRED", //已过期
  CANCELED = "CANCELED", //已撤销
}

export enum EntrustOrderActiveStateEnum { //跟踪委托激活状态
  INACTIVE = "INACTIVE", //未激活
  ACTIVE = "ACTIVE", //已激活
}

export interface EntrustOrderProps {
  id: string; //订单ID
  symbol: string;
  side: TradeSideEnum; //订单方向[1=买(BUY);2=卖(SELL)]
  type: TradeTypeEnum; //订单类型[3=止盈止损;4=跟踪委托]
  bizType: TypeEnum; //业务类型
  price: string; //委托价格，止盈止损使用
  quantity: string; //数量
  quoteQty: string; //金额，跟踪委托买入时输入
  triggerPrice: string; //触发价格
  currentPrice?: string; //当前价格
  createdTime: number; //创建时间
  updatedTime: number; //创建时间
  state: EntrustOrderStateEnum; //订单状态
  activePrice?: string; //激活价格,跟踪委托时使用,非必填
  activeState?: EntrustOrderActiveStateEnum; //跟踪委托激活状态
  turnRate?: string; //回调幅度，跟踪委托使用
  priceDiff?: string; //价距，跟踪委托使用
}

export interface OpenEntrustOrderProps extends EntrustOrderProps {}

export interface HistoryEntrustOrderProps extends EntrustOrderProps {}

export interface WsEntrustOrderProps {
  bt: TypeEnum; //市场 SPOT/LEVER
  ct: number; // createTime 下单时间
  i: string; // orderId 订单号
  s: string; // symbol 交易对
  sd: TradeSideEnum; // side 方向 BUY/SELL
  st: EntrustOrderStateEnum; //订单状态
  t: number; // time 发⽣时间
  tp: TradeTypeEnum; //type 类型 LIMIT/MARKET
  qt: string; //数量/quantity
  qty: string; //金额/quoteQty，跟踪委托买入时输入
  //
  tgp?: string; //触发价格,triggerPrice,止盈止损使用
  p?: string; //委托价格price,止盈止损使用
  ast?: EntrustOrderActiveStateEnum; //跟踪委托激活状态
  acp?: string; //激活价格activePrice,跟踪委托使用
  tr?: string; //回调幅度turnRate,跟踪委托使用
  pd?: string; //priceDiff价距,跟踪委托使用
  ep?: string; //extremePrice跟踪委托使用,下单以来的最高或最低价格,买入时记录最低价，卖出时记录最高价
  cp?: string; //currentPrice
}

interface StateProps {
  openEntrustOrder: WithUndefined<OpenEntrustOrderProps[] | null>;
  wsEntrustOrder: WithUndefined<WsEntrustOrderProps>;
}

let CancelFun_getOpenEntrustOrder;

const entrustOrder = makeAutoObservable(
  {
    openEntrustOrder: undefined as StateProps["openEntrustOrder"], //现货或杠杆，计划委托，当前委托，可能包含其他交易对，null表示没有资产，undefined表示未赋值
    wsEntrustOrder: undefined as StateProps["wsEntrustOrder"], //ws EntrustOrder 推送数据

    updateState(payload: Partial<StateProps>) {
      for (let va in payload) {
        this[va] = payload[va];
      }
    },

    getOpenEntrustOrder(config?) {
      try {
        CancelFun_getOpenEntrustOrder && CancelFun_getOpenEntrustOrder();
      } catch (e) {
        //empty
        CancelFun_getOpenEntrustOrder = null;
      }
      return get_entrustOrderOpen({
        ...(config || {
          params: {
            bizType: StoreMarket.type,
          },
        }),
        cancelFun: (c) => (CancelFun_getOpenEntrustOrder = c),
      })
        .then((data) => {
          this.openEntrustOrder = data;
        })
        .catch(() => {
          this.openEntrustOrder = null;
        })
        .finally(() => {
          CancelFun_getOpenEntrustOrder = null;
        });
    },
  },
  {},
  {
    autoBind: true,
    deep: false,
  }
);

export default entrustOrder;
