import { Editor } from 'slate';
import { getBlockAbove } from './getBlockAbove';
import { getNextSiblingNodes } from './getNextSiblingNodes';

/**
 * Is there empty text after the selection.
 * If there is no leaf after the selected leaf, return {@link Editor.isEnd}.
 * Else, check if the next leaves are empty.
 */
export const isBlockTextEmptyAfterSelection = (editor: Editor) => {
  if (!editor.selection) return false;

  const blockAbove = getBlockAbove(editor);

  const cursor = editor.selection.focus;

  if (!Editor.isEnd(editor, cursor, Editor.parent(editor, editor.selection)[1]))
    return false;

  const siblingNodes = getNextSiblingNodes(blockAbove, cursor.path);

  if (siblingNodes.length) {
    for (const siblingNode of siblingNodes) {
      if (siblingNode.text) {
        return false;
      }
    }
  } else {
    return Editor.isEnd(editor, cursor, blockAbove[1]);
  }

  return true;
};
