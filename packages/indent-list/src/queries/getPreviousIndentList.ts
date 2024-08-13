import {
  type ElementEntryOf,
  type ElementOf,
  type TEditor,
  type TNodeEntry,
  getNode,
  getPreviousPath,
} from '@udecode/plate-common';

import {
  type GetSiblingIndentListOptions,
  getSiblingIndentList,
} from './getSiblingIndentList';

/** Get the previous indent list node. */
export const getPreviousIndentList = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingIndentListOptions<N, E>>
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
