import { SlatePlugin } from '@udecode/slate-plugins-core';

export const createDndPlugin = (): SlatePlugin => ({
  onDrop: (editor) => () => editor.isDragging,
});
