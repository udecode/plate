import React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value This utility takes care of different types
 * of refs: callback refs and React.RefObject(s)
 */
const setRef = <T>(ref: PossibleRef<T>, value: T) => {
  if (typeof ref === 'function') {
    return ref(value);
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
    const unrefs = refs.map((ref) => setRef(ref, node)).filter(unref => unref !== undefined);
    return () => unrefs.forEach(unref => unref());
  }

/**
 * A custom hook that composes multiple refs Accepts callback refs and
 * React.RefObject(s)
 */
export const useComposedRef = <T>(...refs: PossibleRef<T>[]) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(composeRefs(...refs), refs);
};
