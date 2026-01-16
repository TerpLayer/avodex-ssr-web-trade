import React from "react";
import cx from "classnames";
interface SvgProps {
  icon: string;
  style?: WithUndefined<any>;
  className?: string;
}

const AzSvg: React.FC<SvgProps> = ({ className, icon, style }) => {
  return (
    <svg className={cx("iconpark-icon", className)} style={style}>
      <use href={"#" + icon}></use>
    </svg>
  );
};

export default AzSvg;
