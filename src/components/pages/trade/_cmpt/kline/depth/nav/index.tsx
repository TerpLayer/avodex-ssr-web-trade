import React, { HTMLAttributes, useCallback } from "react";
// import { observer } from "mobx-react-lite";
import { Hooks, Util } from "@az/base";
// const { AzContext } = Context;
const { useTranslation } = Hooks;
const { Big } = Util;
// import store from "store";

import { Slider } from "antd";

import styles from "./index.module.scss";

import { OptionDepthProps } from "../../index";
interface Props extends HTMLAttributes<HTMLDivElement> {
  option: OptionDepthProps;
  setOption: (arg: OptionDepthProps) => void;
}

const Main: React.FC<Props> = ({ option, setOption }) => {
  const t = useTranslation();

  const tooltipFormatter = useCallback((value) => {
    return Big(value).times(100).toFixed() + "%";
  }, []);

  const handleChange = useCallback((value) => {
    setOption({ scope: value });
  }, []);

  return (
    <div className={styles.main}>
      <span>{t("trade.scope")}:</span>
      <Slider value={option.scope} max={0.2} min={0.01} step={0.01} tooltip={{ formatter: tooltipFormatter }} onChange={handleChange} />
    </div>
  );
};

// export default observer(Main);
export default Main;
