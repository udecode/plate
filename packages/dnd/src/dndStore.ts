import { createZustandStore } from '@udecode/plate-common';

export const dndStore = createZustandStore('dnd')({
  isDragging: false,
});
