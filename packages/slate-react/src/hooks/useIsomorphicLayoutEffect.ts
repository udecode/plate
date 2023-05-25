import { useEffect, useLayoutEffect } from 'react';

export const CAN_USE_DOM =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

/**
 * Prevent warning on SSR by falling back to useEffect when DOM isn't available
 */
export const useIsomorphicLayoutEffect = CAN_USE_DOM
  ? useLayoutEffect
  : useEffect;
