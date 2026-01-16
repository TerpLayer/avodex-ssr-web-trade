import { makeAutoObservable, observable } from "mobx";
import Storage from "utils/storage";
import { get_currencies, get_currencyInfoOne, get_priceCurrencyConvert } from "api/v4/balance";

export interface CurrencyProps extends ObjAny {
  id: number; //币种id
  currency: string; //币种名称 btcsn
  displayName: string; //币种显示名称 BTCsn
  fullName: string; //币种全称
  logo?: string; //币种logo
  cmcLink?: string; //cmc链接
  weight: number; //权重
  maxPrecision: number; //精度
  depositStatus: 0 | 1; //充值状态(0关闭 1开放)
  withdrawStatus: 0 | 1; //提现状态(0关闭 1开放)
  convertEnabled: 0 | 1; //小额资产兑换开关[0=关;1=开]
  transferEnabled: 0 | 1; //划转开关[0=关;1=开]
  type: "FT" | "NFT"; //
  isListing: 0 | 1; //是否上架[0=否;1是]
}

interface CurrencyInfoProps extends ObjAny {
  currency: string; //币种名称
  fullName: string; //币种全名
  publishTime: number;
  tokenSummary: string | null;
}

interface PriceCurrencyConvertProps extends ObjAny {
  btc: string;
  usd?: string;
  cny?: string;
  inr?: string;
  idr?: string;
}

interface StateProps {
  currencies: WithUndefined<CurrencyProps[]>;
  currencyInfo: WithUndefined<CurrencyInfoProps | null>;
  priceCurrencyConvert: WithUndefined<ObjT<PriceCurrencyConvertProps>>;
}

let TimeoutFun;
let CancelFun_getCurrencyInfoOne;
let CancelFun_getPriceCurrencyConvert;
let TimeoutFun_loopGetCurrencies, CancelFun_loopGetCurrencies;

const currency = makeAutoObservable(
  {
    currencies: undefined as StateProps["currencies"], //所有币种配置信息，数组
    currencyInfo: undefined as StateProps["currencyInfo"], //当前币种信息介绍，null表示没有数据，undefined表示未赋值
    priceCurrencyConvert: undefined as StateProps["priceCurrencyConvert"], //价格币种换算，初始化后每隔30秒会轮询一次
    // 价格页面所有币种列表展示

    get currencyObj(): WithUndefined<ObjT<CurrencyProps>> {
      if (!this.currencies) return;
      const doc: ObjT<CurrencyProps> = {};
      this.currencies.map((obj: any) => (doc[obj.currency] = obj));
      return doc;
    }, //所有币种配置信息，对象

    updateState(payload: Partial<StateProps>) {
      for (const va in payload) {
        this[va] = payload[va];
      }
    },
    updateStateOnce(payload: Partial<StateProps>) {
      for (const va in payload) {
        if (!this[va]) this[va] = payload[va];
      }
    },
    //
    getCurrencyDisplayName(currency: string): string {
      if (this.currencyObj && this.currencyObj[currency] && this.currencyObj[currency].displayName) return this.currencyObj[currency].displayName;

      return currency.toUpperCaseCurrency();
    },
    getCurrencies(finallyFun?: () => void) {
      const { version, currencies } = Storage.get("currencies") || {};

      get_currencies({ params: { version } })
        .then((data) => {
          if (data.currencies && data.version !== version) {
            console.log("【getCurrencies update】", data);
            this.currencies = data.currencies;
            Storage.set("currencies", data);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!this.currencies) this.currencies = currencies;
          finallyFun && finallyFun();
        });
    }, //获取所有币种列表
    loopGetCurrencies() {
      clearTimeout(TimeoutFun_loopGetCurrencies);
      try {
        CancelFun_loopGetCurrencies && CancelFun_loopGetCurrencies();
      } catch (e) {
        CancelFun_loopGetCurrencies = null;
      }

      const { version, currencies } = Storage.get("currencies") || {};

      get_currencies({
        params: {
          version,
        },
        cancelFun: (c) => (CancelFun_loopGetCurrencies = c),
      })
        .then((data) => {
          if (data.currencies && data.version !== version) {
            console.log("【getCurrencies update】", data);
            this.currencies = data.currencies;
            Storage.set("currencies", data);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!this.currencies) this.currencies = currencies;
          CancelFun_loopGetCurrencies = null;
          clearTimeout(TimeoutFun_loopGetCurrencies);
          TimeoutFun_loopGetCurrencies = setTimeout(() => {
            this.loopGetCurrencies();
          }, 3e3);
        });
    }, //轮询获取所有币种列表
    getCurrencyInfoOne(currency) {
      this.currencyInfo = undefined;
      try {
        CancelFun_getCurrencyInfoOne && CancelFun_getCurrencyInfoOne();
      } catch (e) {
        CancelFun_getCurrencyInfoOne = null;
      }
      get_currencyInfoOne(currency, {
        cancelFun: (c) => (CancelFun_getCurrencyInfoOne = c),
      })
        .then((data) => {
          this.currencyInfo = data;
        })
        .catch(() => {
          this.currencyInfo = null;
        })
        .finally(() => {
          CancelFun_getCurrencyInfoOne = null;
        });
    },
    loopGetPriceCurrencyConvert(currency: string) {
      clearTimeout(TimeoutFun);
      try {
        CancelFun_getPriceCurrencyConvert && CancelFun_getPriceCurrencyConvert();
      } catch (e) {
        CancelFun_getPriceCurrencyConvert = null;
      }
      // console.log("currency===", currency);
      get_priceCurrencyConvert({
        params: {
          converts: currency === "btc" ? currency : currency + ",btc",
        },
        cancelFun: (c) => (CancelFun_getPriceCurrencyConvert = c),
      })
        .then((data) => {
          this.priceCurrencyConvert = data;
        })
        .catch(() => {})
        .finally(() => {
          CancelFun_getPriceCurrencyConvert = null;
          // console.log("finally currency===", currency);
          clearTimeout(TimeoutFun);
          TimeoutFun = setTimeout(() => {
            // console.log("setTimeout currency===", currency);
            this.loopGetPriceCurrencyConvert(currency);
          }, 3e4);
        });
    },
  },
  {},
  {
    autoBind: true,
    deep: false,
  }
);

export default currency;
