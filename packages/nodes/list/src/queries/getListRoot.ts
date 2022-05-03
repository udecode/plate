import {
  getAboveNode,
  getPluginType,
  PlateEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
import { Ancestor, Path, Point, Range } from 'slate';
import { ELEMENT_OL, ELEMENT_UL } from '../createListPlugin';

/**
 * Searches upward for the root list element
 */
export const getListRoot = <V extends Value>(
  editor: PlateEditor<V>,
  at: Path | Range | Point | null = editor.selection
): TNodeEntry<Ancestor> | undefined => {
  if (!at) return;

  const parentList = getAboveNode(editor, {
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
