import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { getBlockSelectionNodes } from '../internal/getBlockSelectionNodes';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const removeBlockSelectionNodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const selectedIds = editor
    .plugin(BlockSelectionPlugin)
    .getOption('selectedIds');

  for (const [node, path] of getBlockSelectionNodes(
    tx,
    selectedIds
  ).toReversed()) {
    if (tx.schema.isBlock(node)) tx.nodes.remove({ at: path });
  }
};
