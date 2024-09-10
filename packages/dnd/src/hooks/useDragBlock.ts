import type { PlateEditor } from '@udecode/plate-common/react';

import { useDragNode } from './useDragNode';

export const DRAG_ITEM_BLOCK = 'block';

/** {@link useDragNode} */
export const useDragBlock = (editor: PlateEditor, id: string) =>
  useDragNode(editor, {
    id,
    type: DRAG_ITEM_BLOCK,
  });
