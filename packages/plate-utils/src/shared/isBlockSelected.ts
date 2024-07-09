import type { PlateEditor } from '@udecode/plate-core';
import type { Value } from '@udecode/slate';

import { blockSelectedIds } from './blockSelectedIds';

// Return undefined if not import the `BlockSelectionPlugin` plugin
export const isBlockSelected = <V extends Value>(
  editor: PlateEditor<V>,
  id: string
) => {
  const ids = blockSelectedIds(editor);

  return ids?.has(id);
};
