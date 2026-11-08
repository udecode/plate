'use client';

import { EditorProvider, useOptionalEditor } from 'platejs/react';
import * as React from 'react';

const ToolbarOverlayContext = React.createContext<
  (id: symbol, open: boolean) => void
>(() => {});
const ToolbarElementContext = React.createContext<HTMLElement | null>(null);

function clippingBoxes(toolbar: HTMLElement) {
  const boxes: Element[] = [toolbar];
  let { position } = getComputedStyle(toolbar);

  for (
    let element = toolbar.parentElement;
    element && position !== 'fixed';
    element = element.parentElement
  ) {
    const style = getComputedStyle(element);

    if (
      style.display === 'contents' ||
      (position === 'absolute' &&
        style.position === 'static' &&
        style.transform === 'none')
    ) {
      continue;
    }

    ({ position } = style);

    if (style.display !== 'inline' && style.overflowX !== 'visible') {
      boxes.push(element);
    }
  }

  return boxes;
}

function shownShare(boxes: Element[], host: Element | null) {
  const box = host?.getBoundingClientRect();

  if (!box?.width) return 1;

  let left = 0;
  let right = document.documentElement.clientWidth;

  for (const element of boxes) {
    const edge = element.getBoundingClientRect().left + element.clientLeft;

    left = Math.max(left, edge);
    right = Math.min(right, edge + element.clientWidth);
  }

  return (
    Math.max(Math.min(box.right, right) - Math.max(box.left, left), 0) /
    box.width
  );
}

export function isToolbarSwipe(toolbar: HTMLElement | null, event?: Event) {
  return (
    !!toolbar &&
    (event?.type === 'touchmove' || event?.type === 'touchend') &&
    event.target instanceof Node &&
    toolbar.contains(event.target)
  );
}

export function useToolbarScrollDismiss(
  open: boolean,
  hostRef: React.RefObject<Element | null>,
  closeWithoutFocus: () => void
) {
  const toolbar = React.useContext(ToolbarElementContext);
  const closeRef = React.useRef(closeWithoutFocus);

  React.useInsertionEffect(() => {
    closeRef.current = closeWithoutFocus;
  });

  React.useEffect(() => {
    if (!open || !toolbar) return undefined;

    const boxes = clippingBoxes(toolbar);
    let lastShare = shownShare(boxes, hostRef.current);
    const onScroll = () => {
      const share = shownShare(boxes, hostRef.current);

      if (share < 0.5 && share < lastShare) {
        toolbar.removeEventListener('scroll', onScroll);
        closeRef.current();

        return;
      }

      lastShare = share;
    };

    toolbar.addEventListener('scroll', onScroll, { passive: true });

    return () => toolbar.removeEventListener('scroll', onScroll);
  }, [hostRef, open, toolbar]);

  return toolbar;
}

export function useToolbarOverlayTrigger(
  props: Pick<React.AriaAttributes, 'aria-expanded' | 'aria-haspopup'>
) {
  const [overlayId] = React.useState(() => Symbol('toolbar-overlay'));
  const reportOverlayOpen = React.useContext(ToolbarOverlayContext);
  const ownsOverlay =
    props['aria-haspopup'] !== undefined && props['aria-haspopup'] !== false;
  const open =
    props['aria-expanded'] === true || props['aria-expanded'] === 'true';
  const registeredRef = React.useRef(false);

  React.useEffect(() => {
    if (ownsOverlay) {
      registeredRef.current = true;
      reportOverlayOpen(overlayId, open);
    } else if (registeredRef.current) {
      registeredRef.current = false;
      reportOverlayOpen(overlayId, false);
    }
  }, [open, overlayId, ownsOverlay, reportOverlayOpen]);

  React.useEffect(
    () => () => {
      if (registeredRef.current) reportOverlayOpen(overlayId, false);
    },
    [overlayId, reportOverlayOpen]
  );

  return {
    cancelled: () => {
      if (ownsOverlay && !open) reportOverlayOpen(overlayId, false);
    },
    opening: () => {
      if (ownsOverlay) reportOverlayOpen(overlayId, true);
    },
  };
}

export function useToolbarOverlayHold(open: boolean) {
  const [overlayId] = React.useState(() => Symbol('toolbar-overlay'));
  const reportOverlayOpen = React.useContext(ToolbarOverlayContext);

  React.useEffect(() => {
    if (!open) return undefined;

    reportOverlayOpen(overlayId, true);

    return () => reportOverlayOpen(overlayId, false);
  }, [open, overlayId, reportOverlayOpen]);
}

export function useToolbarOverlayHoldPastUnmount() {
  const [overlayId] = React.useState(() => Symbol('toolbar-overlay'));
  const reportOverlayOpen = React.useContext(ToolbarOverlayContext);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;
    reportOverlayOpen(overlayId, true);

    return () => {
      mountedRef.current = false;
      // Radix runs a menu's close focus from a timer it starts at unmount, so the hold outlasts that timer.
      setTimeout(
        () =>
          setTimeout(() => {
            if (!mountedRef.current) reportOverlayOpen(overlayId, false);
          }, 0),
        0
      );
    };
  }, [overlayId, reportOverlayOpen]);
}

export function ToolbarOverlayProvider({
  children,
  element,
  onOpenChange,
}: {
  children: React.ReactNode;
  element: HTMLElement | null;
  onOpenChange?: (open: boolean) => void;
}) {
  const editor = useOptionalEditor();
  const liveRef = React.useRef({ editor, onOpenChange });
  const [capturedEditor, setCapturedEditor] = React.useState<
    typeof editor | undefined
  >(undefined);
  React.useInsertionEffect(() => {
    liveRef.current = { editor, onOpenChange };
  }, [editor, onOpenChange]);
  const openOverlayIdsRef = React.useRef(new Set<symbol>());
  const overlayOpenRef = React.useRef(false);
  const reportOverlayOpen = React.useCallback((id: symbol, open: boolean) => {
    if (open) {
      openOverlayIdsRef.current.add(id);
    } else {
      openOverlayIdsRef.current.delete(id);
    }

    const nextOpen = openOverlayIdsRef.current.size > 0;

    if (overlayOpenRef.current !== nextOpen) {
      overlayOpenRef.current = nextOpen;
      setCapturedEditor(nextOpen ? liveRef.current.editor : undefined);
      liveRef.current.onOpenChange?.(nextOpen);
    }
  }, []);

  return (
    <ToolbarOverlayContext.Provider value={reportOverlayOpen}>
      <ToolbarElementContext.Provider value={element}>
        <EditorProvider
          editor={capturedEditor === undefined ? editor : capturedEditor}
        >
          {children}
        </EditorProvider>
      </ToolbarElementContext.Provider>
    </ToolbarOverlayContext.Provider>
  );
}
