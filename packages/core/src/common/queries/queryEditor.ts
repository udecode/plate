import castArray from 'lodash/castArray';
import { TEditor, Value } from '../../slate/editor/TEditor';
import { QueryEditorOptions } from '../types/QueryEditorOptions';
import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';
import { someNode } from './someNode';

/**
 * Query the editor state.
 */
export const queryEditor = <V extends Value, E extends TEditor<V> = TEditor<V>>(
  editor: E,
  {
    filter,
    selectionAtBlockStart,
    selectionAtBlockEnd,
    allow,
    exclude,
    at = editor.selection || [],
  }: QueryEditorOptions<V> = {}
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
