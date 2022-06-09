import { TEditor, Value } from '@udecode/plate-core';
import { useDragNode } from './useDragNode';

export const DRAG_ITEM_BLOCK = 'block';

/**
 * {@link useDragNode}
 */
export const useDragBlock = <V extends Value>(editor: TEditor<V>, id: string) =>
  useDragNode<V>(editor, {
    id,
    type: DRAG_ITEM_BLOCK,
  });
