import { useDrag } from 'react-dnd';
import { TEditor } from '@udecode/slate-plugins-core';

export const useDragBlock = (editor: TEditor, id: string) => {
  return useDrag(
    () => ({
      item: { type: 'block', id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      begin: () => {
        document.body.classList.add('dragging');
      },
      end: () => {
        document.body.classList.remove('dragging');
      },
    }),
    []
  );
};
