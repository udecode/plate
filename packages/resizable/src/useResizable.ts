import React from 'react';

import { useEditor, useElement } from '@platejs/core/react';
import { createAtomStore } from '@platejs/core/react/internal';
import { useEditorReadOnly } from '@platejs/plite-react';
import type { TResizableElement } from '@platejs/utils';

import {
  type ResizeDirection,
  type ResizeEvent,
  type ResizeLength,
  resizeLengthClamp,
} from './resizeLength';

export type ResizableOptions = {
  /** Node alignment. */
  align?: 'center' | 'left' | 'right';
  maxWidth?: ResizeLength;
  minWidth?: ResizeLength;
};

type ResizableStoreState = {
  width: number | string;
};

const resizableInitialState: ResizableStoreState = {
  width: 0,
};

export const {
  ResizableProvider,
  resizableStore,
  useResizableSet,
  useResizableStore,
  useResizableValue,
} = createAtomStore(resizableInitialState, { name: 'resizable' as const });

export type ResizeHandleStoreState = {
  onResize: (event: ResizeEvent) => void;
};

const resizeHandleInitialState: ResizeHandleStoreState = {
  onResize: () => {},
};

export const {
  ResizeHandleProvider,
  useResizeHandleSet,
  useResizeHandleStore,
  useResizeHandleValue,
} = createAtomStore(resizeHandleInitialState, {
  name: 'resizeHandle' as const,
  suppressWarnings: true,
});

export const useResizableState = ({
  align = 'center',
  maxWidth = '100%',
  minWidth = 92,
}: ResizableOptions = {}) => {
  const editor = useEditor();
  const element = useElement<TResizableElement>();
  const nodeWidth = element?.width ?? '100%';
  const width = useResizableValue('width');
  const setWidth = useResizableSet('width');

  const setNodeWidth = React.useCallback(
    (nextWidth: number) => {
      if (nextWidth === nodeWidth) {
        const path = editor.read.nodes.path(element);

        if (!path) return;

        editor.update.selection.set(path);

        return;
      }

      editor.update.nodes.set({ width: nextWidth }, { at: element });
    },
    [editor, element, nodeWidth]
  );

  React.useEffect(() => {
    setWidth(nodeWidth);
  }, [nodeWidth, setWidth]);

  return {
    align,
    maxWidth,
    minWidth,
    setNodeWidth,
    setWidth,
    width,
  };
};

export const useResizable = ({
  align,
  maxWidth,
  minWidth,
  setNodeWidth,
  setWidth,
  width,
}: ReturnType<typeof useResizableState>) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  return {
    context: {
      onResize: React.useCallback(
        ({ delta, direction, finished, initialSize }: ResizeEvent) => {
          const wrapperStaticWidth = wrapperRef.current!.offsetWidth;
          const deltaFactor =
            (align === 'center' ? 2 : 1) * (direction === 'left' ? -1 : 1);
          const newWidth = resizeLengthClamp(
            initialSize + delta * deltaFactor,
            wrapperStaticWidth,
            {
              max: maxWidth,
              min: minWidth,
            }
          );

          if (finished) {
            setNodeWidth(newWidth);
          } else {
            setWidth(newWidth);
          }
        },
        [align, maxWidth, minWidth, setNodeWidth, setWidth]
      ),
    },
    props: {
      style: {
        maxWidth,
        minWidth,
        position: 'relative',
        width,
      } as React.CSSProperties,
    },
    wrapperProps: {
      style: {
        position: 'relative',
      } as React.CSSProperties,
    },
    wrapperRef,
  };
};

export type ResizeHandleOptions = {
  direction?: ResizeDirection;
  initialSize?: number;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onMouseDown?: React.MouseEventHandler;
  onResize?: (event: ResizeEvent) => void;
  onTouchStart?: React.TouchEventHandler;
};

export const useResizeHandleState = ({
  direction = 'left',
  initialSize: initialSizeProp,
  onHover,
  onHoverEnd,
  onMouseDown,
  onResize: onResizeProp,
  onTouchStart,
}: ResizeHandleOptions) => {
  const readOnly = useEditorReadOnly();
  const onResizeStore = useResizeHandleValue('onResize');
  const onResize = onResizeProp ?? onResizeStore;
  const [isResizing, setIsResizing] = React.useState(false);
  const [initialPosition, setInitialPosition] = React.useState(0);
  const [initialSizeState, setInitialSize] = React.useState(0);
  const initialSize = initialSizeProp ?? initialSizeState;
  const isHorizontal = direction === 'left' || direction === 'right';

  React.useEffect(() => {
    if (!isResizing) return;

    const sendResizeEvent = (
      event: MouseEvent | TouchEvent,
      finished: boolean
    ) => {
      const point =
        'touches' in event
          ? event.touches[0] || event.changedTouches[0]
          : event;
      const currentPosition = isHorizontal ? point.clientX : point.clientY;

      onResize({
        delta: currentPosition - initialPosition,
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
      onHoverEnd?.();
      sendResizeEvent(event, true);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [
    direction,
    initialPosition,
    initialSize,
    isHorizontal,
    isResizing,
    onHoverEnd,
    onResize,
  ]);

  return {
    direction,
    initialPosition,
    initialSize,
    isHorizontal,
    isResizing,
    readOnly,
    setInitialPosition,
    setInitialSize,
    setIsResizing,
    onHover,
    onHoverEnd,
    onMouseDown,
    onResize,
    onTouchStart,
  };
};

export const useResizeHandle = ({
  isHorizontal,
  isResizing,
  readOnly,
  setInitialPosition,
  setInitialSize,
  setIsResizing,
  onHover,
  onHoverEnd,
  onMouseDown,
  onTouchStart,
}: ReturnType<typeof useResizeHandleState>) => {
  const startResize = (
    event: React.MouseEvent | React.TouchEvent,
    clientX: number,
    clientY: number
  ) => {
    setInitialPosition(isHorizontal ? clientX : clientY);

    const element = (event.target as HTMLElement).parentElement!;

    setInitialSize(isHorizontal ? element.offsetWidth : element.offsetHeight);
    setIsResizing(true);
  };

  const handleMouseDown: React.MouseEventHandler = (event) => {
    startResize(event, event.clientX, event.clientY);
    onMouseDown?.(event);
  };
  const handleTouchStart: React.TouchEventHandler = (event) => {
    const { clientX, clientY } = event.touches[0];

    startResize(event, clientX, clientY);
    onTouchStart?.(event);
  };
  const handleMouseOut = () => {
    if (!isResizing) onHoverEnd?.();
  };

  return {
    hidden: readOnly,
    props: {
      onMouseDown: handleMouseDown,
      onMouseOut: handleMouseOut,
      onMouseOver: onHover,
      onTouchEnd: handleMouseOut,
      onTouchMove: onHover,
      onTouchStart: handleTouchStart,
    },
  };
};
