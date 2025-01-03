import type {
  SlateEditor,
  TElement,
  TElementEntry,
} from '@udecode/plate-common';
import type { Path, Point, Range } from 'slate';

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

  const parentList = editor.api.above<TElement>({
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
