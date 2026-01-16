/**
 * websocket 实例封装
 * 2022-07-26
 //* 每15秒钟进行心跳连接，超过40秒没有数据响应，ws进行重连，
 * 每5秒钟进行心跳连接，超过2次ping没有数据响应，第3次则ws进行重连，
 * 每次重连间隔3秒，直到连接成功
 * 不过即使断线，任何一个 addChannel 方法，都会重启 ws
 * message = {
 *   event: "kline@btc_usdt,5m"
 * }
 */

import store from "store";
import { record } from "@az/acc";

export default (wsUrl, isListenKey) => {
  //变量
  let EventObj = {}; //事件对象
  let SendMsgAry = []; //发送消息队列
  let TaskInterval,
    TaskTimeout,
    // PingPongTime,
    CloseFlag,
    PingTs,
    PingCounts = 0;

  /*========== api ==========*/
  const Socket = {
    ws: null, //websocket 实例
    isReady: false, //websocket是否一切就绪
  };
  //接口列表
  Socket.addChannel = (message, callback) => {
    // console.log("%c【WS addChannel】", "color:#1890ff", message);
    const { event } = message;
    const key = (() => {
      if (message.key && typeof message.key === "string") return message.key;
      const key = createKey();
      message.key = key;
      return key;
    })();
    const msg = {
      method: "subscribe",
      params: [event],
    };
    isListenKey && (msg.listenKey = store.user.token);
    !EventObj[event] && (EventObj[event] = { msg, cb: [] });
    if (!EventObj[event].cb.length) SendMsgAry.push(msg);
    else if (EventObj[event].cb.find((obj) => obj.key === key)) return console.log("%c【WS addChannel】已经存在！%o", "color:orange", { message, EventObj });
    EventObj[event].cb.push({ callback, msg, key });
    // EventObj[event] = { callback, msg };
    // SendMsgAry.push(msg);
    console.log("%c【WS addChannel】", "color:green", { message, EventObj });
    _emit();
  }; //添加频道
  Socket.removeChannel = (message) => {
    // console.log("%c【WS removeChannel】", "color:#9e1068", message);
    const { event, key } = message;
    const msg = {
      method: "unsubscribe",
      params: [event],
    };
    isListenKey && (msg.listenKey = store.user.token);

    if (key && EventObj[event] && EventObj[event].cb && EventObj[event].cb.length) {
      const index = EventObj[event].cb.findIndex((obj) => obj.key === key);
      if (index > -1) {
        EventObj[event].cb.splice(index, 1);
      }
      if (EventObj[event].cb.length > 0) return console.log("%c【WS removeChannel】还有其他监听！%o", "color:blue", { event, EventObj });
    }

    delete EventObj[event];
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
    // PingPongTime = 0;
    PingCounts = 0;
  }; //关闭断开socket
  Socket.connectCounts = 0;
  Socket._emit = _emit;

  function createKey() {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Date.now() + "-" + Math.round(Math.random() * 1e5);
    }
  }

  return Socket;

  /*========== 私有函数 ==========*/
  function _init() {
    const ws = (Socket.ws = new WebSocket(wsUrl));
    Socket.connectCounts += 1;
    Socket.stateCb &&
      Socket.stateCb({
        connectCounts: Socket.connectCounts,
        readyState: ws.readyState,
        ts: 0,
        desc: "_init",
      });
    record({ t: "socket-event", event: "connect", project: "ssr-web-trade", socketUrl: wsUrl, pageUrl: location.href });
    //
    ws.onopen = () => {
      record({ t: "socket-event", event: "open" });
      console.log("%c【WS open】", "color:#00aecc");
      Socket.stateCb &&
        Socket.stateCb({
          connectCounts: Socket.connectCounts,
          readyState: ws.readyState,
          ts: 0,
          desc: "onopen",
        });
      clearTimeout(TaskTimeout);
      //RetryCount = 0;

      ws.send("ping");
      PingTs = Date.now();
      PingCounts += 1;

      // PingPongTime = Date.now();
      TaskInterval = setInterval(() => {
        // if (PingPongTime && Date.now() - PingPongTime > 40000) {
        if (PingCounts >= 2 || (PingCounts && !window.navigator.onLine)) {
          console.log("%c【WS 没有响应，准备重连】", "color:orange");
          Socket.isReady = false;
          clearInterval(TaskInterval);
          Socket.stateCb &&
            Socket.stateCb({
              connectCounts: Socket.connectCounts,
              readyState: 4,
              ts: 0,
              desc: "Reconnect",
            });
          return _retry(1);
        }
        PingCounts &&
          Socket.stateCb &&
          Socket.stateCb({
            connectCounts: Socket.connectCounts,
            readyState: ws.readyState,
            ts: PingCounts * 5000,
            desc: "TaskInterval",
          });
        ws.send("ping");
        PingTs = Date.now();
        PingCounts += 1;
      }, 5000);

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
          // PingPongTime = Date.now();
          return;
        }
        if (data === "pong") {
          Socket.stateCb &&
            Socket.stateCb({
              connectCounts: Socket.connectCounts,
              readyState: ws.readyState,
              ts: Date.now() - PingTs,
              desc: "pong",
            });
          // PingPongTime = Date.now();
          PingCounts = 0;
          return;
        }

        const json = JSON.parse(data);
        // console.log(json);

        if (!json) {
          console.error("【WS onmessage error】%o", json);
          return;
        }

        if (!json.event || !json.data) return;

        const event = json.event;
        if (EventObj[event]) {
          //console.log(`ws4 ${event} ======`, json.data);
          // EventObj[event].callback(json.data);
          EventObj[event].cb.map((item) => {
            item.callback(json.data);
          });
        } else {
          console.log("%c【WS onmessage】对应事件不存在！%o", "color:orange", { event, EventObj });
        }
      } catch (e) {
        console.log("【catch WS onmessage】%o", e);
      }
    };
    //
    ws.onerror = () => {
      Socket.stateCb &&
        Socket.stateCb({
          connectCounts: Socket.connectCounts,
          readyState: ws.readyState,
          ts: 0,
          desc: "onerror",
        });
      record({ t: "socket-event", event: "error" });
      console.log("%c【WS error】", "color:#ac2925");
      _destroy();
      _retry();
    };
    ws.onclose = () => {
      Socket.stateCb &&
        Socket.stateCb({
          connectCounts: Socket.connectCounts,
          readyState: ws.readyState,
          ts: 0,
          desc: "onclose",
        });
      record({ t: "socket-event", event: "close" });
      console.log("%c【WS close】", "color:orange");
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
      console.log("【catch WS _send】%o", e);
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
      console.log("【catch WS _destroy】%o", e);
    }
  }

  function _retry(flag) {
    clearTimeout(TaskTimeout);
    //RetryCount++;
    //if (RetryCount > 10) return console.warn('【websocket 重连失败】');

    if (!window.navigator.onLine) {
      TaskTimeout = setTimeout(() => {
        _retry(flag);
      }, 300);
      return;
    }

    TaskTimeout = setTimeout(
      () => {
        console.log("【WS 开始重连】");
        _init();
      },
      flag ? 0 : 3000
    );
  }
};
