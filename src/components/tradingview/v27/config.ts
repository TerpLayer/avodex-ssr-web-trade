import moment from "moment";

const Color = {
  primary: "#EE1472",
  transparent: "transparent",
  green: "#2E9B74",
  red: "#C35A5A",
};
const Theme = {
  light: {
    name: "Light",
    bgColor: "#FFFFFF",
    lineColor: "rgba(0, 0, 0, 0.03)",
    textColor: "rgba(0, 0, 0, 0.4)",
    lineColor_area: "rgba(51, 51, 51, 1)",
    lineColor_area_03: "rgba(51, 51, 51, 0.3)",
  },
  dark: {
    name: "Dark",
    bgColor: "#131715",
    lineColor: "rgba(255, 255, 255, 0.03)",
    textColor: "rgba(255, 255, 255, 0.4)",
    lineColor_area: "rgba(234, 236, 239, 1)",
    lineColor_area_03: "rgba(234, 236, 239, 0.3)",
  },
};

export const getTimezone = () => {
  const utcOffset = moment().utcOffset();
  const utcHour = Math.round(utcOffset / 60);
  const obj = {
    "-10": "Pacific/Honolulu",
    "-8": "America/Juneau",
    "-7": "America/Los_Angeles",
    "-6": "America/El_Salvador",
    "-5": "America/Chicago",
    "-4": "America/New_York",
    "-3": "America/Sao_Paulo",
    0: "Etc/UTC",
    1: "Africa/Lagos",
    2: "Africa/Cairo",
    3: "Asia/Jerusalem",
    4: "Asia/Dubai",
    "4:30": "Asia/Tehran",
    5: "Asia/Ashkhabad",
    "5:30": "Asia/Kolkata",
    "5:45": "Asia/Kathmandu",
    6: "Asia/Almaty",
    7: "Asia/Bangkok",
    8: "Asia/Hong_Kong",
    9: "Asia/Tokyo",
    "9:30": "Australia/Adelaide",
    10: "Australia/Brisbane",
    11: "Pacific/Norfolk",
    12: "Pacific/Auckland",
    13: "Pacific/Fakaofo",
  };

  const timezone = obj[utcHour + ""] || "Etc/UTC";
  // console.log("timezone =", timezone);
  return timezone;
};

interface Props {
  theme: string; //"dark" | "light"
  isColorReverse?: boolean;
}

const config = (arg: Props) => {
  const { theme, isColorReverse } = arg;
  const themeObj = Theme[theme];

  return {
    library_path: "/charting_library27/",
    custom_css_url: "/charting_library27/chart-sytle-ssr.css",
    timezone: getTimezone(),
    autosize: true,
    theme: themeObj.name,
    toolbar_bg: themeObj.bgColor, // 外围背景颜色
    volumePaneSize: "small", //指标区域大小（large, medium, small, tiny）
    loading_screen: {
      //定制加载进度条
      backgroundColor: themeObj.bgColor,
      foregroundColor: Color.primary,
    },
    overrides: {
      // "paneProperties.legendProperties.showLegend": false, //关闭 MA 展开
      "mainSeriesProperties.candleStyle.upColor": isColorReverse ? Color.red : Color.green, // k线图的柱形颜色 涨
      "mainSeriesProperties.candleStyle.downColor": isColorReverse ? Color.green : Color.red, // k线图的柱形颜色 跌
      "mainSeriesProperties.candleStyle.drawWick": true,
      "mainSeriesProperties.candleStyle.drawBorder": false,
      "mainSeriesProperties.candleStyle.borderUpColor": isColorReverse ? Color.red : Color.green, // hover的字体颜色变化
      "mainSeriesProperties.candleStyle.borderDownColor": isColorReverse ? Color.green : Color.red,
      "mainSeriesProperties.candleStyle.wickUpColor": isColorReverse ? Color.red : Color.green,
      "mainSeriesProperties.candleStyle.wickDownColor": isColorReverse ? Color.green : Color.red,
      "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
      "scalesProperties.showStudyLastValue": false,
      //
      "paneProperties.background": themeObj.bgColor, //中间背景颜色
      "scalesProperties.lineColor": themeObj.lineColor, //网格外的边框颜色
      "scalesProperties.textColor": themeObj.textColor, //字体颜色
      "paneProperties.backgroundGradientStartColor": themeObj.bgColor, //背景渐变开始
      "paneProperties.backgroundGradientEndColor": themeObj.bgColor, //背景渐变结束
      "paneProperties.vertGridProperties.color": themeObj.lineColor, // 网格竖线
      "paneProperties.horzGridProperties.color": themeObj.lineColor, // 网格竖线
      "paneProperties.separatorColor": themeObj.lineColor, //分割线颜色
      //面积图
      "mainSeriesProperties.areaStyle.linewidth": 1,
      "mainSeriesProperties.areaStyle.linecolor": themeObj.lineColor_area,
      "mainSeriesProperties.areaStyle.color1": themeObj.lineColor_area_03,
      "mainSeriesProperties.areaStyle.color2": Color.transparent,
    },
    studies_overrides: {
      // 成交量柱颜色与 K 线涨跌色一致（color.0 跌 / color.1 涨）
      "volume.volume.color.0": isColorReverse ? Color.green : Color.red,
      "volume.volume.color.1": isColorReverse ? Color.red : Color.green,
    },
    time_frames: [],
    disabled_features: [
      // "widget_logo", //tradingview logo
      "header_widget", //隐藏头部的组件dom
      // "timeframes_toolbar", //底部时间栏
      "volume_force_overlay", //在主数据列的同一窗格上放置成交量指示器  防止他们重叠
      "use_localstorage_for_settings", //不加会出现黑线
      "display_market_status", //关闭开市状态
      "popup_hints", //提示信息
      "legend_inplace_edit",
    ],
    enabled_features: [
      "create_volume_indicator_by_default",
      "adaptive_logo", //小屏幕上隐藏 'charts byTradingView' 文本
      "dont_show_boolean_study_arguments", //是否隐藏指标参数
      "move_logo_to_main_pane", //logo在中间位置
      // "disable_resolution_rebuild", //显示的时间与得到的数据时间一致
      "hide_last_na_study_output", //隐藏最后一次指标输出,隐藏指标后面的 n/a
      "same_data_requery", //允许您使用相同的商品调用 setSymbol 来刷新数据
      "hide_left_toolbar_by_default", //第一次打开图表时隐藏左工具栏
    ],
  };
};

export default config;
