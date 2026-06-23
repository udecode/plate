import type { SlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const removeBlockSelectionNodes = (editor: SlateEditor) => {
  const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');

  if (!selectedIds) return;

  editor.update((tx) => {
    tx.nodes.remove({
      at: [],
      match: (node) => {
        const id = (node as { id?: unknown }).id;

        return typeof id === 'string' && selectedIds.has(id);
      },
    });
  });
};
