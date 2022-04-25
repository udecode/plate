import { Editor } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { isText } from '../../types/slate/TText';
import { getParentNodeNode } from '../slate/editor/getParentNodeNode';
import { getBlockAbove } from './getBlockAbove';
import { getNextSiblingNodes } from './getNextSiblingNodes';

/**
 * Is there empty text after the selection.
 * If there is no leaf after the selected leaf, return {@link Editor.isEnd}.
 * Else, check if the next leaves are empty.
 */
export const isBlockTextEmptyAfterSelection = (editor: TEditor) => {
  if (!editor.selection) return false;

  const blockAbove = getBlockAbove(editor);
  if (!blockAbove) return false;

  const cursor = editor.selection.focus;

  const selectionParentEntry = getParentNodeNode(editor, editor.selection);
  if (!selectionParentEntry) return false;
  const [, selectionParentPath] = selectionParentEntry;

  if (!Editor.isEnd(editor, cursor, selectionParentPath)) return false;

  const siblingNodes = getNextSiblingNodes(blockAbove, cursor.path);

  if (siblingNodes.length) {
    for (const siblingNode of siblingNodes) {
      if (isText(siblingNode) && siblingNode.text) {
        return false;
      }
    }
  } else {
    return Editor.isEnd(editor, cursor, blockAbove[1]);
  }

  return true;
};
