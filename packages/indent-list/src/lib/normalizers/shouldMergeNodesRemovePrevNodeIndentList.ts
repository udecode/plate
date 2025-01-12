import { type OverrideEditor, type TElement, isDefined } from '@udecode/plate';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

export const shouldMergeNodesRemovePrevNodeIndentList: OverrideEditor = ({
  api: { shouldMergeNodesRemovePrevNode },
}) => ({
  api: {
    shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry) {
      const prevNode = prevEntry[0] as TElement;
      const curNode = curNodeEntry[0] as TElement;

      if (
        isDefined(curNode[BaseIndentListPlugin.key]) ||
        isDefined(prevNode[BaseIndentListPlugin.key])
      ) {
        return false;
      }

      return shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry);
    },
  },
});
