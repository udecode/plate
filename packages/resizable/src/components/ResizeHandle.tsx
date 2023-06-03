import { MouseEventHandler, useEffect, useState } from 'react';
import { createPrimitiveComponent } from '@udecode/plate-common';
import { ResizeDirection, ResizeEvent } from '../types';

export type ResizeHandleOptions = {
  style?: HTMLDivElement['style'];
  direction: ResizeDirection;
  width?: number;
  startMargin?: number;
  endMargin?: number;
  zIndex?: number;
  onResize?: (event: ResizeEvent) => void;
  onMouseDown?: MouseEventHandler;
  onHover?: () => void;
  onHoverEnd?: () => void;
};

export const useResizeHandleState = ({
  direction,
  width = 10,
  startMargin = 0,
  endMargin = 0,
  zIndex = 40,
  onResize,
  onMouseDown,
  onHover,
  onHoverEnd,
  style,
}: ResizeHandleOptions) => {
  const [isResizing, setIsResizing] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);
  const [initialSize, setInitialSize] = useState(0);

  const isHorizontal = direction === 'left' || direction === 'right';

  useEffect(() => {
    if (!isResizing) return;

    const sendResizeEvent = (event: MouseEvent, finished: boolean) => {
      const { clientX, clientY } = event;
      const currentPosition = isHorizontal ? clientX : clientY;
      const delta = currentPosition - initialPosition;
      onResize?.({ initialSize, delta, finished, direction });
    };

    const handleMouseMove = (event: MouseEvent) =>
      sendResizeEvent(event, false);

    const handleMouseUp = (event: MouseEvent) => {
      setIsResizing(false);
      onHoverEnd?.();
      sendResizeEvent(event, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
    width,
    startMargin,
    endMargin,
    zIndex,
    onResize,
    onMouseDown,
    onHover,
    onHoverEnd,
    style,
  };
};

export const useResizeHandle = (
  state: ReturnType<typeof useResizeHandleState>
) => {
  const handleMouseDown: MouseEventHandler = (event) => {
    const { clientX, clientY } = event;
    state.setInitialPosition(state.isHorizontal ? clientX : clientY);

    const element = (event.target as HTMLElement).parentElement!;
    state.setInitialSize(
      state.isHorizontal ? element.offsetWidth : element.offsetHeight
    );

    state.setIsResizing(true);

    state.onMouseDown?.(event);
  };

  const handleMouseOver = () => {
    state.onHover?.();
  };

  const handleMouseOut = () => {
    if (!state.isResizing) {
      state.onHoverEnd?.();
    }
  };

  const nearSide = state.direction;
  const start = state.isHorizontal ? 'top' : 'left';
  const end = state.isHorizontal ? 'bottom' : 'right';
  const size = state.isHorizontal ? 'width' : 'height';

  return {
    props: {
      style: {
        position: 'absolute',
        [nearSide]: -state.width / 2,
        [start]: state.startMargin,
        [end]: state.endMargin,
        [size]: state.width,
        zIndex: state.zIndex,
        cursor: state.isHorizontal ? 'col-resize' : 'row-resize',
        ...state.style,
      },
      onMouseDown: handleMouseDown,
      onMouseOver: handleMouseOver,
      onMouseOut: handleMouseOut,
    },
  };
};

export const ResizeHandle = createPrimitiveComponent<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onResize'>
>('div')({
  propsHook: useResizeHandle,
  stateHook: useResizeHandleState,
});

export type ResizeHandleProps = React.ComponentProps<typeof ResizeHandle>;
