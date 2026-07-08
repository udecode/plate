import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const selectBlockSelectionNodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const { api } = editor.plugin(BlockSelectionPlugin);
  const range = editor.read.ranges.fromEntries(api.blockSelection.getNodes());

  if (range) {
    tx.selection.set(range);
  }

  api.blockSelection.clear();
};
