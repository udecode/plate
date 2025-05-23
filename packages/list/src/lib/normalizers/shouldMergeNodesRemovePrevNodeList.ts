import {
  type OverrideEditor,
  type TElement,
  isDefined,
  KEYS,
} from '@udecode/plate';

export const shouldMergeNodesRemovePrevNodeList: OverrideEditor = ({
  api: { shouldMergeNodesRemovePrevNode },
}) => ({
  api: {
    shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry) {
      const prevNode = prevEntry[0] as TElement;
      const curNode = curNodeEntry[0] as TElement;

      if (
        isDefined(curNode[KEYS.listType]) ||
        isDefined(prevNode[KEYS.listType])
      ) {
        return false;
      }

      return shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry);
    },
  },
});
