/**
 * global method
 */

import { Util } from "@az/base";
const { Big } = Util;
import { ClsUpDownEnum } from "store/app";

export function getHosts(): { host: string; protocol: string } {
  let host, protocol;
  if (typeof window === "undefined") {
    //server side
    host = process.env.NEXT_PUBLIC_host;
    protocol = process.env.NEXT_PUBLIC_protocol;
  } else {
    const isLocal = location.hostname === "localhost" || /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(location.hostname);
    host = isLocal ? process.env.NEXT_PUBLIC_host : location.host;
    protocol = isLocal ? process.env.NEXT_PUBLIC_protocol : location.protocol;
  }

  return { host, protocol };
}

export function getOrigin(api?: WithUndefined<string>, options?: { ws?: boolean; noProtocol?: boolean }) {
  const { host, protocol } = getHosts();

  const topDomain = host.split(".").slice(-2).join(".");
  const domain = (api ? `${api}.` : "") + topDomain;
  if (!options) return `${protocol}//` + domain;
  if (options.ws) return `${protocol.includes("https") ? "wss" : "ws"}://` + domain;
  if (options.noProtocol) return domain;
}

interface GetServerSideDomainProps {
  inner: string;
  local: string;
  noLocalDomain?: boolean;
}
export function getServerSideDomain(arg: GetServerSideDomainProps): string {
  let domain = arg.inner;
  if (process.env.NEXT_PUBLIC_LOCAL) {
    if (arg.noLocalDomain) {
      domain = arg.local;
    } else {
      const { host, protocol } = getHosts();
      domain = protocol + "//" + host + arg.local;
    }
  }
  return domain;
}

/**
 * 创建ele元素
 * @parEle 父节点
 * @tag Sting，标签字符串
 * @argObj Object，参数
 */
export function $cre(parEle, tag, argObj) {
  !tag && (tag = "div");
  if (typeof tag !== "string") return;

  const ele = document.createElement(tag);

  if (argObj && typeof argObj === "object") {
    for (const va in argObj) {
      if (va === "style" && typeof argObj[va] === "object") {
        for (const vaSub in argObj[va]) ele[va][vaSub] = argObj[va][vaSub];
      } else {
        ele[va] = argObj[va];
      }
    }
  }

  if (parEle) {
    if (typeof parEle === "string") parEle = document.getElementById(parEle);
    parEle.appendChild && parEle.appendChild(ele);
  }

  return ele;
}

/**
 * 监听ele元素的尺寸变化
 * @ele DOM Element，不存在默认 documentElement
 * @callback 回调函数，参数 target Element
 */
export function eleResizeObserver(ele, callback) {
  try {
    const resizeObserver = new ResizeObserver((entries) => {
      // console.log("%c【method.js】resizeObserver %o", "color:#00aecc", entries[0].target);
      callback(entries[0].target);
    });
    resizeObserver.observe(ele || document.documentElement);
  } catch (e) {
    const iframe = $cre(ele || document.body, "iframe", {
      style: {
        position: "absolute",
        zIndex: "-1",
        top: "0",
        bottom: "0",
        left: "0",
        height: "100%",
        width: "100%",
        border: "none",
        opacity: "0",
        background: "transparent",
      },
    }) as any;
    iframe.contentWindow.onresize = function (e) {
      console.log("%c【method.js】iframe.onresize %o", "color:#00aecc", e.target.document.documentElement);
      callback(e.target.document.documentElement);
    };
  }
}

//获取3种状态之一
interface GetThreeStatusProps {
  gt?: any;
  eq?: any;
  lt?: any;
}
export function getOneByThreeStatus(obj: GetThreeStatusProps, value?: number | string) {
  const valueFormat = +(value || 0) || 0;
  if (valueFormat > 0) return obj.gt;
  if (valueFormat < 0) return obj.lt;
  return obj.eq;
}

//获取涨跌幅样式
export function getUpDownCls(value: number | string | undefined, ret3Mode?: boolean): WithUndefined<ClsUpDownEnum> {
  const valueFormat = +(value || 0) || 0;
  if (!valueFormat) return ret3Mode ? undefined : ClsUpDownEnum.down;

  return valueFormat > 0 ? ClsUpDownEnum.up : ClsUpDownEnum.down;
}

//路由
interface RouterPushOptionProps {
  method?: string; //push
  symbol: string;
  isLever?: boolean;
}
export function routerPush(router, { method = "push", symbol, isLever }: RouterPushOptionProps) {
  const query = isLever ? "?type=margin" : "";
  router[method]("/trade/" + symbol + query, undefined, { shallow: true });
}

//获取 children slot
export function getChildrenSlot(children) {
  const eleAry = (() => {
    if (!children) return [];
    if (children instanceof Array) return children;
    if (typeof children === "object") return [children];
    return [];
  })();

  const slots = eleAry.reduce((slots, item) => {
    item.props.slot && (slots[item.props.slot] = item);
    return slots;
  }, {});

  return slots;
}

