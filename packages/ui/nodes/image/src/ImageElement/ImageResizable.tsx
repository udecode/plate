import React, { useCallback, useEffect } from 'react';
import {
  findNodePath,
  select,
  setNodes,
  useEditorRef,
} from '@udecode/plate-core';
import { TImageElement } from '@udecode/plate-image';
import { Resizable, ResizableProps } from 're-resizable';
import { useReadOnly } from 'slate-react';
import { createComponentAs } from '../utils/createComponentAs';
import {
  imageElementAtom,
  imageWidthAtom,
  useImageAtom,
  useImageAtomValue,
} from './imageAtoms';

export interface ImageResizableProps extends ResizableProps {
  /**
   * Image alignment.
   */
  align?: 'left' | 'center' | 'right';

  ignoreReadOnly?: boolean;
}

export const useImageResizable = ({
  ignoreReadOnly,
  align = 'center',
  ...props
}: ImageResizableProps): ResizableProps => {
  const element = useImageAtomValue(imageElementAtom)!;
  const editor = useEditorRef();
  const readOnly = useReadOnly();

  console.log(element);

  const { width: nodeWidth = '100%' } = element;

  const [width, setWidth] = useImageAtom(imageWidthAtom);

  const setNodeWidth = useCallback(
    (w: number) => {
      const path = findNodePath(editor, element);
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

  if (!ignoreReadOnly && readOnly) {
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

export const ImageResizable = createComponentAs<ResizableProps>((props) => {
  const resizableProps = useImageResizable(props);

  return <Resizable {...resizableProps} />;
});
