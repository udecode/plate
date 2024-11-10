import type { CursorData, CursorState } from '@udecode/plate-cursor';

import { createPlatePlugin, findEventRange } from '@udecode/plate-common/react';
import { DndPlugin } from '@udecode/plate-dnd';

export const DragOverCursorPlugin = createPlatePlugin({
  key: 'dragOverCursor',
  options: { cursors: {} as Record<string, CursorState<CursorData>> },
  handlers: {
    onDragEnd: ({ editor, plugin }) => {
      editor.setOption(plugin, 'cursors', {});
    },
    onDragLeave: ({ editor, plugin }) => {
      editor.setOption(plugin, 'cursors', {});
    },
    onDragOver: ({ editor, event, plugin }) => {
      if (editor.getOptions(DndPlugin).isDragging) return;
      // Only show cursor for text drag
      if (!event.dataTransfer?.types.includes('text/plain')) return;

      const range = findEventRange(editor, event);

      if (!range) return;

      editor.setOption(plugin, 'cursors', {
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
    onDrop: ({ editor, plugin }) => {
      editor.setOption(plugin, 'cursors', {});
    },
  },
});
