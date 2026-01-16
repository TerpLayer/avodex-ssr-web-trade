import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import { Dropdown, DropdownProps, MenuProps } from "antd";

import styles from "./index.module.scss";

import { TradeSideEnum } from "store/trade";
import { AccountEnum, NftPositionProps } from "store/balances";

import { NftStatusEnum } from "store/balances";

interface Props extends DropdownProps {
  tradeSide: TradeSideEnum;
  isErr?: boolean;
  value?: string | NftPositionProps;
  onChange?: (val: string | NftPositionProps) => void;
}

const Main: React.FC<Props> = ({ tradeSide, isErr, value, onChange, className }) => {
  const t = useTranslation();
  // const {isLogin} = store.user;
  const { currentNftCoin } = store.market;
  const { currencyObj } = store.currency;
  const { nftPosition } = store.balances;

  const isBuy = useMemo(() => tradeSide === TradeSideEnum.buy, [tradeSide]);
  const currentNftObj = useMemo(() => {
    if (!currencyObj) return;
    return currencyObj[currentNftCoin];
  }, [currentNftCoin, currencyObj]);

  const itemsBuy: MenuProps["items"] = useMemo(() => {
    if (!currentNftObj) return [];
    if (currentNftObj.type !== "NFT" || !currentNftObj.nominalValue) return [];

    const retAry: MenuProps["items"] = [];
    currentNftObj.nominalValue.split(",").map((nominalStr) => {
      retAry.push({
        key: nominalStr,
        label: <a onClick={() => onChange && onChange(nominalStr)}>{nominalStr}</a>,
      });
    });

    return retAry;
  }, [currentNftObj, onChange]);
  const itemsSell: MenuProps["items"] = useMemo(() => {
    if (!nftPosition || !nftPosition.length) return [];

    const retAry: MenuProps["items"] = [];
    nftPosition.map((obj) => {
      if (obj.status === NftStatusEnum.frozen) return;
      const key = obj.nftId;
      retAry.push({
        key,
        // disabled: obj.status === NftStatusEnum.frozen,
        label: (
          <a className={cx(styles.li)} onClick={() => onChange && onChange(obj)}>
            <div>{obj.amount + " " + store.currency.getCurrencyDisplayName(obj.currency)}</div>
            <div>
              <span>{t("trade.softnoteSerial")}:&nbsp;</span>
              <span>{obj.nftId}</span>
            </div>
          </a>
        ),
      });
    });

    return retAry;
  }, [nftPosition, onChange]);
  const items: MenuProps["items"] = useMemo(() => (isBuy ? itemsBuy : itemsSell), [isBuy, itemsBuy, itemsSell]);

  const selectedKeys = useMemo(() => {
    if (value && typeof value !== "string") return [value.nftId];
    if (typeof value === "string") return [value];
    return [];
  }, [value]);

  return (
    <Dropdown
      overlayClassName={styles.main}
      // getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      menu={{
        items,
        selectable: true,
        selectedKeys,
      }}
    >
      <button className={cx("btnTxt btnDrop", styles.trigger, isErr ? styles.err : undefined)} onClick={(e) => e.preventDefault()}>
        <div className={styles.prefix}>{t("trade.amount")}</div>
        <div className={styles.content}>
          {value ? (
            typeof value === "string" ? (
              value
            ) : (
              <>
                <span className={styles.contentTip}>{`(${value.nftId}) `}</span>
                <span>{value.amount}</span>
              </>
            )
          ) : (
            ""
          )}
        </div>
        <div className={styles.suffix}>{store.currency.getCurrencyDisplayName(currentNftCoin)}</div>
      </button>
    </Dropdown>
  );
};

export default observer(Main);
// export default Main;
