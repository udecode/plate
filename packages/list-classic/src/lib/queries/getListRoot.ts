import type { Element, Range } from '@platejs/plite';
import type { ElementEntry, Path, Point } from '@platejs/plite';
import { ElementApi } from '@platejs/plite';
import type { BasePlateEditor } from '@platejs/core';

import { getListTypes } from './getListTypes';

/** Searches upward for the root list element */
export const getListRoot = (
  editor: BasePlateEditor,
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
