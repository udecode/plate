import {
  type SlateEditor,
  getEditorPlugin,
  isBlock,
} from '@udecode/plate-common';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

/** Select inserted blocks from the last operations. */
export const selectInsertedBlocks = (editor: SlateEditor) => {
  const { setOption } = getEditorPlugin(editor, BlockSelectionPlugin);

  const ids = new Set<string>();

  editor.operations.forEach((op) => {
    if (op.type === 'insert_node' && op.node.id && isBlock(editor, op.node)) {
      ids.add(op.node.id as string);
    }
  });

  setTimeout(() => {
    setOption('selectedIds', ids);
  }, 0);
};
