import { createPlugin } from '@udecode/plate-core';

export const KEY_DND = 'dnd';

export const createDndPlugin = createPlugin({
  key: KEY_DND,
  onDrop: (editor) => () => editor.isDragging,
});
