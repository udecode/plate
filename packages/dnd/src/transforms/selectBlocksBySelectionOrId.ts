import type { Range } from 'slate';

import { focusEditor, getNodesRange } from '@udecode/plate-common';
import {
  type PlateEditor,
  type Value,
  select,
} from '@udecode/plate-common/server';

import { getBlocksWithId } from '../queries/getBlocksWithId';
import { selectBlockById } from './selectBlockById';

/**
 * Select blocks by selection or by id. If the block with id is not selected,
 * select the block with id. Else, select the blocks above the selection.
 */
export const selectBlocksBySelectionOrId = <V extends Value>(
  editor: PlateEditor<V>,
  id: string
) => {
  if (!editor.selection) return;

  const blockEntries = getBlocksWithId(editor, { at: editor.selection });
  const isBlockSelected = blockEntries.some(
    (blockEntry) => blockEntry[0].id === id
  );

  if (isBlockSelected) {
    select(editor, getNodesRange(editor, blockEntries) as Range);
    focusEditor(editor);
  } else {
    selectBlockById(editor, id);
  }
};
