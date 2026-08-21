export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}
