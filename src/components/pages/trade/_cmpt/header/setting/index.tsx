import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context, Cookie, Hooks } from "@az/base";
import store from "store";
import { LayoutEnum, ColorStyleEnum, NumberFormatEnum } from "store/app";
import Storage from "utils/storage";

import { PcbItem, PcbPage } from "@az/PriceChangeBenchmark";
import { Drawer, Switch, Radio, Tooltip } from "antd";
import AzSvg from "components/az/svg";
import AppSvgArrowUp from "components/app/svg/arrowUp";
import AppSvgArrowDown from "components/app/svg/arrowDown";

import styles from "./index.module.scss";
import cx from "classnames";

const { useTranslation } = Hooks;
const { AzContext } = Context;

const Main: React.FC = () => {
  const t = useTranslation();
  const [appState, appDispatch] = React.useContext(AzContext);

  const { isColorReverse, isNumberIndent, setNumberFormat, rtl } = store.app;
  const { orderConfirm_limit, orderConfirm_market, orderConfirm_stopLimit, orderConfirm_trailingStop } = store.trade;

  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    appDispatch({ payload: { showSettingDrawer: "" } });
  };

  useEffect(() => {
    if (appState.showSettingDrawer == "spot") {
      setOpen(true);
    }
  }, [appState.showSettingDrawer]);

  const setTheme = (theme) => {
    appDispatch({ payload: { theme } });
    Cookie.set("theme", theme);
  };

  const setLayout = (layout) => {
    store.app.updateState({ layout });
    Storage.set("layout", layout);
    onClose();
  };

  const setColorStyle = useCallback((colorReverse) => {
    appDispatch({ payload: { colorReverse } });
    document.body.setAttribute("data-color-reverse", colorReverse);
    Cookie.set("colorReverse", colorReverse);
    Storage.set("colorReverse", colorReverse);
  }, []);

  const setOrderConfirm_limit = useCallback((orderConfirm_limit) => {
    store.trade.updateState({ orderConfirm_limit });
    Storage.set("orderConfirm_limit", orderConfirm_limit);
  }, []);
  const setOrderConfirm_market = useCallback((orderConfirm_market) => {
    store.trade.updateState({ orderConfirm_market });
    Storage.set("orderConfirm_market", orderConfirm_market);
  }, []);
  const setOrderConfirm_stopLimit = useCallback((orderConfirm_stopLimit) => {
    store.trade.updateState({ orderConfirm_stopLimit });
    Storage.set("orderConfirm_stopLimit", orderConfirm_stopLimit);
  }, []);
  const setOrderConfirm_trailingStop = useCallback((orderConfirm_trailingStop) => {
    store.trade.updateState({ orderConfirm_trailingStop });
    Storage.set("orderConfirm_trailingStop", orderConfirm_trailingStop);
  }, []);

  const [isPcb, setIsPcb] = useState(false);
  const handleAfterOpenChange = useCallback((open) => {
    if (!open) {
      setIsPcb(false);
    }
    if (rtl && !open) {
      document.body.style.float = "";
    }
  }, []);

  useEffect(() => {
    if (rtl && open) {
      document.body.style.float = "left";
    }
  }, [open]);

  return (
    <>
      {/* <button onClick={showDrawer} className={cx("btnTxt", "btnHover", styles.trigger)}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14.1671 2.08365C14.4623 2.0837 14.7361 2.23948 14.8859 2.4938L19.0519 9.57779C19.2051 9.83845 19.2051 10.1618 19.0519 10.4225L14.8859 17.5055C14.7362 17.76 14.4624 17.9166 14.1671 17.9167H5.83411C5.53881 17.9167 5.26508 17.7601 5.11536 17.5055L0.948364 10.4225C0.795264 10.1619 0.79529 9.83838 0.948364 9.57779L5.11536 2.4938L5.17688 2.40298C5.33353 2.20275 5.57586 2.08365 5.83411 2.08365H14.1671ZM2.63391 9.99966L6.30969 16.2497H13.6915L17.3663 9.99966L13.6906 3.74966H6.31067L2.63391 9.99966ZM10.0001 7.08365C11.6107 7.08373 12.9168 8.38919 12.9171 9.99966C12.9171 11.6104 11.6109 12.9166 10.0001 12.9167C8.38945 12.9165 7.08411 11.6104 7.08411 9.99966C7.08446 8.38925 8.38967 7.08382 10.0001 7.08365ZM10.0001 8.74966C9.31014 8.74984 8.75047 9.30973 8.75012 9.99966C8.75012 10.6899 9.30993 11.2495 10.0001 11.2497C10.6904 11.2496 11.2501 10.69 11.2501 9.99966C11.2498 9.30967 10.6902 8.74975 10.0001 8.74966Z"
            fill="white"
          />
        </svg>
      </button> */}
      <Drawer
        className={styles.drawer}
        closable={false}
        width={304}
        title={t("trade.preference")}
        placement={rtl ? "left" : "right"}
        onClose={onClose}
        open={open}
        afterOpenChange={handleAfterOpenChange}
        extra={
          <button className={cx("btnTxt", "btnHover", styles.closeBtn)} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.7122 16.7729C16.0051 17.0658 16.48 17.0658 16.7729 16.7729C17.0658 16.48 17.0658 16.0052 16.7729 15.7123L13.0606 12L16.773 8.28768C17.0659 7.99478 17.0659 7.51991 16.773 7.22702C16.4801 6.93412 16.0052 6.93412 15.7123 7.22702L12 10.9394L8.28759 7.22699C7.9947 6.9341 7.51983 6.9341 7.22693 7.22699C6.93404 7.51989 6.93404 7.99476 7.22693 8.28765L10.9393 12L7.22704 15.7123C6.93414 16.0052 6.93414 16.4801 7.22704 16.773C7.51993 17.0658 7.9948 17.0658 8.2877 16.773L12 13.0607L15.7122 16.7729Z"
                fill="white"
                fill-opacity="0.7"
              />
              <circle opacity="0.1" cx="12" cy="12" r="12" fill="white" />
            </svg>
          </button>
        }
      >
        {!isPcb && (
          <div className={styles.content}>
            {/* <div>
              <p>{t("trade.theme")}</p>
              <div className={styles.conTheme}>
                <button onClick={() => setTheme("dark")} className={cx("btnTxt", "btnHover", { [styles.conThemeAtv]: appState.theme === "dark" })}>
                  <AzSvg icon={`theme-dark-filled`} />
                  <span>{t("trade.theme_dark")}</span>
                </button>
                <button onClick={() => setTheme("light")} className={cx("btnTxt", "btnHover", { [styles.conThemeAtv]: appState.theme === "light" })}>
                  <AzSvg icon={`theme-light-filled`} />
                  <span>{t("trade.theme_light")}</span>
                </button>
              </div>
            </div> */}

            <div>
              <p>{t("trade.colorStyleSetting")}</p>
              <div className={cx(styles.conOrderConfirm, styles.conColorStyleSetting)}>
                <div>
                  <div>
                    <span>{t("trade.colorStyleRedDown")}</span>
                    <AppSvgArrowUp style={{ color: "var(--az-color-green)" }} />
                    <AppSvgArrowDown style={{ color: "var(--az-color-red)" }} />
                  </div>

                  <Radio checked={!isColorReverse} onClick={() => setColorStyle(ColorStyleEnum.normal)} />
                </div>
                <div>
                  <div>
                    <span>{t("trade.colorStyleRedUp")}</span>
                    <AppSvgArrowUp style={{ color: "var(--az-color-red)" }} />
                    <AppSvgArrowDown style={{ color: "var(--az-color-green)" }} />
                  </div>

                  <Radio checked={isColorReverse} onClick={() => setColorStyle(ColorStyleEnum.reverse)} />
                </div>
              </div>
            </div>

            <div>
              <p>{t("trade.layout")}</p>
              <div className={styles.conLayout}>
                <div className={cx({ [styles.conThemeAtv]: store.app.layout === LayoutEnum.classic })}>
                  <button onClick={() => setLayout(LayoutEnum.classic)} className={"btnTxt"}>
                    <div>
                      <span></span>
                      <span></span>
                    </div>
                  </button>
                  <p>{t("trade.classic")}</p>
                </div>
                <div className={cx({ [styles.conThemeAtv]: store.app.layout === LayoutEnum.advanced })}>
                  <button onClick={() => setLayout(LayoutEnum.advanced)} className={"btnTxt"}>
                    <div>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </button>
                  <p>{t("trade.advanced")}</p>
                </div>
                <div className={cx({ [styles.conThemeAtv]: store.app.layout === LayoutEnum.fullscreen })}>
                  <button onClick={() => setLayout(LayoutEnum.fullscreen)} className={"btnTxt"}>
                    <div>
                      <span></span>
                      <span></span>
                    </div>
                  </button>
                  <p>{t("trade.fullscreen")}</p>
                </div>
              </div>
            </div>

            <div>
              <p>{t("trade.orderConfirm")}</p>
              <div className={styles.conOrderConfirm}>
                <div>
                  <div>{t("trade.limitOrder")}</div>
                  <Switch size="small" checked={orderConfirm_limit} onChange={setOrderConfirm_limit} />
                </div>
                <div>
                  <div>{t("trade.marketOrder")}</div>
                  <Switch size="small" checked={orderConfirm_market} onChange={setOrderConfirm_market} />
                </div>
                <div>
                  <div>{t("trade.stopLimit")}</div>
                  <Switch size="small" checked={orderConfirm_stopLimit} onChange={setOrderConfirm_stopLimit} />
                </div>
                <div>
                  <div>{t("trade.trailingStop")}</div>
                  <Switch size="small" checked={orderConfirm_trailingStop} onChange={setOrderConfirm_trailingStop} />
                </div>
              </div>
            </div>

            {/* <div>
              <p>{t("trade.numberDisplayFormat")}</p>
              <div className={cx(styles.conNumberDisplayFormat)}>
                <div>
                  <div>
                    <div>
                      <Tooltip
                        placement="topLeft"
                        getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
                        overlayStyle={{ maxWidth: "250px" }}
                        title={<div className={cx(styles.tipCon)}>{t("trade.standardFormatTip")}</div>}
                      >
                        <span className={cx(styles.tipStr)}>{t("trade.standardFormat")}</span>
                      </Tooltip>
                    </div>

                    <Radio checked={!isNumberIndent} onClick={() => setNumberFormat(NumberFormatEnum.normal)} />
                  </div>
                </div>
                <div>
                  <div>
                    <div>
                      <Tooltip
                        placement="topLeft"
                        getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
                        overlayStyle={{ maxWidth: "250px" }}
                        title={<div className={cx(styles.tipCon)}>{t("trade.indentationFormatTip")}</div>}
                      >
                        <span className={cx(styles.tipStr)}>{t("trade.indentationFormat")}</span>
                      </Tooltip>
                    </div>

                    <Radio checked={isNumberIndent} onClick={() => setNumberFormat(NumberFormatEnum.indent)} />
                  </div>
                  <div>{t("trade.indentationFormatDemo")}</div>
                </div>
              </div>
            </div> */}

            {/* <div className={styles.splitLine}></div> */}

            {/* <PcbItem onClick={() => setIsPcb(true)} /> */}
          </div>
        )}

        {isPcb && <PcbPage onBack={() => setIsPcb(false)} />}
      </Drawer>
    </>
  );
};

export default observer(Main);
