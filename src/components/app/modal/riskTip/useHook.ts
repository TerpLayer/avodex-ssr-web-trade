import { useCallback } from "react";
import store from "store";
import Storage from "utils/storage";

const useModalRiskTip = () => {
  const fn = useCallback((callback?) => {
    const { innovative } = Storage.get("modalRiskTip") || {};

    if (innovative) return close();
    const { plates } = store.market.currentConfig;
    if (!plates || !new RegExp(`^(${plates.join("|")})$`).test(process.env.NEXT_PUBLIC_riskPlateId || "")) return close();
    store.trade.updateState({
      modalRiskTip: {
        open: true,
        callback,
      },
    });

    function close() {
      store.trade.updateState({
        modalRiskTip: { open: false },
      });
      callback && callback();
    }
  }, []);

  return fn;
};

export default useModalRiskTip;
