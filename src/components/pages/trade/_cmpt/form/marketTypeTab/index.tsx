import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import { routerPush } from "utils/method";

import AzTabs from "components/az/tabs";

import { TypeEnum } from "store/market";

const Main: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children }) => {
  const t = useTranslation();
  const router = useRouter();
  const { name, type, leverConfigObj } = store.market;

  const items = useMemo(() => {
    const ary = [
      {
        key: TypeEnum.spot,
        label: t("trade.spot"),
      },
    ];
    if (leverConfigObj && leverConfigObj[name]) {
      ary.push({
        key: TypeEnum.lever,
        label: t("trade.margin") + " " + leverConfigObj[name].maxLeverage + "x",
      });
    }
    return ary;
  }, [name, leverConfigObj]);

  const handleChange = (key) => {
    routerPush(router, { symbol: name, isLever: key === TypeEnum.lever });
  };

  return (
    <AzTabs activeKey={type} items={[]} onChange={handleChange}>
      {children}
    </AzTabs>
  );
};

export default observer(Main);
