import { useCallback, useEffect, useRef } from "react";

interface RetArgProps {
  err?: any; //是否出错，出错为字符串
  data?: any; //结果数据
  config?: any; //配置
}

interface Props {
  fn: (arg: any) => Promise<any>;
  config?: {};
  callback?: (arg: RetArgProps) => void;
  success?: (data: any, config?: any) => void;
  error?: (err: any, e: any, config?: any) => void;
}

type ReturnProps = (cb?) => any; //执行函数

const useAxiosCancelFun = (arg: Props): ReturnProps => {
  const { fn, config, callback, success, error } = arg;

  const cancelFun = useRef<any>();

  const apiResFn = useCallback(
    (cb) => {
      if (cancelFun.current) {
        cancelFun.current();
        cancelFun.current = null;
        console.log("【useAxiosCancelFun】canceled");
      }

      fn({
        ...(config || {}),
        cancelFun: (c) => (cancelFun.current = c),
      })
        .then((data) => {
          success && success(data, config);
          callback && callback({ data, config });
          cb && cb({ data, config });
        })
        .catch((e) => {
          if (e.isCancel) return;
          error && error(e.message, e, config);
          callback && callback({ err: e.message, data: e, config });
          cb && cb({ err: e.message, data: e, config });
        })
        .finally(() => {
          cancelFun.current = null;
        });

      return cancelFun;
    },
    [arg]
  );

  useEffect(() => {
    return () => {
      if (cancelFun.current) {
        cancelFun.current();
        console.log("【useAxiosCancelFun】canceled");
      }
    };
  }, []);

  return apiResFn;
};

export default useAxiosCancelFun;
