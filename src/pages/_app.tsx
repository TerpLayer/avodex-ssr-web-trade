import "antd/dist/antd.variable.min.css";
import type { AppProps } from "next/app";
import { record } from "@az/acc";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import React from "react";
import "@az/Style/dist/index.css";
import "../styles/index.scss";
import "utils/prototype";

import Storage from "utils/storage";
import { Context, Cookie, Request, Seo, AzLocale, Util } from "@az/base";
import { ConfigProvider, message } from "antd";
import useWindowResize from "hooks/useWindowResize";
import store from "store";
import { BreakpointEnum, ThemeEnum } from "store/app";
import ErrorBoundary from "components/app/ErrorBoundary";
import dynamic from "next/dynamic";
const WalletModal = dynamic(() => import("@az/WalletModal"), { ssr: false });

const { AzContext, AzProvider } = Context;

const Package: any = require("../../package.json"); // eslint-disable-line

interface AzContextState {
  theme?: string;
  currency?: string;
  colorReverse?: number;
}

const Content = ({ theme, children }) => {
  const router = useRouter();
  const [appState, appDispatch] = React.useContext(AzContext);

  React.useEffect(() => {
    const htmlDom = document.querySelector("html");
    htmlDom && htmlDom.setAttribute("translate", "no");
  }, []);

  // 采集 channel 和 ref 并记录本地，用于注册后关联 uid
  React.useEffect(() => {
    const channel = Util.getQuery("channel");
    const inviteCode = Util.getQuery("ref");
    const noop = () => {
      /* do nothing */
    };
    if (channel) {
      Storage.set("channel", channel);
      Request.AzAxios.post("/exapi/app/public/channel-access/", { name: channel, url: location.href }).catch(noop);
    }
    if (inviteCode) {
      Storage.set("inviteCode", inviteCode);
      Request.AzAxios.get("/rfapi/public/invite-code/stats/click", { params: { inviteCode } }).catch(noop);
    }
  }, []);

  React.useEffect(() => {
    const payload: AzContextState = {};
    // const payloadTheme = theme || Cookie.get("theme") || "";
    // if (/^(dark|light)$/.test(payloadTheme)) {
    //   payload.theme = payloadTheme;
    // }
    payload.theme = "dark"; // fixed theme
    const currency = Cookie.get("currency");
    currency && (payload.currency = currency);
    appDispatch({ payload });
    const colorReverse = Cookie.get("colorReverse") || Storage.get("colorReverse");
    payload.colorReverse = +colorReverse || 0;

    //clientCode
    let clientCode = Cookie.get("clientCode");
    if (!clientCode || clientCode.length !== 32) {
      clientCode = Date.now() + generateNonceStr(19);
      Cookie.set("clientCode", clientCode);
    }

    Request.setHeader({ "client-code": clientCode });
    //antd

    message.config({ top: 60 });
    ConfigProvider.config({ theme: { primaryColor: "#EE1472" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const isLogin = appState.loginStatus === 1;
    const token = isLogin ? Cookie.get("token") : "";

    store.app.updateState({
      theme: appState.theme as ThemeEnum,
      colorStyle: appState.colorReverse,
      numberFormat: Storage.get("numberFormat"),
      rtl: !!appState.rtl,
    });
    store.balances.updateState({
      convertCurrency: appState.currency,
    });
    store.user.updateState({
      isLogin,
      token,
      userInfo: appState.userInfo,
    });

    console.log("%c【appState】", "color:#00aecc", appState);
  }, [appState]);

  React.useEffect(() => {
    const handleRouteStart = () => NProgress.start();
    const handleRouteDone = () => NProgress.done();

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.events]);

  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_LOCAL && router.query.token) {
      Cookie.set("token", router.query.token as string);
      router.replace("/trade/" + router.query.symbol);
    }
  }, [router]);

  return children;
};

function App({ Component, pageProps }: AppProps) {
  (reportWebVitals as any).nextRouterInfo = useRouter(); // 用于性能埋点绑定路由
  const { locale = "en", locales = [] } = useRouter();

  AzLocale.init(locale, locales, { [locale === "default" ? "en" : locale]: pageProps.messages });
  const localeObj = AzLocale.getLocaleObj(locale);

  const payload = { lang: localeObj.key };
  // console.log("%c【App props】", "color:#00aecc", pageProps);

  const domain = !process.env.NEXT_PUBLIC_LOCAL ? process.env.NEXT_PUBLIC_cdn + "/public" : "";
  if (process.env.NEXT_PUBLIC_LOCAL) {
    Request.setHeader({ "X-Forwarded-Host": process.env.NEXT_PUBLIC_host });
  }

  useWindowResize(() => {
    let breakpoint;
    const { innerWidth } = window;
    if (innerWidth >= 1698) {
      breakpoint = BreakpointEnum.xl;
    } else if (innerWidth > 1200) {
      breakpoint = BreakpointEnum.lg;
    } else if (innerWidth > 768) {
      breakpoint = BreakpointEnum.md;
    } else {
      breakpoint = BreakpointEnum.sm; //<= 768
    }
    store.app.updateState({ breakpoint, windowInnerWidth: innerWidth });
    document.body.setAttribute("data-breakpoint", breakpoint);
  });

  React.useEffect(() => {
    window.addEventListener("online", () => store.app.updateState({ networkOnlineTs: Date.now() }));
    store.app.updateState({ clientSideReady: true });
    console.log("%c【App client side ready】", "color:#52c41a", store);
  }, []);

  return (
    <AzProvider payload={payload} intlValue={AzLocale.intl}>
      <ConfigProvider direction={["fa"].includes(locale) ? "rtl" : "ltr"} locale={pageProps.antd} autoInsertSpaceInButton={false}>
        <Head>
          {/*<html className="notranslate" translate="no" />*/}
          <meta name="version" content={`${Package.version}`} key="version" />
        </Head>
        <Seo tdk={pageProps.tdk} lang={pageProps.locale} resolvedUrl={pageProps.resolvedUrl} Head={Head} />
        {/* eslint-disable */}
        <Script
          id="app-before-interactive"
          data-theme={pageProps.theme}
          strategy="beforeInteractive"
          src={domain + "/beforeInteractive.js?v=" + Package.version}
        />
        {/* <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-CEXDEMO"></Script> */}
        {/* <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);arguments[0]==="event"&&window.__record__&&window.__record__({t:'ga_event',eventName:arguments[1],[arguments[1]]: arguments[2]||null})};
          gtag('js', new Date());
          gtag('config', 'G-CEXDEMO');
          `,
          }}
        ></Script> */}
        <Script src={domain + "/iconpark.js?v=" + Package.version} />
        {/* eslint-enable */}
        <link rel="stylesheet" type="text/css" href="https://at.alicdn.com/t/font_2502537_ytndssfkiy.css" />
        <WalletModal />
        <Content {...pageProps}>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </Content>
      </ConfigProvider>
    </AzProvider>
  );
}

export default App;

export function reportWebVitals(metric) {
  const { pathname, route, locale } = (reportWebVitals as any).nextRouterInfo || {};
  // record({ t: "webVitals", project: "ssr-web-trade", pathname, route, locale, ...metric }, false);
}

function generateNonceStr(length: number, type?: string) {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  type === "num" && (chars = "0123456789");
  const maxPos = chars.length;
  let noceStr = "";
  for (let i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
}
