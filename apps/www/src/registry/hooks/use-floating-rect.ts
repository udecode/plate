'use client';

import {
  type UseFloatingOptions,
  type UseFloatingReturn,
  type VirtualElement,
  getOverflowAncestors,
  useFloating,
} from '@floating-ui/react';
import { type RangeGeometry, useIsomorphicLayoutEffect } from 'platejs/react';
import * as React from 'react';

export type UseFloatingRectOptions = Omit<
  UseFloatingOptions,
  'elements' | 'whileElementsMounted'
> & {
  /** Hide the popup while none of its text is in view. Default: true. */
  hideWhenClipped?: boolean;
};

export type UseFloatingRectReturn = Omit<
  UseFloatingReturn<VirtualElement>,
  'floatingStyles' | 'isPositioned'
> & {
  shown: boolean;
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

/** Position copied UI beside one range. */
export function useFloatingRect(
  geometry: RangeGeometry | null,
  { hideWhenClipped = true, ...options }: UseFloatingRectOptions = {}
): UseFloatingRectReturn {
  const rect = geometry?.boundingRect ?? null;
  const rectRef = React.useRef(rect ?? HIDDEN_RECT);
  const virtualRef = React.useRef<VirtualElement>({
    getBoundingClientRect: () => rectRef.current,
  });
  const open = options.open !== false && rect !== null;
  const { floatingStyles, isPositioned, ...floating } =
    useFloating<VirtualElement>({ ...options, open });
  const { elements, middlewareData, refs, update } = floating;

  useIsomorphicLayoutEffect(() => {
    rectRef.current = rect ?? HIDDEN_RECT;
    refs.setReference(rect ? virtualRef.current : null);

    if (open) update();
  }, [open, rect, refs, update]);

  useContainerMoves(elements.floating, update, rectRef);

  const textHidden =
    (hideWhenClipped && !geometry?.visible) ||
    middlewareData.hide?.referenceHidden === true;
  const shown = open && isPositioned && !textHidden;

  return {
    ...floating,
    shown,
    style: {
      ...floatingStyles,
      display: open ? undefined : 'none',
      visibility: shown ? undefined : 'hidden',
    },
  };
}

// A scroll or resize of the popup's own container can move the popup while its
// text stays put, so the geometry publishes nothing and the popup is placed
// again here.
function useContainerMoves(
  popup: HTMLElement | null,
  update: () => void,
  rectRef: React.RefObject<unknown>
) {
  const updateRef = React.useRef(update);

  useIsomorphicLayoutEffect(() => {
    updateRef.current = update;
  }, [update]);

  React.useEffect(() => {
    const view = popup?.ownerDocument.defaultView;

    if (!popup || !view?.ResizeObserver) return undefined;

    const recheck = () => updateRef.current();
    const observer = new view.ResizeObserver(recheck);
    const listening = new AbortController();
    const options = { passive: true, signal: listening.signal };
    let frame = 0;

    const onScroll = () => {
      if (frame) return;

      const textBefore = rectRef.current;

      frame = requestAnimationFrame(() => {
        frame = 0;

        const textMoved = rectRef.current !== textBefore;

        if (!textMoved) recheck();
      });
    };

    observer.observe(popup);

    for (const ancestor of getOverflowAncestors(popup)) {
      if (ancestor instanceof view.Element) observer.observe(ancestor);

      ancestor.addEventListener('scroll', onScroll, options);
    }

    view.addEventListener('resize', recheck, options);
    view.visualViewport?.addEventListener('resize', recheck, options);

    return () => {
      listening.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [popup, rectRef]);
}
