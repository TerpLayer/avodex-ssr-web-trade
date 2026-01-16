import React, { PropsWithChildren, HTMLAttributes, useRef, useEffect } from "react";
import cx from "classnames";

import styles from "./index.module.scss";

interface AzFontScaleProps extends HTMLAttributes<HTMLDivElement> {
  isLoop?: boolean; //是否每次渲染都执行
  subElClass?: string;
}

const AzFontScale: React.FC<PropsWithChildren<AzFontScaleProps>> = ({ children, isLoop, subElClass, className, ...rest }) => {
  const el = useRef<HTMLDivElement>(null);
  const elSub = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      // console.log("FontScale useEffect");
      if (!el.current || !elSub.current) return;
      if (!elSub.current.offsetWidth) return;
      const ratio = el.current.offsetWidth / elSub.current.offsetWidth;
      if (ratio < 1) {
        elSub.current.style.transform = `scale(${ratio})`;
        elSub.current.style.transformOrigin = "0 50%";
      } else {
        elSub.current.style.removeProperty("transform");
        elSub.current.style.removeProperty("transformOrigin");
      }
    },
    isLoop ? undefined : []
  );

  return (
    <div ref={el} className={cx(styles.main, className)} {...rest}>
      <div ref={elSub} className={cx(styles.sub, subElClass)}>
        {children}
      </div>
    </div>
  );
};

export default AzFontScale;
