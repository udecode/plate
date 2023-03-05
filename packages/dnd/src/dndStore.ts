import { createStore } from '@udecode/plate-core';

export const dndStore = createStore('dnd')({
  isDragging: false,
});
