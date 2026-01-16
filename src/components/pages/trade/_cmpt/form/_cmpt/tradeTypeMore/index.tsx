import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import store from "store";
import { Dropdown, MenuProps } from "antd";
import AzSvg from "components/az/svg";
import ModalAlert from "components/antd/modal/alert";

import styles from "./index.module.scss";

import { TradeTypeEnum } from "store/trade";

interface Props extends HTMLAttributes<HTMLDivElement> {
  tradeType: TradeTypeEnum;
  setTradeType: (arg: TradeTypeEnum) => void;
  isTab?: boolean;
}

const Main: React.FC<Props> = ({ tradeType, setTradeType, isTab, className }) => {
  const t = useTranslation();
  // const {isLogin} = store.user;

  const [currentTradeType, setCurrentTradeType] = useState<TradeTypeEnum>(TradeTypeEnum.stopLimit);

  const dropdownList = useMemo(() => {
    return [
      { key: TradeTypeEnum.stopLimit, label: t("trade.stopLimit"), tip: t("trade.stopLimitTypeTip") },
      { key: TradeTypeEnum.trailingStop, label: t("trade.trailingStop"), tip: t("trade.trailingStopTypeTip") },
    ];
  }, []);
  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return dropdownList.map((obj) => {
      return {
        key: obj.key,
        label: <a onClick={() => setTradeType(obj.key)}>{obj.label}</a>,
      };
    });
  }, [dropdownList]);
  const dropdownAtvDoc = useMemo(() => {
    return dropdownList.find((obj) => obj.key === currentTradeType);
  }, [currentTradeType, dropdownList]);

  const showDlgTip = useCallback(() => {
    ModalAlert({
      title: dropdownAtvDoc?.label,
      content: dropdownAtvDoc?.tip,
    });
  }, [dropdownAtvDoc]);

  useEffect(() => {
    const doc = dropdownList.find((obj) => obj.key === tradeType);
    if (doc) {
      setCurrentTradeType(doc.key);
    }
  }, [tradeType]);

  return (
    <div className={cx(styles.main, className)}>
      {/*<button*/}
      {/*  className={cx("btnTxt", { btnHover: !isTab }, styles.label, { [styles.atv]: tradeType === currentTradeType && !isTab })}*/}
      {/*  onClick={() => setTradeType(currentTradeType)}*/}
      {/*>*/}
      {/*  {dropdownAtvDoc?.label}*/}
      {/*</button>*/}
      <Dropdown
        placement={"bottomRight"}
        menu={{
          items: dropdownItems,
          selectable: true,
          selectedKeys: dropdownAtvDoc ? [dropdownAtvDoc.key] : [],
        }}
      >
        <button
          className={cx("btnTxt btnDrop", { btnHover: !isTab }, styles.drop)}
          onClick={(e) => {
            e.preventDefault();
            setTradeType(currentTradeType);
          }}
        >
          <span className={cx({ [styles.atv]: tradeType === currentTradeType && !isTab })}>{dropdownAtvDoc?.label}</span>
        </button>
      </Dropdown>
      <button className={cx("btnTxt", styles.info)} onClick={showDlgTip}>
        <AzSvg icon={"info"} />
      </button>
    </div>
  );
};

export default observer(Main);
// export default Main;
