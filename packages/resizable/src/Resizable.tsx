import { useEditorReadOnly } from '@platejs/plite-react';
import * as React from 'react';

import {
  type ResizeDirection,
  type ResizeEvent,
  type ResizeLength,
  resizeLengthClamp,
  resizeLengthToRelative,
  resizeLengthToStatic,
} from './resizeLength';

export type ResizableProps = Omit<
  React.ComponentPropsWithRef<'div'>,
  'onResize'
> & {
  /** Node alignment. */
  align?: 'center' | 'left' | 'right';
  maxWidth?: ResizeLength;
  minWidth?: ResizeLength;
  onResizeEnd?: (width: ResizeLength) => void;
  width?: ResizeLength;
};

export type ResizeHandleProps = Omit<
  React.ComponentPropsWithRef<'div'>,
  'onResize'
> & {
  direction?: ResizeDirection;
  initialSize?: number;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onResize?: (event: ResizeEvent) => void;
};

type ResizeContextValue = {
  maxWidth: ResizeLength;
  minWidth: ResizeLength;
  nudgeWidth: (delta: number) => void;
  onResize: (event: ResizeEvent) => void;
  width: ResizeLength;
};

const ResizeContext = React.createContext<ResizeContextValue | null>(null);

export function Resizable({
  align = 'center',
  children,
  maxWidth = '100%',
  minWidth = 0,
  onResizeEnd,
  ref,
  style,
  width: nodeWidth = '100%',
  ...props
}: ResizableProps) {
  const [widthState, setWidthState] = React.useState(() => ({
    source: nodeWidth,
    value: nodeWidth,
  }));
  const width = widthState.source === nodeWidth ? widthState.value : nodeWidth;
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const setWidth = React.useCallback(
    (value: ResizeLength) => {
      setWidthState({ source: nodeWidth, value });
    },
    [nodeWidth]
  );

  const commitWidth = React.useCallback(
    (nextWidth: ResizeLength) => {
      setWidth(nextWidth);
      onResizeEnd?.(nextWidth);
    },
    [onResizeEnd, setWidth]
  );
  const nudgeWidth = React.useCallback(
    (delta: number) => {
      const parentWidth = wrapperRef.current?.offsetWidth;

      if (!parentWidth) return;

      const nextWidth = resizeLengthClamp(
        resizeLengthToStatic(width, parentWidth) + delta,
        parentWidth,
        { max: maxWidth, min: minWidth }
      );

      commitWidth(
        typeof width === 'string' && width.trim().endsWith('%')
          ? resizeLengthToRelative(nextWidth, parentWidth)
          : typeof width === 'string'
            ? `${nextWidth}px`
            : nextWidth
      );
    },
    [commitWidth, maxWidth, minWidth, width]
  );
  const onResize = React.useCallback(
    ({ delta, direction, finished, initialSize }: ResizeEvent) => {
      const wrapperWidth = wrapperRef.current?.offsetWidth;

      if (!wrapperWidth) return;

      const deltaFactor =
        (align === 'center' ? 2 : 1) * (direction === 'left' ? -1 : 1);
      const nextWidth = resizeLengthClamp(
        initialSize + delta * deltaFactor,
        wrapperWidth,
        { max: maxWidth, min: minWidth }
      );

      if (finished) {
        commitWidth(nextWidth);
      } else {
        setWidth(nextWidth);
      }
    },
    [align, commitWidth, maxWidth, minWidth, setWidth]
  );
  const context = React.useMemo(
    () => ({ maxWidth, minWidth, nudgeWidth, onResize, width }),
    [maxWidth, minWidth, nudgeWidth, onResize, width]
  );

  return (
    <ResizeContext value={context}>
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        <div
          ref={ref}
          style={{
            maxWidth,
            minWidth,
            position: 'relative',
            width,
            ...style,
          }}
          {...props}
        >
          {children}
        </div>
      </div>
    </ResizeContext>
  );
}

