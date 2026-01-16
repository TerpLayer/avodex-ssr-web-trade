import { ReactNode } from "react";
import { Modal } from "antd";

import cx from "classnames";

import styles from "./index.module.scss";

interface OptionProps extends ObjAny {
  isConfirm?: boolean;
  className?: string;
  centered?: boolean;
  title?: ReactNode;
  content?: ReactNode;
  inner?: ReactNode;
}

const AntdModalAlert = (contentStrOrOption: string | OptionProps) => {
  let option: OptionProps = {};
  if (typeof contentStrOrOption === "string") {
    option.content = contentStrOrOption;
  } else {
    option = contentStrOrOption;
  }

  const { isConfirm, className, centered = true, title, content, inner, ...rest } = option;

  return Modal[isConfirm ? "confirm" : "info"]({
    title: false,
    icon: false,
    className: cx(styles.main, className),
    centered,
    content: (
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        {content && <div className={styles.content}>{content}</div>}
        {inner && <div className={styles.inner}>{inner}</div>}
      </div>
    ),
    ...rest,
  });
};

AntdModalAlert.confirm = (contentStrOrOption: string | OptionProps) => {
  if (typeof contentStrOrOption === "string") return AntdModalAlert({ content: contentStrOrOption, isConfirm: true });
  AntdModalAlert({ ...contentStrOrOption, isConfirm: true });
};

export default AntdModalAlert;
