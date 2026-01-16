import { useCallback, useMemo } from "react";
import { Hooks } from "@az/base";
import { EntrustOrderActiveStateEnum, EntrustOrderProps, EntrustOrderStateEnum } from "store/entrustOrder";

const { useTranslation } = Hooks;

// interface InputProps {}

interface OutputProps {
  stateLabelObj: object;
  getStateLabel: (arg: EntrustOrderProps | EntrustOrderStateEnum) => string;
  getStateCls: (arg: EntrustOrderProps | EntrustOrderStateEnum) => "success" | "error" | "warn" | undefined;
}

const useGetEntrustOrderStateLab: () => OutputProps = () => {
  const t = useTranslation();

  const stateLabelObj = useMemo(() => {
    return {
      [EntrustOrderStateEnum.NEW]: t("trade.notTriggered"),
      [EntrustOrderStateEnum.TRIGGERED]: t("trade.triggered"),
      [EntrustOrderStateEnum.EXPIRED]: t("trade.expired"),
      [EntrustOrderStateEnum.CANCELED]: t("trade.canceled"),
    };
  }, []);

  const getStateLabel = useCallback((arg: EntrustOrderProps | EntrustOrderStateEnum) => {
    let state = arg;
    if (typeof arg === "object") {
      if (arg.activeState !== EntrustOrderActiveStateEnum.ACTIVE) return t("trade.unactivated");
      state = arg.state;
    }
    return stateLabelObj[state as EntrustOrderStateEnum] || "--";
  }, []);

  const getStateCls = useCallback((arg: EntrustOrderProps | EntrustOrderStateEnum) => {
    let state = arg;
    if (typeof arg === "object") {
      state = arg.state;
    }
    if (state === EntrustOrderStateEnum.TRIGGERED) return "success";
    // if ([EntrustOrderStateEnum.CANCELED, EntrustOrderStateEnum.EXPIRED].includes(state as EntrustOrderStateEnum)) return "warn";

    return;
  }, []);

  return {
    stateLabelObj,
    getStateLabel,
    getStateCls,
  };
};

export default useGetEntrustOrderStateLab;
