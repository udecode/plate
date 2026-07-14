import type { BaseEditor } from '@platejs/core';
import type { ElementEntry, Path, Point, Element, Range } from 'platejs';

import { getListTypes } from './getListTypes';

/** Searches upward for the root list element */
export const getListRoot = (
  editor: BaseEditor,
  at: Path | Point | Range | null = editor.read.selection()
): ElementEntry | undefined => {
  if (!at) return;

  const parentList = editor.read.nodes.above<Element>({
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
