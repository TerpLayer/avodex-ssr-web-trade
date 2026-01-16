import { configure } from "mobx";

configure({
  enforceActions: "never",
});

import app from "./app";
import balances from "./balances";
import copyTrade from "./copyTrade";
import currency from "./currency";
import entrustOrder from "./entrustOrder";
import market from "./market";
import trade from "./trade";
import user from "./user";

const store = {
  app,
  balances,
  copyTrade,
  currency,
  entrustOrder,
  market,
  trade,
  user,
};

export default store;
