import type { PlateEditor } from '@udecode/plate-core';
import type { Value } from '@udecode/slate';

// Return undefined if not import the `BlockSelectionPlugin` plugin
export const blockSelectedIds = <V extends Value>(
  editor: PlateEditor<V>
): Set<string> | undefined => {
  const { blockSelectionStore } = editor as any;

  if (blockSelectionStore) {
    return blockSelectionStore.get.selectedIds();
  }
};
