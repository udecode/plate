import React, { type DependencyList } from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Create a stable version of a function that can be used in dependency arrays
 * without causing hooks like useEffect to re-run if the function changes.
 * Calling the returned function always calls the most recent version of the
 * function that was passed to useStableFn.
 *
 * Pass dependencies only when consumers need the returned callback identity
 * to change with an external subscription boundary.
 *
 */
export const useStableFn = <A extends unknown[], R>(
  fn: (...args: A) => R,
  deps: DependencyList = []
) => {
  const fnRef = React.useRef(fn);

  useIsomorphicLayoutEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return React.useCallback((...args: A) => fnRef.current(...args), deps);
};
