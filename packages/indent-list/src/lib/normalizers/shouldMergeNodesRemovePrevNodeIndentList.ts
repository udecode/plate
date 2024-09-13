import type { NodeEntry } from 'slate';

import {
  type SlateEditor,
  type TElement,
  isDefined,
} from '@udecode/plate-common';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

export const shouldMergeNodesRemovePrevNodeIndentList = (
  editor: SlateEditor
) => {
  const { shouldMergeNodesRemovePrevNode } = editor;

  return function (prevEntry: NodeEntry, curNodeEntry: NodeEntry): boolean {
    const prevNode = prevEntry[0] as TElement;
    const curNode = curNodeEntry[0] as TElement;

    if (
      isDefined(curNode[BaseIndentListPlugin.key]) ||
      isDefined(prevNode[BaseIndentListPlugin.key])
    ) {
      return false;
    }

    return shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry);
  };
};
