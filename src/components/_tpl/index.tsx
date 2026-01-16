import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { Hooks } from "@az/base";
// const { useTranslation } = Hooks;
// import store from "store";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  // const t = useTranslation();
  // const {isLogin} = store.user;

  return (
    <div className={cx(styles.main, className)}>
      <div>template</div>
    </div>
  );
};

export default observer(Main);
// export default Main;
