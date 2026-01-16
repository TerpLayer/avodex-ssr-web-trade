import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { getUrl } = Util;
import store from "store";

import { Tooltip } from "antd";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className, children }) => {
  const t = useTranslation();
  const { isLogin } = store.user;

  if (!isLogin) return <></>;
  return (
    <div className={cx(styles.main, className)}>
      <div>
        {/* <Tooltip
          placement="topLeft"
          overlayStyle={{ maxWidth: "250px" }}
          title={
            <div className={cx(styles.tipCon)}>
              <span>{t("trade.estimatedFeeTips")}</span>
              <a href={getUrl("/rate")} className={cx(styles.link)}>
                {t("trade.diveDeeper")}
              </a>
            </div>
          }
        >
        </Tooltip> */}
        <span className={cx(styles.trigger)}>{t("trade.estimatedFee")}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default observer(Main);
// export default Main;
