import { getAbove } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { Ancestor, NodeEntry, Path, Point, Range } from 'slate';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';

/**
 * Searches upward for the root list element
 */
export const getListRoot = (
  editor: SPEditor,
  at: Path | Range | Point | null = editor.selection
): NodeEntry<Ancestor> | undefined => {
  if (!at) return;

  const parentList = getAbove(editor, {
    at,
    match: {
      type: [
        getPlatePluginType(editor, ELEMENT_UL),
        getPlatePluginType(editor, ELEMENT_OL),
      ],
    },
  });

  if (parentList) {
    const [, parentListPath] = parentList;

    return getListRoot(editor, parentListPath) ?? parentList;
  }
};
