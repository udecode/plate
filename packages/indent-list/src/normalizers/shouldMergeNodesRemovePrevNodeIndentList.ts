import type { NodeEntry } from 'slate';

import {
  type PlateEditor,
  type TElement,
  isDefined,
} from '@udecode/plate-common';

import { IndentListPlugin } from '../IndentListPlugin';

export const shouldMergeNodesRemovePrevNodeIndentList = (
  editor: PlateEditor
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
