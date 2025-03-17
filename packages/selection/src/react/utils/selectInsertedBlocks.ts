import { type SlateEditor, getEditorPlugin } from '@udecode/plate';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

/** Select inserted blocks from the last operations. */
export const selectInsertedBlocks = (editor: SlateEditor) => {
  const { setOption } = getEditorPlugin(editor, BlockSelectionPlugin);

  const ids = new Set<string>();

  editor.operations.forEach((op) => {
    if (
      op.type === 'insert_node' &&
      op.node.id &&
      editor.api.isBlock(op.node)
    ) {
      ids.add(op.node.id as string);
    }
  });

  setOption('selectedIds', ids);
};
