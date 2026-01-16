import { makeAutoObservable, observable } from "mobx";
import { get_symbolStar, get_tradeDeductionFee } from "api/v4/account";
// import { get_tokenUserKey } from "api/old/exapi/lever";
import { get_userVipDetail } from "@/api/v4/vip";

// export interface SymbolStarProps {
//   id: number;
//   symbol: string;
// }

export interface UserInfoProps {
  userAccountLevel?: number; //1=主账户，2=子账户
  headImgUrl?: string;
  nickName?: string;
  userIdStr?: string;
  recommendCode?: string;
}

export interface UserVipInfoProps {
  vipLevel: number;
  vipLevelName: string;
  spotTakerFeeRate: number; //0.05
  spotMakerFeeRate: number; //0.05
}

export interface TradeDeductionFeeProps {
  deductEnable: boolean; //是否开启
  discountRate: string; //"0.25"
}

interface StateProps {
  isLogin: boolean;
  token: string;
  userInfo: null | UserInfoProps;
  userVipInfo: WithUndefined<UserVipInfoProps>;
  symbolStar: string[];
  tradeDeductionFee: WithUndefined<TradeDeductionFeeProps>;
  // leverWsUserKey: string;
}

let loading_getUserVipInfo = false;
let loading_getTradeDeductionFee = false;

const user = makeAutoObservable(
  {
    isLogin: false as StateProps["isLogin"], //用户是否登录
    token: "" as StateProps["token"], //用户token
    userInfo: null as StateProps["userInfo"], //用户信息
    userVipInfo: undefined as StateProps["userVipInfo"], //用户vip费率信息
    symbolStar: [] as StateProps["symbolStar"], //用户自选的市场
    tradeDeductionFee: undefined as StateProps["tradeDeductionFee"], //用户交易手续费抵扣配置
    // leverWsUserKey: "" as StateProps["leverWsUserKey"], //杠杆ws订阅userKey

    get isSubAcc(): boolean {
      return !!(this.userInfo && this.userInfo.userAccountLevel === 2);
    }, //是否是子账户

    updateState(payload: Partial<StateProps>) {
      for (let va in payload) {
        this[va] = payload[va];
      }
    },

    getUserVipInfo() {
      if (loading_getUserVipInfo) return;
      loading_getUserVipInfo = true;

      get_userVipDetail()
        .then((data) => (this.userVipInfo = data))
        .finally(() => {
          loading_getUserVipInfo = false;
        });
    },
    getSymbolStar() {
      get_symbolStar().then((ary) => (this.symbolStar = ary));
    },
    getTradeDeductionFee() {
      // if (loading_getTradeDeductionFee) return;
      // loading_getTradeDeductionFee = true;
      // get_tradeDeductionFee()
      //   .then((data) => (this.tradeDeductionFee = data))
      //   .finally(() => {
      //     loading_getTradeDeductionFee = false;
      //   });
    },
    // getTokenUserKey() {
    //   get_tokenUserKey().then((data) => (this.leverWsUserKey = data));
    // },
  },
  {},
  {
    autoBind: true,
    deep: false,
  }
);

export default user;
