const tabCfgAry = [
  {
    key: "user",
  },
  {
    key: "usds",
    label: "USDⓈ",
    buyCoinAry: ["usdt", "pax", "tusd", "ausd", "usdc", "ust", "busd"], //过滤包含的买方币数组
  },
  // {
  //   key: "etf",
  //   label: "ETF",
  //   noHidden: true, //出现该字段，取消"将浅度隐藏的市场过滤掉"逻辑
  // },
  // {
  //   key: "btc",
  //   label: "BTC",
  //   buyCoinAry: ["btc"],
  // },
  // {
  //   key: "eth",
  //   label: "ETH",
  //   buyCoinAry: ["eth"],
  // },
  // //ALTS
  // {
  //   key: "sol",
  //   label: "SOL",
  //   buyCoinAry: ["sol"],
  //   group: "ALTS",
  // },
  // {
  //   key: "bnb",
  //   label: "BNB",
  //   buyCoinAry: ["bnb"],
  //   group: "ALTS",
  // },
  // {
  //   key: "bitci",
  //   label: "BITCI",
  //   buyCoinAry: ["bitci"],
  //   group: "ALTS",
  // },
  // {
  //   key: "matic",
  //   label: "MATIC",
  //   buyCoinAry: ["matic"],
  //   group: "ALTS",
  // },
  //zone
  {
    key: "zone",
  },
];

export default tabCfgAry;
