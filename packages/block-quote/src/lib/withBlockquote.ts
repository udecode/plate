import type { OverrideEditor, TElement } from '@udecode/plate';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';

export const withBlockquote: OverrideEditor = ({
  api: { shouldMergeNodesRemovePrevNode },
}) => ({
  api: {
    shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry) {
      const prevNode = prevNodeEntry[0] as TElement;

      if (prevNode.type === BaseBlockquotePlugin.key) return false;

      return shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry);
    },
  },
});
