import {
  type WithOverride,
  getAboveNode,
  isBlockAboveEmpty,
  isSelectionExpanded,
  queryNode,
  removeNodes,
} from '@udecode/plate-common';

import type { DeleteConfig } from './DeletePlugin';

/** Set a list of element types to select on backspace */
export const withDelete: WithOverride<DeleteConfig> = ({
  editor,
  getOptions,
}) => {
  const { deleteForward } = editor;
  editor.deleteForward = (unit) => {
    if (!editor.selection) return;

    const { query } = getOptions();

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
