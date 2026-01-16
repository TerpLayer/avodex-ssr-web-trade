import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import store from "store";

import CMPT_DepthNormal from "./depthNormal";
import CMPT_DepthNft from "./depthNft";

export enum LayEnum {
  ask2bid = "ask2bid", //显示卖盘买盘
  ask = "ask", //显示卖盘
  bid = "bid", //显示买盘
}

const Main: React.FC = () => {
  const { isNft } = store.market;
  const [lay, setLay] = useState<LayEnum>(LayEnum.ask2bid);

  return isNft ? <CMPT_DepthNft lay={lay} setLay={setLay} /> : <CMPT_DepthNormal lay={lay} setLay={setLay} />;
};

export default observer(Main);
