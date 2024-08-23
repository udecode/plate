/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyFunction = (...args: any[]) => void;

export interface Frames<F extends AnyFunction = AnyFunction> {
  cancel: () => void;

  next: (...args: Parameters<F>) => void;
}

export const frames = <F extends AnyFunction>(fn: F): Frames<F> => {
  let previousArgs: Parameters<F>;
  let frameId = -1;
  let lock = false;

  return {
    cancel() {
      cancelAnimationFrame(frameId);
      lock = false;
    },
    next(...args: Parameters<F>): void {
      previousArgs = args;

      if (!lock) {
        lock = true;
        frameId = requestAnimationFrame(() => {
          fn(...previousArgs);
          lock = false;
        });
      }
    },
  };
};
