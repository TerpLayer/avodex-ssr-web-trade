import { useCallback, useEffect, useRef } from "react";

interface Props {
  clear: () => void; //清除定时器
  reset: () => void; //重置定时器
}

const useIntervalAsync = <R = unknown>(fn: () => Promise<R>, ms: number): Props => {
  const runningCount = useRef(0);
  const timeout = useRef<number>();
  const mountedRef = useRef(false);

  const next = useCallback(
    (handler) => {
      if (mountedRef.current && runningCount.current === 0) {
        timeout.current = window.setTimeout(handler, ms);
      }
    },
    [ms]
  );

  const run = useCallback(async () => {
    runningCount.current += 1;
    const result = await fn();
    runningCount.current -= 1;

    next(run);

    return result;
  }, [fn, next]);

  useEffect(() => {
    mountedRef.current = true;
    run();

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timeout.current);
    };
  }, [run]);

  const clear = () => {
    window.clearTimeout(timeout.current);
  };

  const reset = useCallback(() => {
    window.clearTimeout(timeout.current);
    return run();
  }, [run]);

  return { clear, reset };
};

export default useIntervalAsync;