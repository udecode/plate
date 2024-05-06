import type { Path, Point, Range } from 'slate';

import {
  type PlateEditor,
  type TElement,
  type TElementEntry,
  type Value,
  getAboveNode,
  getPluginType,
} from '@udecode/plate-common/server';

import { ELEMENT_OL, ELEMENT_UL } from '../createListPlugin';

/** Searches upward for the root list element */
export const getListRoot = <V extends Value>(
  editor: PlateEditor<V>,
  at: Path | Point | Range | null = editor.selection
): TElementEntry | undefined => {
  if (!at) return;

  const parentList = getAboveNode<TElement>(editor, {
    at,
    match: {
      type: [
        getPluginType(editor, ELEMENT_UL),
        getPluginType(editor, ELEMENT_OL),
      ],
    },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath) ?? parentList;
  }
};
