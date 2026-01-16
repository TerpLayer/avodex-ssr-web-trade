import { useCallback, useEffect, useRef } from "react";

interface OptionProps {
  ms?: number; //延迟多少秒执行
  isLoop?: boolean; //是否循环执行
  isInitExec?: boolean; //是否在调用函数时就执行fn
}

type ReturnProps = [
  (arg?: any) => void, //延迟执行函数 timeoutFn
  () => void //清除定时器 timeoutFnClear
];

const useTimeout = (fn: (arg?: any) => void, option?: OptionProps): ReturnProps => {
  const { ms = 100, isLoop, isInitExec } = option || {};

  const timeout = useRef<number>();

  const timeoutFn = useCallback(
    (arg?) => {
      if (timeout.current) clearTimeout(timeout.current);
      isInitExec && fn && fn(arg);
      timeout.current = window.setTimeout(() => {
        !isInitExec && fn && fn(arg);

        timeout.current = 0;
        isLoop && timeoutFn(arg);
      }, ms);
    },
    [fn]
  );

  const timeoutFnClear = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  useEffect(() => {
    return () => {
      timeoutFnClear();
    };
  }, []);

  return [timeoutFn, timeoutFnClear];
};

export default useTimeout;