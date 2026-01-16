import { makeAutoObservable, observable } from "mobx";
import { get_copyTradeUserStatus } from "api/v4/account";
import { get_copyTradeOrderCurLeaderOrder, get_copyTradeOrderCurFollowerOrder } from "api/v4/order";

export enum CopyTradeUserStatusEnum { //跟单员身份
  FOLLOWER = "FOLLOWER", //跟单员
  LEADER = "LEADER", //带单员
  // NONE = "NONE", //无身份
}

interface CopyTradeOrderObjProps {
  id?: string;
  orderId: string; //订单id
  symbol: string; //市场
  //
  buySize: string | number; //买入数量
  sellSize?: string | number; //卖出数量
  //
  buyPrice: string | number; //买入价格
  sellPrice?: string | number; //卖出价格
  //
  profit?: string | number; //收益
  profitRate?: string | number; //收益率
  //
  triggerProfitPrice?: string | number; //止盈
  triggerStopPrice?: string | number; //止损
  //
  buyTime?: number; //买入时间
  sellTime?: number; //卖出时间
}

export interface CopyTradeCurOrderProps extends CopyTradeOrderObjProps {
  //当前跟单
  leaderOrderId?: string; //带单订单id
  leaderNickname?: string; //带单员昵称
  leaderAvatar?: string; //带单员头像链接
  //当前带单
  followCount?: string | number; //跟单人数
}

export interface CopyTradeWsOrderProps {
  s: string; //symbol 交易对
  i: string; //orderId 订单号
  bs?: string; //buySize 买入数量
  ss?: string; //sellSize 卖出数量
  bp?: string; //buyPrice 买入价格
  bt?: number; //buyTime 买入时间
  tp?: string; //triggerProfitPrice 止盈
  ts?: string; //triggerStopPrice 止损
  lo?: string; //leaderOrderId 带单订单id
  ln?: string; //leaderNickname 带单员昵称
  la?: string; //leaderAvatar 带单员头像链接
  w: boolean; //working，true表示订单更新，false表示订单完结
}

interface StateProps {
  userStatus: null | CopyTradeUserStatusEnum;
  curOrder: WithUndefined<CopyTradeCurOrderProps[] | null>;
}

let CancelFun_getCurOrder;

const copyTrade = makeAutoObservable(
  {
    userStatus: null as StateProps["userStatus"], //用户身份
    curOrder: undefined as StateProps["curOrder"], //用户当前跟单或带单列表，null表示没有，undefined表示未初始化

    get isFollower(): boolean {
      return this.userStatus === CopyTradeUserStatusEnum.FOLLOWER;
    }, //是否是跟单员

    updateState(payload: Partial<StateProps>) {
      for (let va in payload) {
        this[va] = payload[va];
      }
    },

    getCopyTradeUserStatus() {
      // get_copyTradeUserStatus().then((data: any) => {
      //   // if ([CopyTradeUserStatusEnum.FOLLOWER, CopyTradeUserStatusEnum.LEADER].includes(data)) this.userStatus = data;
      //   if (CopyTradeUserStatusEnum.LEADER === data) {
      //     this.userStatus = CopyTradeUserStatusEnum.LEADER;
      //   } else {
      //     this.userStatus = CopyTradeUserStatusEnum.FOLLOWER;
      //   }
      // });
    },

    getCurOrder() {
      try {
        CancelFun_getCurOrder && CancelFun_getCurOrder();
      } catch (e) {
        CancelFun_getCurOrder = null;
      }

      return (this.isFollower ? get_copyTradeOrderCurFollowerOrder : get_copyTradeOrderCurLeaderOrder)({
        params: { type: 1 },
        cancelFun: (c) => (CancelFun_getCurOrder = c),
      })
        .then((data: any) => {
          this.curOrder = data;
        })
        .catch(() => {
          this.curOrder = null;
        })
        .finally(() => {
          CancelFun_getCurOrder = null;
        });
    },
  },
  {},
  {
    autoBind: true,
    deep: false,
  }
);

export default copyTrade;
