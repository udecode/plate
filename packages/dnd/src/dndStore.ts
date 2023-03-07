import { createStore } from '@udecode/plate-common';

export const dndStore = createStore('dnd')({
  isDragging: false,
});
