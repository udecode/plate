import {
  type SlateEditor,
  type TElement,
  type TNodeEntry,
  replaceNode,
} from '@udecode/plate-common';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

export const toggleColumns = (editor: SlateEditor, nodeEntry: TNodeEntry) => {
  const nodes = {
    children: [
      {
        children: [nodeEntry[0]],
        type: BaseColumnItemPlugin.key,
        width: '33.33%',
      },
      {
        children: [{ text: '' }],
        type: BaseColumnItemPlugin.key,
        width: '33.33%',
      },
      {
        children: [{ text: '' }],
        type: BaseColumnItemPlugin.key,
        width: '33.33%',
      },
    ],
    type: BaseColumnPlugin.key,
  } as TElement;

  replaceNode(editor, {
    at: nodeEntry[1],
    nodes,
  });
};
