import React, { HTMLAttributes, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation } = Hooks;
import store from "store";
import { post_symbolStar, delete_symbolStarId } from "api/v4/account";

import { Tooltip, TooltipProps } from "antd";
import AzSvg from "components/az/svg";
import AppDivToLogin from "components/app/div/toLogin";

import styles from "./index.module.scss";

// import { SymbolStarProps } from "store/user";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  symbol: string;
  placement?: TooltipProps["placement"];
  isStarEmpty?: boolean;
}

const Main: React.FC<Props> = ({ symbol, className, placement = "topLeft", isStarEmpty }) => {
  const t = useTranslation();
  const { isLogin, symbolStar } = store.user;

  const atvDoc: WithUndefined<string> = useMemo(() => {
    if (!isLogin) return;
    return symbolStar.find((obj) => obj === symbol);
  }, [isLogin, symbol, symbolStar]);
  const tip = useMemo(() => {
    return !atvDoc ? t("trade.favorites") : t("trade.cancel");
  }, [atvDoc]);

  const [loading, setLoading] = useState(false);
  const handleClick = (e) => {
    e && e.stopPropagation();
    if (!isLogin || loading) return;
    setLoading(true);

    if (atvDoc) {
      delete_symbolStarId(atvDoc)
        .then(() => {
          store.user.getSymbolStar();
        })
        .catch(() => {
          //empty
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      post_symbolStar({
        params: { symbol },
      })
        .then(() => {
          store.user.getSymbolStar();
        })
        .catch(() => {
          //empty
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // const showEmptyStar = useMemo(() => {
  //   return !(atvDoc || !isStarEmpty);
  // }, [atvDoc, isStarEmpty]);

  return (
    <>
      {isLogin ? (
        <button className={cx("btnTxt", styles.main, className, { [styles.atv]: !!atvDoc })} onClick={handleClick}>
          {/*<AzSvg className={cx(showEmptyStar ? styles.emptyStar : undefined)} icon={atvDoc ? "star-new-filled" : "star-new-empty"} />*/}
          {/* <AzSvg icon={atvDoc ? "star-new-filled" : "star-new-empty"} /> */}
          {atvDoc ? (
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.4258 4.12228L7.60846 0L4.79112 4.12228L0 5.52787L3.04992 9.48113L2.90617 14.4721L7.60846 12.7931L12.3107 14.4721L12.167 9.48113L15.2169 5.52787L10.4258 4.12228Z"
                fill="var(--az-colorv2-system-warning)"
              />
            </svg>
          ) : (
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.4258 4.12228L7.60846 0L4.79112 4.12228L0 5.52787L3.04992 9.48113L2.90617 14.4721L7.60846 12.7931L12.3107 14.4721L12.167 9.48113L15.2169 5.52787L10.4258 4.12228Z"
                fill="var(--az-colorv2-text-quaternary)"
              />
            </svg>
          )}
        </button>
      ) : (
        <Tooltip
          trigger={isLogin ? "hover" : "click"}
          placement={placement}
          getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
          title={isLogin ? tip : <AppDivToLogin />}
          overlayStyle={{ whiteSpace: "nowrap" }}
        >
          <button className={cx("btnTxt", styles.main, className, { [styles.atv]: !!atvDoc })} onClick={handleClick}>
            {/*<AzSvg className={cx(showEmptyStar ? styles.emptyStar : undefined)} icon={atvDoc ? "star-new-filled" : "star-new-empty"} />*/}
            {/* <AzSvg icon={atvDoc ? "star-new-filled" : "star-new-empty"} /> */}
            {atvDoc ? (
              <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.4258 4.12228L7.60846 0L4.79112 4.12228L0 5.52787L3.04992 9.48113L2.90617 14.4721L7.60846 12.7931L12.3107 14.4721L12.167 9.48113L15.2169 5.52787L10.4258 4.12228Z"
                  fill="var(--az-colorv2-system-warning)"
                />
              </svg>
            ) : (
              <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.4258 4.12228L7.60846 0L4.79112 4.12228L0 5.52787L3.04992 9.48113L2.90617 14.4721L7.60846 12.7931L12.3107 14.4721L12.167 9.48113L15.2169 5.52787L10.4258 4.12228Z"
                  fill="var(--az-colorv2-text-quaternary)"
                />
              </svg>
            )}
          </button>
        </Tooltip>
      )}
    </>
  );
};

export default observer(Main);
