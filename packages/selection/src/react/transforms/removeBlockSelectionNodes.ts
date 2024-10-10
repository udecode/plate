import type { SlateEditor } from '@udecode/plate-common';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const removeBlockSelectionNodes = (editor: SlateEditor) => {
  const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');

  if (!selectedIds) return;

  editor.removeNodes({
    at: [],
    match: (n) => selectedIds.has((n as any).id),
  });
};
