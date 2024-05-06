import { createZustandStore } from '@udecode/plate-common/server';

export const dndStore = createZustandStore('dnd')({
  isDragging: false,
});
