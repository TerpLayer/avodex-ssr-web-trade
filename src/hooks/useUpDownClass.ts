import { useEffect, useState } from "react";

import { getUpDownCls } from "utils/method";
import { ClsUpDownEnum } from "store/app";

import usePrevious from "./usePrevious";

const useUpDownClass = (value: number | string | undefined, initClass?: ClsUpDownEnum): WithUndefined<ClsUpDownEnum> => {
  const [cls, setCls] = useState<WithUndefined<ClsUpDownEnum>>(initClass);
  // const prevCls = usePrevious(cls);
  const prevValue = usePrevious(value);

  useEffect(() => {
    const currValue = +(value || 0) || 0;
    const prevValueFormat = +(prevValue || 0) || 0;

    const rst = getUpDownCls(currValue - prevValueFormat);
    setCls(rst);
    // console.log("useEffect=====", { value, cls, prevCls, prevValue, rst });
  }, [value]);

  // console.log("useUpDownClass===", { cls, initClass });

  return cls;
};

export default useUpDownClass;