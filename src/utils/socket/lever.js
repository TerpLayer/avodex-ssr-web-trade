/**
 * websocket 实例封装
 * 2022-07-26
 * 每15秒钟进行心跳连接，超过40秒没有数据响应，ws进行重连，
 * 每次重连间隔3秒，直到连接成功
 * 不过即使断线，任何一个 addChannel 方法，都会重启 ws
 * message = {
 *   event: "kline@btc_usdt,5m"
 * }
 */

import { getOrigin } from "utils/method";
import store from "store";
import { record } from "@az/acc";

export default ((wsUrl) => {
  //变量
  let EventObj = {}; //事件对象
  let SendMsgAry = []; //发送消息队列
  let TaskInterval, TaskTimeout, PingPongTime, CloseFlag;

  /*========== api ==========*/
  const Socket = {
    ws: null, //websocket 实例
    isReady: false, //websocket是否一切就绪
  };
  //接口列表
  Socket.addChannel = (message, callback) => {
    console.log("%c【WS lever addChannel】", "color:#1890ff", message);
    const msg = {
      op: "subscribe",
      args: [
        {
          ...message,
          userKey: store.user.leverWsUserKey,
        },
      ],
    };
    EventObj[Socket.getMark(message)] = { callback, msg };
    SendMsgAry.push(msg);
    _emit();
  }; //添加频道
  Socket.removeChannel = (message) => {
    console.log("%c【WS lever removeChannel】", "color:#9e1068", message);
    const msg = {
      op: "unsubscribe",
      args: [message],
    };
    delete EventObj[Socket.getMark(message)];
    SendMsgAry.push(msg);
    _emit();
  }; //移除频道
  Socket.close = () => {
    if (!Socket.ws) return;
    CloseFlag = true;
    _destroy();
    clearTimeout(TaskTimeout);
    EventObj = {};
    SendMsgAry = [];
    PingPongTime = 0;
  }; //关闭断开socket
  Socket.getMark = (message) => {
    if (!message || !message.channel) return false;

    const { channel, marketName } = message;
    let result = [channel, marketName];

    return result.join("@");
  }; //生成订阅标识

  return Socket;

  /*========== 私有函数 ==========*/
  function _init() {
    const ws = (Socket.ws = new WebSocket(wsUrl));
    record({ t: "socket-event", event: "connect", project: "ssr-web-trade", socketUrl: wsUrl, pageUrl: location.href });
    //
    ws.onopen = () => {
      record({ t: "socket-event", event: "open" });
      console.log("%c【WS lever open】", "color:#00aecc");
      clearTimeout(TaskTimeout);
      //RetryCount = 0;

      PingPongTime = Date.now();
      TaskInterval = setInterval(() => {
        if (PingPongTime && Date.now() - PingPongTime > 40000) {
          console.log("%c【WS lever 没有响应，准备重连】", "color:orange");
          Socket.isReady = false;
          clearInterval(TaskInterval);
          return _retry(1);
        }
        ws.send("ping");
      }, 15000);

      CloseFlag = false;
      Socket.isReady = true;

      SendMsgAry = [];
      for (let va in EventObj) {
        SendMsgAry.push(EventObj[va].msg);
      }
      // console.log("SendMsgAry %o", SendMsgAry);
      _send();
    };
    ws.onmessage = ({ data }) => {
      try {
        if (data === "ping") {
          ws.send("pong");
          PingPongTime = Date.now();
          return;
        }
        if (data === "pong") {
          PingPongTime = Date.now();
          return;
        }

        const json = JSON.parse(data);
        // console.log(json);

        if (!json || json.code !== 200 || !json.data) {
          console.error("【WS lever onmessage error】%o", json);
          return;
        }

        if (json.data === "ping") {
          ws.send("pong");
          PingPongTime = Date.now();
          return;
        }
        if (json.data === "pong") {
          PingPongTime = Date.now();
          return;
        }

        const event = Socket.getMark(json.data);
        if (EventObj[event]) {
          //console.log(`ws4 ${event} ======`, json.data);
          EventObj[event].callback(json.data);
        } else {
          console.log("%c【WS lever onmessage】对应事件不存在！%o", "color:orange", { event, EventObj });
        }
      } catch (e) {
        console.log("【catch WS lever onmessage】%o", e);
      }
    };
    //
    ws.onerror = () => {
      record({ t: "socket-event", event: "error" });
      console.log("%c【WS lever error】", "color:#ac2925");
      _destroy();
      _retry();
    };
    ws.onclose = () => {
      record({ t: "socket-event", event: "close" });
      console.log("%c【WS lever close】", "color:orange");
      _destroy();
      !CloseFlag && _retry();
    };
  }

  function _emit() {
    if (Socket.isReady) return _send();
    if (Socket.ws) return;
    _init();
  }

  function _send() {
    try {
      const msg = SendMsgAry.shift();
      if (!msg) return;
      Socket.ws.send(JSON.stringify(msg));
      _send();
    } catch (e) {
      console.log("【catch WS lever _send】%o", e);
    }
  }

  function _destroy() {
    try {
      TaskInterval && clearInterval(TaskInterval);
      Socket.isReady = false;
      const ws = Socket.ws;
      Socket.ws = null;
      ws && ws.close();
    } catch (e) {
      console.log("【catch WS lever _destroy】%o", e);
    }
  }

  function _retry(flag) {
    clearTimeout(TaskTimeout);
    //RetryCount++;
    //if (RetryCount > 10) return console.warn('【websocket 重连失败】');

    TaskTimeout = setTimeout(
      () => {
        console.log("【WS lever 开始重连】");
        _init();
      },
      flag ? 0 : 3000
    );
  }
})(getOrigin("www", { ws: true }) + "/exapi/lever/ws?client=web");
