import React, { HTMLAttributes, useMemo } from "react";
import cx from "classnames";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  status?: "success" | "error" | "warn";
}

const Main: React.FC<Props> = ({ children, className, status }) => {
  const cls = useMemo(() => {
    const obj = {
      success: styles.success,
      error: styles.error,
      warn: styles.warn,
    };
    return status ? obj[status] : undefined;
  }, [status]);

  return (
    <div className={cx(styles.main, className)}>
      <i className={cls}></i>
      {children}
    </div>
  );
};

export default Main;
