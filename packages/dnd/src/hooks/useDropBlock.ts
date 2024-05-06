import type { TReactEditor } from '@udecode/plate-common';
import type { Value } from '@udecode/plate-common/server';

import { DRAG_ITEM_BLOCK } from './useDragBlock';
import { type UseDropNodeOptions, useDropNode } from './useDropNode';

/** {@link useDropNode} */
export const useDropBlock = <V extends Value>(
  editor: TReactEditor<V>,
  options: Omit<UseDropNodeOptions, 'accept'>
) => useDropNode(editor, { accept: DRAG_ITEM_BLOCK, ...options });
