import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "store";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import Storage from "utils/storage";
import tabCfgAry from "./tabs/tabCfgAry";

// import store from "store";

import AzInputSearch from "components/az/input/search";
import CMPT_Tabs from "./tabs";
import CMPT_Sort from "./sort";
import CMPT_Container from "./container";
import CMPT_TopSearch from "./topSearch";

import styles from "./index.module.scss";

import { TabCfgProps } from "./tabs";

interface Props extends HTMLAttributes<HTMLDivElement> {
  clsSearch?: string;
  isHidden?: boolean;
}

const Main: React.FC<Props> = ({ className, clsSearch, isHidden }) => {
  const t = useTranslation();

  const [keyword, setKeyword] = useState<string>("");
  const [isSearchInputFocus, setIsSearchInputFocus] = useState<WithUndefined<boolean>>(undefined);
  const isTopSearchVisible = useMemo(() => {
    return !(keyword || !isSearchInputFocus);
  }, [keyword, isSearchInputFocus]);

  const inputRef = useRef<HTMLInputElement>(null);
  const refIsFocus = useRef(false);
  const handleSearchInputFocus = useCallback(() => {
    console.log("onFocus");
    setIsSearchInputFocus(true);
  }, []);
  const handleSearchInputBlur = useCallback(() => {
    console.log("onBlur");
    if (!refIsFocus.current || !inputRef.current) {
      setIsSearchInputFocus(false);
    } else {
      refIsFocus.current = false;
      inputRef.current.focus();
    }
  }, []);
  const setSearchInputFocus = useCallback(() => {
    refIsFocus.current = true;
  }, []);

  const [tabCfg, setTabCfg] = useState<TabCfgProps>(tabCfgAry[1]);
  useEffect(() => {
    const tabCfg = Storage.get("marketGroup");
    if (tabCfg && tabCfg.key) {
      if (tabCfg.key !== "user" || store.user.isLogin) setTabCfg(tabCfg);
    }
  }, []);
  const onTabChange = (tabCfg) => {
    setTabCfg(tabCfg);
    // console.log(1111111, tabCfg);
    Storage.set("marketGroup", tabCfg);
  };

  const [sortBy, setSortBy] = useState<string | undefined>();
  const [isShowVolume, setIsShowVolume] = useState(false);

  useEffect(() => {
    if (isHidden) setKeyword("");
  }, [isHidden]);

  return (
    <div className={cx(styles.main, className)}>
      <div className={styles.search}>
        <AzInputSearch
          innerRef={inputRef}
          className={clsSearch}
          placeholder={t("trade.search2")}
          value={keyword}
          onInput={(val) => setKeyword(val)}
          onFocus={handleSearchInputFocus}
          onBlur={handleSearchInputBlur}
        />
        {isTopSearchVisible && <button className={cx("btnTxt")}>{t("trade.cancel")}</button>}
      </div>

      {isSearchInputFocus !== undefined && (
        <CMPT_TopSearch className={styles.topSearch} visible={isTopSearchVisible} setSearchInputFocus={setSearchInputFocus} isShowVolume={isShowVolume} />
      )}

      <div className={styles.content}>
        {!keyword && <CMPT_Tabs tabCfg={tabCfg} tabChange={onTabChange} />}
        <CMPT_Sort sortBy={sortBy} onChange={(item) => setSortBy(item)} isShowVolume={isShowVolume} setIsShowVolume={setIsShowVolume} />

        <CMPT_Container keyword={keyword} tabCfg={tabCfg} sortBy={sortBy} isShowVolume={isShowVolume} isHidden={isHidden} />
      </div>
    </div>
  );
};

export default observer(Main);
