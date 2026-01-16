import React, { HTMLAttributes, PropsWithChildren, useCallback } from "react";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import { copy } from "utils/method";

import { message } from "antd";
import AzSvg from "./svg";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  text: string;
}

const AzCopy: React.FC<PropsWithChildren<Props>> = ({ children, className, text, ...rest }) => {
  const t = useTranslation();

  const handleClick = useCallback(
    (e) => {
      e && e.stopPropagation();
      if (copy(text)) return message.success(t("trade.copySuccess"));
      message.error(t("trade.copyError"));
    },
    [text]
  );

  return (
    <button className={cx("btnTxt", className)} onClick={handleClick} {...rest}>
      {children || <AzSvg icon={"copy"} />}
    </button>
  );
};

export default AzCopy;
