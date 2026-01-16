import { useEffect, useState } from "react";

import { getUpDownCls } from "utils/method";
import { ClsUpDownEnum } from "store/app";

import usePrevious from "./usePrevious";

export interface TickerProps {
  s: string; //市场名称, btc_usdt
  c?: string; //当前价格, 100.000
  cr?: string; //涨跌幅 0.0582 -> 5.8%
  cv?: string; //价格变动值
  h?: string; //24H最高价 25891.63
  l?: string; //24H最低价 24188.76
  q?: string; //24H成交数量 btc
  v?: string; //24H成交金额 usdt
}

const useUpDownClassTicker = (ticker: WithUndefined<TickerProps>, ret3Mode?: boolean): WithUndefined<ClsUpDownEnum> => {
  const [cls, setCls] = useState<WithUndefined<ClsUpDownEnum>>(getUpDownCls(ticker?.cv, ret3Mode));
  const prevTicker = usePrevious(ticker);

  useEffect(() => {
    if (!ticker) return setCls(undefined);
    //第一次
    if (!prevTicker || prevTicker.s !== ticker.s) return setCls(getUpDownCls(ticker.cv, ret3Mode));

    if (!ret3Mode && ticker.c === prevTicker.c) return;

    const currValue = +(ticker.c || 0) || 0;
    const prevValue = +(prevTicker.c || 0) || 0;
    setCls(getUpDownCls(currValue - prevValue, ret3Mode));
  }, [ticker]);

  return cls;
};

export default useUpDownClassTicker;