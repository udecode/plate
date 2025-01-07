import castArray from 'lodash/castArray.js';

import type { Editor, TLocation } from '../interfaces';
import type { QueryNodeOptions } from './queryNode';

/** Query the editor state. */
export interface QueryEditorOptions<E extends Editor = Editor>
  extends Pick<QueryNodeOptions, 'allow' | 'exclude'> {
  /** Location from where to lookup the node types (bottom-up) */
  at?: TLocation;

  /** Query the editor. */
  filter?: (editor: E) => boolean;

  /** When the selection is at the end of the block above. */
  selectionAtBlockEnd?: boolean;

  /** When the selection is at the start of the block above. */
  selectionAtBlockStart?: boolean;
}

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
