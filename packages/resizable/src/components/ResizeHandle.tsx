import { MouseEventHandler, useEffect, useState } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';
import { ResizeEvent } from '../types';

export type ResizeHandleProps = HTMLPropsAs<'div'> & {
  direction: 'left' | 'right' | 'top' | 'bottom';
  width?: number;
  startMargin?: number;
  endMargin?: number;
  zIndex?: number;
  onResize?: (event: ResizeEvent) => void;
  onMouseDown?: MouseEventHandler;
  onHover?: () => void;
  onHoverEnd?: () => void;
};

export const useResizeHandleProps = ({
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
  ...props
}: ResizeHandleProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);
  const [initialSize, setInitialSize] = useState(0);

  const isHorizontal = direction === 'left' || direction === 'right';

  const handleMouseDown: MouseEventHandler = (event) => {
    const { clientX, clientY } = event;
    setInitialPosition(isHorizontal ? clientX : clientY);

    const element = (event.target as HTMLElement).parentElement!;
    setInitialSize(isHorizontal ? element.offsetWidth : element.offsetHeight);

    setIsResizing(true);

    onMouseDown?.(event);
  };

  useEffect(() => {
    if (!isResizing) return;

    const sendResizeEvent = (event: MouseEvent, finished: boolean) => {
      const { clientX, clientY } = event;
      const currentPosition = isHorizontal ? clientX : clientY;
      const delta = currentPosition - initialPosition;
      onResize?.({ initialSize, delta, finished });
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
  ]);

  const handleMouseOver = () => {
    onHover?.();
  };

  const handleMouseOut = () => {
    if (!isResizing) {
      onHoverEnd?.();
    }
  };

  const nearSide = direction;
  const start = isHorizontal ? 'top' : 'left';
  const end = isHorizontal ? 'bottom' : 'right';
  const size = isHorizontal ? 'width' : 'height';

  return {
    style: {
      position: 'absolute',
      [nearSide]: -width / 2,
      [start]: startMargin,
      [end]: endMargin,
      [size]: width,
      zIndex,
      cursor: isHorizontal ? 'col-resize' : 'row-resize',
      ...style,
    },
    onMouseDown: handleMouseDown,
    onMouseOver: handleMouseOver,
    onMouseOut: handleMouseOut,
    ...props,
  };
};

export const ResizeHandle = createComponentAs<ResizeHandleProps>((props) => {
  const htmlProps = useResizeHandleProps(props);
  return createElementAs('div', htmlProps);
});
