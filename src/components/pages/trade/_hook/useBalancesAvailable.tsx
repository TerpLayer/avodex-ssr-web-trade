import { useMemo } from "react";
import { Util } from "@az/base";
import store from "store";

import { TradeSideEnum } from "store/trade";
import useCoinMemo from "./useCoinMemo";

const { Big } = Util;

const useBalancesAvailable = (tradeSide?: TradeSideEnum) => {
  const { currencyQuantity, currencyPrice } = store.balances;
  const { coinQuantityPrecisionCurrency, coinPricePrecisionCurrency } = useCoinMemo();

  const balancesQuantityAvailable = useMemo(() => {
    let value = "0";
    if (currencyQuantity && currencyQuantity.availableAmount) value = currencyQuantity.availableAmount;
    return Big(value).toFixed(coinQuantityPrecisionCurrency);
  }, [currencyQuantity, coinQuantityPrecisionCurrency]);
  const balancesPriceAvailable = useMemo(() => {
    let value = "0";
    if (currencyPrice && currencyPrice.availableAmount) value = currencyPrice.availableAmount;
    return Big(value).toFixed(coinPricePrecisionCurrency);
  }, [currencyPrice, coinPricePrecisionCurrency]);

  const balancesQuantityAvailableLabel = useMemo(
    () => Big(balancesQuantityAvailable).toFixedCy(coinQuantityPrecisionCurrency),
    [balancesQuantityAvailable, coinQuantityPrecisionCurrency]
  );
  const balancesPriceAvailableLabel = useMemo(
    () => Big(balancesPriceAvailable).toFixedCy(coinPricePrecisionCurrency),
    [balancesPriceAvailable, coinPricePrecisionCurrency]
  );

  if (tradeSide === TradeSideEnum.sell)
    return {
      balancesAvailable: balancesQuantityAvailable,
      balancesAvailableLabel: balancesQuantityAvailableLabel,
    };
  if (tradeSide === TradeSideEnum.buy)
    return {
      balancesAvailable: balancesPriceAvailable,
      balancesAvailableLabel: balancesPriceAvailableLabel,
    };

  return {
    balancesQuantityAvailable,
    balancesPriceAvailable,
    balancesQuantityAvailableLabel,
    balancesPriceAvailableLabel,
  };
};

export default useBalancesAvailable;
