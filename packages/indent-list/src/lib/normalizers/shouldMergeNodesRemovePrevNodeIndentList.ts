import { type ExtendEditorApi, type TElement, isDefined } from '@udecode/plate';

import { BaseIndentListPlugin } from '../BaseIndentListPlugin';

export const shouldMergeNodesRemovePrevNodeIndentList: ExtendEditorApi = ({
  api: { shouldMergeNodesRemovePrevNode },
}) => {
  return {
    shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry): boolean {
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
  };
};
