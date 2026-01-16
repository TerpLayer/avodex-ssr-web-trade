import React, { InputHTMLAttributes, useCallback, useImperativeHandle, useRef } from "react";
import cx from "classnames";
import Big from "big.js";

import styles from "./index.module.scss";

export interface AzInputNumberRefProps extends HTMLInputElement {
  increase: () => void;
  decrease: () => void;
  focus: () => void;
}

export interface AzInputNumberProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onInput" | "autoComplete"> {
  disabled?: boolean;
  disabledLabel?: string;
  max?: number;
  min?: number;
  point?: number; //保留几位小数
  isStepPoint?: boolean; //单步是否是point
  step?: string | number; //单步执行
  onInput?: (val: string) => void;
  autoComplete?: string;
}

const AzInputNumber = React.forwardRef<AzInputNumberRefProps, AzInputNumberProps>(
  (
    { className, value, disabled = false, disabledLabel, max = Infinity, min = 0, point, isStepPoint, step, onInput, autoComplete = "new-password", ...rest },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const $emit = useCallback(
      (val) => {
        onInput && onInput(val);
      },
      [onInput]
    );

    const handleInput = useCallback(
      (e) => {
        // console.log("handleInput===", e);
        // debugger;
        if (disabledLabel) return;
        const newVal = e.target.value;

        if (newVal === "") return $emit(newVal);

        console.log({ newVal, max, min });
        if (max < 0 && !/^-/.test(newVal)) return;

        if (/^-/.test(newVal)) {
          if (min >= 0) return;
          if (newVal === "-") return $emit(newVal);
          if (!/^-[0-9]+\.?[0-9]*$/.test(newVal)) return;
          if (/^-0/.test(newVal) && !/^-0(\.|$)/.test(newVal)) return;
        } else {
          if (!/^[0-9]+\.?[0-9]*$/.test(newVal)) return;
          if (/^0/.test(newVal) && !/^0(\.|$)/.test(newVal)) return;
        }

        //数字检测
        // if (!/^[0-9]+\.?[0-9]*$/.test(newVal)) return;
        //如果0开头
        // if (/^0/.test(newVal) && !/^0(\.|$)/.test(newVal)) return;
        //判断有效位数
        if (typeof point === "number" && /\./.test(newVal)) {
          if (newVal.split(".")[1].length > point) return;
        }
        //判断数值是否在有效区间内
        const numValue = Number(newVal);
        if (numValue > max) return $emit(max + "");
        if (numValue < min) return $emit(min + "");

        $emit(newVal);
      },
      [$emit, disabledLabel, point, max, min]
    );

    const change = useCallback(
      (num) => {
        let _step: number | string = 1;
        let fixLen;

        if (point && isStepPoint) {
          fixLen = point;
          _step = "0." + "0".repeat(point - 1) + "1";
        } else if (step) {
          _step = step;
          const decimalStep = Big(step).toFixed().split(".")[1];
          const decimalValue = ((value || "") + "").split(".")[1];
          if (decimalStep || decimalValue) {
            fixLen = Math.max(decimalStep ? decimalStep.length : 0, decimalValue ? decimalValue.length : 0);
          }
        } else {
          const decimal = ((value || "") + "").split(".")[1];
          if (decimal) {
            fixLen = decimal.length;
            _step = "0." + "0".repeat(decimal.length - 1) + "1";
          }
        }

        if (fixLen && point && fixLen > point) fixLen = point;

        const newVal = Big((value as number | string) || 0)
          .plus(Big(_step).times(num))
          .toFixed(fixLen);

        $emit(newVal);
      },
      [step, point, isStepPoint, value, $emit]
    );
    const increase = useCallback(() => {
      if (disabled) return;
      if (+(value || 0) >= max) return;
      change(1);
    }, [disabled, value, max, change]);
    const decrease = useCallback(() => {
      if (disabled) return;
      if (+(value || 0) <= min) return;
      change(-1);
    }, [disabled, value, min, change]);

    const handleKeyDown = useCallback(
      (e) => {
        // console.log("handleKeyDown");
        e.stopPropagation();
        // e.preventDefault();
        const keyName = e.key;
        if (keyName === "ArrowUp") {
          increase();
          e.preventDefault();
        } else if (keyName === "ArrowDown") {
          decrease();
          e.preventDefault();
        }
      },
      [increase, decrease]
    );

    useImperativeHandle(
      ref,
      (): any => {
        return {
          increase,
          decrease,
          focus: () => {
            if (!inputRef.current) return;
            inputRef.current.focus();
            const value = inputRef.current.value;
            inputRef.current.value = "";
            inputRef.current.value = value;
          },
        };
      },
      [increase, decrease]
    );

    return (
      <input
        ref={inputRef}
        className={cx(styles.main, className)}
        inputMode={"decimal"}
        value={disabledLabel || value}
        disabled={disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    );
  }
);

AzInputNumber.displayName = "AzInputNumber";

export default AzInputNumber;
