import React, { HTMLAttributes, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
// import store from "store";

import LimitAndMarket from "./limitAndMarket";
import EntrustStopLimit from "./entrust/stopLimit";
import EntrustTrailingStop from "./entrust/trailingStop";

import styles from "./index.module.scss";

export enum OrderListTypeEnum {
  limitAndMarket = "limitAndMarket", //现价市价
  stopLimit = "stopLimit", //止盈止损
  trailingStop = "trailingStop", //跟踪委托
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  isHideOtherPairs: boolean;
  setHideOtherPairs: (arg: boolean) => void;
  clsUl: string;
  clsLi: string;
}

const Main: React.FC<Props> = ({ className, isHideOtherPairs, setHideOtherPairs, clsUl, clsLi }) => {
  const t = useTranslation();
  // const {isLogin} = store.user;

  const [orderListType, setOrderListType] = useState<OrderListTypeEnum>(OrderListTypeEnum.limitAndMarket);

  const handleBtnClick = useCallback((val: OrderListTypeEnum) => {
    setOrderListType(val);
  }, []);

  return (
    <div className={cx(styles.main, className)}>
      {/* <div className={styles.bar}>
        <div>
          <div>
            <button
              className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.limitAndMarket })}
              onClick={() => handleBtnClick(OrderListTypeEnum.limitAndMarket)}
            >
              {t("trade.limitAndMarket")}
            </button>
            <button
              className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.stopLimit })}
              onClick={() => handleBtnClick(OrderListTypeEnum.stopLimit)}
            >
              {t("trade.stopLimit")}
            </button>
            <button
              className={cx("btnTxt", styles.barBtn, { [styles.barBtnAtv]: orderListType === OrderListTypeEnum.trailingStop })}
              onClick={() => handleBtnClick(OrderListTypeEnum.trailingStop)}
            >
              {t("trade.trailingStop")}
            </button>
          </div>
        </div>
      </div> */}

      <div className={styles.content}>
        {orderListType === OrderListTypeEnum.limitAndMarket && (
          <LimitAndMarket isHideOtherPairs={isHideOtherPairs} setHideOtherPairs={setHideOtherPairs} clsUl={clsUl} clsLi={clsLi} />
        )}
        {orderListType === OrderListTypeEnum.stopLimit && (
          <EntrustStopLimit isHideOtherPairs={isHideOtherPairs} setHideOtherPairs={setHideOtherPairs} clsUl={clsUl} clsLi={clsLi} />
        )}
        {orderListType === OrderListTypeEnum.trailingStop && (
          <EntrustTrailingStop isHideOtherPairs={isHideOtherPairs} setHideOtherPairs={setHideOtherPairs} clsUl={clsUl} clsLi={clsLi} />
        )}
      </div>
    </div>
  );
};

export default observer(Main);
// export default Main;
