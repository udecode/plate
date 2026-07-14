import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const deleteTable = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const tableItem = editor.read.nodes.above({
    match: { type: editor.getType(KEYS.table) },
  });

  if (tableItem) {
    tx.nodes.remove({ at: tableItem[1] });
  }
};
