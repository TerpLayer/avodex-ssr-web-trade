import React, { HTMLAttributes, useMemo } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
// import { Context } from "@az/base";
//const { useTranslation } = Hooks;
import store from "store";
import styles from "./index.module.scss";
import AzLoading from "../loading";
import XtToLogin from "@/components/app/div/toLogin";
import AzFontScale from "../fontScale";
import XtNoData from "@/components/app/div/noData";
enum AzPaneThemeClassName {
  simple = "simple",
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  attr?: any;
  loading: boolean;
  noData?: boolean;
  theme?: AzPaneThemeClassName;
  minHeight?: number;
  isNeedLogin?: boolean;
}

const AzPane: React.FC<Props> = ({ className, loading = false, noData = false, theme = "", minHeight = 200, isNeedLogin = false, children }) => {
  //const t = useTranslation();
  const { isLogin } = store.user;

  const getTheme = useMemo(() => {
    return `az-pane-${theme}-container`;
  }, [theme]);

  return (
    <div className={cx(styles["az-pane-container"], styles[getTheme])} style={{ minHeight: minHeight + "px" }}>
      {isNeedLogin && !isLogin ? (
        <div className="pane-nologin" style={{ minHeight: minHeight + "px" }}>
          <AzFontScale>
            <XtToLogin />
          </AzFontScale>
        </div>
      ) : (
        <>
          {noData && !loading ? (
            <div className="pane-nodata" style={{ minHeight: minHeight + "px" }}>
              <AzFontScale>
                <XtNoData></XtNoData>
              </AzFontScale>
            </div>
          ) : (
            children
          )}
        </>
      )}
      {loading && <AzLoading />}
    </div>
  );
};
export default observer(AzPane);
