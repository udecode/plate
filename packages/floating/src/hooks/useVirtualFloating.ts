import * as React from 'react';
import {
  CSSProperties,
  MutableRefObject,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ClientRectObject } from '@floating-ui/core';
import {
  autoUpdate,
  ReferenceType,
  useFloating,
  UseFloatingProps,
  UseFloatingReturn,
  VirtualElement,
} from '@floating-ui/react-dom-interactions';
import { createVirtualElement } from '../createVirtualElement';
import { getSelectionBoundingClientRect } from '../utils/index';

export interface ExtendedRefs<RT extends ReferenceType = ReferenceType> {
  reference: React.MutableRefObject<RT | null>;
  floating: React.MutableRefObject<HTMLElement | null>;
  domReference: React.MutableRefObject<Element | null>;
}

export interface UseVirtualFloatingOptions extends Partial<UseFloatingProps> {
  getBoundingClientRect?: () => ClientRectObject;
  open?: boolean;
}

export interface UseVirtualFloatingReturn<
  RT extends ReferenceType = ReferenceType
> extends Omit<UseFloatingReturn<RT>, 'refs'> {
  refs: ExtendedRefs<RT>;
  virtualElementRef: MutableRefObject<VirtualElement>;
  style: CSSProperties;
}

/**
 * `useFloating` with a controlled virtual element. Used to follow cursor position.
 *
 * Default options:
 * - `whileElementsMounted: autoUpdate`
 *
 * Additional options:
 * - `getBoundingClientRect` to get the bounding client rect.
 * - `hidden` to hide the floating element
 *
 * Additional returns:
 * - `style` to apply to the floating element
 * - `virtualElementRef`
 *
 * @see useFloating
 * @see https://floating-ui.com/docs/react-dom#virtual-element
 */
export const useVirtualFloating = <RT extends ReferenceType = ReferenceType>({
  getBoundingClientRect = getSelectionBoundingClientRect,
  ...floatingOptions
}: UseVirtualFloatingOptions): UseVirtualFloatingReturn<RT> => {
  const virtualElementRef = useRef<RT>(createVirtualElement() as RT);
  const [visible, setVisible] = useState(true);

  const floatingResult = useFloating<RT>({
    // update on scroll and resize
    whileElementsMounted: autoUpdate,
    ...floatingOptions,
  });

  const { reference, middlewareData, strategy, x, y, update } = floatingResult;

  useLayoutEffect(() => {
    virtualElementRef.current.getBoundingClientRect = getBoundingClientRect;
  }, [getBoundingClientRect, update]);

  useLayoutEffect(() => {
    reference(virtualElementRef.current);
  }, [reference]);

  useLayoutEffect(() => {
    if (!middlewareData?.hide) return;

    const { referenceHidden } = middlewareData.hide;

    setVisible(!referenceHidden);
  }, [middlewareData.hide]);

  return {
    ...floatingResult,
    virtualElementRef,
    style: {
      position: strategy,
      top: y ?? 0,
      left: x ?? 0,
      display: floatingOptions.open === false ? 'none' : undefined,
      visibility: !visible ? 'hidden' : undefined,
    },
  };
};
