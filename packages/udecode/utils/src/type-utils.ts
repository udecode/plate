/** @returns Whether the provided parameter is undefined. */
export const isUndefined = (obj: any): obj is undefined => obj === undefined;

export const isNull = (obj: any): obj is null => obj === null;

/** @returns Whether the provided parameter is undefined or null. */
export const isUndefinedOrNull = (obj: any): obj is null | undefined =>
  isUndefined(obj) || isNull(obj);

/** @returns Whether the provided parameter is defined. */
export const isDefined = <T>(arg: T | null | undefined): arg is T =>
  !isUndefinedOrNull(arg);

export function bindFirst<T, Args extends any[], R>(
  fn: (first: T, ...args: Args) => R,
  firstArg: T
): (...args: Args) => R {
  return (...args) => fn(firstArg, ...args);
}
