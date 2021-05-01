import { useDrag } from 'react-dnd';
import { TEditor } from '@udecode/slate-plugins-core';

export const useDragBlock = (editor: TEditor, id: string) => {
  return useDrag(
    () => ({
      type: 'block',
      item() {
        document.body.classList.add('dragging');
        return { id };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        document.body.classList.remove('dragging');
      },
    }),
    []
  );
};
