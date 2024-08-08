import type { PlateEditor } from '@udecode/plate-core';

// Return undefined if not import the `BlockSelectionPlugin` plugin
export const blockSelectedIds = (
  editor: PlateEditor
): Set<string> | undefined => {
  const { blockSelectionStore } = editor as any;

  if (blockSelectionStore) {
    return blockSelectionStore.get.selectedIds();
  }
};
