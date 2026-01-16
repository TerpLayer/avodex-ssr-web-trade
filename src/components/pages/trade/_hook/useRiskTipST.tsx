import React, { useEffect } from "react";
import store from "store";
import { useRouter } from "next/router";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import ModalAlert from "components/antd/modal/alert";
import SvgIcon from "@az/SvgIcon";
import SvgClose from "@/assets/icon-svg/close2.svg";

const useRiskTipST = () => {
  const t = useTranslation();
  const { name, currentConfig, symbolStList, formatName } = store.market;
  const router = useRouter();

  useEffect(() => {
    if ((currentConfig.id || currentConfig.id === 0) && symbolStList.includes(currentConfig.id)) {
      ModalAlert.confirm({
        title: t("trade.riskTip"),
        width: 400,
        closeIcon: <SvgIcon className={"svgIcon"} src={SvgClose} />,
        content: t("trade.riskTipST", [formatName(name)]),
        okText: t("trade.iKnow"),
        cancelText: t("trade.viewmore"),
        onCancel: () => {
          const url = "http://www.cexdemo.com/";
          window.open(url);
        },
      });
    }
  }, [name, symbolStList]);

  useEffect(() => {
    store.market.getSymbolStList(); //获取被st标签标记的交易对列表
  }, []);
};

export default useRiskTipST;
