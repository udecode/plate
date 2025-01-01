import type { PlateEditor } from '@udecode/plate-core/react';

import { getBlocks } from '@udecode/slate';

export const getLastBlockDOMNode = (editor: PlateEditor) => {
  return editor.api.toDOMNode(getBlocks(editor).at(-1)![0]);
};
