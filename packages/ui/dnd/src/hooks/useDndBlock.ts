import { useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useEditorRef } from '@udecode/plate-core';
import { useDragBlock } from './useDragBlock';
import { useDropBlockOnEditor } from './useDropBlockOnEditor';

export const useDndBlock = ({
  id,
  blockRef,
  previewRef,
  removePreview,
}: {
  id: string;
  blockRef: any;
  previewRef?: any;
  removePreview?: boolean;
}) => {
  const editor = useEditorRef();

  const [dropLine, setDropLine] = useState<'' | 'top' | 'bottom'>('');

  const [{ isDragging }, dragRef, preview] = useDragBlock(editor, id);
  const [{ isOver }, drop] = useDropBlockOnEditor(editor, {
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
