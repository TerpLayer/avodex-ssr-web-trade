import React, { ReactNode, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import cx from "classnames";

import styles from "./index.module.scss";

import AzInputNumber, { AzInputNumberRefProps, AzInputNumberProps } from "components/az/input/number";

interface AppInputNumberProps extends Omit<AzInputNumberProps, "prefix" | "onBlur"> {
  classInput?: string;
  disabled?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  isErr?: boolean;
  noBtns?: boolean;
  noHandleSuffixEvent?: boolean;
  onBlur?: (e: EventTarget) => void;
}

const AppInputNumber = React.forwardRef<AzInputNumberRefProps, AppInputNumberProps>(
  ({ className, classInput, disabled = false, prefix, suffix, isErr, noBtns, noHandleSuffixEvent, onBlur, ...rest }, ref) => {
    const refInput = useRef<AzInputNumberRefProps>(null);
    const [isFocus, setIsFocus] = useState(false);

    const onIncrease = useCallback(() => {
      if (refInput.current && refInput.current.increase) refInput.current.increase();
    }, []);
    const onDecrease = useCallback(() => {
      if (refInput.current && refInput.current.decrease) refInput.current.decrease();
    }, []);

    const clsStatus = useMemo(() => {
      if (isErr) return styles.err;
      if (isFocus) return styles.atv;
    }, [isErr, isFocus]);

    const interval = useRef<number>();
    const once = useCallback((event, fn) => {
      const listener = function () {
        fn && fn();
        document.removeEventListener(event, listener);
      };
      document.addEventListener(event, listener);
    }, []);
    const handleMouseDown = useCallback((fn) => {
      const startTime = Date.now();
      once("mouseup", () => {
        if (Date.now() - startTime < 100) {
          fn();
        }
        if (interval.current) {
          clearInterval(interval.current);
          interval.current = 0;
        }
      });
      interval.current && clearInterval(interval.current);
      interval.current = window.setInterval(fn, 100);
    }, []);
    const handleKeyDown = useCallback((e, fn) => {
      e.stopPropagation();
      const keyName = e.key;
      if (keyName === "Enter" || keyName === " ") {
        fn();
        e.preventDefault();
      }
    }, []);
    const handleBlur = useCallback(
      (e) => {
        setIsFocus(false);
        onBlur && onBlur(e);
      },
      [onBlur]
    );
    useEffect(() => {
      return () => {
        if (interval.current) {
          clearInterval(interval.current);
          interval.current = 0;
        }
      };
    }, []);

    const handleSuffixEvent = () => {
      if (noHandleSuffixEvent) return;
      refInput.current && refInput.current.focus();
    };

    useImperativeHandle(ref, (): any => refInput.current, []);

    return (
      <div className={cx(styles.main, clsStatus, className)} aria-disabled={disabled}>
        <div className={styles.content}>
          {!!prefix && <div className={styles.prefix}>{prefix}</div>}
          <AzInputNumber
            ref={refInput}
            className={cx(styles.input, classInput)}
            onFocus={() => setIsFocus(true)}
            onBlur={handleBlur}
            disabled={disabled}
            {...rest}
          />
          {!!suffix && (
            <div className={styles.suffix} onClick={handleSuffixEvent}>
              {suffix}
            </div>
          )}
        </div>
        {!noBtns && (
          <div className={styles.btns}>
            <button
              disabled={disabled}
              className={cx("btnTxt", styles.btnUp)}
              onKeyDown={(e) => handleKeyDown(e, onIncrease)}
              onMouseDown={() => handleMouseDown(onIncrease)}
              onBlur={handleBlur}
            >
              <span></span>
            </button>
            <span></span>
            <button
              disabled={disabled}
              className={cx("btnTxt", styles.btnDown)}
              onKeyDown={(e) => handleKeyDown(e, onDecrease)}
              onMouseDown={() => handleMouseDown(onDecrease)}
              onBlur={handleBlur}
            >
              <span></span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

AppInputNumber.displayName = "AppInputNumber";

export default AppInputNumber;
