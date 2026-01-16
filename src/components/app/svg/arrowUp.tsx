import React, { HTMLAttributes } from "react";
interface Props extends HTMLAttributes<HTMLOrSVGElement> {
  attr?: any;
}

const AppSvgArrowUp: React.FC<Props> = ({ ...rest }) => {
  return (
    <svg width="0.666666em" height="1em" viewBox="0 0 8 12" className={"up-color"} {...rest}>
      <path d="M5.44726 12L5.44726 4.25318H7L4 0L1 4.25318H2.55274L2.55274 12H5.44726Z" fill="currentColor" />
    </svg>
  );
};

export default AppSvgArrowUp;
