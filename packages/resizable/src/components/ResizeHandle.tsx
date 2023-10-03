import React, {
  MouseEventHandler,
  TouchEventHandler,
  useEffect,
  useState,
} from 'react';
import {
  atom,
  createPrimitiveComponent,
  JotaiProvider,
  useAtom,
} from '@udecode/plate-common';

import { ResizeDirection, ResizeEvent } from '../types';
import { isTouchEvent } from '../utils';

export const resizeHandleAtoms = {
  onResize: atom<{ fn: any } | null>(null),
};

export const ResizeHandleEffects = ({
  onResize,
}: {
  onResize?: ResizeHandleOptions['onResize'];
}) => {
  const [, setHandleResize] = useAtom(resizeHandleAtoms.onResize);

  useEffect(() => {
    setHandleResize({ fn: onResize });
  }, [onResize, setHandleResize]);

  return null;
};

export const ResizeHandleProvider = ({
  children,
  onResize,
}: {
  children: React.ReactNode;
  onResize?: ResizeHandleOptions['onResize'];
}) => {
  return (
    <JotaiProvider
      initialValues={[[resizeHandleAtoms.onResize, { fn: onResize }]]}
    >
      <ResizeHandleEffects onResize={onResize} />
      {children}
    </JotaiProvider>
  );
};

export type ResizeHandleOptions = {
  direction?: ResizeDirection;
  initialSize?: number;
  onResize?: (event: ResizeEvent) => void;
  onMouseDown?: MouseEventHandler;
  onTouchStart?: TouchEventHandler;
  onHover?: () => void;
  onHoverEnd?: () => void;
};

export const useResizeHandleState = ({
  direction = 'left',
  initialSize: _initialSize,
  onResize,
  onMouseDown,
  onTouchStart,
  onHover,
  onHoverEnd,
}: ResizeHandleOptions) => {
  const [_onResize] = useAtom(resizeHandleAtoms.onResize);
  if (!onResize) onResize = _onResize?.fn;

  const [isResizing, setIsResizing] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);
  const [initialSize, setInitialSize] = useState(_initialSize ?? 0);

  const isHorizontal = direction === 'left' || direction === 'right';

  useEffect(() => {
    if (!isResizing) return;

    const sendResizeEvent = (
      event: MouseEvent | TouchEvent,
      finished: boolean
    ) => {
      const { clientX, clientY } = isTouchEvent(event)
        ? event.touches[0] || event.changedTouches[0]
        : event;

      const currentPosition = isHorizontal ? clientX : clientY;
      const delta = currentPosition - initialPosition;
      onResize?.({
        initialSize,
        delta,
        finished,
        direction,
      });
    };

    const handleMouseMove = (event: MouseEvent | TouchEvent) =>
      sendResizeEvent(event, false);

    const handleMouseUp = (event: MouseEvent | TouchEvent) => {
      setIsResizing(false);
      onHoverEnd?.();
      sendResizeEvent(event, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [
    isResizing,
    initialPosition,
    initialSize,
    onResize,
    isHorizontal,
    onHoverEnd,
    direction,
  ]);

  return {
    isResizing,
    setIsResizing,
    initialPosition,
    setInitialPosition,
    initialSize,
    setInitialSize,
    isHorizontal,
    direction,
    onResize,
    onMouseDown,
    onTouchStart,
    onHover,
    onHoverEnd,
  };
};

export const useResizeHandle = ({
  setInitialPosition,
  setInitialSize,
  setIsResizing,
  onMouseDown,
  onTouchStart,
  isHorizontal,
  isResizing,
  onHover,
  onHoverEnd,
}: ReturnType<typeof useResizeHandleState>) => {
  const handleMouseDown: MouseEventHandler = (event) => {
    const { clientX, clientY } = event;
    setInitialPosition(isHorizontal ? clientX : clientY);

    const element = (event.target as HTMLElement).parentElement!;
    setInitialSize(isHorizontal ? element.offsetWidth : element.offsetHeight);

    setIsResizing(true);

    onMouseDown?.(event);
  };

  const handleTouchStart: TouchEventHandler = (event) => {
    const { touches } = event;
    const touch = touches[0];
    const { clientX, clientY } = touch;
    setInitialPosition(isHorizontal ? clientX : clientY);

    const element = (event.target as HTMLElement).parentElement!;
    setInitialSize(isHorizontal ? element.offsetWidth : element.offsetHeight);
    setIsResizing(true);
    onTouchStart?.(event);
  };

  const handleMouseOver = () => {
    onHover?.();
  };

  const handleMouseOut = () => {
    if (!isResizing) {
      onHoverEnd?.();
    }
  };

  return {
    props: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      onMouseOver: handleMouseOver,
      onMouseOut: handleMouseOut,
      onTouchMove: handleMouseOver,
      onTouchEnd: handleMouseOut,
    },
  };
};

export const ResizeHandle = createPrimitiveComponent<
  'div',
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onResize'>
>('div')({
  propsHook: useResizeHandle,
  stateHook: useResizeHandleState,
});

export type ResizeHandleProps = React.ComponentPropsWithRef<
  typeof ResizeHandle
>;
