import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Util } from "@az/base";
//const { useTranslation } = Hooks;
//import store from "store";
import styles from "./index.module.scss";
interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
  value: string | number;
  decimal?: number;
  upClolr?: string;
  downColor?: string;
  closeColor?: boolean;
  size?: number;
}

type StyleProps = Props["style"] & Record<string, string>;

const { Big } = Util;
const UpDown: React.FC<Props> = ({
  className,
  value = "",
  decimal = 2,
  upClolr = "var(--az-color-up)",
  downColor = "var(--az-color-down)",
  closeColor = false,
  size = 18,
}) => {
  //const t = useTranslation();
  //const {isLogin} = store.user;
  const showRate = useMemo(() => {
    if (!+value) return "0.00%";
    return (+value > 0 ? "+" : "") + Big(value).toFixed(decimal, 0) + "%";
  }, [decimal, value]);

  const color = useMemo(() => {
    if (closeColor) return undefined;
    return !isNaN(+value) && value != 0 ? (+value > 0 ? upClolr : downColor) : upClolr;
  }, [value, closeColor]);

  return (
    <span className={cx(styles["up-down-ctn"], className)} style={{ "--updown-color": color, "--updown-font-size": `${size}px` } as StyleProps}>
      {showRate}
    </span>
  );
};
export default observer(UpDown);
