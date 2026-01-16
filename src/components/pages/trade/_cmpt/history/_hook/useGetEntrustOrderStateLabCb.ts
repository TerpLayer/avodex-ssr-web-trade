import { useCallback } from "react";
import { Hooks } from "@az/base";
import { EntrustOrderActiveStateEnum, EntrustOrderProps, EntrustOrderStateEnum } from "store/entrustOrder";

const { useTranslation } = Hooks;

const useGetEntrustOrderStateLabCb: () => (doc: EntrustOrderProps) => string = () => {
  const t = useTranslation();

  const fn = useCallback((doc: EntrustOrderProps) => {
    const obj = {
      [EntrustOrderStateEnum.NEW]: t("trade.notTriggered"),
      [EntrustOrderStateEnum.TRIGGERED]: t("trade.triggered"),
      [EntrustOrderStateEnum.EXPIRED]: t("trade.expired"),
      [EntrustOrderStateEnum.CANCELED]: t("trade.canceled"),
    };

    if (doc.activeState === EntrustOrderActiveStateEnum.INACTIVE) return t("trade.unactivated");

    return obj[doc.state] || "--";
  }, []);

  return fn;
};

export default useGetEntrustOrderStateLabCb;
