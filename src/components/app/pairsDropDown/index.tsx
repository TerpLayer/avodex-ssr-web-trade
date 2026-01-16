import store from "@/store";
import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
// import { Hooks } from "@az/base";
import AppDropdown from "components/app/dropdown";
// const { useTranslation } = Hooks;
interface Props {
  getDetailSubscribe: (dealPair: string) => void;
}

const PairsDropDown: React.FC<Props> = ({ getDetailSubscribe }) => {
  // const t = useTranslation();
  const { etfDealPairListData, name } = store.market;
  const [optionAtvKey, setOptionAtvKey] = useState("");

  const handlerClick = (dealPairName) => {
    setOptionAtvKey(dealPairName);
    getDetailSubscribe(dealPairName);
  };

  useEffect(() => {
    const selectItem = etfDealPairListData.find((item) => item.dealPairName === name);
    selectItem ? setOptionAtvKey(name) : etfDealPairListData.length ? setOptionAtvKey(etfDealPairListData[0].dealPairName) : setOptionAtvKey("");
  }, [name, etfDealPairListData]);

  const items = useMemo(() => {
    return etfDealPairListData.map((item) => ({
      key: item.dealPairName,
      label: item.name,
    }));
  }, [etfDealPairListData]);

  return (
    <>
      <AppDropdown value={optionAtvKey} items={items} onChange={handlerClick} />
    </>
  );
};

export default observer(PairsDropDown);
