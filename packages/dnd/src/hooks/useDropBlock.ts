import type { TReactEditor } from '@udecode/plate-common/react';

import { DRAG_ITEM_BLOCK } from './useDragBlock';
import { type UseDropNodeOptions, useDropNode } from './useDropNode';

/** {@link useDropNode} */
export const useDropBlock = (
  editor: TReactEditor,
  options: Omit<UseDropNodeOptions, 'accept'>
) => useDropNode(editor, { accept: DRAG_ITEM_BLOCK, ...options });
