import React, { HTMLAttributes, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { Hooks } from "@az/base";
// const { useTranslation } = Hooks;
import store from "store";
import { get_advertSpaceCode } from "api/v4/app";
import useAxiosCancelFun from "hooks/useAxiosCancelFun";

import styles from "./index.module.scss";
import AzSvg from "@/components/az/svg";
import { BannerCarousel } from "@az/NavFlex";

interface AdProps {
  imgUrl?: string;
  link?: string;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
}

const Main: React.FC<Props> = ({ className }) => {
  // const t = useTranslation();
  // const { isLogin } = store.user;

  // const [isClosed, setIsClosed] = useState<boolean>(false);
  // const [adDoc, setAdDoc] = useState<AdProps>();

  // const apiReqArg = useMemo(() => {
  //   return {
  //     fn: (cfg) => get_advertSpaceCode("1006", cfg),
  //     config: {},
  //     success: (data) => setAdDoc(data),
  //   };
  // }, []);
  // const apiReq = useAxiosCancelFun(apiReqArg);

  // useEffect(() => {
  //   apiReq();
  // }, []);

  // if (!isLogin || isClosed || !adDoc || !adDoc.imgUrl) return <></>;

  return (
    <div className={cx(styles.main, className)}>
      <BannerCarousel displayType={3} displayPage={2} interval={4000} width={"100%"} height={100} imageFit="cover" />
      {/* <button className={cx("btnTxt", styles.btn)} onClick={() => setIsClosed(true)}>
        <AzSvg icon={`close`} />
      </button>

      <a href={adDoc.link} target="_blank" rel="noreferrer">
        <img className={styles.img} src={adDoc.imgUrl} alt="ad" loading="lazy" />
      </a> */}
    </div>
  );
};

export default observer(Main);
// export default Main;
