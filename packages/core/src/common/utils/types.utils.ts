/**
 * @returns whether the provided parameter is undefined.
 */
export function isUndefined(obj: any): obj is undefined {
  return typeof obj === 'undefined';
}

export function isNull(obj: any): obj is null {
  return obj === null;
}

/**
 * @returns whether the provided parameter is undefined or null.
 */
export function isUndefinedOrNull(obj: any): obj is undefined | null {
  return isUndefined(obj) || isNull(obj);
}

/**
 * @returns whether the provided parameter is defined.
 */
export function isDefined<T>(arg: T | null | undefined): arg is T {
  return !isUndefinedOrNull(arg);
}
