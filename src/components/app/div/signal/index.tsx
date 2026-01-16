import React, { HTMLAttributes } from "react";
// import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { Hooks } from "@az/base";
// const { useTranslation } = Hooks;
// import store from "store";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  value?: number; //[0, 100]
  atvColor?: string;
}

const Main: React.FC<Props> = ({ value = 100, atvColor, className }) => {
  // const t = useTranslation();
  // const {isLogin} = store.user;

  return (
    <div className={cx(styles.main, className)}>
      <div style={{ color: value > 0 ? atvColor : undefined }}></div>
      <div style={{ color: value > 25 ? atvColor : undefined }}></div>
      <div style={{ color: value > 50 ? atvColor : undefined }}></div>
      <div style={{ color: value > 75 ? atvColor : undefined }}></div>
    </div>
  );
};

// export default observer(Main);
export default Main;
