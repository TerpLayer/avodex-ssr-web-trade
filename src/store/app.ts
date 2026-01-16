import { makeAutoObservable, observable } from "mobx";
import Storage from "utils/storage";
import { get_time } from "api/v4/market";

export enum ThemeEnum {
  light = "light", //浅色主题
  dark = "dark", //深色主题
}

export enum ColorStyleEnum {
  normal = 0, //默认，绿涨红跌
  reverse = 1, //相反，红涨绿跌
}

export enum NumberFormatEnum {
  normal = 0, //默认，标准格式
  indent = 1, //缩进格式
}

export enum LayoutEnum {
  classic = "classic", //标准版
  advanced = "advanced", //专业版
  fullscreen = "fullscreen", //全屏版
}

export enum BreakpointEnum {
  xl = "xl", //超大屏幕，以 1698px 做设计，≥ 1698px
  lg = "lg", //正常屏幕，以 1400px 做设计， 1200px < normal < 1698px
  md = "md", //稍小屏幕，以 1020px 做设计， 768px < md ≤ 1200px
  sm = "sm", //移动端屏幕，以 375px 做设计，≤ 768px
}

export enum ClsUpDownEnum {
  up = "up-color", //上涨样式
  down = "down-color", //下跌样式
}
interface StateProps {
  clientSideReady: boolean;
  theme: ThemeEnum;
  colorStyle: ColorStyleEnum;
  numberFormat: NumberFormatEnum;
  breakpoint: BreakpointEnum;
  windowInnerWidth: WithUndefined<number>;
  layout: LayoutEnum;
  time: { server: number; local: number };
  networkOnlineTs: number;
  rtl: boolean;
}

const app = makeAutoObservable(
  {
    clientSideReady: false as StateProps["clientSideReady"], //客户端是否就绪
    theme: ThemeEnum.light as StateProps["theme"], //当前主题，默认浅色主题
    colorStyle: ColorStyleEnum.normal as StateProps["colorStyle"], //颜色样式，默认绿涨红跌
    numberFormat: NumberFormatEnum.normal as StateProps["numberFormat"], //数值展示格式，默认标准格式
    breakpoint: BreakpointEnum.lg as StateProps["breakpoint"], //屏幕尺寸断点
    windowInnerWidth: undefined as StateProps["windowInnerWidth"], //屏幕当前内部宽度
    layout: LayoutEnum.advanced as StateProps["layout"], //当前交易视图，标准版=classic，专业版=advanced，全屏版=fullscreen
    time: {
      server: 0, //获取的服务器时间
      local: 0, //获取到服务端时间时，本地的时间戳
    } as StateProps["time"],
    networkOnlineTs: 0 as StateProps["networkOnlineTs"], //网络发生重连的时间戳
    rtl: false as StateProps["rtl"], //是否是从右向左布局

    get isDark(): boolean {
      return this.theme === ThemeEnum.dark;
    }, //是否是深色主题
    get isColorReverse(): boolean {
      return this.colorStyle == ColorStyleEnum.reverse;
    }, //颜色样式是否相反，红涨绿跌
    get isNumberIndent(): boolean {
      return this.numberFormat == NumberFormatEnum.indent;
    }, //数值是否是缩进展示
    get isH5(): boolean {
      return this.breakpoint === BreakpointEnum.sm;
    }, //是否是H5布局

    updateState(payload: Partial<StateProps>) {
      for (const va in payload) {
        this[va] = payload[va];
      }
    },
    //
    initLayout() {
      this.layout = (() => {
        const layout = Storage.get("layout");
        if (layout && LayoutEnum[layout]) return layout;
        return LayoutEnum.advanced;
      })();
    },
    getServerTime() {
      get_time().then(({ serverTime }) => {
        this.updateState({
          time: {
            server: serverTime as any,
            local: Date.now(),
          },
        });
      });
    },
    setNumberFormat(val: NumberFormatEnum = NumberFormatEnum.indent) {
      this.numberFormat = val;
      Storage.set("numberFormat", val);
    },
  },
  {},
  {
    autoBind: true,
    deep: false,
  }
);

export default app;
