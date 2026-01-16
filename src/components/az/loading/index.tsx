import React from "react";

import styles from "./index.module.scss";
import cx from "classnames";

interface Props {
  className?: string;
  style?: any;
}

const AzLoading: React.FC<Props> = ({ style, className }) => {
  return (
    <div className={cx(styles.main, className)} style={style}>
      <div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default AzLoading;
