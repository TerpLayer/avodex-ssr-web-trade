import React from "react";
import { Context, Cookie } from "@az/base";
const { AzContext } = Context;
import cx from "classnames";

import AzSvg from "components/az/svg";

import styles from "./index.module.scss";

const Main: React.FC = () => {
  const [appState, appDispatch] = React.useContext(AzContext);

  const handleThemeToggle = () => {
    const theme = appState.theme === "dark" ? "light" : "dark";
    appDispatch({ payload: { theme } });
    Cookie.set("theme", theme);
  };

  return (
    <button onClick={handleThemeToggle} className={cx("btnTxt", "btnHover", styles.main)}>
      <AzSvg icon={`theme-${appState.theme === "dark" ? "light" : "dark"}-outlined`} />
    </button>
  );
};

export default Main;
