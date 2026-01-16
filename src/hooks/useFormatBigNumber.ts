import React from "react";
import { Context, Util } from "@az/base";
const { Big } = Util;

const useFormatBigNumber = (number: number | string, point?: number): string => {
  const [appState] = React.useContext(Context.AzContext);
  point && point < 0 && (point = 0);

  let result;
  const volume = +number;

  if (appState.locale === "zh-CN") {
    if (volume > 1e8) {
      result = Big(volume / 1e8).toFixedMaxCy(4) + "亿";
    } else if (volume > 1e4) {
      result = Big(volume / 1e4).toFixedMaxCy(2) + "万";
    } else {
      result = Big(volume).toFixedCy(point);
    }
  } else {
    if (volume > 1e8) {
      result = Big(volume / 1e6).toFixedMaxCy(4) + "M";
    } else if (volume > 1e4) {
      result = Big(volume / 1e3).toFixedMaxCy(2) + "K";
    } else {
      result = Big(volume).toFixedCy(point);
    }
  }

  return result;
};

export default useFormatBigNumber;
