/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyFunction = (...args: any[]) => void;

export interface Frames<F extends AnyFunction = AnyFunction> {
    next(...args: Parameters<F>): void;

    cancel(): void;
}

export const frames = <F extends AnyFunction>(fn: F): Frames<F> => {
    let previousArgs: Parameters<F>;
    let frameId = -1;
    let lock = false;

    return {
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
        cancel() {
            cancelAnimationFrame(frameId);
            lock = false;
        }
    };
};
