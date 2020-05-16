import { Editor } from 'slate';
import { isMarkActive } from '../queries';

/**
 * Toggle a custom property to the leaf text nodes in the current selection.
 */
export const toggleMark = (editor: Editor, key: string) => {
  const isActive = isMarkActive(editor, key);

  if (isActive) {
    Editor.removeMark(editor, key);
  } else {
    Editor.addMark(editor, key, true);
  }
};
