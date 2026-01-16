import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Tooltip } from "antd";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";

import AzSvg from "components/az/svg";

import styles from "./index.module.scss";

const Main: React.FC = () => {
  const t = useTranslation();
  const { currentConfig, tips } = store.market;

  const marketTip = useMemo(() => {
    if (!currentConfig) return;
    return tips[currentConfig.id + ""];
  }, [currentConfig, tips]);

  if (!marketTip || ![1, 3].includes(marketTip.tipsType)) return <></>;

  return (
    <Tooltip
      placement="bottomLeft"
      arrowPointAtCenter={true}
      title={
        <div className={styles.content}>
          <span>{marketTip.content}</span>
          {!!marketTip.link && (
            <a href={marketTip.link} target="_blank" rel="noreferrer">
              {" " + t("trade.diveDeeper")}
            </a>
          )}
        </div>
      }
    >
      <div className={styles.target}>
        <AzSvg icon={"alert"} />
      </div>
    </Tooltip>
  );
};

export default observer(Main);
