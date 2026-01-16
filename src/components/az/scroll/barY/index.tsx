import React, { PropsWithChildren } from "react";
import cx from "classnames";
import PerfectScrollbar from "react-perfect-scrollbar";

import styles from "./index.module.scss";

interface Props {
  noWrap?: boolean;
  className?: string;
  // style?: any;
  [key: string]: any;
}

const AzScrollBarY: React.FC<PropsWithChildren<Props>> = ({ children, noWrap, className, ...rest }) => {
  return (
    <div className={cx(styles.main, [noWrap ? styles.noWrap : ""], className)}>
      {noWrap ? (
        children
      ) : (
        <PerfectScrollbar options={{ suppressScrollX: true }} {...rest}>
          {children}
        </PerfectScrollbar>
      )}
    </div>
  );
};

// AzScrollBarY.displayName = 'AzScrollBarY';

export default AzScrollBarY;
