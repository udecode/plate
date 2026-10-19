/** @returns Whether the provided parameter is defined. */
export const isDefined = <T>(arg: T | null | undefined): arg is T =>
  arg !== null && arg !== undefined;
