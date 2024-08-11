export type MaybeReturnType<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : T;
