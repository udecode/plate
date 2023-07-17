import {
  EElement,
  EElementEntry,
  getNode,
  getPreviousPath,
  TEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';

import {
  getSiblingIndentList,
  GetSiblingIndentListOptions,
} from './getSiblingIndentList';

/**
 * Get the previous indent list node.
 */
export const getPreviousIndentList = <
  N extends EElement<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  entry: EElementEntry<V>,
  options?: Partial<GetSiblingIndentListOptions<N, V>>
): TNodeEntry<N> | undefined => {
  return getSiblingIndentList(editor, entry, {
    getPreviousEntry: ([, currPath]) => {
      const prevPath = getPreviousPath(currPath);
      if (!prevPath) return;

      const prevNode = getNode<N>(editor, prevPath);
      if (!prevNode) return;

      return [prevNode, prevPath];
    },
    ...options,
    getNextEntry: undefined,
  });
};
