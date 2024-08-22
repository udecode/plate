import type { SlateEditor } from '@udecode/plate-core';

import { blockSelectedIds } from './blockSelectedIds';

// Return undefined if not import the `BlockSelectionPlugin` plugin
export const isBlockSelected = (editor: SlateEditor, id: string) => {
  const ids = blockSelectedIds(editor);

  return ids?.has(id);
};
