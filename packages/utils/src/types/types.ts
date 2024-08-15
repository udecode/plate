import type { AnyObject } from './AnyObject';

export type OmitFirst<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;

export type WithRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
/**
 * Makes each property optional and turns each leaf property into any, allowing
 * for type overrides by narrowing any.
 */

export type DeepPartialAny<T> = {
  [P in keyof T]?: T[P] extends AnyObject ? DeepPartialAny<T[P]> : any;
};

/** Simplify a complex type expression into a single object. */
export type Simplify<T> = T extends Date | any[]
  ? T
  : { [K in keyof T]: T[K] } & {};

/** Turn a union type into an intersection. */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/** Modify type properties. https://stackoverflow.com/a/55032655/6689201 */
export type Modify<T, R> = Omit<T, keyof R> & R;

/** Modify deep type properties. https://stackoverflow.com/a/65561287/6689201 */
export type ModifyDeep<A extends AnyObject, B extends DeepPartialAny<A>> = {
  [K in keyof A]: B[K] extends never
    ? A[K]
    : B[K] extends AnyObject
      ? ModifyDeep<A[K], B[K]>
      : B[K];
} & (A extends AnyObject ? Omit<B, keyof A> : A);

export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};

export type WithPartial<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
