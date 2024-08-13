import {
  type TEditor,
  getParentNode,
  isEndPoint,
  isText,
} from '@udecode/slate';

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

  const selectionParentEntry = getParentNode(editor, editor.selection);

  if (!selectionParentEntry) return false;

  const [, selectionParentPath] = selectionParentEntry;

  if (!isEndPoint(editor, cursor, selectionParentPath)) return false;

  const siblingNodes = getNextSiblingNodes(blockAbove, cursor.path);

  if (siblingNodes.length > 0) {
    for (const siblingNode of siblingNodes) {
      if (isText(siblingNode) && siblingNode.text) {
        return false;
      }
    }
  } else {
    return isEndPoint(editor, cursor, blockAbove[1]);
  }

  return true;
};
