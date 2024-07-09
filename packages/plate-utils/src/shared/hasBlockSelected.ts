import type { PlateEditor } from '@udecode/plate-core';
import type { Value } from '@udecode/slate';

import { blockSelectedIds } from './blockSelectedIds';

// Return undefined if not import the `BlockSelectionPlugin` plugin
export const hasBlockSelected = <V extends Value>(
  editor: PlateEditor<V>
): boolean | undefined => {
  const ids = blockSelectedIds(editor);

  return ids && ids.size > 0;
};
