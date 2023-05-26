import { findEventRange } from '@udecode/plate';

import { cursorStore } from '@/plate/cursor-overlay/cursorStore';
import { MyPlatePlugin } from '@/plate/demo/plate.types';

export const dragOverCursorPlugin: MyPlatePlugin = {
  key: 'drag-over-cursor',
  handlers: {
    onDragOver: (editor) => (event) => {
      if (editor.isDragging) return;

      const range = findEventRange(editor, event);
      if (!range) return;

      cursorStore.set.cursors({
        drag: {
          key: 'drag',
          data: {
            style: {
              backgroundColor: 'hsl(222.2 47.4% 11.2%)',
              width: 3,
            },
          },
          selection: range,
        },
      });
    },
    onDragLeave: () => () => {
      cursorStore.set.cursors({});
    },
    onDragEnd: () => () => {
      cursorStore.set.cursors({});
    },
    onDrop: () => () => {
      cursorStore.set.cursors({});
    },
  },
};
