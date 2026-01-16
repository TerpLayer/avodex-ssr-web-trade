import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import store from "store";
import { getChildrenSlot } from "utils/method";

import CMPT_Classic from "./classic";
import CMPT_Advanced from "./advanced";
import CMPT_Fullscreen from "./fullscreen";
import CMPT_h5 from "./h5";

import styles from "./index.module.scss";
import styles_classic from "./classic/index.module.scss";
import styles_advanced from "./advanced/index.module.scss";
import styles_fullscreen from "./fullscreen/index.module.scss";
import { LayoutEnum } from "store/app";
const Main: React.FC<PropsWithChildren> = ({ children }) => {
  const { isH5 } = store.app;

  const slots = getChildrenSlot(children);

  const layCls = useMemo(() => {
    const obj = {
      [LayoutEnum.classic]: styles_classic,
      [LayoutEnum.advanced]: styles_advanced,
      [LayoutEnum.fullscreen]: styles_fullscreen,
    };
    return obj[store.app.layout];
  }, [store.app.layout]); // eslint-disable-line react-hooks/exhaustive-deps

  const [initStyle, setInitStyle] = useState<any>({
    flexBasis: "calc(100vh - 60px)",
    overflow: "hidden",
  });
  useEffect(() => {
    setInitStyle(undefined);
  }, []);

  return !isH5 ? (
    <div data-layout={store.app.layout} className={cx(styles.main, layCls.main)} style={initStyle}>
      {slots.maintainTip}
      <div className={styles.header}>{slots.header}</div>
      {store.app.layout === LayoutEnum.classic && <CMPT_Classic>{children}</CMPT_Classic>}
      {store.app.layout === LayoutEnum.advanced && <CMPT_Advanced>{children}</CMPT_Advanced>}
      {store.app.layout === LayoutEnum.fullscreen && <CMPT_Fullscreen>{children}</CMPT_Fullscreen>}
    </div>
  ) : (
    <CMPT_h5>{children}</CMPT_h5>
  );
};

export default observer(Main);
