import React from 'react';

import { select, setNodes } from '@udecode/plate-common';
import {
  findNodePath,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';

import type { ResizeEvent, ResizeLength } from '../types';
import type { TResizableElement } from './TResizableElement';

import { resizeLengthClamp } from '../utils';
import { ResizeHandleProvider } from './ResizeHandle';
import { useResizableStore } from './useResizableStore';

export interface ResizableOptions {
  /** Node alignment. */
  align?: 'center' | 'left' | 'right';

  maxWidth?: ResizeLength;

  minWidth?: ResizeLength;
  readOnly?: boolean;
}

export const useResizableState = ({
  align = 'center',
  maxWidth = '100%',
  minWidth = 92,
}: ResizableOptions = {}) => {
  const element = useElement<TResizableElement>();
  const editor = useEditorRef();

  const nodeWidth = element?.width ?? '100%';

  const [width, setWidth] = useResizableStore().use.width();

  const setNodeWidth = React.useCallback(
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

const Resizable = React.forwardRef<
  HTMLDivElement,
  {
    options: ResizableOptions;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ children, options, ...rest }, ref) => {
  const state = useResizableState(options);
  const { context, props, wrapperProps, wrapperRef } = useResizable(state);

  return (
    <div ref={wrapperRef} {...wrapperProps}>
      <div ref={ref} {...props} {...rest}>
        <ResizeHandleProvider onResize={context.onResize}>
          {children}
        </ResizeHandleProvider>
      </div>
    </div>
  );
});
Resizable.displayName = 'Resizable';

export { Resizable };
