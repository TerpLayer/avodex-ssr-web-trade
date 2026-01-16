import React, { useMemo } from "react";
// import { observer } from "mobx-react-lite";
import cx from "classnames";
// import store from "store";

import type { MenuProps } from "antd";
import { Dropdown } from "antd";

import styles from "./index.module.scss";

import { TabCfgProps } from "../index";

interface GroupCfgProps {
  group: string;
  children: TabCfgProps[];
}
interface Props {
  className?: string;
  tabCfg: TabCfgProps;
  groupCfg: GroupCfgProps;
  tabChange: (item: TabCfgProps) => void;
}

const Main: React.FC<Props> = ({ className, tabCfg, groupCfg, tabChange }) => {
  const atvDoc = useMemo(() => {
    if (tabCfg.group !== groupCfg.group) return;
    return groupCfg.children.find((obj) => obj.key === tabCfg.key);
  }, [tabCfg, groupCfg]);

  const items: MenuProps["items"] = useMemo(() => {
    return groupCfg.children.map((obj) => {
      return {
        key: obj.key,
        label: <a onClick={() => tabChange(obj)}>{obj.label}</a>,
      };
    });
  }, [groupCfg]);

  return (
    <Dropdown
      placement={"bottomRight"}
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      menu={{
        items,
        selectable: true,
        selectedKeys: atvDoc ? [atvDoc.key] : [],
      }}
    >
      <button className={cx("btnTxt btnDrop", styles.trigger, className)} onClick={(e) => e.preventDefault()}>
        <span>{atvDoc ? atvDoc.label : groupCfg.group}</span>
      </button>
    </Dropdown>
  );
};

// export default observer(Main);
export default Main;
