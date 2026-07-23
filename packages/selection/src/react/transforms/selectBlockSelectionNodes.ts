import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateContext,
  EditorUpdateTransaction,
} from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { getBlockSelectionNodes } from '../internal/getBlockSelectionNodes';

export const selectBlockSelectionNodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { afterCommit }: EditorUpdateContext
) => {
  const { api, getOption } = editor.plugin(BlockSelectionPlugin);
  const range = tx.ranges.fromEntries(
    getBlockSelectionNodes(tx, getOption('selectedIds'))
  );

  if (!range) return;

  tx.selection.set(range);
  afterCommit(() => api.clear());
};
