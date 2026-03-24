import React, { HTMLAttributes, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import Highcharts from "highcharts/highstock";
import { Context, Hooks, Util } from "@az/base";
const { AzContext } = Context;
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";

import useCoinMemo from "components/pages/trade/_hook/useCoinMemo";
import indentFormat from "@/hooks/indentFormat";

import styles from "./index.module.scss";

const Color = {
  primary: "#EE1472",
  transparent: "transparent",
  green: "#17c186",
  red: "#fd5760",
};
const Theme = {
  light: {
    bgColor: "#fff",
    lineColor: "rgba(0, 0, 0, 0.4)",
  },
  dark: {
    bgColor: "#0C1418",
    lineColor: "rgba(255, 255, 255, 0.4)",
  },
};

import { OptionDepthProps } from "../../index";
import { filterBigNumThousands } from "@/utils/method";
interface Props extends HTMLAttributes<HTMLDivElement> {
  option: OptionDepthProps;
}

const Main: React.FC<Props> = ({ option }) => {
  const t = useTranslation();
  const [appState] = React.useContext(AzContext);
  // const { name, currentConfig } = store.market;
  const { isColorReverse, isNumberIndent } = store.app;
  const { tradeRecent, depthAsks, depthBids } = store.trade;

  const { coinPricePrecisionMarket } = useCoinMemo();

  const [depthChart, setDepthChart] = useState<any>();

  const limitPrice = useMemo(() => {
    //最新成交价
    const price = +Big((tradeRecent ? tradeRecent.p : 0) || 0).toFixed(coinPricePrecisionMarket);

    const dist = Big(price).times(option.scope);
    const distHalf = dist.div(2);

    const bid = +Big(price).minus(dist).toFixed(coinPricePrecisionMarket);
    const ask = +Big(price).plus(dist).toFixed(coinPricePrecisionMarket);

    const tickPositions = [
      bid,
      +Big(price).minus(distHalf).toFixed(coinPricePrecisionMarket),
      price,
      +Big(price).plus(distHalf).toFixed(coinPricePrecisionMarket),
      ask,
    ];

    return {
      bid,
      ask,
      price,
      tickPositions,
    };
  }, [option, tradeRecent, coinPricePrecisionMarket]);
  const asks = useMemo(() => {
    if (!depthAsks || !depthAsks.length || !limitPrice.ask) return [];

    const ary: any = [];
    const len = depthAsks.length;
    for (let i = len - 1; i >= 0; i--) {
      if (+depthAsks[i][0] < limitPrice.ask) {
        ary.push([+depthAsks[i][0], +depthAsks[i][2].totalAmount]);
      } else if (+depthAsks[i][0] > limitPrice.ask) {
        if (i === len - 1) {
          ary.push([limitPrice.ask, 0]);
        } else {
          ary.push([limitPrice.ask, +depthAsks[i + 1][2].totalAmount]);
        }
        return ary;
      } else {
        ary.push([+depthAsks[i][0], +depthAsks[i][2].totalAmount]);
        return ary;
      }
    }

    ary.push([limitPrice.ask, +depthAsks[0][2].totalAmount]);
    return ary;
  }, [limitPrice, depthAsks]);
  const bids = useMemo(() => {
    if (!depthBids || !depthBids.length || !limitPrice.bid) return [];

    const ary: any = [];
    const len = depthBids.length;
    for (let i = 0; i < len; i++) {
      if (+depthBids[i][0] > limitPrice.bid) {
        ary.unshift([+depthBids[i][0], +depthBids[i][2].totalAmount]);
      } else if (+depthBids[i][0] < limitPrice.bid) {
        if (i === 0) {
          ary.unshift([limitPrice.bid, 0]);
        } else {
          ary.unshift([limitPrice.bid, +depthBids[i - 1][2].totalAmount]);
        }
        return ary;
      } else {
        ary.unshift([+depthBids[i][0], +depthBids[i][2].totalAmount]);
        return ary;
      }
    }

    ary.unshift([limitPrice.bid, +depthBids[len - 1][2].totalAmount]);
    return ary;
  }, [limitPrice, depthBids]);
  const series = useMemo(() => {
    return [
      {
        name: t("trade.total"),
        data: asks,
        fillOpacity: 0.1,
        color: isColorReverse ? Color.green : Color.red,
      },
      {
        name: t("trade.total"),
        data: bids,
        fillOpacity: 0.1,
        color: isColorReverse ? Color.red : Color.green,
      },
    ];
  }, [isColorReverse, asks, bids, coinPricePrecisionMarket]);

  const xAxis = useMemo(() => {
    const themeObj = Theme[appState.theme];
    return {
      lineColor: themeObj.lineColor, //轴线颜色
      title: "",
      tickLength: 5, //坐标轴刻度线的长度
      tickColor: themeObj.lineColor, //刻度线的颜色
      crosshair: {
        color: themeObj.lineColor, //颜色
        dashStyle: "Dash", //线条样式
      }, //十字准星线
      plotLines: [
        {
          color: themeObj.lineColor,
          dashStyle: "dash",
          value: limitPrice.price,
          width: 1,
        },
      ],
      min: limitPrice.bid,
      max: limitPrice.ask,
      tickPositions: limitPrice.tickPositions,
      labels: {
        formatter: function () {
          const self: any = this; // eslint-disable-line
          console.log("formatter", self.value);
          return indentFormat(Big(self.value).toFixedCy(coinPricePrecisionMarket));
        },
        style: {
          color: themeObj.lineColor,
          fontWeight: "700",
        },
      }, //轴标签
    };
  }, [appState, limitPrice, coinPricePrecisionMarket, isNumberIndent]);
  const yAxis = useMemo(() => {
    const themeObj = Theme[appState.theme];
    return [
      {
        gridLineWidth: 0, //网格线线条宽度
        title: "",
        tickLength: 0, //坐标轴刻度线的长度
        labels: {
          align: "left", //对齐方式
          x: 0, //水平偏移
          enabled: false, //是否显示
        }, //轴标签
      },
      {
        opposite: true, //对面显示
        linkedTo: 0, //关联
        lineColor: themeObj.lineColor, //轴线颜色
        lineWidth: 1, //轴线宽度
        gridLineWidth: 0, //网格线线条宽度
        title: "",
        tickWidth: 1, //坐标轴刻度线的宽度
        tickLength: 5, //刻度线长度
        tickColor: themeObj.lineColor, //刻度线颜色
        labels: {
          // formatter: function () {
          //   const self: any = this; // eslint-disable-line
          //   console.log("yAxis formatter", self.value);
          //   return indentFormat(filterBigNumThousands(self.value));
          // },
          style: {
            color: themeObj.lineColor,
            fontWeight: "700",
          },
        },
      },
    ];
  }, [appState, isNumberIndent]);

  //DepthChart init
  useEffect(() => {
    const themeObj = Theme[appState.theme];
    const options = {
      chart: {
        type: "areaspline",
        animation: false,
        zoomType: "xy",
        backgroundColor: themeObj.bgColor,
      }, //图表配置
      credits: false, //版权信息
      exporting: false, //导出
      legend: false, //图例
      title: "", //图表标题
      tooltip: {
        headerFormat: `${t("trade.price")}: {point.key}<br/>`, //标题格式
        pointFormat: `${t("trade.total")}: {point.y}`,
        valueDecimals: 2, //保留小数位数
        formatter: function () {
          const self: any = this; // eslint-disable-line
          console.log("tooltip formatter", self);

          return (
            `${t("trade.price")}: ${indentFormat(Big(self.x).toFixedCy(store.market.currentConfig.pricePrecision))}` +
            "<br/>" +
            `${t("trade.total")}: ${indentFormat(filterBigNumThousands(self.y, store.market.currentConfig.quantityPrecision))}`
          );
        },
      }, //数据提示框
      series: series, //图表的数据列
      xAxis: xAxis,
      yAxis: yAxis,
    };
    const depthChart = (Highcharts as any).chart("depth-chart", options);
    setDepthChart(depthChart);
  }, []);

  useEffect(() => {
    if (!depthChart) return;
    const themeObj = Theme[appState.theme];
    depthChart.update({
      chart: {
        backgroundColor: themeObj.bgColor,
      },
      series,
      xAxis,
      yAxis,
    });
  }, [series, xAxis, yAxis, appState]);

  return (
    <div className={styles.main}>
      <div id="depth-chart"></div>
    </div>
  );
};

export default observer(Main);
