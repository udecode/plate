import {
  type PlateEditor,
  type TElement,
  type TNodeEntry,
  replaceNode,
} from '@udecode/plate-common';

import { ColumnItemPlugin, ColumnPlugin } from '../ColumnPlugin';

export const toggleColumns = (editor: PlateEditor, nodeEntry: TNodeEntry) => {
  const nodes = {
    children: [
      {
        children: [nodeEntry[0]],
        type: ColumnItemPlugin.key,
        width: '33.33%',
      },
      {
        children: [{ text: '' }],
        type: ColumnItemPlugin.key,
        width: '33.33%',
      },
      {
        children: [{ text: '' }],
        type: ColumnItemPlugin.key,
        width: '33.33%',
      },
    ],
    type: ColumnPlugin.key,
  } as TElement;

  replaceNode(editor, {
    at: nodeEntry[1],
    nodes,
  });
};
