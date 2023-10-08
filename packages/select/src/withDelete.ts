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
  editor.deleteForward = (unit: 'character' | 'word' | 'line' | 'block') => {
    if (!editor.selection) return;
    if (!isSelectionExpanded(editor) && isBlockAboveEmpty(editor)) {
      // check when line is empty
      const isValidNode = queryNode(getAboveNode(editor), query);
      if (query) {
        //is query is passed
        if (isValidNode) {
          // cursor is in query blocks
          removeNodes(editor as any);
        } else {
          //fallback to default behaiour
          deleteForward(unit);
        }
      } else {
        // query is not passed, then plugin is active everywhere
        removeNodes(editor as any);
      }
    } else {
      // when line is not empty, fall back to default behavior
      deleteForward(unit);
    }
  };
  return editor;
};
