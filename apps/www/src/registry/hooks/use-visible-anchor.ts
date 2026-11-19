'use client';

import { useEditableClip, useIsomorphicLayoutEffect } from 'platejs/react';
import * as React from 'react';

export type VisibleAnchor = {
  readonly contextElement: Element | undefined;
  getBoundingClientRect: () => DOMRectReadOnly;
};

const noSubscribe = () => () => {};
const notHidden = () => false;

/**
 * Builds a popover anchor whose `hidden` turns true once none of its boxes
 * shows in the Editable. Floating UI reads the anchor each time it places the
 * popover, so `hidden` follows every scroll it hears. `measure` lists the boxes
 * the popover may sit under, best first, and a new function makes a new anchor.
 * While `keepShown` returns true the popover stays shown; the hook checks it
 * again after each render and each focus change.
 */
export function useVisibleAnchor({
  editableRef,
  keepShown,
  measure,
}: {
  editableRef: React.RefObject<HTMLElement | null>;
  keepShown?: () => boolean;
  measure: (() => readonly DOMRectReadOnly[]) | null;
}) {
  const clip = useEditableClip({ editableRef });
  const [selfScrolls, setSelfScrolls] = React.useState(false);

  const state = React.useMemo(() => {
    if (!measure) return null;

    let context: Element | undefined;
    let clipped = false;
    let hidden = false;
    let held: (() => boolean) | undefined;
    const listeners = new Set<() => void>();
    const sync = () => {
      const next = clipped && !held?.();

      if (next === hidden) return;

      hidden = next;

      for (const listener of listeners) listener();
    };
    const anchor: VisibleAnchor = {
      // Floating UI looks for scroll boxes from the context element's parent,
      // so an Editable that scrolls itself hands over its first child. Other
      // Editables stay the context, because a child that crosses the scroll
      // box's edge makes Floating UI place the popover a second time per frame.
      get contextElement() {
        const editable = editableRef.current;

        if (!context && editable) {
          const scrolls =
            selfScrolls ||
            editable.scrollHeight > editable.clientHeight ||
            editable.scrollWidth > editable.clientWidth;

          context = (scrolls && editable.firstElementChild) || editable;
        }

        return context;
      },
      getBoundingClientRect: () => {
        const boxes = measure();
        const [visible] = clip(boxes);

        clipped = !visible;
        sync();

        return visible
          ? DOMRectReadOnly.fromRect(visible)
          : (boxes[0] ?? new DOMRect());
      },
    };

    return {
      anchor,
      getHidden: () => hidden,
      setKeepShown: (next: (() => boolean) | undefined) => {
        held = next;
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);

        return () => {
          listeners.delete(listener);
        };
      },
      sync,
    };
  }, [clip, editableRef, measure, selfScrolls]);

  useIsomorphicLayoutEffect(() => {
    state?.setKeepShown(keepShown);
    state?.sync();
  });

  React.useEffect(() => {
    const editable = editableRef.current;

    if (!editable || state?.anchor.contextElement !== editable) {
      return undefined;
    }

    const onScroll = () => setSelfScrolls(true);

    editable.addEventListener('scroll', onScroll, {
      once: true,
      passive: true,
    });

    return () => editable.removeEventListener('scroll', onScroll);
  }, [editableRef, state]);

  // Focus sits on the body between focusout and focusin, so the hold is
  // checked a frame after either.
  React.useEffect(() => {
    const ownerDocument = editableRef.current?.ownerDocument;

    if (!state || !ownerDocument) return undefined;

    let frame = 0;
    const onFocusChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(state.sync);
    };

    ownerDocument.addEventListener('focusin', onFocusChange);
    ownerDocument.addEventListener('focusout', onFocusChange);

    return () => {
      cancelAnimationFrame(frame);
      ownerDocument.removeEventListener('focusin', onFocusChange);
      ownerDocument.removeEventListener('focusout', onFocusChange);
    };
  }, [editableRef, state]);

  const hidden = React.useSyncExternalStore(
    state?.subscribe ?? noSubscribe,
    state?.getHidden ?? notHidden,
    notHidden
  );

  return { anchor: state?.anchor ?? null, hidden };
}
