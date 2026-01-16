import { useCallback } from "react";
import { record } from "@az/acc";

interface ObjAnyProps {
  [key: string]: any;
}

type RetType = (filePath: string) => (arg: ObjAnyProps) => void;

const useRecord: RetType = (filePath: string) => {
  const fn = useCallback(
    (arg) => {
      try {
        const send = {
          t: "trade",
          filePath,
          ...arg,
        };
        record(send);
        console.log("record(", send);
      } catch (e) {
        console.error(e);
      }
    },
    [filePath]
  );

  return fn;
};

export default useRecord;
