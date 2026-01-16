import React, { useMemo } from "react";
// import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import { thousands } from "utils/method";

import styles from "./index.module.scss";

import defaultIcon from "assets/img/icon404.png";
// const defaultIcon = require("assets/img/icon404.png");

import AppDropdown, { AppDropdownProps, AppDropdownItemProps } from "components/app/dropdown";

export interface DropdownCurrencyItemProps {
  key: string;
  fullName?: string;
  logo?: string;
  availableAmount?: string;
  convertAmount?: string;
  convertAmountStr?: string;
}

interface Props extends AppDropdownProps {
  value: string;
  items: DropdownCurrencyItemProps[];
  onChange: (arg) => void;
}

const IconLabel: React.FC<{ name: string; fullName?: string; logo?: string; className?: string }> = ({ name, fullName, logo, className }) => {
  return (
    <div className={cx(styles.iconLabel, className)}>
      {/*eslint-disable-next-line  @next/next/no-img-element*/}
      <img src={logo || defaultIcon} alt={"coin logo"} />
      <b>{store.currency.getCurrencyDisplayName(name)}</b>
      <small>{fullName}</small>
    </div>
  );
};

const Main: React.FC<Props> = ({ value, items, onChange, ...rest }) => {
  const t = useTranslation();
  // const { isLogin } = store.user;

  const itemsFormat = useMemo(() => {
    const ary: AppDropdownItemProps[] = [];

    items.map(({ key, fullName, logo, availableAmount, convertAmountStr }) => {
      ary.push({
        key,
        label: (
          <div className={cx(styles.li, { [styles.liAtv]: key === value })}>
            <IconLabel name={key} fullName={fullName} logo={logo} />
            <div className={styles.liRight}>
              <div>{thousands(availableAmount || 0)}</div>
              <small>{convertAmountStr}</small>
            </div>
          </div>
        ),
        keyword: fullName,
      });
    });

    return ary;
  }, [value, items]);
  const atvItem = useMemo(() => {
    if (value === undefined || !items || !items.length) return;
    return items.find((obj) => obj.key === value);
  }, [value, items]);

  return (
    <AppDropdown
      value={value}
      items={itemsFormat}
      triggerLabel={
        atvItem ? (
          <IconLabel name={atvItem.key} fullName={atvItem.fullName} logo={atvItem.logo} className={styles.trigger} />
        ) : (
          <span className={styles.noData}>{t("trade.noData")}</span>
        )
      }
      onChange={onChange}
      itemHeight={50}
      {...rest}
    />
  );
};

// export default observer(Main);
export default Main;
