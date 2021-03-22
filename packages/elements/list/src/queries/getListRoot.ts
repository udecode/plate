import { getAbove } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Ancestor, Editor, NodeEntry, Path, Point, Range } from 'slate';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';

/**
 * Searches upward for the root list element
 */
export const getListRoot = (
  editor: Editor,
  at: Path | Range | Point | null = editor.selection
): NodeEntry<Ancestor> | undefined => {
  if (!at) return;

  const parentList = getAbove(editor, {
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
