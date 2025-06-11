import type { SlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const removeBlockSelectionNodes = (editor: SlateEditor) => {
  const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');

  if (!selectedIds) return;

  editor.tf.removeNodes({
    at: [],
    block: true,
    match: (n: any) => !!n.id && selectedIds.has((n as any).id),
  });
};
