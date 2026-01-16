import React, { ReactNode } from "react";

import AntdModalAlert from "@/components/antd/modal/alert";
import AzSvg from "@/components/az/svg";

import styles from "./index.module.scss";

interface Props extends ObjAny {
  content?: ReactNode;
  icon?: string;
}

const Main = ({ content, icon = "alert2", ...rest }: Props) => {
  return AntdModalAlert({
    content: (
      <div className={styles.alertModalContent}>
        <AzSvg icon={icon} />
        <div>{content}</div>
      </div>
    ),
    ...rest,
  });
};

export default Main;
