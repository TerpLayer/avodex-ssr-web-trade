import Notify from "@az/Notify";
import cs from "./index.module.scss";
import Network from "@/components/pages/trade/_cmpt/network";
import Ticker from "./ticker";

export const TradeFooter = () => {
  return (
    <div className={cs.container}>
      <div>
        <Network />
      </div>
      <span className={cs.splitLine}></span>
      <Ticker />
      <span className={cs.splitLine}></span>
      <div>
        <Notify pushPage={1} />
      </div>
    </div>
  );
};
