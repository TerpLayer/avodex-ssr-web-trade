import { useEffect } from "react";
function useAsyncEffect<V>(
  effect: (isActive: () => boolean) => V | Promise<V>,
  destroy?: ((result?: V) => void) | any[] | never[],
  dependencies?: any[] | never[]
) {
  const hasDestroy = typeof destroy === "function";
  useEffect(
    () => {
      let result: V | undefined;
      let mounted = true;
      let maybePromise = effect(() => mounted);
      Promise.resolve(maybePromise).then((value) => {
        result = value;
      });
      // 组件卸载
      return () => {
        mounted = false;
        hasDestroy && destroy(result);
      };
    },
    hasDestroy ? dependencies : destroy
  );
}

export default useAsyncEffect;
