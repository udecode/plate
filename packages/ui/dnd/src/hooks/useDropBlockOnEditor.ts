import { TReactEditor, Value } from '@udecode/plate-core';
import { DRAG_ITEM_BLOCK } from './useDragBlock';
import { useDropNode, UseDropNodeOptions } from './useDropNode';

/**
 * @deprecated use {@link useDropNode}
 */
export const useDropBlockOnEditor = <V extends Value>(
  editor: TReactEditor<V>,
  options: Omit<UseDropNodeOptions, 'accept'>
) => useDropNode(editor, { accept: DRAG_ITEM_BLOCK, ...options });
