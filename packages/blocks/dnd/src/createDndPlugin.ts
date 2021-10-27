import { PlatePlugin } from '@udecode/plate-core';

export const createDndPlugin = (): PlatePlugin => ({
  onDrop: (editor) => () => editor.isDragging,
});
