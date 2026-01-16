import { getOrigin } from "utils/method";
import Socket from "./socket";
import store from "store";

export default Socket({
  url: getOrigin("stream", { ws: true }) + "/private",
  token: () => {
    return store.user.token;
  },
});
