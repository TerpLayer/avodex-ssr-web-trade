import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";

import { Dropdown, MenuProps } from "antd";

import styles from "./index.module.scss";

import { TabCfgProps } from "../index";

interface Props {
  className?: string;
  tabCfg: TabCfgProps;
  tabChange: (item: TabCfgProps) => void;
}

const Main: React.FC<Props> = ({ className, tabCfg, tabChange }) => {
  const t = useTranslation();

  const { plateList } = store.market;

  useEffect(() => {
    if (!plateList.length) store.market.getPlateList();
  }, []);

  const showPlateList = useMemo(() => {
    //过滤 ETF 板块
    return plateList.filter((obj) => obj.id !== "145");
  }, [plateList]);

  const atvDoc = useMemo(() => {
    const { key, plateId } = tabCfg;
    if (key !== "zone" || (!plateId && plateId !== 0)) return;
    return showPlateList.find((obj) => obj.id === plateId + "");
  }, [tabCfg, showPlateList]);

  const label = useMemo(() => {
    return atvDoc ? atvDoc.plate || atvDoc.id : t("trade.zone");
  }, [atvDoc]);

  const items: MenuProps["items"] = useMemo(() => {
    return showPlateList.map((obj) => {
      return {
        key: obj.id,
        label: (
          <a
            onClick={() =>
              tabChange({
                key: "zone",
                plateId: +obj.id,
              })
            }
          >
            {obj.plate}
          </a>
        ),
      };
    });
  }, [showPlateList]);

  return (
    <Dropdown
      placement={"bottomRight"}
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      menu={{
        items,
        selectable: true,
        selectedKeys: atvDoc ? [atvDoc.id] : [],
      }}
    >
      <button className={cx("btnTxt btnDrop", styles.trigger, className)} onClick={(e) => e.preventDefault()}>
        <span>{label}</span>
      </button>
    </Dropdown>
  );
};

export default observer(Main);
