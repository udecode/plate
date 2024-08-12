import {
  type EElement,
  type EElementEntry,
  type TEditor,
  type TNodeEntry,
  type Value,
  getNode,
  getPreviousPath,
} from '@udecode/plate-common';

import {
  type GetSiblingIndentListOptions,
  getSiblingIndentList,
} from './getSiblingIndentList';

/** Get the previous indent list node. */
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
