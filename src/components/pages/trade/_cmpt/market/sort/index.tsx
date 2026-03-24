import React, { useCallback, useState } from "react";
// import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import store from "store";

import AzSvg from "components/az/svg";

import styles from "./index.module.scss";

interface Props {
  sortBy: string | undefined;
  onChange: (item: string | undefined) => void;
  isShowVolume: boolean;
  setIsShowVolume: (arg: boolean) => void;
}

const Main: React.FC<Props> = ({ sortBy, onChange, isShowVolume, setIsShowVolume }) => {
  const t = useTranslation();

  const getCls = useCallback(
    (attr) => {
      if (!sortBy) return;
      const ary = sortBy.split("_");
      if (attr !== ary[0]) return;
      return ary[1];
    },
    [sortBy]
  );

  const onClick = useCallback(
    (attr) => {
      let value;
      if (!sortBy) {
        value = attr + "_down";
      } else {
        const ary = sortBy.split("_");
        if (attr !== ary[0]) {
          value = attr + "_down";
        } else {
          if (ary[1] === "down") {
            value = attr + "_up";
          } else {
            value = "";
          }
        }
      }

      onChange(value);
    },
    [sortBy]
  );

  return (
    <div className={styles.main}>
      <div>
        <button className={cx("btnTxt", styles.btnFilter, getCls("name"))} onClick={() => onClick("name")}>
          {t("trade.pairs")}
        </button>
      </div>
      <div>
        <button className={cx("btnTxt", styles.btnFilter, getCls("price"))} onClick={() => onClick("price")}>
          {t("trade.lastPrice")}
        </button>
      </div>
      <div>
        <button className={cx("btnTxt", styles.btnFilter, getCls("volume"))} onClick={() => onClick("volume")}>
          {t("trade.volume")}
        </button>
      </div>
      <div>
        <button className={cx("btnTxt", styles.btnFilter, getCls("rate"))} onClick={() => onClick("rate")}>
          {t("trade.change")}
        </button>
      </div>
      {/* <button className={cx("btnTxt")} onClick={() => setIsShowVolume(!isShowVolume)}>
          <AzSvg icon={"transfer"} />
        </button> */}
    </div>
  );
};

// export default observer(Main);
export default Main;
