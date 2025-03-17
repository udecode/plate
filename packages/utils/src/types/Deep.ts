export declare type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends {
          [key in keyof T]: T[key];
        }
      ? {
          [K in keyof T]?: DeepPartial<T[K]>;
        }
      : T;

/** 2 levels deep of partial */
export type Deep2Partial<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? T[K]
    : Deep2Partial<T[K]>;
};

export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};
