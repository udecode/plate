import type { SlateEditor } from '@udecode/plate-common';

import { blockSelectedIds } from './blockSelectedIds';

// Return undefined if not import the `BlockSelectionPlugin` plugin
export const hasBlockSelected = (editor: SlateEditor): boolean | undefined => {
  const ids = blockSelectedIds(editor);

  return ids && ids.size > 0;
};
