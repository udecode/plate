import type { BaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

/** Select inserted blocks from the last operations. */
export const selectInsertedBlocks = (editor: BaseEditor) => {
  const { setOption } = editor.plugin(BlockSelectionPlugin);

  const ids = new Set<string>();

  editor.read.operations().forEach((op) => {
    if (
      op.type === 'insert_node' &&
      op.node.id &&
      editor.read.schema.isBlock(op.node)
    ) {
      ids.add(op.node.id as string);
    }
  });

  setOption('selectedIds', ids);
};
