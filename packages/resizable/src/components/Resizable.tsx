import React from 'react';

import { useEditorRef, useElement, usePath } from '@udecode/plate/react';

import type { ResizeEvent, ResizeLength } from '../types';
import type { TResizableElement } from './TResizableElement';

import { resizeLengthClamp } from '../utils';
import { ResizeHandleProvider } from './ResizeHandle';
import { useResizableSet, useResizableValue } from './useResizableStore';

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
  const editor = useEditorRef();
  const element = useElement<TResizableElement>();
  const path = usePath();

  const nodeWidth = element?.width ?? '100%';

  const width = useResizableValue('width');
  const setWidth = useResizableSet('width');

  const setNodeWidth = React.useCallback(
    (w: number) => {
      if (w === nodeWidth) {
        // Focus the node if not resized
        editor.tf.select(path);
      } else {
        editor.tf.setNodes<TResizableElement>({ width: w }, { at: path });
      }
    },
    [editor, nodeWidth, path]
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
