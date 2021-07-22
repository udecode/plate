import { useDrag } from 'react-dnd';
import { TEditor } from '@udecode/plate-core';

export const useDragBlock = (editor: TEditor, id: string) => {
  return useDrag(
    () => ({
      type: 'block',
      item() {
        editor.isDragging = true;
        document.body.classList.add('dragging');
        return { id };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        editor.isDragging = false;
        document.body.classList.remove('dragging');
      },
    }),
    []
  );
};
