import React from "react";
import { getOrigin } from "utils/method";
import { Context, AzLocale } from "@az/base";
const { AzContext } = Context;
import store from "store";

export const useReplaceUrlParameter = (url: string): string => {
  const [appState] = React.useContext(AzContext);
  const { convertCurrency } = store.balances;

  const params = {
    __h5host__: getOrigin(undefined, { noProtocol: true }),
    __pathLang__: appState.lang,
    __lang__: AzLocale.getLangCode(),
    __currency__: convertCurrency,
  };

  const reg = new RegExp("(" + Object.keys(params).join("|") + ")", "g");
  return url.replace(reg, (attr) => params[attr]);
};

export default useReplaceUrlParameter;
