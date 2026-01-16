import React, { HTMLAttributes, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { QRCodeSVG } from "qrcode.react";
import cx from "classnames";
import { Hooks } from "@az/base";
const { useTranslation, FormattedMessage } = Hooks;
import store from "store";
import { getHosts } from "utils/method";

import ShareModal from "@az/ShareModal";

import styles from "./index.module.scss";

import ImgCopyTrading from "./copyTrading.png";
import ImgBitCoin from "./bitcoin.png";
// @ts-ignore
import SvgLogo from "./logo2.svg";
// @ts-ignore
import SvgAvatar from "./avatar.svg";

import { CopyTradeCurOrderExtendProps } from "@/components/pages/trade/_cmpt/history/copyTrade";

interface Props {
  doc: CopyTradeCurOrderExtendProps;
  open: boolean;
  onCancel: () => void;
}

const Main: React.FC<Props> = ({ doc, open, onCancel }) => {
  const t = useTranslation();
  const router = useRouter();

  const { formatName } = store.market;
  const { userInfo } = store.user;
  const { isFollower } = store.copyTrade;

  const text = useMemo(() => {
    if (isFollower) return t("trade.copyTradeShareFollower", [formatName(doc.symbol), doc._profitRate]);
    else return t("trade.copyTradeShareLeader", [userInfo?.nickName || "--", formatName(doc.symbol), doc._profitRate]);
  }, [userInfo, isFollower, doc]);
  const url = useMemo(() => {
    const { host, protocol } = getHosts();
    const { locale } = router;
    const url = `${protocol}//` + host + (locale ? `/${locale}` : "");

    if (isFollower) {
      return url + "/copy-trading?type=spot&ref=" + userInfo?.recommendCode;
    } else {
      return url + "/copy-trading/trader/" + userInfo?.userIdStr + `?ref=${userInfo?.recommendCode}`;
    }
  }, [router, userInfo, isFollower, doc]);

  const userObj = useMemo(() => {
    const nickname = userInfo?.nickName || "--";
    return {
      avatar: userInfo?.headImgUrl || SvgAvatar,
      nickname,
      tag: isFollower ? t("trade.copyTradeFollower") : t("trade.copyTradeLeader"),
      tip: isFollower ? t("trade.oneClickCopy") : t("trade.oneClickFollowTrader", [nickname]),
    };
  }, [userInfo, isFollower, doc]);

  return (
    <ShareModal text={text} url={url} open={open} onCancel={onCancel}>
      <div className={styles.main}>
        <img className={styles.ImgCopyTrading} src={ImgCopyTrading} />
        <img className={styles.ImgBitCoin} src={ImgBitCoin} />
        <div className={styles.nav}>
          <img src={SvgLogo} />
          <span>{t("trade.copySpot")}</span>
        </div>

        <div className={styles.user}>
          <img src={userObj.avatar} />
          <div>
            <div>{userObj.nickname}</div>
            <div>{userObj.tag}</div>
          </div>
        </div>

        <div className={styles.order}>
          <div>
            <div>{formatName(doc.symbol)}</div>
            <div className={doc._profitCls}>{doc._profitRate}</div>
            <div className={doc._profitCls}>({doc._profit})</div>
          </div>

          <div>
            <div>
              <span>{t("trade.buyPrice") + ": "}</span>
              <span>{doc._buyPrice}</span>
            </div>
            <div>
              <span>{t("trade.lastPrice2") + ": "}</span>
              <span>{doc._latestPrice}</span>
            </div>
          </div>
        </div>

        <div className={styles.banner}>
          <div>
            <div>
              <FormattedMessage
                id={"trade.join"}
                values={{
                  "0": <b className={styles.bannerXT}>CEXDEMO</b>,
                }}
              />
            </div>
            <div>{userObj.tip}</div>
          </div>
          <div>
            <QRCodeSVG value={url} size={56} />
          </div>
        </div>
      </div>
    </ShareModal>
  );
};

export default observer(Main);
// export default Main;
