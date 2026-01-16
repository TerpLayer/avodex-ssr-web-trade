import React, { Fragment, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import store from "store";
import tabCfgAry from "./tabCfgAry";

import AzSvg from "components/az/svg";

import CMPT_Zone from "./zone";
import CMPT_Group from "./group";

import styles from "./index.module.scss";

export interface TabCfgProps {
  key: string;
  label?: string;
  buyCoinAry?: string[];
  group?: string;
  plateId?: number;
  noHidden?: boolean;
}

interface Props {
  tabCfg: TabCfgProps;
  tabChange: (item: TabCfgProps) => void;
}

const Main: React.FC<Props> = ({ tabCfg, tabChange }) => {
  const { isLogin } = store.user;

  const tabCfgAryFormat = useMemo(() => {
    const ary: any = [],
      doc = {};

    tabCfgAry.map((obj) => {
      const { group } = obj;
      if (!group) return ary.push(obj);
      if (!doc[group]) {
        doc[group] = {
          group,
          children: [],
        };
        ary.push(doc[group]);
      }
      doc[group].children.push(obj);
    });

    return ary;
  }, []);

  return (
    <div className={styles.main}>
      {tabCfgAryFormat.map((item) => {
        if (item.key === "user") {
          if (isLogin) {
            return (
              <button key={item.key} className={cx("btnTxt", styles.user, { [styles.atv]: tabCfg.key === "user" })} onClick={() => tabChange(item)}>
                <AzSvg icon={tabCfg.key === "user" ? `star-new-filled` : `star-new-empty`} />
              </button>
            );
          } else {
            return <Fragment key={item.key}></Fragment>;
          }
        }

        if (item.group)
          return (
            <CMPT_Group key={item.group} tabCfg={tabCfg} groupCfg={item} tabChange={tabChange} className={cx({ [styles.atv]: tabCfg.group === item.group })} />
          );
        if (item.key === "zone")
          return <CMPT_Zone key={item.key} tabCfg={tabCfg} tabChange={tabChange} className={cx({ [styles.atv]: tabCfg.key === "zone" })} />;

        return (
          <button key={item.key} className={cx("btnTxt", { [styles.atv]: tabCfg.key === item.key })} onClick={() => tabChange(item)}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default observer(Main);
// export default Main;
