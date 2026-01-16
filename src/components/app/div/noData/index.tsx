import React from "react";
import cx from "classnames";
import nodataIcon from "./nodata.png";

import { Hooks } from "@az/base";
const { useTranslation } = Hooks;

import AzSvg from "components/az/svg";

import styles from "./index.module.scss";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  noIcon?: boolean;
}

const AppDivNoData: React.FC<Props> = ({ label, noIcon, className, ...rest }) => {
  const t = useTranslation();

  return (
    <div className={cx(styles.main, className)} {...rest}>
      {!noIcon && <img src={nodataIcon} alt="" width={48} height={48} />}
      <div>{label || t("trade.noData")}</div>
    </div>
  );
};

export default AppDivNoData;
