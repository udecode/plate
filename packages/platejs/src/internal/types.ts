export type MaybeReturnType<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : T;

export type UnionToIntersection<U> = (
  U extends unknown ? (value: U) => void : never
) extends (value: infer I) => void
  ? I
  : never;

export type NoInfer<T> = [T][T extends any ? 0 : never];
