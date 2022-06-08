import { useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useEditorRef } from '@udecode/plate-core';
import { DropLineDirection } from '../types';
import { useDragNode, UseDragNodeOptions } from './useDragNode';
import { useDropNode, UseDropNodeOptions } from './useDropNode';

export interface UseDndNodeOptions {
  id: string;
  blockRef: any;
  removePreview?: boolean;
}

export const useDndNode = ({
  id,
  type,
  blockRef,
  previewRef,
  removePreview,
}: {
  /**
   *
   */
  id: string;

  /**
   * The type of item being dragged.
   */
  type: UseDragNodeOptions['type'];

  /**
   * The reference to the block being dragged.
   */
  blockRef: UseDropNodeOptions['blockRef'];

  previewRef?: any;
  
  /**
   * Whether to remove the preview.
   */
  removePreview?: boolean;

  drag?: UseDragNodeOptions;
  drop?: UseDropNodeOptions;
}) => {
  const editor = useEditorRef();

  const [dropLine, setDropLine] = useState<DropLineDirection>('');

  const [{ isDragging }, dragRef, preview] = useDragNode(editor, {
    item: { id },
    type,
  });
  const [{ isOver }, drop] = useDropNode(editor, {
    accept: type,
    id,
    blockRef,
    dropLine,
    setDropLine,
  });

  if (removePreview) {
    drop(blockRef);
    preview(getEmptyImage(), { captureDraggingState: true });
  } else if (previewRef) {
    drop(blockRef);
    preview(previewRef);
  } else {
    preview(drop(blockRef));
  }

  if (!isOver && dropLine) {
    setDropLine('');
  }

  return {
    isDragging,
    dropLine,
    dragRef,
  };
};

export const useDndBlock = (options: UseDndNodeOptions) => useDndNode(options);
