import { dequal } from 'dequal';
import { useRef } from 'react';

// oxlint-disable react/refs -- Render-pure deep comparison must retain the prior inputs and value without scheduling an update.
export function useDeepCompareMemo<T>(
  factory: () => T,
  dependencies: unknown[]
) {
  const cache = useRef<{ dependencies: unknown[]; value: T }>(undefined);

  if (!cache.current || !dequal(cache.current.dependencies, dependencies)) {
    cache.current = { dependencies, value: factory() };
  }

  return cache.current.value;
}
// oxlint-enable react/refs
