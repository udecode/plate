import type { TEditor } from '@udecode/plate-common/server';

import { useDragNode } from './useDragNode';

export const DRAG_ITEM_BLOCK = 'block';

/** {@link useDragNode} */
export const useDragBlock = (editor: TEditor, id: string) =>
  useDragNode(editor, {
    id,
    type: DRAG_ITEM_BLOCK,
  });
