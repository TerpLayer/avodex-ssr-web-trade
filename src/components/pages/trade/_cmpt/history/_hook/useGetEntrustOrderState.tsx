import React, { useMemo } from "react";
import { Hooks } from "@az/base";
import { EntrustOrderProps, EntrustOrderStateEnum } from "store/entrustOrder";
import { MenuProps } from "antd";

import useGetEntrustOrderStateLab from "./useGetEntrustOrderStateLab";

const { useTranslation } = Hooks;

interface InputProps {
  state?: "" | EntrustOrderStateEnum;
  setState?: (arg: "" | EntrustOrderStateEnum) => void;
}

interface OutputProps {
  stateLabelObj: object;
  getStateLabel: (arg: EntrustOrderProps | EntrustOrderStateEnum) => string;
  getStateCls: (arg: EntrustOrderProps | EntrustOrderStateEnum) => "success" | "error" | "warn" | undefined;
  dropdownItemsState: MenuProps["items"];
  dropdownLabelState: string;
}

const useGetEntrustOrderState: (arg: InputProps) => OutputProps = ({ state, setState }) => {
  const t = useTranslation();

  const { stateLabelObj, getStateLabel, getStateCls } = useGetEntrustOrderStateLab();

  const dropdownItemsState: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "",
        label: <a onClick={() => setState && setState("")}>{t("trade.all")}</a>,
      },
      // {
      //   key: EntrustOrderStateEnum.NEW,
      //   label: <a onClick={() => setState && setState(EntrustOrderStateEnum.NEW)}>{getStateLabel(EntrustOrderStateEnum.NEW)}</a>,
      // },
      {
        key: EntrustOrderStateEnum.TRIGGERED,
        label: <a onClick={() => setState && setState(EntrustOrderStateEnum.TRIGGERED)}>{getStateLabel(EntrustOrderStateEnum.TRIGGERED)}</a>,
      },
      {
        key: EntrustOrderStateEnum.EXPIRED,
        label: <a onClick={() => setState && setState(EntrustOrderStateEnum.EXPIRED)}>{getStateLabel(EntrustOrderStateEnum.EXPIRED)}</a>,
      },
      {
        key: EntrustOrderStateEnum.CANCELED,
        label: <a onClick={() => setState && setState(EntrustOrderStateEnum.CANCELED)}>{getStateLabel(EntrustOrderStateEnum.CANCELED)}</a>,
      },
    ];
  }, []);
  const dropdownLabelState = useMemo(() => {
    return (state && stateLabelObj[state]) || t("trade.status");
  }, [state]);

  return {
    stateLabelObj,
    getStateLabel,
    getStateCls,
    dropdownItemsState,
    dropdownLabelState,
  };
};

export default useGetEntrustOrderState;
