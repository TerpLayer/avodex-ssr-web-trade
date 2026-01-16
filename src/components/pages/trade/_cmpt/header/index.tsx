import React from "react";
import { observer } from "mobx-react-lite";
import store from "store";

import CMPT_Symbol from "./symbol";
// import CMPT_MarketTip from "./marketTip";
import CMPT_Ticker from "./ticker";
import CMPT_Theme from "./theme";
import CMPT_Setting from "./setting";

import styles from "./index.module.scss";

const Main: React.FC = () => {
  if (store.app.isH5)
    return (
      <div className={styles.h5}>
        <CMPT_Symbol />
        <CMPT_Ticker />
      </div>
    );

  return (
    <div className={styles.main}>
      <div className={styles.left}>
        <CMPT_Symbol />
        {/*<CMPT_MarketTip />*/}
        <CMPT_Ticker />
      </div>

      <div className={styles.right}>
        {/*<CMPT_Theme />*/}
        <CMPT_Setting />
      </div>
    </div>
  );
};

export default observer(Main);
// export default Main;
