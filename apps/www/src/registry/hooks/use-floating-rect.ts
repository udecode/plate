'use client';

import {
  type Middleware,
  type UseFloatingOptions,
  type UseFloatingReturn,
  type VirtualElement,
  getOverflowAncestors,
  useFloating,
} from '@floating-ui/react';
import { type ViewportRect, useIsomorphicLayoutEffect } from 'platejs/react';
import * as React from 'react';

export type UseFloatingRectOptions = Omit<
  UseFloatingOptions,
  'elements' | 'whileElementsMounted'
> & {
  /** Hide the popup while its text is outside its clipping area. Default: true. */
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

// Floating UI commits every finished calculation, so an older one can finish
// last. Its rects.reference holds the text from when it started, so this last
// step reads the reference again, after the clip, to judge the newest text.
const textClipped: Middleware = {
  name: 'textClipped',
  async fn({ elements, platform, strategy }) {
    const clip = await platform.getClippingRect({
      boundary: 'clippingAncestors',
      element: elements.floating,
      rootBoundary: 'viewport',
      strategy,
    });
    const text = elements.reference.getBoundingClientRect();

    return {
      data: {
        hidden:
          outside(text.top, text.bottom, clip.y, clip.y + clip.height) ||
          outside(text.left, text.right, clip.x, clip.x + clip.width),
      },
    };
  },
};

function outside(
  start: number,
  end: number,
  clipStart: number,
  clipEnd: number
) {
  const collapsed = start === end;

  if (clipEnd <= clipStart) return true;
  if (collapsed) return start < clipStart || start > clipEnd;

  return end <= clipStart || start >= clipEnd;
}

/** Position copied UI from one immutable viewport rectangle. */
export function useFloatingRect(
  rect: ViewportRect | null,
  { hideWhenClipped = true, ...options }: UseFloatingRectOptions = {}
): UseFloatingRectReturn {
  const rectRef = React.useRef(rect ?? HIDDEN_RECT);
  const virtualRef = React.useRef<VirtualElement>({
    getBoundingClientRect: () => rectRef.current,
  });
  const open = options.open !== false && rect !== null;
  // A calculation started before hideWhenClipped changed can finish last, so
  // every calculation runs the check and the option only decides its use.
  const { floatingStyles, isPositioned, ...floating } =
    useFloating<VirtualElement>({
      ...options,
      middleware: [...(options.middleware ?? []), textClipped],
      open,
    });
  const { elements, middlewareData, refs, update } = floating;

  useIsomorphicLayoutEffect(() => {
    rectRef.current = rect ?? HIDDEN_RECT;
    refs.setReference(rect ? virtualRef.current : null);

    if (open) update();
  }, [open, rect, refs, update]);

  useClipChanges(elements.floating, update, rectRef);

  const textHidden =
    (hideWhenClipped && middlewareData.textClipped?.hidden === true) ||
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

function useClipChanges(
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
