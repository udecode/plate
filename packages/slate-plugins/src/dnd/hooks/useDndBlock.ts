import { useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ReactEditor, useEditor } from 'slate-react';
import { ToggleTypeEditor } from '../../common/plugins/toggle-type/withToggleType';
import { useDragBlock } from './useDragBlock';
import { useDropBlockOnEditor } from './useDropBlockOnEditor';

export const useDndBlock = ({
  id,
  blockRef,
  removePreview,
}: {
  id: string;
  blockRef: any;
  removePreview?: boolean;
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

  if (removePreview) {
    drop(blockRef);
    preview(getEmptyImage(), { captureDraggingState: true });
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
