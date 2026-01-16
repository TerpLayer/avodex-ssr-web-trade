import React, { useCallback } from "react";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;

import { Drawer, DrawerProps } from "antd";
import DatePicker from "./core";

import styles from "./index.module.scss";

interface Props extends DrawerProps {
  dateConfig?: any;
  value?: Date;
  min?: Date;
  max?: Date;
  onSelect?: (arg: Date) => void;
  //
  onClose?: () => void;
}

const Main: React.FC<Props> = ({ value, min, max, dateConfig, onSelect, onClose, ...rest }) => {
  const t = useTranslation();

  const handleSelect = useCallback(
    (time) => {
      onSelect && onSelect(time);
      onClose && onClose();
    },
    [onSelect, onClose]
  );

  return (
    <Drawer className={styles.drawer} closable={false} placement="bottom" height="244px" onClose={onClose} {...rest}>
      <DatePicker
        className={styles.main}
        theme="ios"
        isOpen={true}
        value={value}
        min={min}
        max={max}
        dateConfig={dateConfig}
        onSelect={handleSelect}
        onCancel={onClose}
        confirmText={t("other.confirm")}
        cancelText={t("trade.cancel")}
      />
    </Drawer>
  );
};

export default Main;
