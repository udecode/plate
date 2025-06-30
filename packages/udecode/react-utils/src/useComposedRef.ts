import React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value This utility takes care of different types
 * of refs: callback refs and React.RefObject(s)
 */
const setRef = <T>(ref: PossibleRef<T>, value: T) => {
  if (typeof ref === 'function') {
    const result = ref(value);
    // Ignore if callback ref returns a function (not allowed by React)
    if (typeof result === 'function') {
      return undefined;
    }
    return result;
  } else if (ref !== null && ref !== undefined) {
    (ref as React.RefObject<T>).current = value;
  }
};

/**
 * A utility to compose multiple refs together Accepts callback refs and
 * React.RefObject(s)
 */
export const composeRefs =
  <T>(...refs: PossibleRef<T>[]) =>
  (node: T) => {
    refs.forEach((ref) => setRef(ref, node));
    // Don't return a function - React doesn't allow callback refs to return functions
    return undefined;
  };

/**
 * A custom hook that composes multiple refs Accepts callback refs and
 * React.RefObject(s)
 */
export const useComposedRef = <T>(...refs: PossibleRef<T>[]) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(composeRefs(...refs), refs);
};
