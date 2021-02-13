import { Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getBlocksWithId } from './getBlocksWithId';
import { getNodesRange } from './getNodesRange';
import { selectBlockById } from './selectBlockById';

/**
 * Select blocks by selection or by id.
 * If the block with id is not selected, select the block with id.
 * Else, select the blocks above the selection.
 */
export const selectBlocksBySelectionOrId = (
  editor: ReactEditor,
  id: string
) => {
  if (!editor.selection) return;

  const blockEntries = getBlocksWithId(editor, { at: editor.selection });
  const isBlockSelected = blockEntries.some(
    (blockEntry) => blockEntry[0].id === id
  );

  if (isBlockSelected) {
    Transforms.select(editor, getNodesRange(editor, blockEntries) as Range);
    ReactEditor.focus(editor);
  } else {
    selectBlockById(editor, id);
  }
};
