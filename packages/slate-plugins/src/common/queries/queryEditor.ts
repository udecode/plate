import { Editor } from 'slate';
import { QueryEditorOptions } from '../types/QueryEditorOptions';
import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';

/**
 * Query the editor state.
 */
export const queryEditor = (
  editor: Editor,
  { filter, start, end }: QueryEditorOptions = {}
) => {
  if (
    (filter && !filter(editor)) ||
    (start && !isSelectionAtBlockStart(editor)) ||
    (end && !isSelectionAtBlockEnd(editor))
  ) {
    return false;
  }

  return true;
};
