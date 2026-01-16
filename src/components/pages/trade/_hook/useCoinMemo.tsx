import { useMemo } from "react";
import store from "store";

const useCoinMemo = () => {
  const { name, currentConfig } = store.market;
  const { currencyObj, getCurrencyDisplayName } = store.currency;

  const coinQuantity = useMemo(() => {
    return name.split("_")[0];
  }, [name]); //卖方币
  const coinPrice = useMemo(() => {
    return name.split("_")[1];
  }, [name]); //买方币

  const coinQuantityUpperCase = useMemo(() => getCurrencyDisplayName(coinQuantity), [coinQuantity]); //卖方币，大写
  const coinPriceUpperCase = useMemo(() => getCurrencyDisplayName(coinPrice), [coinPrice]); //买方币，大写

  const coinQuantityPrecisionMarket = useMemo(() => {
    return currentConfig.quantityPrecision && currentConfig.quantityPrecision >= 0 ? currentConfig.quantityPrecision : 0;
  }, [currentConfig]); //卖方币市场精度
  const coinPricePrecisionMarket = useMemo(() => {
    return currentConfig.pricePrecision && currentConfig.pricePrecision >= 0 ? currentConfig.pricePrecision : 0;
  }, [currentConfig]); //买方币市场精度

  const coinQuantityPrecisionCurrency = useMemo(() => {
    if (!currencyObj || !currencyObj[coinQuantity]) return 0;
    return currencyObj[coinQuantity].maxPrecision >= 0 ? currencyObj[coinQuantity].maxPrecision : 0;
  }, [currencyObj, coinQuantity]); //卖方币币种精度
  const coinPricePrecisionCurrency = useMemo(() => {
    if (!currencyObj || !currencyObj[coinPrice]) return 0;
    return currencyObj[coinPrice].maxPrecision >= 0 ? currencyObj[coinPrice].maxPrecision : 0;
  }, [currencyObj, coinPrice]); //买方币币种精度

  const coinQuantityFilter = useMemo(() => {
    if (currentConfig.filters) {
      return currentConfig.filters.find((obj) => obj.filter === "QUANTITY");
    }
  }, [currentConfig]);
  const coinPriceFilter = useMemo(() => {
    if (currentConfig.filters) {
      return currentConfig.filters.find((obj) => obj.filter === "PRICE");
    }
  }, [currentConfig]);

  return {
    coinQuantity, //卖方币
    coinPrice, //买方币
    coinQuantityUpperCase,
    coinPriceUpperCase,
    coinQuantityPrecisionMarket, //卖方币【市场】精度
    coinPricePrecisionMarket, //买方币【市场】精度
    coinQuantityPrecisionCurrency, //卖方币【币种】精度
    coinPricePrecisionCurrency, //买方币【币种】精度
    coinQuantityFilter, //卖方币，市场交易过滤器
    coinPriceFilter, //买方币，市场交易过滤器
  };
};

export default useCoinMemo;
