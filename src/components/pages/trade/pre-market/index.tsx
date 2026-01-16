import React, { HTMLAttributes, useEffect } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { Hooks } from "@az/base";
// const { useTranslation } = Hooks;
import store from "store";
import Storage from "@/utils/storage";

import styles from "./index.module.scss";

import AzLoading from "@/components/az/loading";

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  // const t = useTranslation();
  const router = useRouter();
  const { symbols } = store.market;

  useEffect(() => {
    if (!symbols) return;
    let name = "btc_usdt";
    const plateId = +(process.env.NEXT_PUBLIC_preMarketPlateId || "");
    const symbolAry = symbols.filter((obj) => {
      if (!obj.plates || !obj.plates.length) return false;
      return obj.plates.includes(plateId);
    });
    if (symbolAry.length) {
      symbolAry.sort((x, y) => {
        const s1 = x.displayWeight || 0;
        const s2 = y.displayWeight || 0;
        return s2 - s1;
      });

      name = symbolAry[0].symbol;

      Storage.set("marketGroup", { key: "zone", plateId });
    }

    console.log("useEffect----", { symbols, plateId, name });
    router.replace("/trade/" + name);
  }, [symbols]);

  useEffect(() => {
    store.market.loopGetMarketConfig(); //获取所有现货市场
    store.market.getPlateList(); //获取板块列表
  }, []);

  return (
    <div className={cx(styles.main, className)}>
      <AzLoading />
    </div>
  );
};

export default observer(Main);
// export default Main;
