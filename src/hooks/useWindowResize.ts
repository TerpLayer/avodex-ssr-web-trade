import { useEffect } from "react";

function useWindowResize(callback: () => void, ms: number = 100) {
  useEffect(() => {
    let timeout;
    window.addEventListener("resize", onResize);
    callback();

    return () => {
      timeout && clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };

    function onResize() {
      // console.log("【call】onResize");
      if (timeout) return;
      timeout = setTimeout(() => {
        timeout = null;
        callback();
      }, 100);
    }
  }, []);
}

export default useWindowResize;