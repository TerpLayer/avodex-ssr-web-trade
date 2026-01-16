import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { useRouter } from "next/router";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import Storage from "utils/storage";
import { routerPush } from "utils/method";

import { Popconfirm, Dropdown, MenuProps } from "antd";
import CMPT_btn from "./btn";

import styles from "./index.module.scss";

import { EtfProps } from "store/market";

const EtfDropOrBtn: React.FC<{ cls: string; data: EtfProps[] }> = ({ cls, data }) => {
  const router = useRouter();

  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return data.map((item) => {
      return {
        key: item.symbol,
        label: (
          <a onClick={() => routerPush(router, { symbol: item.symbol })}>
            <CMPT_btn doc={item} />
          </a>
        ),
      };
    });
  }, []);

  if (data.length === 1) return <CMPT_btn onClick={() => routerPush(router, { symbol: data[0].symbol })} className={cx(styles.btn, cls)} doc={data[0]} />;

  return (
    <Dropdown
      placement={"bottomRight"}
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      menu={{
        items: dropdownItems,
      }}
    >
      <div>
        <CMPT_btn className={cx(styles.btn_drop, styles.btn, cls)} doc={data[0]} />
      </div>
    </Dropdown>
  );
};

const Main: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className }) => {
  const t = useTranslation();
  // const router = useRouter();
  const { name, etfListBase, isEtf, config, isLever } = store.market;
  const [isPop, setIsPop] = useState(false);
  const hidePop = useCallback(() => {
    Storage.set("isEtfGuideKnown", true);
    setIsPop(false);
  }, []);
  useEffect(() => {
    setIsPop(!Storage.get("isEtfGuideKnown"));
  }, []);

  // const hasEtf = useMemo(() => {
  //   // return !!(etfConfig && etfConfig[name] && etfConfig[name].data && etfConfig[name].data.length);
  // }, [name, etfConfig]);

  const long2short = useMemo(() => {
    const long: EtfProps[] = [];
    const short: EtfProps[] = [];

    if (!isEtf && etfListBase) {
      etfListBase.map((item) => {
        if (config?.[item.symbol] && config?.[item.symbol].displayLevel !== "NONE") {
          if (item.direction === "LONG") {
            long.push(item);
          } else {
            short.push(item);
          }
        }
      });
    }

    long.sort((a, b) => b.maxLeverage - a.maxLeverage);
    short.sort((a, b) => b.maxLeverage - a.maxLeverage);

    const ary: { cls: string; data: EtfProps[] }[] = [];
    long.length && ary.push({ cls: styles.long, data: long });
    short.length && ary.push({ cls: styles.short, data: short });

    return ary;
  }, [isEtf, name, etfListBase]);

  if (isEtf || isLever) return <></>;
  return (
    <div className={cx(styles.main, className)}>
      {long2short.map((item, index) => {
        if (index === 0 && isPop)
          return (
            <Popconfirm
              key={name + "_" + index}
              title={t("trade.xGuideEtf", [store.currency.getCurrencyDisplayName(name.split("_")[0])])}
              getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
              open={true}
              icon={null}
              showCancel={false}
              onConfirm={hidePop}
            >
              <EtfDropOrBtn cls={item.cls} data={item.data} />
            </Popconfirm>
          );
        return <EtfDropOrBtn key={name + "_" + index} cls={item.cls} data={item.data} />;
      })}
    </div>
  );
};

export default observer(Main);
