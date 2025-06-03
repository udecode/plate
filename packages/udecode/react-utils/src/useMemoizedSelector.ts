import React from 'react';

/**
 * Re-render only when the selector result changes.
 *
 * @param selector A function that derives a value from deps
 * @param deps Dependencies on which to run the selector
 * @param equalityFn Optional comparison function to detect changes in the
 *   derived value
 */
export function useMemoizedSelector<R>(
  selector: () => R,
  deps: React.DependencyList,
  equalityFn: (a: R, b: R) => boolean = (a, b) => a === b
) {
  // Initialize our state with the initial "selected" value.
  const [memoizedValue, setMemoizedValue] = React.useState<R>(() => selector());

  // Keep a ref of the previous value so we can compare in an effect.
  const previousValueRef = React.useRef<R>(memoizedValue);

  React.useEffect(() => {
    // Compute a new value by calling the selector.
    const newValue = selector();

    // If different, update state and the ref.
    if (!equalityFn(previousValueRef.current, newValue)) {
      setMemoizedValue(newValue);
      previousValueRef.current = newValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return memoizedValue;
}
