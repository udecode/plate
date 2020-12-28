import { Editor } from 'slate';
import { getBlockAbove } from './getBlockAbove';
import { isEnd } from './isEnd';

/**
 * Is the selection focus at the end of its parent block.
 */
export const isSelectionAtBlockEnd = (editor: Editor) => {
  const [, path] = getBlockAbove(editor);

  return isEnd(editor, editor.selection?.focus, path);
};
