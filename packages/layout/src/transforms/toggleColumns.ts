import {
  type PlateEditor,
  type TElement,
  type TNodeEntry,
  replaceNode,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN, ELEMENT_COLUMN_GROUP } from '../ColumnPlugin';

export const toggleColumns = (editor: PlateEditor, nodeEntry: TNodeEntry) => {
  const nodes = {
    children: [
      {
        children: [nodeEntry[0]],
        type: ELEMENT_COLUMN,
        width: '33.33%',
      },
      {
        children: [{ text: '' }],
        type: ELEMENT_COLUMN,
        width: '33.33%',
      },
      {
        children: [{ text: '' }],
        type: ELEMENT_COLUMN,
        width: '33.33%',
      },
    ],
    type: ELEMENT_COLUMN_GROUP,
  } as TElement;

  replaceNode(editor, {
    at: nodeEntry[1],
    nodes,
  });
};
