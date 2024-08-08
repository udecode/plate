import type { PlateEditor } from '@udecode/plate-core';

import { blockSelectedIds } from './blockSelectedIds';

// Return undefined if not import the `BlockSelectionPlugin` plugin
export const hasBlockSelected = (editor: PlateEditor): boolean | undefined => {
  const ids = blockSelectedIds(editor);

  return ids && ids.size > 0;
};
