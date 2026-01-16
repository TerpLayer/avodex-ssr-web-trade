import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import cx from "classnames";
import { eleResizeObserver } from "utils/method";

import styles from "./index.module.scss";

interface Props {
  className?: string;
  style?: any;
  resetEffect?: any;
}

const AzScrollArrow: React.FC<PropsWithChildren<Props>> = ({ children, style, className, resetEffect }) => {
  const timeoutFun = useRef<number>();

  const contentEl = useRef<HTMLDivElement>(null);
  const [isLeftArrow, setIsLeftArrow] = useState<boolean>(false);
  const [isRightArrow, setIsRightArrow] = useState<boolean>(false);

  const refresh = useCallback(() => {
    if (!contentEl.current) return;
    const { scrollLeft, scrollWidth, offsetWidth } = contentEl.current;
    // console.log("【refresh】========", { scrollLeft, scrollWidth, offsetWidth });
    if (scrollWidth > offsetWidth) {
      setIsLeftArrow(scrollLeft === 0 ? false : true);
      setIsRightArrow(scrollWidth - offsetWidth - scrollLeft < 2 ? false : true);
    } else {
      setIsLeftArrow(false);
      setIsRightArrow(false);
    }
    timeoutFun.current = undefined;
  }, []);
  useEffect(() => {
    if (!contentEl.current) return;

    contentEl.current.addEventListener("scroll", onResize);
    eleResizeObserver(contentEl.current, onResize);

    function onResize() {
      if (timeoutFun.current) return;
      timeoutFun.current = window.setTimeout(refresh, 100);
    }

    return () => {
      clearTimeout(timeoutFun.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (contentEl.current) contentEl.current.removeEventListener("scroll", onResize);
    };
  }, []);

  const onClickLeft = () => {
    if (!contentEl.current) return;
    contentEl.current.scrollLeft = 0;
    refresh();
  };
  const onClickRight = () => {
    if (!contentEl.current) return;
    const { scrollWidth, offsetWidth } = contentEl.current;
    contentEl.current.scrollLeft = scrollWidth - offsetWidth;
    refresh();
  };

  useEffect(() => {
    // console.log("【resetEffect】-------》");
    onClickLeft();
  }, [resetEffect]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cx(styles.main, className)} style={style}>
      <div ref={contentEl} className={styles.content}>
        {children}
      </div>
      {isLeftArrow && <div className={styles.arrowLeft} onClick={onClickLeft}></div>}
      {isRightArrow && <div className={styles.arrowRight} onClick={onClickRight}></div>}
    </div>
  );
};

export default AzScrollArrow;
