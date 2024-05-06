import React from 'react';

import throttle from 'lodash/throttle.js';
import raf from 'raf';

const getCoords = (e: any) => {
  if (e.type === 'touchmove') {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }

  return { x: e.clientX, y: e.clientY };
};

export interface ScrollAreaProps {
  placement: 'bottom' | 'top';
  containerRef?: React.RefObject<any>;
  enabled?: boolean;
  height?: number;
  minStrength?: number;
  scrollAreaProps?: React.HTMLAttributes<HTMLDivElement>;
  strengthMultiplier?: number;
  zIndex?: number;
}

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
  const ref = React.useRef<HTMLDivElement>();

  const scaleYRef = React.useRef(0);
  const frameRef = React.useRef<null | number>(null);

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

  const stopScrolling = () => {
    scaleYRef.current = 0;

    if (frameRef.current) {
      raf.cancel(frameRef.current);
      frameRef.current = null;
    }
  };

  const startScrolling = () => {
    const tick = () => {
      const scaleY = scaleYRef.current;

      // stop scrolling if there's nothing to do
      if (strengthMultiplier === 0 || scaleY === 0) {
        stopScrolling();

        return;
      }

      const container = containerRef?.current ?? window;
      container.scrollBy(0, scaleY * strengthMultiplier * direction);

      frameRef.current = raf(tick);

      // there's a bug in safari where it seems like we can't get
      // mousemove events from a container that also emits a scroll
      // event that same frame. So we should double the strengthMultiplier and only adjust
      // the scroll position at 30fps
    };

    tick();
  };

  // Update scaleY every 100ms or so
  // and start scrolling if necessary
  const updateScrolling = throttle(
    (e) => {
      const container = ref.current;

      if (!container) return;

      const { height: h, top: y } = container.getBoundingClientRect();
      const coords = getCoords(e);

      const strength = Math.max(Math.max(coords.y - y, 0) / h, minStrength);

      // calculate strength
      scaleYRef.current = direction === -1 ? 1 - strength : strength;

      // start scrolling if we need to
      if (!frameRef.current && scaleYRef.current) {
        startScrolling();
      }
    },
    100,
    { trailing: false }
  );

  const handleEvent = (e: any) => {
    updateScrolling(e);
  };

  React.useEffect(() => {
    if (!enabled) {
      stopScrolling();
    }
  }, [enabled]);

  if (!enabled) return null;

  // Hide the element if not enabled, so it doesn't interfere with clicking things under it.
  return (
    <div
      onDragEnd={stopScrolling}
      onDragLeave={stopScrolling}
      onDragOver={handleEvent}
      // would have to attach the listeners to the body
      onTouchMove={handleEvent}
      ref={ref as any}
      // touchmove events don't seem to work across siblings, so we unfortunately
      style={style}
      {...scrollAreaProps}
    />
  );
}
