import type { PlateEditor } from '@platejs/core/react';

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
  const selection = editor.read.selection();

  if (!selection) return;

  const blockEntries = getBlocksWithId(editor, { at: selection });
  const isBlockSelected = blockEntries.some(
    (blockEntry) => blockEntry[0].id === id
  );

  if (isBlockSelected) {
    const range = editor.read.ranges.fromEntries(blockEntries);

    if (!range) return;

    editor.update.selection.set(range);
    editor.api.dom.focus();
  } else {
    selectBlockById(editor, id);
  }
};
