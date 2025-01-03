import type { PlateEditor } from '@udecode/plate-common/react';
import type { Range } from 'slate';

import { getNodesRange } from '@udecode/plate-common';

import { getBlocksWithId } from '../queries/getBlocksWithId';
import { selectBlockById } from './selectBlockById';

/**
 * Select blocks by selection or by id. If the block with id is not selected,
 * select the block with id. Else, select the blocks above the selection.
 */
export const selectBlocksBySelectionOrId = (
  editor: PlateEditor,
  id: string
) => {
  if (!editor.selection) return;

  const blockEntries = getBlocksWithId(editor, { at: editor.selection });
  const isBlockSelected = blockEntries.some(
    (blockEntry) => blockEntry[0].id === id
  );

  if (isBlockSelected) {
    editor.tf.select(getNodesRange(editor, blockEntries) as Range);
    editor.tf.focus();
  } else {
    selectBlockById(editor, id);
  }
};
