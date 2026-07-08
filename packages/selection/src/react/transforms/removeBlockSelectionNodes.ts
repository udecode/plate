import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { ElementApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const removeBlockSelectionNodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const { getOption } = editor.plugin(BlockSelectionPlugin);
  const selectedIds = getOption('selectedIds');

  if (!selectedIds) return;

  tx.nodes.remove({
    at: [],
    match: (node) =>
      ElementApi.isElement(node) &&
      editor.read.schema.isBlock(node) &&
      !!node.id &&
      selectedIds.has(node.id as string),
  });
};
