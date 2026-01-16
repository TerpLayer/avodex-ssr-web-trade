import React, { useMemo } from "react";
import cx from "classnames";

import AzSvg from "components/az/svg";
import AzInput, { AzInputProps } from "components/az/input";

import styles from "./index.module.scss";

// interface AzInputSearchProps extends AzInputProps {}

const AzInputSearch: React.FC<AzInputProps> = ({ style, className, value, onInput, ...rest }) => {
  const hasValue = useMemo(() => {
    if (value === 0) return true;
    return !!value;
  }, [value]);
  const onClear = () => {
    onInput && onInput("");
  };

  return (
    <div className={cx(styles.main, className)} style={style}>
      <AzSvg icon={`search`} />
      <AzInput className={styles.input} value={value} onInput={onInput} {...rest} />

      {hasValue && (
        <button onClick={onClear} className={"btnTxt"}>
          <AzSvg icon={`close`} />
        </button>
      )}
    </div>
  );
};

export default AzInputSearch;
