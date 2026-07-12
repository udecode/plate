import React from 'react';

import type { ClientRectObject } from '@floating-ui/core';

import { useIsomorphicLayoutEffect } from '@udecode/react-utils';

import {
  createVirtualElement,
  getDefaultBoundingClientRect,
} from '../createVirtualElement';
import {
  type UseFloatingOptions,
  type UseFloatingReturn,
  type VirtualElement,
  autoUpdate,
  useFloating,
} from '../libs/floating-ui';

export interface UseVirtualFloatingOptions extends Partial<UseFloatingOptions> {
  open?: boolean;
  getBoundingClientRect?: () => ClientRectObject;
}

export interface UseVirtualFloatingReturn
  extends UseFloatingReturn<VirtualElement> {
  style: React.CSSProperties;
  virtualElementRef: React.MutableRefObject<VirtualElement>;
}

/**
 * `useFloating` with a controlled virtual element. Used to follow cursor
 * position.
 *
 * Default options:
 *
 * - `whileElementsMounted: autoUpdate`
 *
 * Additional options:
 *
 * - `getBoundingClientRect` to get the bounding client rect.
 * - `hidden` to hide the floating element
 *
 * Additional returns:
 *
 * - `style` to apply to the floating element
 * - `virtualElementRef`
 *
 * @see useFloating
 * @see https://floating-ui.com/docs/react-dom#virtual-element
 */
export const useVirtualFloating = ({
  getBoundingClientRect = getDefaultBoundingClientRect,
  ...floatingOptions
}: UseVirtualFloatingOptions): UseVirtualFloatingReturn => {
  const virtualElementRef = React.useRef(createVirtualElement());

  const floatingResult = useFloating<VirtualElement>({
    // update on scroll and resize
    whileElementsMounted: autoUpdate,
    ...floatingOptions,
  });

  const { middlewareData, refs, strategy, update, x, y } = floatingResult;

  useIsomorphicLayoutEffect(() => {
    virtualElementRef.current.getBoundingClientRect = getBoundingClientRect;
    refs.setReference(virtualElementRef.current);
    void update();
  }, [getBoundingClientRect, refs.setReference, update]);

  const visible = middlewareData.hide?.referenceHidden !== true;

  return {
    ...floatingResult,
    style: {
      display: floatingOptions.open === false ? 'none' : undefined,
      left: x ?? 0,
      position: strategy,
      top: y ?? 0,
      visibility: visible ? undefined : 'hidden',
    },
    virtualElementRef,
  };
};
