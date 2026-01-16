import React, { InputHTMLAttributes, LegacyRef } from "react";
import cx from "classnames";

import styles from "./index.module.scss";

export interface AzInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onInput" | "autoComplete"> {
  innerRef?: LegacyRef<HTMLInputElement>;
  trim?: boolean;
  onInput?: (val: string) => void;
  autoComplete?: string;
}

const AzInput: React.FC<AzInputProps> = ({ innerRef, className, value, onInput, autoComplete = "new-password", trim = true, ...rest }) => {
  // const lock = useRef<boolean>(false);

  /*
  const handleCompositionStart = useCallback(() => {
    lock.current = true;
  }, []);
  const handleCompositionEnd = useCallback(() => {
    //react bug, not call
    lock.current = false;
  }, []);
  */

  const handleInput = (e) => {
    // if (lock.current) return;
    const { value } = e.target;
    onInput && onInput(trim ? value.trim() : value);
  };

  return (
    <input
      ref={innerRef}
      className={cx(styles.main, className)}
      value={value}
      autoComplete={autoComplete}
      // onCompositionStart={handleCompositionStart}
      // onCompositionEnd={handleCompositionEnd}
      onInput={handleInput}
      {...rest}
    />
  );
};

export default AzInput;
