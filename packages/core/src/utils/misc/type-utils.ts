/**
 * @returns whether the provided parameter is undefined.
 */
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined';

export const isNull = (obj: any): obj is null => obj === null;

/**
 * @returns whether the provided parameter is undefined or null.
 */
export const isUndefinedOrNull = (obj: any): obj is undefined | null =>
  isUndefined(obj) || isNull(obj);

/**
 * @returns whether the provided parameter is defined.
 */
export const isDefined = <T>(arg: T | null | undefined): arg is T =>
  !isUndefinedOrNull(arg);
