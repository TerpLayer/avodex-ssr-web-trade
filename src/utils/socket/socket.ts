import { record } from "@az/acc";

type GetTokenFunType = () => string | undefined;

export interface WsMsgProps {
  topic: string;
  event?: string;
  key?: string;
}
interface InputProps {
  url: string;
  token?: string | GetTokenFunType;
}

interface OutputProps {
  ws: WebSocket | null;
  isReady: boolean;
  addChannel: (message: WsMsgProps, callback: (data: any) => any) => void;
  removeChannel: (message: WsMsgProps) => void;
  close: () => void;
  createKey: () => string;
}

enum MethodEnum {
  subscribe = "subscribe",
  unsubscribe = "unsubscribe",
}

interface TreeCbItemProps {
  key: string;
  cb: (data: any, event?: string) => any;
}
interface TreeTopicProps {
  event: Partial<{
    [event: string]: TreeCbItemProps[];
  }>;
  cb: TreeCbItemProps[];
}
type TreeType = Partial<{
  [topic: string]: TreeTopicProps;
}>;

interface SendMsgItemProps {
  method: MethodEnum;
  params: string[];
  listenKey?: string;
}

const Socket: (arg: InputProps) => OutputProps = ({ url, token }) => {
  let Tree: TreeType = {};
  let SendMsgAry: SendMsgItemProps[] = [];

  let TaskInterval: number = 0;
  let TaskTimeout: number = 0;
  let PingPongTime: number = 0;
  let CloseFlag: boolean = false;

  const Socket: OutputProps = {
    ws: null,
    isReady: false,
    addChannel,
    removeChannel,
    close,
    createKey,
  };

  function addChannel(message: WsMsgProps, callback: (data: any) => any) {
    const { topic, event } = message;
    const key = (() => {
      if (message.key && typeof message.key === "string") return message.key;
      const key = createKey();
      message.key = key;
      return key;
    })();
    const cbItem: TreeCbItemProps = {
      key,
      cb: callback,
    };

    if (!Tree[topic]) {
      Tree[topic] = {
        event: {},
        cb: [],
      };

      const sendMsg: SendMsgItemProps = {
        method: MethodEnum.subscribe,
        params: [topic],
      };
      // _setTokenToObj(sendMsg);
      SendMsgAry.push(sendMsg);

      console.log(`%c【WS TOPIC=${topic} subscribe】新增`, "color:#1890ff", message);
    } else {
      console.log(`%c【WS TOPIC=${topic} subscribe】已存在`, "color:#1890ff", message);
    }

    const TreeTopic = Tree[topic] as TreeTopicProps;

    if (event) {
      if (!TreeTopic.event[event]) {
        TreeTopic.event[event] = [cbItem];
      } else {
        const TreeTopicEventAry = TreeTopic.event[event] as TreeCbItemProps[];
        if (TreeTopicEventAry.find((obj) => obj.key === key)) {
          console.log(`%c【WS TOPIC=${topic} subscribe】key已经存在！%o`, "color:orange", { Tree, message });
          return;
        }
        TreeTopicEventAry.push(cbItem);
      }
    } else {
      const TreeTopicCbAry = TreeTopic.cb;
      if (TreeTopicCbAry.find((obj) => obj.key === key)) {
        console.log(`%c【WS TOPIC=${topic} subscribe】key已经存在！%o`, "color:orange", { Tree, message });
        return;
      }
      TreeTopicCbAry.push(cbItem);
    }

    _emit();
  }
  function removeChannel(message: WsMsgProps) {
    const { topic, event, key } = message;
    if (!key) {
      console.log(`%c【WS TOPIC=${topic} unsubscribe】取消失败，key不存在！%o`, "color:orange", { Tree, message });
      return;
    }
    if (!Tree[topic]) {
      console.log(`%c【WS TOPIC=${topic} unsubscribe】取消失败，topic不存在！%o`, "color:orange", { Tree, message });
      return;
    }

    const TreeTopic = Tree[topic] as TreeTopicProps;

    if (event) {
      if (!TreeTopic.event[event]) {
        console.log(`%c【WS TOPIC=${topic} unsubscribe】未找到对应key事件！%o`, "color:orange", { Tree, message });
        return;
      } else {
        const TreeTopicEventAry = TreeTopic.event[event] as TreeCbItemProps[];
        const index = TreeTopicEventAry.findIndex((obj) => obj.key === key);
        if (index < 0) {
          console.log(`%c【WS TOPIC=${topic} unsubscribe】未找到对应key事件！%o`, "color:orange", { Tree, message });
          return;
        }
        TreeTopicEventAry.splice(index, 1);
        if (!TreeTopicEventAry.length) {
          delete TreeTopic.event[event];
        }
      }
    } else {
      const TreeTopicCbAry = TreeTopic.cb;
      const index = TreeTopicCbAry.findIndex((obj) => obj.key === key);
      if (index < 0) {
        console.log(`%c【WS TOPIC=${topic} unsubscribe】未找到对应key事件！%o`, "color:orange", { Tree, message });
        return;
      }
      TreeTopicCbAry.splice(index, 1);
    }

    if (TreeTopic.cb.length) {
      console.log(`%c【WS TOPIC=${topic} unsubscribe】订阅还在，事件已移除！%o`, "color:#9e1068", { Tree, message });
      return;
    }
    for (let va in TreeTopic.event) {
      if (va) {
        console.log(`%c【WS TOPIC=${topic} unsubscribe】订阅还在，事件已移除！%o`, "color:#9e1068", { Tree, message });
        return;
      }
    }

    delete Tree[topic];

    const sendMsg: SendMsgItemProps = {
      method: MethodEnum.unsubscribe,
      params: [topic],
    };
    // _setTokenToObj(sendMsg);
    SendMsgAry.push(sendMsg);

    console.log(`%c【WS TOPIC=${topic} unsubscribe】无其他事件，订阅销毁！%o`, "color:#9e1068", { Tree, message });
    _emit();
  }
  function close() {
    if (!Socket.ws) return;
    CloseFlag = true;
    _destroy();
    clearTimeout(TaskTimeout);
    Tree = {};
    SendMsgAry = [];
    PingPongTime = 0;
  }
  function createKey() {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Date.now() + "-" + Math.round(Math.random() * 1e5);
    }
  }

  return Socket;

  function _init() {
    const ws = (Socket.ws = new WebSocket(url));
    record({ t: "socket-event", event: "connect", project: "ssr-web-trade", socketUrl: url, pageUrl: location.href });
    //
    ws.onopen = () => {
      record({ t: "socket-event", event: "open" });
      console.log("%c【WS TOPIC open】", "color:#00aecc");
      clearTimeout(TaskTimeout);
      //RetryCount = 0;

      PingPongTime = Date.now();
      TaskInterval = window.setInterval(() => {
        if (PingPongTime && Date.now() - PingPongTime > 40000) {
          console.log("%c【WS TOPIC 没有响应，准备重连】", "color:orange");
          Socket.isReady = false;
          clearInterval(TaskInterval);
          return _retry(1);
        }
        ws.send("ping");
      }, 15000);

      CloseFlag = false;
      Socket.isReady = true;

      const topicAry: string[] = [];
      for (let va in Tree) {
        topicAry.push(va);
      }
      const sendMsg: SendMsgItemProps = {
        method: MethodEnum.subscribe,
        params: topicAry,
      };
      // _setTokenToObj(sendMsg);
      SendMsgAry = [sendMsg];

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

        if (!json) {
          console.error("【WS TOPIC onmessage error】%o", json);
          return;
        }

        if (!json.topic || !json.event || !json.data) return;

        if (!Tree[json.topic]) {
          console.log(`%c【WS TOPIC=${json.topic} onmessage】该topic不存在！%o`, "color:orange", { Tree, json });
          return;
        }

        const TreeTopic = Tree[json.topic] as TreeTopicProps;
        TreeTopic.cb.map((obj) => obj.cb(json.data, json.event));
        if (TreeTopic.event[json.event]) {
          TreeTopic.event[json.event]?.map((obj) => obj.cb(json.data));
        }
      } catch (e) {
        console.log("【catch WS TOPIC onmessage】%o", e);
      }
    };
    //
    ws.onerror = () => {
      record({ t: "socket-event", event: "error" });
      console.log("%c【WS TOPIC error】", "color:#ac2925");
      _destroy();
      _retry();
    };
    ws.onclose = () => {
      record({ t: "socket-event", event: "close" });
      console.log("%c【WS TOPIC close】", "color:orange");
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
      if (!msg || !Socket.ws) return;
      Socket.ws.send(JSON.stringify(msg));
      _send();
    } catch (e) {
      console.log("【catch WS TOPIC _send】%o", e);
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
      console.log("【catch WS TOPIC _destroy】%o", e);
    }
  }
  function _retry(flag?) {
    clearTimeout(TaskTimeout);
    //RetryCount++;
    //if (RetryCount > 10) return console.warn('【websocket 重连失败】');

    TaskTimeout = window.setTimeout(
      () => {
        console.log("【WS TOPIC 开始重连】");
        _init();
      },
      flag ? 0 : 3000
    );
  }

  function _setTokenToObj(obj) {
    if (token) {
      if (typeof token === "string") {
        obj.listenKey = token;
      } else if (typeof token === "function") {
        const listenKey = token();
        if (listenKey && typeof listenKey === "string") obj.listenKey = listenKey;
      }
    }
    return obj;
  }
};

export default Socket;
