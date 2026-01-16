import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import Storage from "@/utils/storage";
import { Modal, ModalProps, Button, Checkbox } from "antd";
import useModalRiskTip from "./useHook";
import SvgIcon from "@az/SvgIcon";
import SvgClose from "@/assets/icon-svg/close2.svg";

import styles from "./index.module.scss";

export interface AppModalRiskTipProps extends ModalProps {
  open?: boolean;
  //
  callback?: () => void;
}
interface Props extends AppModalRiskTipProps {
  updateProps: (obj: Omit<AppModalRiskTipProps, "updateProps">) => void;
}

const AppModalRiskTip: React.FC<Props> = ({ open, callback, updateProps, ...rest }) => {
  const t = useTranslation();
  const { name } = store.market;

  const checkRiskTip = useModalRiskTip();

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setChecked(false);
  }, [open]);

  const toClose = useCallback(
    (bool) => {
      updateProps({ open: false });
      bool && callback && callback();
    },
    [callback, updateProps]
  );
  const handleConfirm = useCallback(() => {
    if (checked) {
      Storage.set("modalRiskTip", { innovative: 1 });
    }
    toClose(true);
  }, [checked, toClose]);

  useEffect(() => {
    checkRiskTip();
  }, [name]);

  return (
    <Modal
      open={false}
      title={t("trade.riskTip")}
      width={450}
      centered
      className={styles.main}
      closeIcon={<SvgIcon className={"svgIcon"} src={SvgClose} />}
      maskClosable={false}
      onCancel={() => toClose(false)}
      footer={
        <Button key="confirm" type="primary" onClick={handleConfirm} disabled={!checked}>
          {t("confirm")}
        </Button>
      }
      {...rest}
    >
      <div className={cx(styles.text)}>{t("trade.riskTipDetail")}</div>

      <div className={cx(styles.checkDiv)}>
        <Checkbox className={cx(styles.checkbox)} checked={checked} onChange={(e) => setChecked(e.target.checked)}>
          {t("trade.riskTipAgree")}
        </Checkbox>
      </div>
    </Modal>
  );
};

export default observer(AppModalRiskTip);
// export default Main;
