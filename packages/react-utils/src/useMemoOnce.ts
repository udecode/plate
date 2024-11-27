import React from 'react';

export function useMemoOnce<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const initialized = React.useRef(false);
  const prevDepsRef = React.useRef(deps);
  const memoizedValueRef = React.useRef<T>();

  if (
    !initialized.current ||
    deps.some((dep, i) => dep !== prevDepsRef.current[i])
  ) {
    initialized.current = true;
    prevDepsRef.current = deps;
    memoizedValueRef.current = factory();
  }

  return memoizedValueRef.current!;
}
