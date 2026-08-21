/** Modify type properties. https://stackoverflow.com/a/55032655/6689201 */
export type Modify<T, R> = Omit<T, keyof R> & R;

/** Remove the first parameter from a function type. */
export type OmitFirst<F> = F extends (
  first: infer _First,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;

/** Turn a union type into an intersection. */
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
