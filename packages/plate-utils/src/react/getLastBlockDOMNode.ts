import type { PlateEditor } from '@udecode/plate-core/react';

import { toDOMNode } from '@udecode/slate-react';
import { getBlocks } from '@udecode/slate-utils';

export const getLastBlockDOMNode = (editor: PlateEditor) => {
  return toDOMNode(editor, getBlocks(editor).at(-1)![0]);
};