/**
 * 千分位分隔符函数，用于对数字字符串进行千分位分隔，且不改变小数位
 * strOrNum 数字或者字符串
 */
export function thousands(strOrNum: string | number): string {
  const ary = ((strOrNum || 0) + "").split(".");
  const retAry = [ary[0].replace(/\d(?=(\d{3})+$)/g, "$&,")];
  ary[1] && retAry.push(ary[1]);
  return retAry.join(".");
}

/**
 * 数值缩进格式展示，返回字符串（默认是千分位分割字符串）
 * 若小数位不低于8位且存在至少连续4个0，数值中的0缩进展示，如：0.00000001展示为：0.0{7}1，括号中的数值表示0的个数（包含括号外的0）
 * strOrNum 数字或者数字符串（不能有千分位分割）
 */
export function numberIndented(strOrNum: string | number): string {
  let retStr = "";
  if (!strOrNum) return retStr;
  if (typeof strOrNum === "number") {
    retStr = Big(strOrNum).toFixed();
  } else {
    retStr = strOrNum;
  }
  const ary = retStr.split(".");
  const decimalPart = ary[1];
  if (decimalPart && /^[0-9]{8}/.test(decimalPart)) {
    const decimalIndented = decimalPart.replace(/0{4,}/g, (str) => {
      if (new RegExp(`${str}[^\\d]*$`).test(decimalPart)) return str;
      return `0{${str.length}}`;
    });
    retStr = ary[0] + "." + decimalIndented;
  }

  return thousands(retStr);
}

//首字母大写
export function upperCaseFirstLetter(str: string) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

//返回千分位分割字符串，对大于 1000 的数字加 K M B 单位，且精度固定保留 3 位
export function filterBigNumThousands(strOrNum: string | number, precision?: number): string {
  // if (+strOrNum >= 1e7) {
  if (+strOrNum - 1e9 >= 0)
    return (
      Big(strOrNum || 0)
        .div(1e9)
        .toFixedCy(3) + "B"
    );
  if (+strOrNum - 1e6 >= 0)
    return (
      Big(strOrNum || 0)
        .div(1e6)
        .toFixedCy(3) + "M"
    );
  if (+strOrNum - 1e3 >= 0)
    return (
      Big(strOrNum || 0)
        .div(1e3)
        .toFixedCy(3) + "K"
    );
  // }

  if ((precision && precision > 0) || precision === 0) return Big(strOrNum || 0).toFixedCy(precision);

  return thousands(strOrNum);
}

/**
 * 获取url中search字段，譬如 getUrlSearchAttr('token')
 * @param regStr，属性字段
 * @param exact，是否精确匹配大小写
 * @param urlStr，如果存在，使用该字符串作为查找对象
 * @returns {string}，返回对应属性的值
 */
export function getUrlSearchAttr(regStr, exact?, urlStr?) {
  let todoStr = typeof window !== undefined ? window.location.search : "";
  if (urlStr && typeof urlStr === "string") {
    urlStr.indexOf("?") < 0 && (urlStr = "?" + urlStr);
    todoStr = urlStr;
  }

  const regExp = new RegExp("[?&]" + regStr + "=[^&]+", exact ? "g" : "gi");
  let value = "",
    temp;
  todoStr.replace(regExp, ((str) => {
    temp = str.split("=")[1];
    temp && (value = decodeURIComponent(temp));
  }) as any);

  return value;
}

/**
 * 将 text 文本复制到剪切板
 * @param text，需要复制的文本
 * 这个是同步函数，返回 true 说明复制成功，false 失败
 */
export function copy(text) {
  const ele = document.createElement("textarea");
  ele.readOnly = true;
  ele.style.position = "fixed";
  ele.style.opacity = "0";
  ele.style.width = "0";
  ele.style.height = "0";
  ele.value = text;
  document.body.appendChild(ele);
  ele.focus();
  //ele.select(); //not working in mobile
  ele.setSelectionRange(0, ele.value.length);
  const result = document.execCommand("copy");
  ele.parentNode && ele.parentNode.removeChild(ele);
  return result;
}
/**
 * @param value
 * @returns
 */
export function disposePrecision(value?: number | string, point = 3) {
  if (typeof value === "string") return value;
  let str = "";
  for (let i = 1; i < point; i++) {
    str += 0;
  }
  str += "1";
  str = "0." + str;

  const minus001 = (value ? +value : 0) - +str;
  if (minus001 >= 0) {
    return Big(value || 0).toFixedCy(point);
  }
  return Big(value || 0).toFixedMax(8);
}

export const point2Percent = (point: string) => {
  const pointBig = new Big(+point);
  const big100 = new Big(100);
  return pointBig.times(big100).toNumber();
};
