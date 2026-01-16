import React, { HTMLAttributes } from "react";
interface Props extends HTMLAttributes<HTMLOrSVGElement> {
  attr?: any;
}

const AppSvgArrowUp: React.FC<Props> = ({ ...rest }) => {
  return (
    <svg width="0.666666em" height="1em" viewBox="0 0 8 12" className={"down-color"} {...rest}>
      <path d="M2.55274 0V7.74682H1L4 12L7 7.74682H5.44726V0L2.55274 0Z" fill="currentColor" />
    </svg>
  );
};

export default AppSvgArrowUp;
