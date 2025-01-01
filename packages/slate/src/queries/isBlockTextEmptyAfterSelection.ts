import { type TEditor, isText } from '../interfaces';
import { getBlockAbove } from './getBlockAbove';
import { getNextSiblingNodes } from './getNextSiblingNodes';

/**
 * Is there empty text after the selection. If there is no leaf after the
 * selected leaf, return {@link isEndPoint}. Else, check if the next leaves are
 * empty.
 */
export const isBlockTextEmptyAfterSelection = (editor: TEditor) => {
  if (!editor.selection) return false;

  const blockAbove = getBlockAbove(editor);

  if (!blockAbove) return false;

  const cursor = editor.selection.focus;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return false;

  const [, selectionParentPath] = selectionParentEntry;

  if (!editor.api.isEnd(cursor, selectionParentPath)) return false;

  const siblingNodes = getNextSiblingNodes(blockAbove, cursor.path);

  if (siblingNodes.length > 0) {
    for (const siblingNode of siblingNodes) {
      if (isText(siblingNode) && siblingNode.text) {
        return false;
      }
    }
  } else {
    return editor.api.isEnd(cursor, blockAbove[1]);
  }

  return true;
};
