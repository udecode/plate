import type { PlateEditor } from '@udecode/plate-common/react';

import { DRAG_ITEM_BLOCK } from './useDragBlock';
import { type UseDropNodeOptions, useDropNode } from './useDropNode';

/** {@link useDropNode} */
export const useDropBlock = (
  editor: PlateEditor,
  options: Omit<UseDropNodeOptions, 'accept'>
) => useDropNode(editor, { accept: DRAG_ITEM_BLOCK, ...options });
