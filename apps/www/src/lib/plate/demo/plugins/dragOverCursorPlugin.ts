import { findEventRange } from '@udecode/plate-common';

import { cursorStore } from '@/components/plate-ui/cursor-overlay';
import { MyPlatePlugin } from '@/plate/plate.types';

export const KEY_DRAG_OVER_CURSOR = 'dragOverCursor';

export const dragOverCursorPlugin: MyPlatePlugin = {
  key: KEY_DRAG_OVER_CURSOR,
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
