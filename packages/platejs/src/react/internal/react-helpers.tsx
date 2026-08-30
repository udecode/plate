import React, { type DependencyList } from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

const setRef = <T,>(ref: PossibleRef<T>, value: T | null) => {
  if (typeof ref === 'function') return ref(value);
  if (ref !== null && ref !== undefined) ref.current = value;
};

export const composeRefs =
  <T,>(...refs: Array<PossibleRef<T>>) =>
  (node: T | null) => {
    const cleanups = refs
      .map((ref) => setRef(ref, node))
      .filter(
        (cleanup): cleanup is () => void => typeof cleanup === 'function'
      );

    return cleanups.length > 0
      ? () => {
          for (const cleanup of cleanups) cleanup();
        }
      : undefined;
  };

export const useComposedRef = <T,>(...refs: Array<PossibleRef<T>>) =>
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- Each variadic ref is a dependency and must detach independently.
  React.useCallback(composeRefs(...refs), refs);

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  window.document != null &&
  'createElement' in window.document
    ? React.useLayoutEffect
    : React.useEffect;

export const useStableFn = <A extends unknown[], R>(
  fn: (...args: A) => R,
  deps: DependencyList = []
) => {
  const fnRef = React.useRef(fn);

  useIsomorphicLayoutEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return React.useCallback(
    (...args: A) => fnRef.current(...args),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- The caller owns callback identity while invocation reads the latest function.
    deps
  );
};
