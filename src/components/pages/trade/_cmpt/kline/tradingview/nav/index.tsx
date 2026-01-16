import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import store from "store";
import Storage from "utils/storage";

import { Dropdown, MenuProps } from "antd";
import AzSvg from "components/az/svg";

import styles from "./index.module.scss";

import { OptionTradingViewProps, getOptionTradingView, ActionTradingViewProps } from "../../index";

interface Props extends HTMLAttributes<HTMLDivElement> {
  option: WithUndefined<OptionTradingViewProps>;
  setOption: (arg: OptionTradingViewProps) => void;
  setAction: (arg: ActionTradingViewProps) => void;
  el?: any;
}

const Main: React.FC<Props> = ({ option, setOption, setAction, el }) => {
  const t = useTranslation();

  const [optionAtvKey, setOptionAtvKey] = useState("");
  useEffect(() => {
    const { interval, chartType } = getOptionTradingView(option);
    const key = [interval, chartType].join("_");
    setOptionAtvKey(key);
  }, [option]);

  const handleClickOption = useCallback((interval: string, chartType = 1) => {
    const option = { interval, chartType };
    setOption(option);
    Storage.set("tvOption", option);
  }, []);
  const handleClickAction = useCallback(
    (actionId) => {
      setAction({ actionId });
      const { interval, chartType } = getOptionTradingView(option);
      if (chartType === 3 && actionId === "chartProperties") {
        setOption({ interval, chartType: 1 });
      }
    },
    [option]
  );

  const dropdownList = useMemo(() => {
    return [
      { key: "3_1", label: "3" + t("trade.klineMin") },
      { key: "360_1", label: "6" + t("trade.klineHour") },
      { key: "480_1", label: "8" + t("trade.klineHour") },
      { key: "720_1", label: "12" + t("trade.klineHour") },
      { key: "3D_1", label: "3" + t("trade.klineDay") },
      { key: "1W_1", label: "1" + t("trade.klineWeek") },
      { key: "1M_1", label: "1" + t("trade.klineMonth") },
      { key: "12M_1", label: "1" + t("trade.klineYear") },
    ];
  }, []);
  const dropdownAtvDoc = useMemo(() => {
    return dropdownList.find((obj) => obj.key === optionAtvKey);
  }, [optionAtvKey, dropdownList]);
  const dropdownLabel = useMemo(() => {
    return dropdownAtvDoc ? dropdownAtvDoc.label : t("trade.more");
  }, [dropdownAtvDoc]);
  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return dropdownList.map((obj) => {
      return {
        key: obj.key,
        label: <a onClick={() => handleClickOption(obj.key.split("_")[0])}>{obj.label}</a>,
      };
    });
  }, [dropdownList]);

  return (
    <div className={styles.main}>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "1_3" })} onClick={() => handleClickOption("1", 3)}>
        {t("trade.klineTime")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "1_1" })} onClick={() => handleClickOption("1")}>
        1{t("trade.klineMin")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "5_1" })} onClick={() => handleClickOption("5")}>
        5{t("trade.klineMin")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "15_1" })} onClick={() => handleClickOption("15")}>
        15{t("trade.klineMin")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "30_1" })} onClick={() => handleClickOption("30")}>
        30{t("trade.klineMin")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "60_1" })} onClick={() => handleClickOption("60")}>
        1{t("trade.klineHour")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "120_1" })} onClick={() => handleClickOption("120")}>
        2{t("trade.klineHour")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "240_1" })} onClick={() => handleClickOption("240")}>
        4{t("trade.klineHour")}
      </button>
      <button className={cx("btnTxt btnHover", { [styles.atv]: optionAtvKey === "1D_1" })} onClick={() => handleClickOption("1D")}>
        1{t("trade.klineDay")}
      </button>

      <Dropdown
        placement={"bottomLeft"}
        getPopupContainer={() => (el && el.current ? el.current : document.body)}
        menu={{
          items: dropdownItems,
          selectable: true,
          selectedKeys: dropdownAtvDoc ? [dropdownAtvDoc.key] : [],
        }}
      >
        <button className={cx("btnTxt btnHover btnDrop", styles.trigger, { [styles.atv]: !!dropdownAtvDoc })} onClick={(e) => e.preventDefault()}>
          {dropdownLabel}
        </button>
      </Dropdown>

      <button className={cx("btnTxt btnHover", styles.btnIcon)} onClick={() => handleClickAction("chartProperties")}>
        <AzSvg icon={"property"} />
      </button>
      <button className={cx("btnTxt btnHover", styles.btnIcon)} onClick={() => handleClickAction("insertIndicator")}>
        <AzSvg icon={"indicator"} />
      </button>
    </div>
  );
};

export default observer(Main);
