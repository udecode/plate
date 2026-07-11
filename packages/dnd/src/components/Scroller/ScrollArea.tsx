import React from 'react';

import throttle from 'lodash/throttle.js';
import raf from 'raf';

const getCoords = (e: React.DragEvent | React.TouchEvent) => {
  if ('changedTouches' in e) {
    const touch = e.changedTouches[0];

    if (!touch) return;

    return { x: touch.clientX, y: touch.clientY };
  }

  return { x: e.clientX, y: e.clientY };
};

const stopScrolling = (
  scaleYRef: React.RefObject<number>,
  frameRef: React.RefObject<number | null>
) => {
  scaleYRef.current = 0;

  if (frameRef.current !== null) {
    raf.cancel(frameRef.current);
    frameRef.current = null;
  }
};

export type ScrollAreaProps = {
  placement: 'bottom' | 'top';
  containerRef?: React.RefObject<HTMLElement | Window | null>;
  enabled?: boolean;
  height?: number;
  minStrength?: number;
  scrollAreaProps?: React.HTMLAttributes<HTMLDivElement>;
  strengthMultiplier?: number;
  zIndex?: number;
};

export function ScrollArea({
  containerRef,
  enabled = true,
  height = 100,
  minStrength = 0.15,
  placement,
  scrollAreaProps,
  strengthMultiplier = 25,
  zIndex = 10_000,
}: ScrollAreaProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const scaleYRef = React.useRef(0);
  const frameRef = React.useRef<number | null>(null);

  const direction = placement === 'top' ? -1 : 1;

  // Drag a fixed, invisible box of custom height at the top, and bottom
  // of the window. Make sure to show it only when dragging something.
  const style: React.CSSProperties = {
    height,
    opacity: 0,
    position: 'fixed',
    width: '100%',
    zIndex,
    ...scrollAreaProps?.style,
  };

  if (placement === 'top') {
    style.top = 0;
  } else if (placement === 'bottom') {
    style.bottom = 0;
  }

  const updateScrollingRef = React.useRef<
    ((e: React.DragEvent | React.TouchEvent) => void) | null
  >(null);

  React.useEffect(() => {
    const startScrolling = () => {
      const tick = () => {
        const scaleY = scaleYRef.current;

        if (strengthMultiplier === 0 || scaleY === 0) {
          stopScrolling(scaleYRef, frameRef);

          return;
        }

        const container = containerRef?.current ?? window;
        container.scrollBy(0, scaleY * strengthMultiplier * direction);
        frameRef.current = raf(tick);
      };

      tick();
    };
    const updateScrolling = throttle(
      (e: React.DragEvent | React.TouchEvent) => {
        const container = ref.current;

        if (!container) return;

        const { height: h, top: y } = container.getBoundingClientRect();
        const coords = getCoords(e);

        if (!coords || h <= 0) return;

        const strength = Math.max(Math.max(coords.y - y, 0) / h, minStrength);

        // calculate strength
        scaleYRef.current = direction === -1 ? 1 - strength : strength;

        // start scrolling if we need to
        if (frameRef.current === null && scaleYRef.current) {
          startScrolling();
        }
      },
      100,
      { trailing: false }
    );
    updateScrollingRef.current = updateScrolling;

    return () => {
      updateScrolling.cancel();
      updateScrollingRef.current = null;
      stopScrolling(scaleYRef, frameRef);
    };
  }, [containerRef, direction, minStrength, strengthMultiplier]);

  const handleEvent = (e: React.DragEvent | React.TouchEvent) => {
    updateScrollingRef.current?.(e);
  };

  React.useEffect(() => {
    if (!enabled) {
      stopScrolling(scaleYRef, frameRef);
    }
  }, [enabled]);

  if (!enabled) return null;

  // Hide the element if not enabled, so it doesn't interfere with clicking things under it.
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag and drop functionality requires these event handlers
    <div
      {...scrollAreaProps}
      ref={ref}
      // touchmove events don't seem to work across siblings, so we unfortunately
      style={style}
      onDragEnd={() => stopScrolling(scaleYRef, frameRef)}
      onDragLeave={() => stopScrolling(scaleYRef, frameRef)}
      onDragOver={handleEvent}
      // would have to attach the listeners to the body
      onTouchMove={handleEvent}
    />
  );
}
