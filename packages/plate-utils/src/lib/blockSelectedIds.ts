// Return undefined if not import the `BlockSelectionPlugin` plugin
import type { SlateEditor } from '@udecode/plate-common';

export const blockSelectedIds = (
  editor: SlateEditor
): Set<string> | undefined => {
  const { blockSelectionStore } = editor as any;

  if (blockSelectionStore) {
    return blockSelectionStore.get.selectedIds();
  }
};
