import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
// import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { useRouter } from "next/router";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { Big } = Util;
// import store from "store";
// import Storage from "utils/storage";
// import { routerPush } from "utils/method";

import { Slider } from "antd";

import styles from "./index.module.scss";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  max?: string;
  point?: number;
  disabled?: boolean;
  onChange?: (arg: string, slider: number, isAfterChange?: boolean) => void;
  noBtnAll?: boolean;
}

const Main: React.FC<Props> = ({ className, value, max, point = 0, disabled, onChange, noBtnAll = false }) => {
  const t = useTranslation();
  const [sliderValue, setSliderValue] = useState(+(value || 0) || 0);

  const mask = useMemo(() => {
    return {
      0: <></>,
      20: <></>,
      40: <></>,
      60: <></>,
      80: <></>,
      100: <></>,
    };
  }, []);

  const tooltipFormatter = useCallback((value) => {
    return value + "%";
  }, []);
  const handleChange = useCallback(
    (val, isAfterChange?) => {
      console.log("slider onChange", val, max, point);
      setSliderValue(val);
      const value = Big(max || 0)
        .times(val)
        .div(100)
        .toFixed(point);
      onChange && onChange(value, val, isAfterChange);
    },
    [max, point, onChange]
  );

  useEffect(() => {
    if (!value) return setSliderValue(0);
    const valueNum = +(value || 0) || 0;
    const maxNum = +(max || 0) || 0;

    if (!maxNum) {
      if (valueNum) {
        setSliderValue(100);
      }
    } else {
      if (valueNum >= maxNum) {
        setSliderValue(100);
      } else {
        setSliderValue(Math.round((valueNum / maxNum) * 100));
      }
    }
  }, [value, max]);

  return (
    <div className={cx(styles.main, className)}>
      <Slider
        value={sliderValue}
        tooltip={{ formatter: tooltipFormatter }}
        onChange={(val) => handleChange(val)}
        onAfterChange={(val) => handleChange(val, true)}
        disabled={disabled}
        marks={mask}
        max={100}
        min={0}
      />
      {!noBtnAll && (
        <button
          disabled={disabled}
          className={cx("btnTxt btnHover", styles.btnAll)}
          onClick={() => {
            handleChange(100, true);
          }}
        >
          {t("trade.all")}
        </button>
      )}
    </div>
  );
};

// export default observer(Main);
export default Main;
