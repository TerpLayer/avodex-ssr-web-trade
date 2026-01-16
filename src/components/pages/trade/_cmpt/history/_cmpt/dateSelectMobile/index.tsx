import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks, Util } from "@az/base";
const { useTranslation } = Hooks;
const { moment } = Util;
// import store from "store";

import DatePicker from "components/react-mobile-datepicker/index";

import styles from "./index.module.scss";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  startTime: number;
  setStartTime: (arg: number) => void;
  endTime: number;
  setEndTime: (arg: number) => void;
}

const Main: React.FC<Props> = ({ startTime, setStartTime, endTime, setEndTime }) => {
  const t = useTranslation();

  const startTimeLab = useMemo(() => {
    if (!startTime) return "";
    return moment(startTime).format("YYYY-MM-DD");
  }, [startTime]);
  const endTimeLab = useMemo(() => {
    if (!endTime) return "";
    return moment(endTime).format("YYYY-MM-DD");
  }, [endTime]);

  const [open, setOpen] = useState(false);
  const [time, setTime] = useState<Date>();
  const [min, setMin] = useState<Date>();
  const [max, setMax] = useState<Date>();

  const type = useRef<string>();

  const handleOpen = useCallback((time) => {
    setTime(new Date(time));
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);
  const handleSelect = useCallback((date) => {
    const timestamp = date.valueOf();
    // console.log(date, timestamp);
    if (type.current === "start") {
      setStartTime(timestamp);
    } else if (type.current === "end") {
      setEndTime(timestamp);
    }
  }, []);

  const handleClickBtnStart = useCallback(() => {
    type.current = "start";
    handleOpen(startTime);

    const todayEnd = moment().endOf("day").valueOf();
    const max = Math.min(endTime, todayEnd);
    const min = moment(max).add(-90, "days").startOf("day").valueOf();
    setMax(new Date(max));
    setMin(new Date(min));
  }, [startTime, endTime, handleOpen]);
  const handleClickBtnEnd = useCallback(() => {
    type.current = "end";
    handleOpen(endTime);

    const todayEnd = moment().endOf("day").valueOf();
    const end = moment(startTime).add(90, "days").endOf("day").valueOf();
    const max = Math.min(todayEnd, end);
    setMax(new Date(max));
    setMin(new Date(startTime));
  }, [startTime, endTime, handleOpen]);

  return (
    <>
      <div className={styles.main}>
        <p>{t("trade.date")}</p>
        <div>
          <button className={cx("btnTxt")} onClick={handleClickBtnStart}>
            {startTimeLab}
          </button>
          <span>{t("trade.to")}</span>
          <button className={cx("btnTxt")} onClick={handleClickBtnEnd}>
            {endTimeLab}
          </button>
        </div>
      </div>
      <DatePicker open={open} value={time} min={min} max={max} onClose={handleClose} onSelect={handleSelect} />
    </>
  );
};

export default observer(Main);
// export default Main;
