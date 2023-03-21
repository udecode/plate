import React, { useCallback, useEffect } from 'react';
import {
  AsProps,
  createComponentAs,
  findNodePath,
  isDefined,
  select,
  setNodes,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import {
  Resizable as ReResizable,
  ResizableProps as ReResizableProps,
} from 're-resizable';
import { useReadOnly } from 'slate-react';
import { TMediaElement } from '../media/types';
import { useResizableStore } from './resizableStore';
import { TResizableElement } from './TResizableElement';

export interface ResizableProps
  extends Omit<ReResizableProps, 'as'>,
    AsProps<'div'> {
  /**
   * Node alignment.
   */
  align?: 'left' | 'center' | 'right';

  readOnly?: boolean;
}

export const useResizable = ({
  align = 'center',
  readOnly,
  ...props
}: ResizableProps): ReResizableProps => {
  const element = useElement<TMediaElement>();
  const editor = useEditorRef();
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

  const defaultProps: ReResizableProps = {
    minWidth: 92,
    size: { width: width!, height: '100%' },
    maxWidth: '100%',
    lockAspectRatio: true,
    resizeRatio: align === 'center' ? 2 : 1,
    enable: {
      left: ['center', 'left'].includes(align),
      right: ['center', 'right'].includes(align),
    },
    handleStyles: {
      left: { left: 0 },
      right: { right: 0 },
    },
    onResize: (e, direction, ref) => {
      setWidth(ref.offsetWidth);
    },
    onResizeStop: (e, direction, ref) => setNodeWidth(ref.offsetWidth),
  };

  if (readOnly) {
    return {
      ...defaultProps,
      ...props,
      enable: {
        left: false,
        right: false,
        top: false,
        bottom: false,
        topLeft: false,
        bottomLeft: false,
        topRight: false,
        bottomRight: false,
      },
    };
  }

  return { ...defaultProps, ...props };
};

export const Resizable = createComponentAs<ResizableProps>((props) => {
  const resizableProps = useResizable(props);
  return <ReResizable {...resizableProps} />;
});
