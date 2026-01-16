import React, { ReactNode } from "react";
import cx from "classnames";

import AzScrollArrow from "components/az/scroll/arrow";

import styles from "./index.module.scss";

export interface ItemProps {
  key: string;
  label: ReactNode;
}

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onClick"> {
  activeKey?: string;
  items: ItemProps[];
  onChange?: (activeKey: string, item: ItemProps) => void;
  onClick?: (activeKey: string, item: ItemProps) => void;
  isArrow?: boolean; //是否显示箭头容器
  resetEffect?: any;
}

const AzTabs: React.FC<Props> = ({ activeKey, items, onChange, onClick, isArrow, resetEffect, children, className, ...rest }) => {
  let atvKey = activeKey;
  if (!atvKey && items.length === 1) {
    atvKey = items[0].key;
  }

  const itemAry = items.map((item) => {
    return (
      <button
        key={item.key}
        className={cx("btnTxt", styles.btn, { [styles.only]: items.length === 1, [styles.atv]: item.key === atvKey })}
        onClick={() => {
          onClick && onClick(item.key, item);
          onChange && atvKey !== item.key && onChange(item.key, item);
        }}
      >
        {item.label}
      </button>
    );
  });

  return (
    <div className={cx(styles.main, className)} {...rest}>
      {isArrow ? <AzScrollArrow resetEffect={resetEffect}>{itemAry}</AzScrollArrow> : <div>{itemAry}</div>}
      <div>{children}</div>
    </div>
  );
};

export default AzTabs;
