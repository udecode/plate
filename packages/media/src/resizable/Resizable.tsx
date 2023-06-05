import React, { useCallback, useEffect, useRef } from 'react';
import {
  AsProps,
  createComponentAs,
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
import { useResizableStore } from './resizableStore';
import { TResizableElement } from './TResizableElement';

export interface ResizableProps extends AsProps<'div'> {
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

export const useResizable = ({
  align = 'center',
  readOnly,
  minWidth = 92,
  maxWidth = '100%',
  renderHandleLeft,
  renderHandleRight,
  ...props
}: ResizableProps) => {
  const element = useElement<TMediaElement>();
  const editor = usePlateEditorRef();
  const _readOnly = useReadOnly();
  readOnly = isDefined(readOnly) ? readOnly : _readOnly;
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    wrapperProps: {
      ref: wrapperRef,
      style: {
        position: 'relative',
      },
    } as AsProps<'div'>,
    resizableProps: {
      style: {
        width,
        minWidth,
        maxWidth,
        position: 'relative',
      },
    } as AsProps<'div'>,
    handleLeft,
    handleRight,
    restProps: props,
  };
};

export const Resizable = createComponentAs<ResizableProps>(
  ({ children, ...props }) => {
    const { wrapperProps, resizableProps, handleLeft, handleRight, restProps } =
      useResizable(props);

    return (
      <div {...wrapperProps}>
        <div {...(resizableProps as any)} {...restProps}>
          {handleLeft}
          {children}
          {handleRight}
        </div>
      </div>
    );
  }
);
