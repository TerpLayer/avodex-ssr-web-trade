import React, { HTMLAttributes } from "react";
// import { observer } from "mobx-react-lite";
// import store from "store";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  option: any;
  setOption: any;
}

const Main: React.FC<Props> = () => {
  return (
    <div className={styles.main}>
      <div data-target="itb-widget" data-type="powered-by"></div>
    </div>
  );
};

// export default observer(Main);
export default Main;
