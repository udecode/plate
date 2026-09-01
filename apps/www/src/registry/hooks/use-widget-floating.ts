'use client';

import {
  type UseFloatingOptions,
  type UseFloatingReturn,
  type VirtualElement,
  useFloating,
} from '@floating-ui/react';
import {
  type PliteWidgetGeometry,
  useIsomorphicLayoutEffect,
} from 'platejs/react';
import * as React from 'react';

export type UseWidgetFloatingOptions = Omit<
  UseFloatingOptions,
  'elements' | 'whileElementsMounted'
>;

export type UseWidgetFloatingReturn = UseFloatingReturn<VirtualElement> & {
  style: React.CSSProperties;
};

const HIDDEN_RECT = Object.freeze({
  bottom: -9999,
  height: 0,
  left: -9999,
  right: -9999,
  top: -9999,
  width: 0,
  x: -9999,
  y: -9999,
});

/** Position copied UI from one immutable Plite Widget geometry snapshot. */
export function useWidgetFloating(
  geometry: PliteWidgetGeometry | null,
  options: UseWidgetFloatingOptions = {}
): UseWidgetFloatingReturn {
  const rectRef = React.useRef(geometry?.boundingRect ?? HIDDEN_RECT);
  const virtualRef = React.useRef<VirtualElement>({
    getBoundingClientRect: () => rectRef.current,
  });
  const floating = useFloating<VirtualElement>(options);
  const { elements, floatingStyles, middlewareData, refs, update } = floating;

  useIsomorphicLayoutEffect(() => {
    rectRef.current = geometry?.boundingRect ?? HIDDEN_RECT;
    refs.setReference(geometry ? virtualRef.current : null);

    if (geometry && options.open !== false) update();
  }, [geometry, options.open, refs, update]);

  React.useEffect(() => {
    const element = elements.floating;
    const ResizeObserver = element?.ownerDocument.defaultView?.ResizeObserver;

    if (!element || !ResizeObserver) return undefined;

    const observer = new ResizeObserver(() => {
      update();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [elements.floating, update]);

  return {
    ...floating,
    style: {
      ...floatingStyles,
      display: options.open === false || !geometry ? 'none' : undefined,
      visibility:
        !floating.isPositioned || middlewareData.hide?.referenceHidden === true
          ? 'hidden'
          : undefined,
    },
  };
}
