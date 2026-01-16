import React, { HTMLAttributes, useMemo, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// const { getUrl, Big } = Util;
import store from "store";

import AzSvg from "components/az/svg";

import styles from "./index.module.scss";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  const t = useTranslation();
  // const [appState] = useContext(Context.AzContext);
  const { name, currentConfig, tips } = store.market;

  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    setIsOpen(true);
  }, [name]);

  const marketTip = useMemo(() => {
    if (!currentConfig) return;
    return tips[currentConfig.id + ""];
  }, [name, currentConfig, tips]);
  const hasTip = useMemo(() => {
    if (!isOpen) return false;
    if (marketTip && [2, 3].includes(marketTip.tipsType)) return true;
    return false;
  }, [isOpen, marketTip]);

  if (!marketTip || !hasTip) return <></>;

  return (
    <div className={cx(styles.main, className)}>
      <div>
        <AzSvg icon={"alert"} />
        <div>
          <span>{marketTip.content}</span>
          {!!marketTip.link && (
            <a href={marketTip.link} target="_blank" rel="noreferrer">
              {" " + t("trade.diveDeeper")}
            </a>
          )}
        </div>
      </div>
      <button className={"btnTxt btnHover"} onClick={() => setIsOpen(false)}>
        <AzSvg icon={"close"} />
      </button>
    </div>
  );
};

export default observer(Main);
// export default Main;
