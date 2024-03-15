export declare type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends {
          [key in keyof T]: T[key];
        }
      ? {
          [K in keyof T]?: DeepPartial<T[K]>;
        }
      : T;
