import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import cx from "classnames";
// import { Hooks } from "@az/base";
// const { useTranslation } = Hooks;
// const { getUrl, Big } = Util;
import { routerPush } from "@/utils/method";
import store from "store";

import { Dropdown, DropdownProps, MenuProps } from "antd";

import styles from "./index.module.scss";

import { LeverSymbolProps, SymbolProps } from "store/market";

interface Props extends DropdownProps {
  currency: string;
}

const Main: React.FC<Props> = ({ currency, ...rest }) => {
  const router = useRouter();
  // const t = useTranslation();
  const { symbols, config, isLever, leverConfigAry, formatName } = store.market;
  const { getCurrencyDisplayName } = store.currency;

  const itemsSpot: MenuProps["items"] = useMemo(() => {
    let ary: SymbolProps[] = [];
    if (symbols && symbols.length) {
      ary = symbols.filter((doc) => {
        if (!doc.symbol.split("_").includes(currency)) return false;
        if (!doc.tradingEnabled) return false; //是否可以交易
        if (doc.state === "DELISTED") return false; //退市
        if (!/^(FULL)$/.test(doc.displayLevel)) return false; //不是完全展示
        return true;
      });
      ary.sort((a, b) => b.displayWeight - a.displayWeight);
    }
    return ary.slice(0, 4).map((obj) => {
      return {
        key: obj.symbol,
        label: <a onClick={() => routerPush(router, { symbol: obj.symbol })}>{formatName(obj.symbol)}</a>,
      };
    });
  }, [currency, symbols]);
  const itemsLever: MenuProps["items"] = useMemo(() => {
    let ary: LeverSymbolProps[] = [];
    if (leverConfigAry && leverConfigAry.length) {
      ary = leverConfigAry.filter((doc) => {
        if (config && config[doc.symbol] && !config[doc.symbol].tradingEnabled) return false;

        return doc.symbol.split("_").includes(currency);
      });
    }
    return ary.slice(0, 4).map((obj) => {
      return {
        key: obj.symbol,
        label: <a onClick={() => routerPush(router, { symbol: obj.symbol, isLever: true })}>{formatName(obj.symbol)}</a>,
      };
    });
  }, [currency, config, leverConfigAry]);
  const items: MenuProps["items"] = useMemo(() => {
    // return [];
    return isLever ? itemsLever : itemsSpot;
  }, [isLever, itemsLever, itemsSpot]);

  if (!items.length) return <span>{getCurrencyDisplayName(currency)}</span>;

  return (
    <Dropdown
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      menu={{
        items,
      }}
      {...rest}
    >
      <button className={cx("btnTxt btnDrop", styles.trigger)} onClick={(e) => e.preventDefault()}>
        <span>{getCurrencyDisplayName(currency)}</span>
      </button>
    </Dropdown>
  );
};

export default observer(Main);
// export default Main;
