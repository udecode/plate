import throttle from 'lodash/throttle.js';
import raf from 'raf';
import React from 'react';

import { useDndPluginStore } from './internal/DndStore';

const getCoords = (event: React.DragEvent | React.TouchEvent) => {
  if ('changedTouches' in event) {
    const touch = event.changedTouches[0];

    if (!touch) return;

    return { x: touch.clientX, y: touch.clientY };
  }

  return { x: event.clientX, y: event.clientY };
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

type ScrollAreaProps = {
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
  } else {
    style.bottom = 0;
  }

  const updateScrollingRef = React.useRef<
    ((event: React.DragEvent | React.TouchEvent) => void) | null
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
      (event: React.DragEvent | React.TouchEvent) => {
        const container = ref.current;

        if (!container) return;

        const { height: areaHeight, top } = container.getBoundingClientRect();
        const coords = getCoords(event);

        if (!coords || areaHeight <= 0) return;

        const strength = Math.max(
          Math.max(coords.y - top, 0) / areaHeight,
          minStrength
        );

        scaleYRef.current = direction === -1 ? 1 - strength : strength;

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

  const handleEvent = (event: React.DragEvent | React.TouchEvent) => {
    updateScrollingRef.current?.(event);
  };

  React.useEffect(() => {
    if (!enabled) {
      stopScrolling(scaleYRef, frameRef);
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    // drag and drop functionality requires these event handlers.
    <div
      {...scrollAreaProps}
      ref={ref}
      style={style}
      onDragEnd={() => stopScrolling(scaleYRef, frameRef)}
      onDragLeave={() => stopScrolling(scaleYRef, frameRef)}
      onDragOver={handleEvent}
      onTouchMove={handleEvent}
    />
  );
}

export type DndScrollerOptions = Omit<ScrollAreaProps, 'placement'>;

export function Scroller(props: DndScrollerOptions) {
  return (
    <>
      <ScrollArea placement="top" {...props} />
      <ScrollArea placement="bottom" {...props} />
    </>
  );
}

export function DndScroller(props: Partial<DndScrollerOptions>) {
  const isDragging = useDndPluginStore('isDragging');
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (isDragging) {
      const timeout = setTimeout(() => {
        setShow(true);
      }, 100);

      return () => clearTimeout(timeout);
    }

    setShow(false);
  }, [isDragging]);

  return <Scroller enabled={isDragging && show} {...props} />;
}

export function DndScrollerAfterEditable() {
  const enableScroller = useDndPluginStore('enableScroller');
  const scrollerProps = useDndPluginStore('scrollerProps');

  if (!enableScroller) return null;

  return <DndScroller {...scrollerProps} />;
}
