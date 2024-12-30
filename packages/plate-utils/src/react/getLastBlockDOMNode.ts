import type { PlateEditor } from '@udecode/plate-core/react';

import { getBlocks, toDOMNode } from '@udecode/slate';

export const getLastBlockDOMNode = (editor: PlateEditor) => {
  return editor.toDOMNode(getBlocks(editor).at(-1)![0]);
};
