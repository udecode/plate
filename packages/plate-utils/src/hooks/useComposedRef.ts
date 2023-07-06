import { MutableRefObject, Ref, useCallback } from 'react';

type PossibleRef<T> = Ref<T> | undefined;

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
const setRef = <T>(ref: PossibleRef<T>, value: T) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as MutableRefObject<T>).current = value;
  }
};

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
export const composeRefs =
  <T>(...refs: PossibleRef<T>[]) =>
  (node: T) =>
    refs.forEach((ref) => setRef(ref, node));

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
export const useComposedRef = <T>(...refs: PossibleRef<T>[]) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(composeRefs(...refs), refs);
};
