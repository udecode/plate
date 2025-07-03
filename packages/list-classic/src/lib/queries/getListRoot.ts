import type {
  ElementEntry,
  Path,
  Point,
  SlateEditor,
  TElement,
  TRange,
} from 'platejs';

import { getListTypes } from './getListTypes';

/** Searches upward for the root list element */
export const getListRoot = (
  editor: SlateEditor,
  at: Path | Point | TRange | null = editor.selection
): ElementEntry | undefined => {
  if (!at) return;

  const parentList = editor.api.above<TElement>({
    at,
    match: {
      type: getListTypes(editor),
    },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath) ?? parentList;
  }
};
