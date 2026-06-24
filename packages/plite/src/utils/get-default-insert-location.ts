import type { Location } from '../interfaces';
import {
  getChildren as editorGetChildren,
  getSnapshot as editorGetSnapshot,
  point as editorPoint,
} from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';

/**
 * Get the default location to insert content into the editor.
 * By default, use the selection as the target location. But if there is
 * no selection, insert at the end of the document since that is such a
 * common use case when inserting from a non-selected state.
 */
export const getDefaultInsertLocation = (editor: Editor): Location => {
  const selection = editorGetSnapshot(editor).selection;

  if (selection) {
    return selection;
  }
  if (editorGetChildren(editor).length > 0) {
    return editorPoint(editor, [], { edge: 'end' });
  }
  return [0];
};
