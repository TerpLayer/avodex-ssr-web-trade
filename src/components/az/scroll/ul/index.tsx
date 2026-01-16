import React, { PropsWithChildren, useMemo } from "react";
import cx from "classnames";

import styles from "./index.module.scss";
// import AzScrollBarY from "../barY";

interface Props {
  className?: string;
  winHeight?: number; //窗口高度
  scrollTop?: number; //窗口向上滚动距离
  height?: number; //单个列表高度
  dataAry?: any[]; //数据列表
}

const AzScrollUl = React.forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  ({ children, className, winHeight = 0, scrollTop = 0, height = 30, dataAry = [], ...rest }, ref) => {
    const totalHeight = useMemo(() => {
      return height * dataAry.length;
    }, [height, dataAry]);
    const startIndex = useMemo(() => {
      const index = Math.floor(scrollTop / height);
      return Math.max(index - 1, 0);
    }, [scrollTop, height]);
    const start = useMemo(() => {
      return startIndex * height;
    }, [startIndex, height]);
    const count = useMemo(() => {
      const count = Math.ceil((scrollTop - start + winHeight + height) / height);
      return Math.min(count, dataAry.length);
    }, [scrollTop, start, winHeight, height, dataAry]);
    const record = useMemo(() => {
      return dataAry.slice(startIndex, startIndex + count);
    }, [dataAry, startIndex, count]);

    const childrenWithProps = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;
      return React.cloneElement(child, { ...child.props, startIndex, record });
    });

    // console.log("AzScrollUl = ", { winHeight, scrollTop, height, totalHeight, startIndex, start, count, record });
    return (
      <div ref={ref} className={cx(styles.main, className)} style={{ height: totalHeight + "px" }} {...rest}>
        {childrenWithProps}
      </div>
    );
  }
);

AzScrollUl.displayName = "AzScrollUl";

export default AzScrollUl;