export function ResizeHandle({
  direction = 'left',
  initialSize: initialSizeProp,
  onHover,
  onHoverEnd,
  onKeyDown,
  onMouseDown,
  onMouseOut,
  onMouseOver,
  onResize: onResizeProp,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
  ...props
}: ResizeHandleProps) {
  const context = React.use(ResizeContext);

  if (!context) {
    throw new Error('ResizeHandle must be rendered inside Resizable');
  }

  const readOnly = useEditorReadOnly();
  const onResize = onResizeProp ?? context.onResize;
  const [isResizing, setIsResizing] = React.useState(false);
  const [initialPosition, setInitialPosition] = React.useState(0);
  const [initialSizeState, setInitialSize] = React.useState(0);
  const initialSize = initialSizeProp ?? initialSizeState;
  const isHorizontal = direction === 'left' || direction === 'right';
  const publishHoverEnd = React.useEffectEvent(() => onHoverEnd?.());
  const publishResize = React.useEffectEvent((event: ResizeEvent) => {
    onResize(event);
  });

  React.useEffect(() => {
    if (!isResizing) return undefined;

    const sendResizeEvent = (
      event: MouseEvent | TouchEvent,
      finished: boolean
    ) => {
      const point =
        'touches' in event
          ? event.touches[0] || event.changedTouches[0]
          : event;

      if (!point) return;

      publishResize({
        delta: (isHorizontal ? point.clientX : point.clientY) - initialPosition,
        direction,
        finished,
        initialSize,
      });
    };
    const handleMove = (event: MouseEvent | TouchEvent) => {
      sendResizeEvent(event, false);
    };
    const handleEnd = (event: MouseEvent | TouchEvent) => {
      setIsResizing(false);
      publishHoverEnd();
      sendResizeEvent(event, true);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [direction, initialPosition, initialSize, isHorizontal, isResizing]);

  if (readOnly) return null;

  const startResize = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    clientX: number,
    clientY: number
  ) => {
    setInitialPosition(isHorizontal ? clientX : clientY);

    const parent = event.currentTarget.parentElement;

    if (!parent) return;

    setInitialSize(isHorizontal ? parent.offsetWidth : parent.offsetHeight);
    setIsResizing(true);
  };
  const width = Number.parseFloat(String(context.width));
  const unit =
    typeof context.width === 'string' && context.width.trim().endsWith('%')
      ? '%'
      : 'px';

  return (
    <div
      aria-label="Resize"
      aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
      aria-valuemax={Number.parseFloat(String(context.maxWidth))}
      aria-valuemin={Number.parseFloat(String(context.minWidth))}
      aria-valuenow={width}
      aria-valuetext={`${width}${unit}`}
      data-resizing={isResizing || undefined}
      role="slider"
      tabIndex={0}
      onKeyDown={(event) => {
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const step = event.shiftKey ? 50 : 10;
        const delta =
          event.key === 'ArrowUp'
            ? 1
            : event.key === 'ArrowDown'
              ? -1
              : event.key === 'ArrowRight'
                ? rtl
                  ? -1
                  : 1
                : event.key === 'ArrowLeft'
                  ? rtl
                    ? 1
                    : -1
                  : 0;

        if (delta !== 0) {
          event.preventDefault();
          context.nudgeWidth(delta * step);
        }

        onKeyDown?.(event);
      }}
      onMouseDown={(event) => {
        startResize(event, event.clientX, event.clientY);
        onMouseDown?.(event);
      }}
      onMouseOut={(event) => {
        if (!isResizing) onHoverEnd?.();
        onMouseOut?.(event);
      }}
      onMouseOver={(event) => {
        onHover?.();
        onMouseOver?.(event);
      }}
      onBlur={() => {
        if (!isResizing) onHoverEnd?.();
      }}
      onFocus={() => onHover?.()}
      onTouchEnd={(event) => {
        if (!isResizing) onHoverEnd?.();
        onTouchEnd?.(event);
      }}
      onTouchMove={(event) => {
        onHover?.();
        onTouchMove?.(event);
      }}
      onTouchStart={(event) => {
        const point = event.touches[0];

        if (point) startResize(event, point.clientX, point.clientY);
        onTouchStart?.(event);
      }}
      {...props}
    />
  );
}
