import React, {
  CSSProperties,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  findNodePath,
  select,
  setNodes,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import {
  ResizeEvent,
  ResizeHandleProvider,
  ResizeLength,
  resizeLengthClamp,
} from '@udecode/resizable';

import { TMediaElement } from '../media/types';
import { useResizableStore } from './resizableStore';
import { TResizableElement } from './TResizableElement';

export interface ResizableOptions {
  /**
   * Node alignment.
   */
  align?: 'left' | 'center' | 'right';

  readOnly?: boolean;

  minWidth?: ResizeLength;
  maxWidth?: ResizeLength;
}

export const useResizableState = ({
  align = 'center',
  minWidth = 92,
  maxWidth = '100%',
}: ResizableOptions = {}) => {
  const element = useElement<TMediaElement>();
  const editor = usePlateEditorRef();

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
    minWidth,
    maxWidth,
    setNodeWidth,
    setWidth,
    width,
  };
};

export const useResizable = ({
  align,
  minWidth,
  maxWidth,
  setNodeWidth,
  setWidth,
  width,
}: ReturnType<typeof useResizableState>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return {
    wrapperRef,
    wrapperProps: {
      style: {
        position: 'relative',
      } as CSSProperties,
    },
    props: {
      style: {
        width,
        minWidth,
        maxWidth,
        position: 'relative',
      } as CSSProperties,
    },
    context: {
      onResize: useCallback(
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
      ),
    },
  };
};

const Resizable = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    options: ResizableOptions;
  }
>(({ children, options, ...rest }, ref) => {
  const state = useResizableState(options);
  const { wrapperRef, wrapperProps, props, context } = useResizable(state);

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
