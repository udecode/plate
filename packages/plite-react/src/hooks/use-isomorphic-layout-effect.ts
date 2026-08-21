import { CAN_USE_DOM } from '@platejs/plite-dom';
import { useEffect, useLayoutEffect } from 'react';

/**
 * Prevent warning on SSR by falling back to useEffect when DOM isn't available
 */

export const useIsomorphicLayoutEffect = CAN_USE_DOM
  ? useLayoutEffect
  : useEffect;
