import React, { HTMLAttributes, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";
import { eleResizeObserver } from "utils/method";

import useTimeout from "hooks/useTimeout";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  height?: number; //单个列表高度
  dataAry?: any[]; //数据列表
  isReverse?: boolean; //是否是倒序
  recordCb?: (arg: any) => void; //
}

const AzScrollLay: React.FC<PropsWithChildren<Props>> = ({ children, className, height = 20, dataAry = [], isReverse = false, recordCb, ...rest }) => {
  const refEl = useRef<HTMLDivElement>(null);
  const [winHeight, setWinHeight] = useState<number>(0);

  const count = useMemo(() => {
    const count = Math.ceil(winHeight / height);
    return Math.min(count, dataAry.length);
  }, [winHeight, height, dataAry]);
  const record = useMemo(() => {
    if (isReverse) return dataAry.slice(dataAry.length - count, dataAry.length);
    return dataAry.slice(0, count);
  }, [isReverse, dataAry, count]);

  const isEmptyAryRef = useRef<boolean>(false);
  useEffect(() => {
    if (!recordCb || !recordCb) return;
    if (isEmptyAryRef.current && !record.length) return;
    isEmptyAryRef.current = !record.length;
    recordCb(record);
  }, [record]);

  const [timeoutFn] = useTimeout(() => {
    if (!refEl.current) return;
    setWinHeight(refEl.current.offsetHeight);
  });

  useEffect(() => {
    if (!refEl.current) return;
    setWinHeight(refEl.current.offsetHeight);
    eleResizeObserver(refEl.current, timeoutFn);
  }, []);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;
    return React.cloneElement(child, { ...child.props, record });
  });

  return (
    <div ref={refEl} className={cx(styles.main, className)} {...rest}>
      {childrenWithProps}
    </div>
  );
};

export default AzScrollLay;
