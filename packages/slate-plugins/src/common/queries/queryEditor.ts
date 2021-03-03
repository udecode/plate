import castArray from 'lodash/castArray';
import { Editor } from 'slate';
import { QueryEditorOptions } from '../types/QueryEditorOptions';
import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';
import { someNode } from './someNode';

/**
 * Query the editor state.
 */
export const queryEditor = (
  editor: Editor,
  {
    filter,
    selectionAtBlockStart,
    selectionAtBlockEnd,
    allow,
    exclude,
    at = editor.selection || [],
  }: QueryEditorOptions = {}
) => {
  if (
    (filter && !filter(editor)) ||
    (selectionAtBlockStart && !isSelectionAtBlockStart(editor)) ||
    (selectionAtBlockEnd && !isSelectionAtBlockEnd(editor))
  ) {
    return false;
  }

  const allows = castArray(allow);
  if (allows.length && !someNode(editor, { at, match: { type: allows } })) {
    return false;
  }

  const excludes = castArray(exclude);
  if (excludes.length && someNode(editor, { at, match: { type: excludes } })) {
    return false;
  }

  return true;
};
