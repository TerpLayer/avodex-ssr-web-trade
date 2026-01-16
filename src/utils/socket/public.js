import { getOrigin } from "utils/method";
import Socket from "./core";

export default Socket(getOrigin("stream", { ws: true }) + "/public");
