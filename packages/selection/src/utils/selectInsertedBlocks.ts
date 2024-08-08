import { type TEditor, isBlock } from '@udecode/plate-common/server';

import { blockSelectionActions } from '../blockSelectionStore';

/** Select inserted blocks from the last operations. */
export const selectInsertedBlocks = (editor: TEditor) => {
  const ids = new Set();

  editor.operations.forEach((op) => {
    if (op.type === 'insert_node' && op.node.id && isBlock(editor, op.node)) {
      ids.add(op.node.id);
    }
  });

  setTimeout(() => {
    blockSelectionActions.isSelecting(true);
    blockSelectionActions.selectedIds(ids);
  }, 0);
};
