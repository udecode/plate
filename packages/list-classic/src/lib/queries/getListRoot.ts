import type { Element, Range } from '@platejs/slate';
import type { ElementEntry, Path, Point } from '@platejs/slate';
import { ElementApi } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';

import { getListTypes } from './getListTypes';

/** Searches upward for the root list element */
export const getListRoot = (
  editor: SlateEditor,
  at: Path | Point | Range | null = editor.selection
): ElementEntry | undefined => {
  if (!at) return;

  const parentList = editor.api.above<Element>({
    at,
    match: (node) =>
      ElementApi.isElement(node) && getListTypes(editor).includes(node.type),
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath) ?? parentList;
  }
};
