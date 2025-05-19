import { type OverrideEditor, type TElement, isDefined } from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';

export const shouldMergeNodesRemovePrevNodeList: OverrideEditor = ({
  api: { shouldMergeNodesRemovePrevNode },
}) => ({
  api: {
    shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry) {
      const prevNode = prevEntry[0] as TElement;
      const curNode = curNodeEntry[0] as TElement;

      if (
        isDefined(curNode[INDENT_LIST_KEYS.listStyleType]) ||
        isDefined(prevNode[INDENT_LIST_KEYS.listStyleType])
      ) {
        return false;
      }

      return shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry);
    },
  },
});
