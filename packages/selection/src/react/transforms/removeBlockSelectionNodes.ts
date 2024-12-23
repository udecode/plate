import {
  type SlateEditor,
  isBlockWithId,
  removeNodes,
} from '@udecode/plate-common';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const removeBlockSelectionNodes = (editor: SlateEditor) => {
  const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');

  if (!selectedIds) return;

  removeNodes(editor, {
    at: [],
    match: (n) => isBlockWithId(editor, n) && selectedIds.has(n.id),
  });
};
