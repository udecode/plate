import React, { HTMLAttributes, useCallback, useEffect, useRef } from 'react';
import {
  findNodePath,
  isDefined,
  select,
  setNodes,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import {
  ResizeEvent,
  ResizeHandleProps,
  ResizeLength,
  resizeLengthClamp,
  useResizeHandle,
  useResizeHandleState,
} from '@udecode/resizable';
import { useReadOnly } from 'slate-react';

import { TMediaElement } from '../media/types';
import { TResizableElement } from './TResizableElement';
import { useResizableStore } from './resizableStore';

export interface ResizableOptions {
  /**
   * Node alignment.
   */
  align?: 'left' | 'center' | 'right';

  readOnly?: boolean;

  minWidth?: ResizeLength;
  maxWidth?: ResizeLength;

  renderHandleLeft?: (props: ResizeHandleProps) => JSX.Element;
  renderHandleRight?: (props: ResizeHandleProps) => JSX.Element;
}

export const useResizableState = ({
  align = 'center',
  readOnly,
  minWidth = 92,
  maxWidth = '100%',
  renderHandleLeft,
  renderHandleRight,
}: ResizableOptions) => {
  const element = useElement<TMediaElement>();
  const editor = usePlateEditorRef();
  const _readOnly = useReadOnly();
  readOnly = isDefined(readOnly) ? readOnly : _readOnly;

  const nodeWidth = element?.width ?? '100%';

  const [width, setWidth] = useResizableStore().use.width();

  const setNodeWidth = useCallback(
    (w: number) => {
      const path = findNodePath(editor, element!);
      if (!path) return;

      if (w === nodeWidth) {
        // Focus the node if not resized
        select(editor, path);
      } else {
        setNodes<TResizableElement>(editor, { width: w }, { at: path });
      }
    },
    [editor, element, nodeWidth]
  );

  useEffect(() => {
    setWidth(nodeWidth);
  }, [nodeWidth, setWidth]);

  return {
    align,
    readOnly,
    minWidth,
    maxWidth,
    renderHandleLeft,
    renderHandleRight,
    setNodeWidth,
    setWidth,
    width,
  };
};

export const useResizable = ({
  align,
  readOnly,
  minWidth,
  maxWidth,
  renderHandleLeft,
  renderHandleRight,
  setNodeWidth,
  setWidth,
  width,
}: ReturnType<typeof useResizableState>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(
    ({ initialSize, delta, finished, direction }: ResizeEvent) => {
      const wrapperStaticWidth = wrapperRef.current!.offsetWidth;
      const deltaFactor =
        (align === 'center' ? 2 : 1) * (direction === 'left' ? -1 : 1);

      const newWidth = resizeLengthClamp(
        initialSize + delta * deltaFactor,
        wrapperStaticWidth,
        {
          min: minWidth,
          max: maxWidth,
        }
      );

      if (finished) {
        setNodeWidth(newWidth);
      } else {
        setWidth(newWidth);
      }
    },
    [align, maxWidth, minWidth, setNodeWidth, setWidth]
  );

  // Remove style except for cursor
  const handlePropsLeft = {
    ...useResizeHandle(
      useResizeHandleState({
        direction: 'left',
        onResize: handleResize,
      })
    ).props,
    style: { cursor: 'ew-resize' },
  };

  const handlePropsRight = {
    ...useResizeHandle(
      useResizeHandleState({
        direction: 'right',
        onResize: handleResize,
      })
    ).props,
    style: { cursor: 'ew-resize' },
  };

  const handleLeft =
    !readOnly && align !== 'left' && renderHandleLeft?.(handlePropsLeft);
  const handleRight =
    !readOnly && align !== 'right' && renderHandleRight?.(handlePropsRight);

  return {
    wrapperRef,
    wrapperProps: {
      style: {
        position: 'relative',
      },
    } as HTMLAttributes<HTMLDivElement>,
    resizableProps: {
      style: {
        width,
        minWidth,
        maxWidth,
        position: 'relative',
      },
    },
    handleLeft,
    handleRight,
  };
};

const Resizable = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    options: ResizableOptions;
  }
>(({ children, options, ...props }, ref) => {
  const state = useResizableState(options);
  const { wrapperRef, wrapperProps, resizableProps, handleLeft, handleRight } =
    useResizable(state);

  return (
    <div ref={wrapperRef} {...wrapperProps}>
      <div ref={ref} {...(resizableProps as any)} {...props}>
        {handleLeft}
        {children}
        {handleRight}
      </div>
    </div>
  );
});
Resizable.displayName = 'Resizable';

export { Resizable };
