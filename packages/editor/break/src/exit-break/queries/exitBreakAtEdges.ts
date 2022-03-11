import {
  isExpanded,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  TEditor,
} from '@udecode/plate-core';

/**
 * Check if the selection is at the edge of its parent block.
 * If it is and if the selection is expanded, delete its content.
 */
export const exitBreakAtEdges = (
  editor: TEditor,
  {
    start,
    end,
  }: {
    start?: boolean;
    end?: boolean;
  }
) => {
  let queryEdge = false;
  let isEdge = false;
  let isStart = false;
  if (start || end) {
    queryEdge = true;

    if (start && isSelectionAtBlockStart(editor)) {
      isEdge = true;
      isStart = true;
    }

    if (end && isSelectionAtBlockEnd(editor)) {
      isEdge = true;
    }

    if (isEdge && isExpanded(editor.selection)) {
      editor.deleteFragment();
    }
  }

  return {
    queryEdge,
    isEdge,
    isStart,
  };
};
