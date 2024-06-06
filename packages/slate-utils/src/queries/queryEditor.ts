import {
  type QueryEditorOptions,
  type TEditor,
  type Value,
  someNode,
} from '@udecode/slate';
import castArray from 'lodash/castArray.js';

import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';

/** Query the editor state. */
export const queryEditor = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>(
  editor: E,
  {
    allow,
    at = editor.selection || [],
    exclude,
    filter,
    selectionAtBlockEnd,
    selectionAtBlockStart,
  }: QueryEditorOptions<V, E> = {}
) => {
  if (
    (filter && !filter(editor)) ||
    (selectionAtBlockStart && !isSelectionAtBlockStart(editor)) ||
    (selectionAtBlockEnd && !isSelectionAtBlockEnd(editor))
  ) {
    return false;
  }

  const allows = castArray(allow);

  if (allows.length > 0 && !someNode(editor, { at, match: { type: allows } })) {
    return false;
  }

  const excludes = castArray(exclude);

  if (
    excludes.length > 0 &&
    someNode(editor, { at, match: { type: excludes } })
  ) {
    return false;
  }

  return true;
};
