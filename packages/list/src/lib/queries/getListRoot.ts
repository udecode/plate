import type { Path, Point, Range } from 'slate';

import {
  type SlateEditor,
  type TElement,
  type TElementEntry,
  getAboveNode,
} from '@udecode/plate-common';

import { BulletedListPlugin, NumberedListPlugin } from '../ListPlugin';

/** Searches upward for the root list element */
export const getListRoot = (
  editor: SlateEditor,
  at: Path | Point | Range | null = editor.selection
): TElementEntry | undefined => {
  if (!at) return;

  const parentList = getAboveNode<TElement>(editor, {
    at,
    match: {
      type: [
        editor.getType(BulletedListPlugin),
        editor.getType(NumberedListPlugin),
      ],
    },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath) ?? parentList;
  }
};
