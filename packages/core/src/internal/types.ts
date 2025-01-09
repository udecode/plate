export type MaybeReturnType<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : T;

export type NoInfer<T> = [T][T extends any ? 0 : never];
