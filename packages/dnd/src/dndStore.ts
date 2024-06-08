import { createZustandStore } from '@udecode/plate-common/server';

export const dndStore = createZustandStore('dnd')({
  DraggingId: null as null | string,
  isDragging: false,
});
