import {
  MouseEventHandler,
  TouchEventHandler,
  useEffect,
  useState,
} from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';
import { ResizeDirection, ResizeEvent } from '../types';
import { isTouchEvent } from '../utils';

export type ResizeHandleProps = HTMLPropsAs<'div'> & {
  direction: ResizeDirection;
  width?: number;
  startMargin?: number;
  endMargin?: number;
  zIndex?: number;
  onResize?: (event: ResizeEvent) => void;
  onMouseDown?: MouseEventHandler;
  onTouchStart?: TouchEventHandler;
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
  onTouchStart,
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
      onResize?.({ initialSize, delta, finished, direction });
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
    onTouchStart: handleTouchStart,
    onMouseOver: handleMouseOver,
    onMouseOut: handleMouseOut,
    onTouchMove: handleMouseOver,
    onTouchEnd: handleMouseOut,
    ...props,
  };
};

export const ResizeHandle = createComponentAs<ResizeHandleProps>((props) => {
  const htmlProps = useResizeHandleProps(props);
  return createElementAs('div', htmlProps);
});
