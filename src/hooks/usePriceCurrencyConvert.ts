import usePriceCurrencyConvertCb, { PriceCurrencyConvertCbOptionProps } from "./usePriceCurrencyConvertCb";

export const usePriceCurrencyConvert = (option: PriceCurrencyConvertCbOptionProps): string => {
  const fn = usePriceCurrencyConvertCb();
  return fn(option);
};

export default usePriceCurrencyConvert;
