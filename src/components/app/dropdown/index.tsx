import React, { useMemo, useState, ReactNode } from "react";
// import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import store from "store";

import { Dropdown, DropdownProps } from "antd";
import AzInputSearch from "components/az/input/search";
import AzScrollWindow from "components/az/scroll/window";

import styles from "./index.module.scss";

type KeyType = string | number;

export interface AppDropdownItemProps extends ObjAny {
  key: KeyType;
  label?: ReactNode; //列表内容
  keyword?: string; //搜索关键词
}

export interface AppDropdownProps extends DropdownProps {
  value?: KeyType;
  onChange?: (arg) => void;
  triggerLabel?: ReactNode;
  items?: AppDropdownItemProps[];
  itemHeight?: number; //单个列表高度
  maxHeight?: number; //最大列表高度
  placeholder?: string;
}

const WindowUl: React.FC<any> = ({ startIndex, record, value, onChange, height, hide }) => {
  return record.map((item: AppDropdownItemProps, index) => {
    return (
      <button
        key={item.key}
        className={cx("btnTxt ant-dropdown-menu-item", styles.li, { "ant-dropdown-menu-item-selected": value === item.key })}
        style={{ height: height, top: (startIndex + index) * height + "px" }}
        onClick={(e) => {
          e.stopPropagation();
          onChange && onChange(item.key);
          hide && hide();
        }}
      >
        {item.label}
      </button>
    );
  });
};

const Main: React.FC<AppDropdownProps> = ({ value, onChange, triggerLabel, items = [], itemHeight = 32, maxHeight = 200, placeholder, ...rest }) => {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const itemsFormat = useMemo(() => {
    if (!keyword) return items;
    const str = keyword.replace(/\//g, "_").replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    const ary: AppDropdownItemProps[] = [];
    items.map((item) => {
      if (!item.key) return ary.push(item);
      if (
        new RegExp(str, "i").test(item.key + "") ||
        (item.keyword && new RegExp(str, "i").test(item.keyword)) ||
        (typeof item.label === "string" && new RegExp(str, "i").test(item.label))
      )
        ary.push(item);
    });
    return ary;
  }, [keyword, items]);
  const atvItem = useMemo(() => {
    if (value === undefined || !items || !items.length) return;
    return items.find((obj) => obj.key === value);
  }, [value, items]);

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      overlayClassName={styles.main}
      // getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      dropdownRender={() => {
        return (
          <div className={styles.dropdownRender}>
            <div className={styles.search}>
              <AzInputSearch value={keyword} onInput={setKeyword} placeholder={placeholder || t("trade.search")} />
            </div>
            <AzScrollWindow
              className={styles.AzScrollWindow}
              style={{ maxHeight }}
              height={itemHeight}
              dataAry={itemsFormat}
              defaultWinHeight={maxHeight}
              isDisableObserver={true}
            >
              <WindowUl value={value} onChange={onChange} height={itemHeight} hide={() => setOpen(false)} />
            </AzScrollWindow>
          </div>
        );
      }}
      {...rest}
    >
      <button className={cx("btnTxt btnDrop", styles.trigger)} onClick={(e) => e.preventDefault()}>
        {triggerLabel || (atvItem && atvItem.label)}
      </button>
    </Dropdown>
  );
};

// export default observer(Main);
export default Main;
