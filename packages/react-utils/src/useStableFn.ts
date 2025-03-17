import React from 'react';

/**
 * Create a stable version of a function that can be used in dependency arrays
 * without causing hooks like useEffect to re-run if the function changes.
 * Calling the returned function always calls the most recent version of the
 * function that was passed to useStableFn.
 */
export const useStableFn = <A extends unknown[], R>(fn: (...args: A) => R) => {
  const fnRef = React.useRef(fn);
  fnRef.current = fn;
  return React.useCallback((...args: A) => fnRef.current(...args), []);
};
