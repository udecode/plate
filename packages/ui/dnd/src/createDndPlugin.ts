import { createPluginFactory, createStore } from '@udecode/plate-core';

export const KEY_DND = 'dnd';

export const dndStore = createStore(KEY_DND)({
  isDragging: false,
});

export const createDndPlugin = createPluginFactory({
  key: KEY_DND,
  handlers: {
    onDrop: (editor) => () => editor.isDragging as boolean,
  },
});
