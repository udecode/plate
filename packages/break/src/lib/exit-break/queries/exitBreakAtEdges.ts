import type { TEditor } from '@udecode/plate-common';

/**
 * Check if the selection is at the edge of its parent block. If it is and if
 * the selection is expanded, delete its content.
 */
export const exitBreakAtEdges = (
  editor: TEditor,
  {
    end,
    start,
  }: {
    end?: boolean;
    start?: boolean;
  }
) => {
  let queryEdge = false;
  let isEdge = false;
  let isStart = false;

  if (start || end) {
    queryEdge = true;

    if (start && editor.api.isAt({ start: true })) {
      isEdge = true;
      isStart = true;
    }
    if (end && editor.api.isAt({ end: true })) {
      isEdge = true;
    }
    if (isEdge && editor.api.isExpanded()) {
      editor.deleteFragment();
    }
  }

  return {
    isEdge,
    isStart,
    queryEdge,
  };
};
