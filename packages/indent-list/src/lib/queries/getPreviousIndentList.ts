import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type NodeEntry,
  NodeApi,
  getPreviousPath,
} from '@udecode/plate-common';

import {
  type GetSiblingIndentListOptions,
  getSiblingIndentList,
} from './getSiblingIndentList';

/** Get the previous indent list node. */
export const getPreviousIndentList = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingIndentListOptions<N, E>>
): NodeEntry<N> | undefined => {
  return getSiblingIndentList(editor, entry, {
    getPreviousEntry: ([, currPath]) => {
      const prevPath = getPreviousPath(currPath);

      if (!prevPath) return;

      const prevNode = NodeApi.get<N>(editor, prevPath);

      if (!prevNode) return;

      return [prevNode, prevPath];
    },
    ...options,
    getNextEntry: undefined,
  });
};
