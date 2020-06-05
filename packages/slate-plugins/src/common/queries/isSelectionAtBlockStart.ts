import { Editor } from 'slate';
import { getBlockAboveSelection } from './getBlockAboveSelection';
import { isStart } from './isStart';

/**
 * Is the selection focus at the start of its parent block.
 */
export const isSelectionAtBlockStart = (editor: Editor) => {
  const [, path] = getBlockAboveSelection(editor);

  return isStart(editor, editor.selection?.focus, path);
};
