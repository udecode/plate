/** Dynamic object whose values are intentionally unchecked. Prefer `UnknownObject` for narrowing. */
export type AnyObject = Record<string, any>;

/** Dynamic object whose values must be narrowed before use. */
export type UnknownObject = Record<string, unknown>;
