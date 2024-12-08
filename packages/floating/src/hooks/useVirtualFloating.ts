import React from 'react';

import type { ClientRectObject } from '@floating-ui/core';

import { useIsomorphicLayoutEffect } from '@udecode/plate-common/react';

import {
  createVirtualElement,
  getDefaultBoundingClientRect,
} from '../createVirtualElement';
import {
  type ReferenceType,
  type UseFloatingOptions,
  type UseFloatingReturn,
  type VirtualElement,
  autoUpdate,
  useFloating,
} from '../libs/floating-ui';

export interface UseVirtualFloatingOptions extends Partial<UseFloatingOptions> {
  getBoundingClientRect?: () => ClientRectObject;
  open?: boolean;
}

export interface UseVirtualFloatingReturn<RT extends ReferenceType = ReferenceType>
  extends UseFloatingReturn<RT> {
  style: React.CSSProperties;
  virtualElementRef: React.MutableRefObject<VirtualElement | null>;
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
export const useVirtualFloating = <RT extends ReferenceType = ReferenceType>({
  getBoundingClientRect = getDefaultBoundingClientRect,
  ...floatingOptions
}: UseVirtualFloatingOptions): UseVirtualFloatingReturn<RT> => {
  const virtualElementRef = React.useRef<RT>(createVirtualElement() as RT);
  const [visible, setVisible] = React.useState(true);

  const floatingResult = useFloating<RT>({
    // update on scroll and resize
    whileElementsMounted: autoUpdate,
    ...floatingOptions,
  });

  const { middlewareData, refs, strategy, update, x, y } = floatingResult;

  useIsomorphicLayoutEffect(() => {
    virtualElementRef.current.getBoundingClientRect = getBoundingClientRect;
  }, [getBoundingClientRect, update]);

  useIsomorphicLayoutEffect(() => {
    refs.setReference(virtualElementRef.current);
  }, [refs]);

  useIsomorphicLayoutEffect(() => {
    if (!middlewareData?.hide) return;

    const { referenceHidden } = middlewareData.hide;

    setVisible(!referenceHidden);
  }, [middlewareData.hide]);

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
