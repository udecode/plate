import React, { useCallback, useEffect } from 'react';
import {
  AsProps,
  createComponentAs,
  findNodePath,
  isDefined,
  select,
  setNodes,
  useEditorRef,
} from '@udecode/plate-core';
import { Resizable, ResizableProps } from 're-resizable';
import { useReadOnly } from 'slate-react';
import { useImageElement } from '../hooks/index';
import { TImageElement } from '../types';
import { useImageStore } from './Image';

export interface ImageResizableProps
  extends Omit<ResizableProps, 'as'>,
    AsProps<'div'> {
  /**
   * Image alignment.
   */
  align?: 'left' | 'center' | 'right';

  readOnly?: boolean;
}

export const useImageResizable = ({
  align = 'center',
  readOnly,
  ...props
}: ImageResizableProps): ResizableProps => {
  const element = useImageElement();
  const editor = useEditorRef();
  const _readOnly = useReadOnly();
  readOnly = isDefined(readOnly) ? readOnly : _readOnly;

  const { width: nodeWidth = '100%' } = element ?? {};

  const [width, setWidth] = useImageStore().use.width();

  const setNodeWidth = useCallback(
    (w: number) => {
      const path = findNodePath(editor, element!);
      if (!path) return;

      if (w === nodeWidth) {
        // Focus the node if not resized
        select(editor, path);
      } else {
        setNodes<TImageElement>(editor, { width: w }, { at: path });
      }
    },
    [editor, element, nodeWidth]
  );

  useEffect(() => {
    setWidth(nodeWidth);
  }, [nodeWidth, setWidth]);

  const defaultProps: ResizableProps = {
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

export const ImageResizable = createComponentAs<ImageResizableProps>(
  (props) => {
    const resizableProps = useImageResizable(props);

    return <Resizable {...resizableProps} />;
  }
);
