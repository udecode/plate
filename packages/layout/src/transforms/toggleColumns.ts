import {
  type EElement,
  type ENode,
  type PlateEditor,
  type TNodeEntry,
  type Value,
  replaceNode,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN, ELEMENT_COLUMN_GROUP } from '../ColumnPlugin';

export const toggleColumns = <V extends Value>(
  editor: PlateEditor<V>,
  nodeEntry: TNodeEntry<ENode<V>>
) => {
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
  };

  replaceNode(editor, {
    at: nodeEntry[1],
    nodes: nodes as EElement<V>,
  });
};
