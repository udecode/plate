import React, {
  CSSProperties,
  HTMLAttributes,
  RefObject,
  useEffect,
  useRef,
} from 'react';
import { throttle } from 'lodash';
import raf from 'raf';

const getCoords = (e: any) => {
  if (e.type === 'touchmove') {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }

  return { x: e.clientX, y: e.clientY };
};

export interface ScrollAreaProps {
  placement: 'top' | 'bottom';
  enabled?: boolean;
  height?: number;
  zIndex?: number;
  minStrength?: number;
  strengthMultiplier?: number;
  containerRef?: RefObject<any>;
  scrollAreaProps?: HTMLAttributes<HTMLDivElement>;
}

export function ScrollArea({
  placement,
  enabled = true,
  height = 100,
  zIndex = 10000,
  minStrength = 0.15,
  strengthMultiplier = 25,
  containerRef,
  scrollAreaProps,
}: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>();

  const scaleYRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const direction = placement === 'top' ? -1 : 1;

  // Drag a fixed, invisible box of custom height at the top, and bottom
  // of the window. Make sure to show it only when dragging something.
  const style: CSSProperties = {
    position: 'fixed',
    height,
    width: '100%',
    opacity: 0,
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

      const { top: y, height: h } = container.getBoundingClientRect();
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

  useEffect(() => {
    if (!enabled) {
      stopScrolling();
    }
  }, [enabled]);

  if (!enabled) return null;

  // Hide the element if not enabled, so it doesn't interfere with clicking things under it.
  return (
    <div
      ref={ref as any}
      style={style}
      onDragOver={handleEvent}
      onDragLeave={stopScrolling}
      onDragEnd={stopScrolling}
      // touchmove events don't seem to work across siblings, so we unfortunately
      // would have to attach the listeners to the body
      onTouchMove={handleEvent}
      {...scrollAreaProps}
    />
  );
}
