import { TReactEditor, Value } from '@udecode/plate-common';

import { DRAG_ITEM_BLOCK } from './useDragBlock';
import { useDropNode, UseDropNodeOptions } from './useDropNode';

/**
 * {@link useDropNode}
 */
export const useDropBlock = <V extends Value>(
  editor: TReactEditor<V>,
  options: Omit<UseDropNodeOptions, 'accept'>
) => useDropNode(editor, { accept: DRAG_ITEM_BLOCK, ...options });
