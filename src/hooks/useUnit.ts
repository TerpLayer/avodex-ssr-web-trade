import { useMemo } from "react";
import store from "@/store";
import { ConvertCurrencyAry } from "@/store/balances";
const useUnit = () => {
  const unit = useMemo(() => {
    const { convertCurrency } = store.balances;
    const itemRes = { ...ConvertCurrencyAry.find((item) => item.key == convertCurrency) } as unknown as { key: string; note: string; maxPrecision: number };
    itemRes.key = itemRes.key?.toUpperCaseCurrency();
    if (itemRes.key === "USD") itemRes.key = "US";
    return itemRes;
  }, [store.balances.convertCurrency]);
  return unit;
};

export default useUnit;
