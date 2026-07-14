/** @returns Whether the provided parameter is defined. */
export const isDefined = <T>(arg: T | null | undefined): arg is T =>
  arg !== null && arg !== undefined;

/** Bind the first argument of a function while preserving the remaining signature. */
export function bindFirst<T, Args extends unknown[], R>(
  fn: (first: T, ...args: Args) => R,
  firstArg: T
): (...args: Args) => R {
  return (...args) => fn(firstArg, ...args);
}
