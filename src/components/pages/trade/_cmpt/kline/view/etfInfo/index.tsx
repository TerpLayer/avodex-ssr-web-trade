import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
const { Big } = Util;
import AzScrollBarY from "components/az/scroll/barY";
import ImgIcon404 from "@/assets/img/icon404.png";

import styles from "./index.module.scss";
import stylesView from "@/components/pages/trade/_cmpt/kline/view/index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  const { name, etfConfigObj, netWorth } = store.market;
  const { getCurrencyDisplayName } = store.currency;

  const coin = useMemo(() => {
    return name.split("_")[0];
  }, [name]);
  const coinBuyLab = useMemo(() => {
    return getCurrencyDisplayName(name.split("_")[1]);
  }, [name, getCurrencyDisplayName]);
  const etfCfg = useMemo(() => {
    if (etfConfigObj && etfConfigObj[name]) return etfConfigObj[name];
  }, [name, etfConfigObj]);

  console.log("etfCfg-----", etfCfg);

  return (
    <div className={cx(stylesView.main, className)}>
      <div className={cx(stylesView.head)}>
        <div className={cx(stylesView.coin)}>
          <img src={etfCfg?.logo || ImgIcon404} alt="logo" />
          <span>{getCurrencyDisplayName(coin)}</span>
          {etfCfg && (
            <small>{`(${etfCfg.direction === "LONG" ? t("market.etf.kanduo") : t("market.etf.kankong")}${getCurrencyDisplayName(etfCfg.baseCurrency)}(${t(
              "market.etf.leverNum",
              { amount: etfCfg.maxLeverage }
            )}))`}</small>
          )}
        </div>
      </div>
      {!!etfCfg && (
        <div className={cx(stylesView.body)}>
          <AzScrollBarY>
            <div className={cx(stylesView.scrollDiv)}>
              {!!etfCfg.baseCurrency && (
                <div className={cx(stylesView.li)}>
                  <div>{t("market.etf.trackTarget")}</div>
                  <div>{getCurrencyDisplayName(etfCfg.baseCurrency)}</div>
                </div>
              )}
              {!!etfCfg.managementRate && (
                <div className={cx(stylesView.li)}>
                  <div>{t("market.etf.manageRate")}</div>
                  <div>
                    {Big(etfCfg.managementRate || 0)
                      .times(100)
                      .toFixed() + "%"}
                  </div>
                </div>
              )}
              {!!etfCfg.initialNetWorth && (
                <div className={cx(stylesView.li)}>
                  <div>{t("market.etf.initVal")}</div>
                  <div>{etfCfg.initialNetWorth + " " + coinBuyLab}</div>
                </div>
              )}
              <div className={cx(stylesView.li)}>
                <div>{t("market.etf.lastVal")}</div>
                <div>{(netWorth || "--") + " " + coinBuyLab}</div>
              </div>
              {!!etfCfg.maxLeverage && (
                <div className={cx(stylesView.li)}>
                  <div>{t("trade.margin")}</div>
                  <div>{etfCfg.maxLeverage + "X"}</div>
                </div>
              )}
            </div>
          </AzScrollBarY>
          <div className={cx(styles.bodyRight)}>
            {!!etfCfg.instruction && (
              <div className={cx(stylesView.section, stylesView.introduction)}>
                <p className={cx(stylesView.scrollDiv)}>{t("trade.aboutCoin", [getCurrencyDisplayName(coin)])}</p>
                <AzScrollBarY>
                  <div className={cx(stylesView.scrollDiv)} dangerouslySetInnerHTML={{ __html: etfCfg.instruction }}></div>
                </AzScrollBarY>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(Main);
// export default Main;
