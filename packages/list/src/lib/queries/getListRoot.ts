import type { Path, Point, Range } from 'slate';

import {
  type SlateEditor,
  type TElement,
  type TElementEntry,
  getAboveNode,
} from '@udecode/plate-common';

import {
  BaseBulletedListPlugin,
  BaseNumberedListPlugin,
} from '../BaseListPlugin';

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
        editor.getType(BaseBulletedListPlugin),
        editor.getType(BaseNumberedListPlugin),
      ],
    },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath) ?? parentList;
  }
};
