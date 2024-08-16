import type { Path, Point, Range } from 'slate';

import {
  type PlateEditor,
  type TElement,
  type TElementEntry,
  getAboveNode,
} from '@udecode/plate-common';

import { ListOrderedPlugin, ListUnorderedPlugin } from '../ListPlugin';

/** Searches upward for the root list element */
export const getListRoot = (
  editor: PlateEditor,
  at: Path | Point | Range | null = editor.selection
): TElementEntry | undefined => {
  if (!at) return;

  const parentList = getAboveNode<TElement>(editor, {
    at,
    match: {
      type: [
        editor.getType(ListUnorderedPlugin),
        editor.getType(ListOrderedPlugin),
      ],
    },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath) ?? parentList;
  }
};
