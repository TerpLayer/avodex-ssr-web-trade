import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { eleResizeObserver } from "utils/method";

import CMPT_BarY from "../barY";
import CMPT_Ul from "../ul";

interface Props {
  height?: number; //单个列表高度
  dataAry?: any[]; //数据列表
  ulClassName?: string; //ul className
  scrollBtmCb?: () => void; //滚动到底部回调
  defaultWinHeight?: number; //默认窗口高度
  isDisableObserver?: boolean; //是否禁用观察
  isScrollBottom?: boolean; //是否滑动到底部
  [key: string]: any;
}

const AzScrollWindow: React.FC<PropsWithChildren<Props>> = ({
  children,
  height,
  dataAry,
  ulClassName,
  scrollBtmCb,
  defaultWinHeight = 1,
  isDisableObserver,
  isScrollBottom,
  ...rest
}) => {
  const [winHeight, setWinHeight] = useState<number>(defaultWinHeight);
  const [scrollTop, setScrollTop] = useState<number>(0);
  // const scrollEle = React.createRef<HTMLDivElement>();
  const scrollEle = useRef() as React.MutableRefObject<HTMLDivElement>;

  const timeoutResize = useRef<number>();
  const timeoutScroll = useRef<number>();

  const handleScrollY = useCallback(
    (el) => {
      if (timeoutScroll.current) return;
      timeoutScroll.current = window.setTimeout(() => {
        // console.log("handleScrollY------>", el);
        setScrollTop(el.scrollTop);
        timeoutScroll.current = 0;
        if (scrollBtmCb && el.scrollHeight === el.scrollTop + winHeight) {
          scrollBtmCb();
        }
      }, 20);
    },
    [scrollBtmCb, winHeight]
  );

  const onResize = useCallback(() => {
    // console.log("onResize===", timeoutResize.current, scrollEle.current);
    if (timeoutResize.current) return;
    timeoutResize.current = window.setTimeout(() => {
      if (scrollEle.current) {
        setWinHeight(scrollEle.current.offsetHeight);
        setScrollTop(scrollEle.current.scrollTop);
        // console.log("scrollEle.current===", scrollEle.current.offsetHeight, scrollEle.current.scrollTop);
      }
      timeoutResize.current = 0;
      // console.log("onResize over", timeoutResize.current, scrollEle.current);
    }, 100);
  }, []);

  useEffect(() => {
    // console.log("scrollEle.current======>", scrollEle.current);
    if (!scrollEle.current) return;
    const { offsetHeight } = scrollEle.current;
    setWinHeight(offsetHeight);
    !isDisableObserver && eleResizeObserver(scrollEle.current, onResize);

    if (isScrollBottom) {
      const scrollTop = (dataAry || []).length * (height || 0) - offsetHeight;
      scrollEle.current.scrollTop = Math.max(scrollTop, 0);
    }

    return () => {
      timeoutResize.current && window.clearTimeout(timeoutResize.current);
      timeoutScroll.current && window.clearTimeout(timeoutScroll.current);
    };
  }, []);

  return (
    <CMPT_BarY containerRef={(ref) => (scrollEle.current = ref)} onScrollY={handleScrollY} {...rest}>
      <CMPT_Ul className={ulClassName} scrollTop={scrollTop} winHeight={winHeight} height={height} dataAry={dataAry}>
        {children}
      </CMPT_Ul>
    </CMPT_BarY>
  );
};

export default AzScrollWindow;
