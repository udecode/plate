import * as React from 'react';

import { useEditorReadOnly } from '../../core';
import { bindPointerSession } from '../../utils/bindPointerSession.internal';
import {
  resizeLengthClamp,
  resizeLengthToRelative,
  resizeLengthToStatic,
} from './resizeLength.internal';

export type ResizeDirection = 'bottom' | 'left' | 'right' | 'top';

export type ResizeEvent = {
  delta: number;
  direction: ResizeDirection;
  finished: boolean;
  initialSize: number;
};

export type ResizeLength = number | string;

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
  parentWidth: number;
  resetWidth: () => void;
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
  const [parentWidth, setParentWidth] = React.useState(0);
  const measureWrapper = React.useCallback((element: HTMLDivElement | null) => {
    wrapperRef.current = element;
    if (element) setParentWidth(element.offsetWidth);
  }, []);
  React.useLayoutEffect(() => {
    const element = wrapperRef.current;
    if (!element) return undefined;
    const Observer = element.ownerDocument.defaultView?.ResizeObserver;
    if (!Observer) return undefined;
    const observer = new Observer(() => setParentWidth(element.offsetWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
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
  const resetWidth = React.useCallback(
    () => setWidth(nodeWidth),
    [nodeWidth, setWidth]
  );
  const nudgeWidth = React.useCallback(
    (delta: number) => {
      const wrapperWidth = wrapperRef.current?.offsetWidth;

      if (!wrapperWidth) return;
      setParentWidth(wrapperWidth);

      const nextWidth = resizeLengthClamp(
        resizeLengthToStatic(width, wrapperWidth) + delta,
        wrapperWidth,
        { max: maxWidth, min: minWidth }
      );

      commitWidth(
        typeof width === 'string' && width.trim().endsWith('%')
          ? resizeLengthToRelative(nextWidth, wrapperWidth)
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
      setParentWidth(wrapperWidth);

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
    () => ({
      maxWidth,
      minWidth,
      nudgeWidth,
      onResize,
      parentWidth,
      resetWidth,
      width,
    }),
    [maxWidth, minWidth, nudgeWidth, onResize, parentWidth, resetWidth, width]
  );

  return (
    <ResizeContext value={context}>
      <div ref={measureWrapper} style={{ position: 'relative' }}>
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
  onPointerDown,
  onPointerLeave,
  onPointerEnter,
  onResize: onResizeProp,
  style,
  ...props
}: ResizeHandleProps) {
  const context = React.use(ResizeContext);

  if (!context) {
    throw new Error('ResizeHandle must be rendered inside Resizable');
  }

  const readOnly = useEditorReadOnly();
  const onResize = onResizeProp ?? context.onResize;
  const [isResizing, setIsResizing] = React.useState(false);
  const cancelRef = React.useRef<(() => void) | null>(null);
  const isHorizontal = direction === 'left' || direction === 'right';
  React.useLayoutEffect(
    () => () => cancelRef.current?.(),
    [direction, initialSizeProp, onResize, readOnly, context.resetWidth]
  );

  if (readOnly) return null;

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const handle = event.currentTarget;
    const parent = handle.parentElement;
    const ownerWindow = handle.ownerDocument.defaultView;
    if (
      event.button !== 0 ||
      !event.isPrimary ||
      !parent?.isConnected ||
      !ownerWindow
    ) {
      return;
    }
    cancelRef.current?.();
    const initialPosition = isHorizontal ? event.clientX : event.clientY;
    const initialSize =
      initialSizeProp ??
      (isHorizontal ? parent.offsetWidth : parent.offsetHeight);
    const publish = (pointer: PointerEvent, finished: boolean) =>
      onResize({
        delta:
          (isHorizontal ? pointer.clientX : pointer.clientY) - initialPosition,
        direction,
        finished,
        initialSize,
      });
    cancelRef.current = bindPointerSession({
      ownerWindow,
      pointerId: event.pointerId,
      isCurrent: () => handle.isConnected && handle.parentElement === parent,
      onMove: (pointer) => publish(pointer, false),
      onEnd: (pointer) => {
        cancelRef.current = null;
        setIsResizing(false);
        try {
          if (pointer) publish(pointer, true);
          else context.resetWidth();
        } finally {
          onHoverEnd?.();
        }
      },
    });
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
  };
  const width = resizeLengthClamp(
    resizeLengthToStatic(context.width, context.parentWidth),
    context.parentWidth,
    { min: context.minWidth, max: context.maxWidth }
  );
  const unit =
    typeof context.width === 'string' && context.width.trim().endsWith('%')
      ? '%'
      : 'px';

  return (
    <div
      aria-label="Resize"
      aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
      aria-valuemax={resizeLengthToStatic(
        context.maxWidth,
        context.parentWidth
      )}
      aria-valuemin={resizeLengthToStatic(
        context.minWidth,
        context.parentWidth
      )}
      aria-valuenow={width}
      aria-valuetext={
        unit === '%' && context.parentWidth
          ? resizeLengthToRelative(width, context.parentWidth)
          : `${width}px`
      }
      data-resizing={isResizing || undefined}
      role="slider"
      style={{ touchAction: 'none', ...style }}
      tabIndex={0}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing) return;
        const rtl =
          event.currentTarget.ownerDocument.defaultView?.getComputedStyle(
            event.currentTarget
          ).direction === 'rtl';
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
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) startResize(event);
      }}
      onPointerLeave={(event) => {
        if (!isResizing) onHoverEnd?.();
        onPointerLeave?.(event);
      }}
      onPointerEnter={(event) => {
        onHover?.();
        onPointerEnter?.(event);
      }}
      onBlur={() => {
        if (!isResizing) onHoverEnd?.();
      }}
      onFocus={() => onHover?.()}
      {...props}
    />
  );
}
