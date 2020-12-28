import { Editor } from 'slate';
import { getBlockAbove } from './getBlockAbove';
import { isStart } from './isStart';

/**
 * Is the selection focus at the start of its parent block.
 */
export const isSelectionAtBlockStart = (editor: Editor) => {
  const [, path] = getBlockAbove(editor);

  return isStart(editor, editor.selection?.focus, path);
};
