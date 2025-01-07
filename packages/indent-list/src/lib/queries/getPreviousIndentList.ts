import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type NodeEntry,
  NodeApi,
  PathApi,
} from '@udecode/plate';

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
      const prevPath = PathApi.previous(currPath);

      if (!prevPath) return;

      const prevNode = NodeApi.get<N>(editor, prevPath);

      if (!prevNode) return;

      return [prevNode, prevPath];
    },
    ...options,
    getNextEntry: undefined,
  });
};
