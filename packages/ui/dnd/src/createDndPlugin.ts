import { createPluginFactory } from '@udecode/plate-core';

export const KEY_DND = 'dnd';

export const createDndPlugin = createPluginFactory({
  key: KEY_DND,
  handlers: {
    onDrop: (editor) => () => editor.isDragging as boolean,
  },
});
