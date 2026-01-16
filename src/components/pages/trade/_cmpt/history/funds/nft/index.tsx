import React, { HTMLAttributes, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
// import { useRouter } from "next/router";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
import store from "store";
// import { routerPush, thousands, upperCaseFirstLetter } from "@/utils/method";
// import { get_nftPosition } from "api/v4/balance";

// import { Dropdown, MenuProps, Tooltip } from "antd";
// import useAxiosCancelFun from "hooks/useAxiosCancelFun";
// import usePriceCurrencyConvertCb from "hooks/usePriceCurrencyConvertCb";
import AzLoading from "components/az/loading";
import AzScrollBarY from "components/az/scroll/barY";
import AppDivNoData from "components/app/div/noData";
// import CurrencyMarketDropdown from "../../_cmpt/currencyMarketDropdown";
import Img_softnote_light from "assets/img/softnote-light.png";
import Img_softnote_dark from "assets/img/softnote-dark.png";

import styles from "./index.module.scss";

import { NftPositionProps, NftStatusEnum } from "store/balances";

interface NftPositionExtendProps extends NftPositionProps {
  _amount: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  clsUl: string;
  clsLi: string;
}

const Main: React.FC<Props> = ({ className, clsUl, clsLi }) => {
  // const router = useRouter();
  const t = useTranslation();
  const { isDark } = store.app;
  const { currentNftCoin } = store.market;
  const { nftPosition } = store.balances;

  const [loading, setLoading] = useState(true);

  const itemsExtend = useMemo<WithUndefined<NftPositionExtendProps[]>>(() => {
    if (!nftPosition) return undefined;
    const ary: NftPositionExtendProps[] = [];
    nftPosition.map((doc) => {
      ary.push({
        ...doc,
        _amount: doc.amount + " " + store.currency.getCurrencyDisplayName(doc.currency),
      });
    });
    return ary;
  }, [nftPosition]);

  useEffect(() => {
    setLoading(itemsExtend !== undefined ? false : true);
  }, [itemsExtend]);

  return (
    <>
      <AzScrollBarY noWrap={store.app.rtl} className={cx(styles.AzScrollBarY, className)} options={{}}>
        <div className={cx(styles.main, className)}>
          <div className={styles.nav}>
            <div className={cx(clsLi, styles.li)}>
              <div>{t("trade.softnote")}</div>
              <div>{t("trade.serial")}</div>
              <div>{t("trade.amount")}</div>
              <div>
                <a href={"/wallet/account/common/deposit/softnote?currency=" + currentNftCoin} className={cx("btnTxt", styles.atv)}>
                  {t("trade.deposit")}
                </a>
                <a href={"/wallet/account/common/withdrawal/softnote?currency=" + currentNftCoin} className={cx("btnTxt", styles.atv)}>
                  {t("trade.withdraw")}
                </a>
              </div>
            </div>
          </div>

          {itemsExtend && (
            <div className={cx(clsUl, styles.ul)}>
              {!itemsExtend.length ? (
                <AppDivNoData className={styles.noData} />
              ) : (
                itemsExtend.map((doc) => {
                  const disabled = doc.status === NftStatusEnum.frozen;
                  return (
                    <div key={doc.nftId} className={cx(clsLi, styles.li, disabled ? styles.liDisabled : undefined)}>
                      <div>
                        <img src={isDark ? Img_softnote_dark : Img_softnote_light} alt="" />
                      </div>
                      <div>
                        <span>{doc.nftId}</span>
                        {disabled && (
                          <>
                            <span>&nbsp;</span>
                            <span className={styles.tag}>{t("trade.frozen")}</span>
                          </>
                        )}
                      </div>
                      <div>{doc._amount}</div>
                      <div></div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </AzScrollBarY>
      {loading && <AzLoading />}
    </>
  );
};

export default observer(Main);
// export default Main;
