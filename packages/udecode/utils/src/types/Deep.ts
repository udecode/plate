/** Recursively make nested object fields optional while retaining functions. */
export type Deep2Partial<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : Deep2Partial<T[K]>;
};
