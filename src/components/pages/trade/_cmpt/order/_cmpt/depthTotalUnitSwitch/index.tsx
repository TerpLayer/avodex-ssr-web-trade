import React, { HTMLAttributes, useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import Storage from "utils/storage";
import { Dropdown, MenuProps } from "antd";

import styles from "./index.module.scss";
import AzFontScale from "@/components/az/fontScale";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  const { name } = store.market;
  const { isDepthShowTotalPrice } = store.trade;

  const coinSell = useMemo(() => {
    return store.currency.getCurrencyDisplayName(name.split("_")[0] || "");
  }, [name]);
  const coinBuy = useMemo(() => {
    return store.currency.getCurrencyDisplayName(name.split("_")[1] || "");
  }, [name]);

  const handleClickUnit = useCallback((key) => {
    Storage.set("depthShowTotalPrice", key);
    store.trade.updateState({ isDepthShowTotalPrice: !!key });
  }, []);

  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "0",
        label: <a onClick={() => handleClickUnit(0)}>{t("trade.total") + `(${coinSell})`}</a>,
      },
      {
        key: "1",
        label: <a onClick={() => handleClickUnit(1)}>{t("trade.total") + `(${coinBuy})`}</a>,
      },
    ];
  }, [coinSell, coinBuy, handleClickUnit]);

  useEffect(() => {
    const key = Storage.get("depthShowTotalPrice");
    if (/^(0|1)$/.test(key)) handleClickUnit(key);
  }, []);

  return (
    <Dropdown
      placement={"bottomRight"}
      // getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      menu={{
        items: dropdownItems,
        selectable: true,
        selectedKeys: [isDepthShowTotalPrice ? "1" : "0"],
      }}
    >
      <button className={cx("btnTxt btnHover btnDrop", styles.trigger)} onClick={(e) => e.preventDefault()}>
        <AzFontScale isLoop>{t("trade.total") + (coinSell.length < 7 ? `(${isDepthShowTotalPrice ? coinBuy : coinSell})` : "")}</AzFontScale>
      </button>
    </Dropdown>
  );
};

export default observer(Main);
// export default Main;
