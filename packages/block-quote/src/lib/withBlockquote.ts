import type { ExtendEditorApi, TElement } from '@udecode/plate';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';

export const withBlockquote: ExtendEditorApi = ({
  api: { shouldMergeNodesRemovePrevNode },
}) => ({
  shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry) {
    const prevNode = prevNodeEntry[0] as TElement;

    if (prevNode.type === BaseBlockquotePlugin.key) return false;

    return shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry);
  },
});
