import { createStore } from '@udecode/plate-core';
import { KEY_DND } from './createDndPlugin';

export const dndStore = createStore(KEY_DND)({
  isDragging: false,
});
