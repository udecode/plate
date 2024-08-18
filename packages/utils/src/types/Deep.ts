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

export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};
