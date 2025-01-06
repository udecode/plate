import castArray from 'lodash/castArray.js';

import type { Editor } from '../interfaces';
import type { QueryEditorOptions } from '../types';

/** Query the editor state. */
export const queryEditor = <E extends Editor>(
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
    (selectionAtBlockStart && !editor.api.isAt({ start: true })) ||
    (selectionAtBlockEnd && !editor.api.isAt({ end: true }))
  ) {
    return false;
  }

  const allows = castArray(allow);

  if (allows.length > 0 && !editor.api.some({ at, match: { type: allows } })) {
    return false;
  }

  const excludes = castArray(exclude);

  if (
    excludes.length > 0 &&
    editor.api.some({ at, match: { type: excludes } })
  ) {
    return false;
  }

  return true;
};
