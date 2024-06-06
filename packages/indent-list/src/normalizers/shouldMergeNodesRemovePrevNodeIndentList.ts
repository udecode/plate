import type { NodeEntry } from 'slate';

import {
  type PlateEditor,
  type TElement,
  type Value,
  isDefined,
} from '@udecode/plate-common/server';

import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';

export const shouldMergeNodesRemovePrevNodeIndentList = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { shouldMergeNodesRemovePrevNode } = editor;

  return function (prevEntry: NodeEntry, curNodeEntry: NodeEntry): boolean {
    const prevNode = prevEntry[0] as TElement;
    const curNode = curNodeEntry[0] as TElement;

    if (
      isDefined(curNode[KEY_LIST_STYLE_TYPE]) ||
      isDefined(prevNode[KEY_LIST_STYLE_TYPE])
    ) {
      return false;
    }

    return shouldMergeNodesRemovePrevNode(prevEntry, curNodeEntry);
  };
};
