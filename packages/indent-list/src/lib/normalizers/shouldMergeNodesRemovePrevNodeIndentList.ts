import type { NodeEntry } from 'slate';

import {
  type SlateEditor,
  type TElement,
  isDefined,
} from '@udecode/plate-common';

import { IndentListPlugin } from '../IndentListPlugin';

export const shouldMergeNodesRemovePrevNodeIndentList = (
  editor: SlateEditor
) => {
  const { shouldMergeNodesRemovePrevNode } = editor;

  return function (prevEntry: NodeEntry, curNodeEntry: NodeEntry): boolean {
    const prevNode = prevEntry[0] as TElement;
    const curNode = curNodeEntry[0] as TElement;

    if (
      isDefined(curNode[IndentListPlugin.key]) ||
      isDefined(prevNode[IndentListPlugin.key])
    ) {
      return false;
    }

    return shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry);
  };
};
