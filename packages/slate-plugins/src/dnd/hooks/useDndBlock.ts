import { useState } from 'react';
import { ToggleTypeEditor } from '@udecode/slate-plugins';
import { ReactEditor, useEditor } from 'slate-react';
import { useDragBlock } from './useDragBlock';
import { useDropBlockOnEditor } from './useDropBlockOnEditor';

export const useDndBlock = ({
  id,
  blockRef,
}: {
  id: string;
  blockRef: any;
}) => {
  const editor = useEditor() as ReactEditor & ToggleTypeEditor;

  const [dropLine, setDropLine] = useState<'' | 'top' | 'bottom'>('');

  const [{ isDragging }, dragRef, preview] = useDragBlock(editor, id);
  const [{ isOver }, drop] = useDropBlockOnEditor(editor, {
    id,
    blockRef,
    dropLine,
    setDropLine,
  });

  preview(drop(blockRef));

  if (!isOver && dropLine) {
    setDropLine('');
  }

  return {
    isDragging,
    dropLine,
    dragRef,
  };
};
