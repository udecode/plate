import castArray from 'lodash/castArray.js';

import type { TEditor } from '../interfaces';
import type { QueryEditorOptions } from '../types';

import { isSelectionAtBlockEnd } from './isSelectionAtBlockEnd';
import { isSelectionAtBlockStart } from './isSelectionAtBlockStart';
import { someNode } from './someNode';

/** Query the editor state. */
export const queryEditor = <E extends TEditor>(
  editor: E,
  {
    allow,
    at = editor.selection || [],
    exclude,
    filter,
    selectionAtBlockEnd,
    selectionAtBlockStart,
  }: QueryEditorOptions<E> = {}
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
