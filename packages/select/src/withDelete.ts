import {
  getAboveNode,
  isBlockAboveEmpty,
  isSelectionExpanded,
  PlateEditor,
  queryNode,
  removeNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';

import { DeletePlugin } from './createDeletePlugin';

/**
 * Set a list of element types to select on backspace
 */
export const withDelete = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options: { query } }: WithPlatePlugin<DeletePlugin, V, E>
) => {
  const { deleteForward } = editor;
  editor.deleteForward = (unit) => {
    if (!editor.selection) return;
    const isValidNode = !query || queryNode(getAboveNode(editor), query);
    if (
      !isSelectionExpanded(editor) &&
      isBlockAboveEmpty(editor) &&
      isValidNode
    ) {
      // Cursor is in query blocks and line is empty
      removeNodes(editor as any);
    } else {
      // When the line is not empty or other conditions are not met, fall back to default behavior
      deleteForward(unit);
    }
  };
  return editor;
};
