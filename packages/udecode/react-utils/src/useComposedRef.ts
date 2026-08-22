import React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value This utility takes care of different types
 * of refs: callback refs and React.RefObject(s)
 */
const setRef = <T>(ref: PossibleRef<T>, value: T | null) => {
  if (typeof ref === 'function') {
    return ref(value);
  }
  if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
};

/**
 * A utility to compose multiple refs together Accepts callback refs and
 * React.RefObject(s)
 */
export const composeRefs =
  <T>(...refs: Array<PossibleRef<T>>) =>
  (node: T | null) => {
    const cleanups: Array<(() => void) | undefined> = [];

    refs.forEach((ref) => {
      const cleanup = setRef(ref, node);
      if (typeof cleanup === 'function') {
        cleanups.push(cleanup);
      }
    });

    // Return a cleanup function if any refs returned cleanup functions
    if (cleanups.length > 0) {
      return () => {
        for (const cleanup of cleanups) {
          cleanup?.();
        }
      };
    }

    return undefined;
  };

/**
 * A custom hook that composes multiple refs Accepts callback refs and
 * React.RefObject(s)
 */
export const useComposedRef = <T>(...refs: Array<PossibleRef<T>>) =>
  // The callback identity must change with the supplied refs so React detaches
  // replaced refs and runs their cleanup functions.
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] Each variadic ref is itself the dependency; expanding the array would change neither identity nor cleanup semantics.
  React.useCallback(composeRefs(...refs), refs);
