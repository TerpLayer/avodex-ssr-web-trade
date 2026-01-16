import React, { HTMLAttributes, useMemo, useState, useCallback } from "react";
// import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment } = Util;
// import store from "store";

import { DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
const { RangePicker } = DatePicker;

import styles from "./index.module.scss";

interface SearchProps {
  startTime: number;
  endTime: number;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  onSearch?: (arg: SearchProps) => void;
}

const Main: React.FC<Props> = ({ className, disabled = false, onSearch }) => {
  const t = useTranslation();
  // const { isLogin } = store.user;

  const [select, setSelect] = useState<{ type: "btn"; data: number } | { type: "date"; data: moment.Moment[] }>({ type: "btn", data: 30 });

  const dateValue = useMemo(() => {
    if (select.type !== "date") return [];
    return select.data;
  }, [select]);
  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    if (!current) return false;
    if (current < moment().add(-90, "days").startOf("day")) return true;
    if (current > moment().endOf("day")) return true;
    return false;
  };

  const handleDateChange = useCallback((date) => {
    // console.log({ date, dateString });
    if (!date) return;
    setSelect({
      type: "date",
      data: date,
    });
  }, []);

  const handleSearch = useCallback(
    (newSelect?) => {
      const currentSelect = newSelect || select;
      newSelect && setSelect(newSelect);
      let send;
      if (currentSelect.type === "btn") {
        send = {
          startTime: moment()
            .subtract(currentSelect.data - 1, "days")
            .startOf("day")
            .valueOf(),
          endTime: moment().endOf("day").valueOf(),
        };
      } else {
        send = {
          startTime: currentSelect.data[0].startOf("day").valueOf(),
          endTime: currentSelect.data[1].endOf("day").valueOf(),
        };
      }
      // console.log(send);
      onSearch && onSearch(send);
    },
    [select, onSearch]
  );
  const handleReset = useCallback(() => {
    handleSearch({
      type: "btn",
      data: 30,
    });
  }, [handleSearch]);

  return (
    <div className={cx(styles.main, className)}>
      <button
        disabled={disabled}
        className={cx("btnTxt", styles.lab, { [styles.atv]: select.data === 7 })}
        onClick={() => handleSearch({ type: "btn", data: 7 })}
      >
        {t("trade.last7days")}
      </button>
      <button
        disabled={disabled}
        className={cx("btnTxt", styles.lab, { [styles.atv]: select.data === 30 })}
        onClick={() => handleSearch({ type: "btn", data: 30 })}
      >
        {t("trade.last30days")}
      </button>
      <button
        disabled={disabled}
        className={cx("btnTxt", styles.lab, { [styles.atv]: select.data === 90 })}
        onClick={() => handleSearch({ type: "btn", data: 90 })}
      >
        {t("trade.last90days")}
      </button>

      <RangePicker
        disabled={disabled}
        size={"middle"}
        allowClear={false}
        format="YYYY-MM-DD"
        disabledDate={disabledDate}
        value={dateValue as any}
        onChange={handleDateChange}
      />

      <button disabled={disabled} className={cx("btnTxt", styles.btn, styles.btnSearch)} onClick={() => handleSearch()}>
        {t("trade.search")}
      </button>
      <button disabled={disabled} className={cx("btnTxt", styles.btn, styles.btnReset)} onClick={handleReset}>
        {t("trade.reset")}
      </button>
    </div>
  );
};

// export default observer(Main);
export default Main;
