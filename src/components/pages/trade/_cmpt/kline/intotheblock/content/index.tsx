import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Context, Hooks } from "@az/base";
const { AzContext } = Context;
const { useTranslation } = Hooks;
import store from "store";

import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  option?: any;
}

const Main: React.FC<Props> = () => {
  const t = useTranslation();
  const [appState] = React.useContext(AzContext);
  const { currencyInfo } = store.currency;
  const { name } = store.market;

  const tokenId = useMemo(() => {
    return store.currency.getCurrencyDisplayName(name.split("_")[0]);
  }, [name]);
  const language = useMemo(() => {
    const obj = {
      "zh-CN": "zh",
      ja: "ja",
      ko: "ko",
      ru: "ru",
    };
    return obj[appState.lang] || "en";
  }, [appState]);
  const itbWidgetInitFn = useCallback(() => {
    if (typeof window === undefined) return;
    const itbWidgetInit = (window as any).itbWidgetInit;
    if (!itbWidgetInit) return;
    itbWidgetInit({
      apiKey: "NVeioyYW8C1S1XSvbeN6e6s2brGnTvAA1GnpwmSL", // Initialize the widget with your api key
      language,
      options: {
        hideCallToAction: false,
        hideNavigator: true,
        tokenId,
        hidePriceSeries: true,
        events: {
          onTokenNotSupported: ({ element }) => {
            element.innerHTML = t("trade.noData");
          },
        },
      },
    });
  }, [language, tokenId]);

  const [jsReady, setJsReady] = useState<boolean>(false);
  useEffect(() => {
    jsReader("https://app.intotheblock.com/widget.js", "intotheblock", () => {
      setJsReady(true);
    });

    function jsReader(url, id, callback) {
      if (!url || typeof url !== "string") {
        callback && callback();
        return;
      }
      if (id && document.getElementById(id)) {
        callback && callback();
        return;
      }

      createScript();

      function createScript() {
        const body = document.body;
        const script = document.createElement("script");
        id && (script.id = id);
        script.type = "text/javascript";
        script.async = true;
        script.src = url;
        body.appendChild(script);

        script.onload = function () {
          callback && callback();
        };
      }
    }
  }, []);

  const hasData = useMemo(() => {
    return !!(currencyInfo && currencyInfo.tokenSummary);
  }, [currencyInfo]);
  const loading = useMemo(() => {
    if (currencyInfo === undefined) return true;
    if (!currencyInfo) return false;
    if (!currencyInfo.tokenSummary) return false;
    if (!jsReady) return true;
    return false;
  }, [currencyInfo, jsReady]);

  useEffect(() => {
    if (!jsReady || loading || !hasData) return;
    itbWidgetInitFn();
  }, [jsReady, loading, hasData, itbWidgetInitFn]);

  return (
    <div className={styles.main}>
      {hasData && (
        <AzScrollBarY>
          <div className={cx(styles.content)}>
            <div
              data-target="itb-widget"
              data-type="daily-active-addresses"
              data-options='{"highcharts": { "chart": {"height": 210}, "colors": ["#3e72b0", "#06a753", "#c6c6c6"]}}'
            ></div>
            <div data-target="itb-widget" data-type="east-vs-west" data-options='{"highcharts": { "chart": {"height": 210}}}'></div>
            <div
              data-target="itb-widget"
              data-type="large-transactions-volume"
              data-options='{"highcharts": { "chart": {"height": 210}, "colors": ["#eebb56"]}}'
            ></div>
            <div data-target="itb-widget" data-type="total-addresses" data-options='{"highcharts": { "chart": {"height": 210}}}'></div>
            <div className="without-highlight-percentage-odd">
              <div data-target="itb-widget" data-type="ownership-by-time-held" data-options='{"highcharts": { "chart": {"height": 255}}}'></div>
            </div>
            <div id="widget-in-and-out-of-the-money-around-price" className="without-highlight-percentage">
              <div
                data-target="itb-widget"
                data-type="in-and-out-of-the-money-around-price"
                data-options='{"rotateChartInMobile": false, "bubbleLimit": 5, "bubbleMaxSize": 50, "chartHeight": 200}'
              ></div>
            </div>
          </div>
        </AzScrollBarY>
      )}
      {!hasData && <AppDivNoData label={t("trade.intotheblockTip")} />}
      {loading && <AzLoading className={styles.loading} />}
    </div>
  );
};

export default observer(Main);
