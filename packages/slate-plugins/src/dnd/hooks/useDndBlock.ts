import { useState } from 'react';
import { ReactEditor, useEditor } from 'slate-react';
import { ToggleTypeEditor } from '../../common/plugins/toggle-type/withToggleType';
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
