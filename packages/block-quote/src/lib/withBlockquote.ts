import type { OverrideEditor, TElement } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const withBlockquote: OverrideEditor = ({
  api: { shouldMergeNodesRemovePrevNode },
}) => ({
  api: {
    shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry) {
      const prevNode = prevNodeEntry[0] as TElement;

      if (prevNode.type === KEYS.blockquote) return false;

      return shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry);
    },
  },
});
