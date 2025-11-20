/* eslint-disable react-hooks/refs */
import { useRef } from 'react';

import deepEqual from './deepEqual';

// This hook uses refs during render for deep equality memoization.
// This pattern violates react-hooks/refs but is necessary for performance.
// The rule is disabled for this file because deep equality checks require
// reading refs during render to avoid unnecessary re-computations.
export default function useDeepEqualMemo<T>(value: T) {
  const ref = useRef<T | undefined>(undefined);

  if (!deepEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}
