import React from 'react';

export const CAN_USE_DOM =
  typeof window !== 'undefined' &&
  window.document != null &&
  'createElement' in window.document;

/**
 * Prevent warning on SSR by falling back to React.useEffect when DOM isn't
 * available
 */
export const useIsomorphicLayoutEffect = CAN_USE_DOM
  ? React.useLayoutEffect
  : React.useEffect;
