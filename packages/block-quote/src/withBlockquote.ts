import { PlateEditor, TElement, Value } from '@udecode/plate-common/server';

import { ELEMENT_BLOCKQUOTE } from './createBlockquotePlugin';

export const withBlockquote = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { shouldMergeNodesRemovePrevNode } = editor;

  if (!!shouldMergeNodesRemovePrevNode) {
    editor.shouldMergeNodesRemovePrevNode = (prevNodeEntry, curNodeEntry) => {
      const prevNode = prevNodeEntry[0] as TElement;

      if (prevNode.type === ELEMENT_BLOCKQUOTE) return false;

      return shouldMergeNodesRemovePrevNode(prevNodeEntry, curNodeEntry);
    };
  }

  return editor;
};
