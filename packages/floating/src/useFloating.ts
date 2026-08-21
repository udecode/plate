import type { ClientRectObject } from '@floating-ui/core';
import { useIsomorphicLayoutEffect } from '@udecode/react-utils';
import React from 'react';

import {
  type UseFloatingOptions,
  type UseFloatingReturn,
  type VirtualElement,
  autoUpdate,
  useFloating,
} from './floating-ui';
import { createVirtualElement, getDefaultBoundingClientRect } from './geometry';

export interface UseVirtualFloatingOptions extends Partial<UseFloatingOptions> {
  open?: boolean;
  getBoundingClientRect?: () => ClientRectObject;
}

export interface UseVirtualFloatingReturn extends UseFloatingReturn<VirtualElement> {
  style: React.CSSProperties;
  virtualElementRef: React.MutableRefObject<VirtualElement>;
}

/** `useFloating` with a controlled virtual reference element. */
export const useVirtualFloating = ({
  getBoundingClientRect = getDefaultBoundingClientRect,
  ...floatingOptions
}: UseVirtualFloatingOptions): UseVirtualFloatingReturn => {
  const virtualElementRef = React.useRef(createVirtualElement());
  const floatingResult = useFloating<VirtualElement>({
    whileElementsMounted: autoUpdate,
    ...floatingOptions,
  });
  const { middlewareData, refs, strategy, update, x, y } = floatingResult;

  useIsomorphicLayoutEffect(() => {
    virtualElementRef.current.getBoundingClientRect = getBoundingClientRect;
    refs.setReference(virtualElementRef.current);
    void update();
  }, [getBoundingClientRect, refs.setReference, update]);

  return {
    ...floatingResult,
    style: {
      display: floatingOptions.open === false ? 'none' : undefined,
      left: x ?? 0,
      position: strategy,
      top: y ?? 0,
      visibility:
        middlewareData.hide?.referenceHidden === true ? 'hidden' : undefined,
    },
    virtualElementRef,
  };
};
