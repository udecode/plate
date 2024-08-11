import type { MaybeReturnType } from '../../types/misc/types';

import { isFunction } from './isFunction';

/**
 * Optionally calls `value` as a function. Otherwise it is returned directly.
 *
 * @param value Function or any value.
 * @param context Optional context to bind to function.
 * @param props Optional props to pass to function.
 */
export function callOrReturn<T>(value: T, ...props: any[]): MaybeReturnType<T> {
  if (isFunction(value)) {
    return value(...props);
  }

  return value as MaybeReturnType<T>;
}
